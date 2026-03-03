const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const db = require('../../shared/dynamodb');
const { success, error } = require('../../shared/response');
const { verifyFirebaseIdToken } = require('../../shared/firebase-auth');

const TABLE = process.env.TABLE_NAME;
const USER_ROLES = new Set(['employee', 'manager']);

function parseBody(event) {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw { statusCode: 400, message: 'Invalid JSON request body.' };
  }
}

function buildFallbackName(decodedToken) {
  if (decodedToken.name) {
    return decodedToken.name;
  }

  if (decodedToken.email) {
    return decodedToken.email.split('@')[0];
  }

  return 'User';
}

exports.handler = async (event) => {
  try {
    const body = parseBody(event);
    const role = (body.role || '').toLowerCase();
    const autoCreate = body.autoCreate === true;

    if (!USER_ROLES.has(role)) {
      return error('role must be either employee or manager.', 400);
    }

    const decodedToken = await verifyFirebaseIdToken(event);

    if (!decodedToken.uid || !decodedToken.email) {
      return error('Token must include uid and email.', 400);
    }

    const key = {
      PK: `user#${decodedToken.uid}`,
      SK: 'profile',
    };

    let result = await db.send(
      new GetCommand({
        TableName: TABLE,
        Key: key,
      })
    );

    let userProfile = result.Item;

    if (!userProfile && autoCreate) {
      const now = new Date().toISOString();
      userProfile = {
        ...key,
        entityType: 'USER_PROFILE',
        uid: decodedToken.uid,
        email: decodedToken.email,
        fullName: (body.fullName || '').trim() || buildFallbackName(decodedToken),
        role,
        provider: decodedToken.firebase?.sign_in_provider || 'google.com',
        photoUrl: decodedToken.picture || null,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      await db.send(
        new PutCommand({
          TableName: TABLE,
          Item: userProfile,
          ConditionExpression: 'attribute_not_exists(PK)',
        })
      );
    } else if (!userProfile) {
      return error('Account profile not found. Please create an account first.', 404);
    }

    if (userProfile.role !== role) {
      return error(`Account is registered as ${userProfile.role}.`, 403);
    }

    const now = new Date().toISOString();

    const updated = await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: key,
        UpdateExpression: 'SET lastLoginAt = :lastLoginAt, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':lastLoginAt': now,
          ':updatedAt': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return success(updated.Attributes || userProfile, 200);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return error('Account already exists. Please sign in.', 409);
    }

    return error(err.message || 'Internal server error', err.statusCode || 500);
  }
};

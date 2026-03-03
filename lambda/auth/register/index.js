const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

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

exports.handler = async (event) => {
  try {
    const body = parseBody(event);
    const fullName = (body.fullName || '').trim();
    const role = (body.role || '').toLowerCase();

    if (!fullName) {
      return error('fullName is required.', 400);
    }

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

    const existing = await db.send(
      new GetCommand({
        TableName: TABLE,
        Key: key,
      })
    );

    if (existing.Item) {
      return error('Account already exists. Please sign in.', 409);
    }

    const now = new Date().toISOString();

    const userProfile = {
      ...key,
      entityType: 'USER_PROFILE',
      uid: decodedToken.uid,
      email: decodedToken.email,
      fullName,
      role,
      provider: decodedToken.firebase?.sign_in_provider || 'password',
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

    return success(userProfile, 201);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return error('Account already exists. Please sign in.', 409);
    }

    return error(err.message || 'Internal server error', err.statusCode || 500);
  }
};

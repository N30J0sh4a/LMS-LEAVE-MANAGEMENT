const { GetCommand } = require('@aws-sdk/lib-dynamodb');

const db = require('./dynamodb');
const { verifyFirebaseIdToken } = require('./firebase-auth');

const TABLE = process.env.TABLE_NAME;

async function getRequesterProfile(uid) {
  if (!TABLE) {
    throw { statusCode: 500, message: 'TABLE_NAME is not configured.' };
  }

  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        PK: `user#${uid}`,
        SK: 'profile',
      },
    })
  );

  return result.Item || null;
}

async function getRequester(event) {
  const decodedToken = await verifyFirebaseIdToken(event);

  if (!decodedToken.uid) {
    throw { statusCode: 401, message: 'Token is missing uid.' };
  }

  const profile = await getRequesterProfile(decodedToken.uid);

  if (!profile) {
    throw { statusCode: 403, message: 'Account profile not found.' };
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email || profile.email || null,
    profile,
  };
}

function requireRole(requester, allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(requester.profile.role)) {
    throw {
      statusCode: 403,
      message: `Forbidden. Required role: ${roles.join(' or ')}.`,
    };
  }
}

module.exports = {
  getRequester,
  requireRole,
};

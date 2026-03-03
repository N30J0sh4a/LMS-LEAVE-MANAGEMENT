const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

function getFirebaseAuth() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw {
        statusCode: 500,
        message:
          'Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
      };
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  return getAuth();
}

function getBearerToken(headers = {}) {
  const authorization = headers.Authorization || headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw { statusCode: 401, message: 'Missing or invalid Authorization bearer token.' };
  }

  return authorization.slice('Bearer '.length).trim();
}

async function verifyFirebaseIdToken(event) {
  const token = getBearerToken(event.headers || {});
  const auth = getFirebaseAuth();

  try {
    return await auth.verifyIdToken(token);
  } catch (err) {
    throw { statusCode: 401, message: err.message || 'Invalid Firebase ID token.' };
  }
}

module.exports = {
  verifyFirebaseIdToken,
};

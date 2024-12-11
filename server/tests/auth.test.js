const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const mockAuth = {
    verifyIdToken: jest.fn()
  };

  return {
    auth: () => mockAuth,
    apps: [{ delete: jest.fn() }],
    initializeApp: jest.fn()
  };
});

// Cleanup after tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  admin.apps.forEach((app) => app.delete());
  jest.resetAllMocks();
});

describe('/api/login', () => {
  it('logs in a user with a valid Firebase token', async () => {
    const mockFirebaseToken = 'valid-firebase-id-token';
    const mockUid = '12121';

    // Mock Firebase `verifyIdToken` method to resolve with a valid UID
    admin.auth().verifyIdToken.mockResolvedValue({ uid: mockUid });

    const response = await request(app)
      .post('/api/login')
      .send({ token: mockFirebaseToken });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.uid).toBe(mockUid);
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);
  });

  it('returns 401 with a message if Firebase token is invalid', async () => {
    const invalidMockFirebaseToken = 'invalid-firebase-id-token';

    admin.auth().verifyIdToken.mockRejectedValue({
      code: 'auth/invalid-id-token',
      message: 'The Firebase ID token is invalid'
    });

    const response = await request(app)
      .post('/api/login')
      .send({ token: invalidMockFirebaseToken });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Invalid Firebase token. Please try again.'
    );
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(
      invalidMockFirebaseToken
    );
  });

  it('returns 401 with a message if Firebase token has expired', async () => {
    const expiredMockFirebaseToken = 'expired-firebase-id-token';

    admin.auth().verifyIdToken.mockRejectedValue({
      code: 'auth/expired-token',
      message: 'The Firebase ID token has expired'
    });

    const response = await request(app)
      .post('/api/login')
      .send({ token: expiredMockFirebaseToken });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token expired. Please try again.');
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(
      expiredMockFirebaseToken
    );
  });

  it('returns 400 if no Firebase token is provided', async () => {
    const response = await request(app).post('/api/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Token is required for login.');
    expect(admin.auth().verifyIdToken).not.toHaveBeenCalled();
  });

  it('returns 401 with a message for other unauthorised errors', async () => {
    const otherMockFirebaseToken = 'unauthorized-firebase-id-token';

    // Mock Firebase `verifyIdToken` method to reject with a generic error
    admin.auth().verifyIdToken.mockRejectedValue({
      code: 'auth/unauthorized',
      message: 'Unauthorized access'
    });

    const response = await request(app)
      .post('/api/login')
      .send({ token: otherMockFirebaseToken });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorised login. Please try again.');
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(
      otherMockFirebaseToken
    );
  });
});

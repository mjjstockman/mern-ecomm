const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

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

    admin.auth().verifyIdToken.mockResolvedValue({ uid: mockUid });

    const response = await request(app)
      .post('/api/login')
      .send({ token: mockFirebaseToken });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.uid).toBe(mockUid);
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);
  });
});

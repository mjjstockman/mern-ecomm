const request = require('supertest');
const app = require('../server');

jest.mock('firebase-admin', () => ({
  auth: {
    verifyIdToken: jest.fn()
  }
}));

describe('Authentication API', () => {
  it('logs in a user with a valid Firebase token', () => {
    const mockToken = 'valid-firebase-id-token';
    
    require('firebase-admin').auth.verifyIdToken.mockResolvedValue({
      uid: '12121'
    });

    return request(app)
      .post('/api/login')
      .send({ token: mockToken })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.uid).toBe('12121');
      });
  });
});

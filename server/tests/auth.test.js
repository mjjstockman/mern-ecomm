const request = require('supertest');
const app = require('../server');

describe('Authentication API', () => {
  it('allows a user to log in with valid credentials', () => {
    return request(app)
      .post('/api/login')
      .send({ email: 'test@tester.com', password: 'binGbaNg80' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
      });
  });
});

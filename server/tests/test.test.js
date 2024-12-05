const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('testing setup', () => {
  it('runs Jest correctly', () => {
    expect(true).toBe(true);
  });

  it('returns 200 for GET /api/test endpoint', () => {
    return request(app)
      .get('/api/test')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  afterAll(() => {
    return mongoose.connection.close();
  });
});

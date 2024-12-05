describe('Testing setup', () => {
  it('runs Jest correctly', () => {
    expect(true).toBe(true);
  });

  it('returns 200 for GET /api/test endpoint', async () => {
    const response = await request('http://localhost:5001/api/test').get(
      '/api/test'
    );
    expect(response.statusCode).toBe(200);
  });
});

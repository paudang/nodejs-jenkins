import request from 'supertest';

const SERVER_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;

describe('E2E User Tests', () => {
  let userId: string;
  let authToken: string;
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';

  it('should fail to fetch users without token (Protected)', async () => {
    const response = await request(SERVER_URL).get('/api/users');
    expect(response.statusCode).toBe(401);
  });

  it('should create a user successfully (Signup)', async () => {
    const response = await request(SERVER_URL)
      .post('/api/users')
      .send({ name: 'Test User', email: uniqueEmail, password: testPassword });

    expect([201, 202]).toContain(response.statusCode);
    userId = response.body.id || response.body._id;
  });

  it('should login and obtain a JWT token', async () => {
    const response = await request(SERVER_URL)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: testPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken || response.body.token).toBeDefined();
    authToken = response.body.accessToken || response.body.token;
  });

  it('should fetch users successfully', async () => {
    const response = await request(SERVER_URL)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update a user successfully', async () => {
    const response = await request(SERVER_URL)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated User' });

    expect([200, 202, 204]).toContain(response.statusCode);
  });

  it('should delete a user successfully', async () => {
    const response = await request(SERVER_URL)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect([200, 202, 204]).toContain(response.statusCode);
  });
});

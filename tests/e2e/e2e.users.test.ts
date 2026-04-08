import request from 'supertest';

const SERVER_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;

describe('E2E User Tests', () => {
  // Global setup and teardown hooks can be added here
  // typically for database seeding or external authentication checks prior to E2E.
  let userId: string;
  const uniqueEmail = `test_${Date.now()}@example.com`;

  it('should create a user successfully via REST', async () => {
    const response = await request(SERVER_URL)
      .post('/api/users')
      .send({ name: 'Test User', email: uniqueEmail });

    expect(response.statusCode).toBe(201);
    userId = response.body.id || response.body._id;
  });

  it('should update a user successfully via REST', async () => {
    const response = await request(SERVER_URL)
      .patch(`/api/users/${userId}`)
      .send({ name: 'Updated User' });

    expect(response.statusCode).toBe(200);
  });

  it('should delete a user successfully via REST', async () => {
    const response = await request(SERVER_URL).delete(`/api/users/${userId}`);

    expect(response.statusCode).toBe(200);
  });
});

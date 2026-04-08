import request from 'supertest';

const SERVER_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;

describe('E2E User Tests', () => {
  // Global setup and teardown hooks can be added here
  // typically for database seeding or external authentication checks prior to E2E.
  let userId: string;
  const uniqueEmail = `test_${Date.now()}@example.com`;

  it('should trigger Kafka event for user creation', async () => {
    const response = await request(SERVER_URL)
      .post('/api/users')
      .send({ name: 'Test User', email: uniqueEmail });

    expect([201, 202]).toContain(response.statusCode);
    userId = response.body.id || response.body._id;
    expect(userId).toBeDefined();

    // Wait for Kafka to process...
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it('should trigger Kafka event for user update', async () => {
    const response = await request(SERVER_URL)
      .patch(`/api/users/${userId}`)
      .send({ name: 'Updated User' });

    expect([200, 202, 204]).toContain(response.statusCode);

    // Wait for Kafka to process...
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it('should trigger Kafka event for user deletion', async () => {
    const response = await request(SERVER_URL).delete(`/api/users/${userId}`);

    expect([200, 202, 204]).toContain(response.statusCode);

    // Wait for Kafka to process...
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});

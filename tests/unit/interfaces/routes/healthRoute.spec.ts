import request from 'supertest';
import express from 'express';
import healthRoute from '@/interfaces/routes/healthRoute';
import { HTTP_STATUS } from '@/utils/httpCodes';
import mongoose from 'mongoose';

jest.mock('mongoose', () => {
  return {
    connection: {
      readyState: 1,
      db: {
        admin: jest.fn().mockReturnValue({
          ping: jest.fn().mockResolvedValue(true),
        }),
      },
    },
  };
});

describe('Health Route', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoute);
    jest.clearAllMocks();
  });

  it('should return 200 OK with UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.status).toBe('UP');
    expect(res.body.database).toBe('connected');
  });

  it('should handle database ping failure and return 500', async () => {
    ((mongoose.connection.db as any).admin as jest.Mock).mockReturnValueOnce({
      ping: jest.fn().mockRejectedValueOnce(new Error('DB Error')),
    });

    const res = await request(app).get('/health');
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.body.status).toBe('DOWN');
    expect(res.body.database).toBe('error');
  });
});

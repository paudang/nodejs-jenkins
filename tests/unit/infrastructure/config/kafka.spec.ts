import { Kafka } from 'kafkajs';

jest.mock('kafkajs', () => {
  return {
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn(),
      consumer: jest.fn(),
    })),
  };
});

jest.mock('@/config/env', () => ({
  env: {
    KAFKA_BROKER: 'localhost:9092',
  },
}));

describe('Kafka Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Kafka', () => {
    require('@/infrastructure/config/kafka');
    expect(Kafka).toHaveBeenCalled();
  });
});

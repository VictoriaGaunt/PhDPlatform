import mongoose from 'mongoose';

jest.mock('ioredis', () => require('ioredis-mock'));
afterAll(async () => {
    await mongoose.disconnect();
});

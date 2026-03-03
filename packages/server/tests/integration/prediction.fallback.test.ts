import * as supertest from 'supertest';
import app from '../../src/app';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Prediction fallback', () => {
    it('uses local fallback when python model is unavailable', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('python down'));

        const response = await supertest(app)
            .post('/api/v1/predictions/forecast')
            .send({ model: 'regression', horizon: 3, confidence: 0.9, historicalData: [{ year: 2020, value: 0.6 }] });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.predictions)).toBe(true);
        expect(response.body.data.predictions).toHaveLength(3);
    });
});

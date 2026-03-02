import request from 'supertest';
import app from '../../src/app';

describe('Prediction validation', () => {
    it('returns 400 when horizon is out of bounds', async () => {
        const response = await request(app)
            .post('/api/v1/predictions/forecast')
            .send({ model: 'regression', horizon: 0, confidence: 0.9 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});

import supertest from 'supertest';
import app from '../../src/app';
import axios from 'axios';
import { RegressionModel } from '../../src/services/models/regression.model';
import { TimeSeriesModel } from '../../src/services/models/timeSeries.model';
import { GradientBoostingModel } from '../../src/services/models/gradientBoosting.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../src/services/models/regression.model');
jest.mock('../../src/services/models/timeSeries.model');
jest.mock('../../src/services/models/gradientBoosting.model');

describe('Prediction fallback', () => {
    it('uses local fallback when python model is unavailable', async () => {

        const mockPredict = jest.fn().mockResolvedValue([
            { year: 2021, value: 0.65 },
            { year: 2022, value: 0.67 },
            { year: 2023, value: 0.69 }
        ]);

        (RegressionModel as jest.Mock).mockImplementation(() => ({
            train: jest.fn(),
            predict: mockPredict
        }));

        (TimeSeriesModel as jest.Mock).mockImplementation(() => ({
            predict: mockPredict
        }));

        (GradientBoostingModel as jest.Mock).mockImplementation(() => ({
            train: jest.fn(),
            predict: jest.fn().mockResolvedValue([[0.65]]) // возвращает массив чисел
        }));

        mockedAxios.post.mockRejectedValueOnce(new Error('python down'));

        const response = await supertest(app)
            .post('/api/v1/predictions/forecast')
            .send({
                model: 'regression',
                horizon: 3,
                confidence: 0.9,
                historicalData: [{ year: 2020, value: 0.6 }]
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.predictions)).toBe(true);
        expect(response.body.data.predictions).toHaveLength(3);
    });
});
import { Request, Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import environment from '../config/environment';
import { cacheService } from '../services/cache.service';

export class ReadinessController {
    static async ready(_req: Request, res: Response) {
        const mongoReady = mongoose.connection.readyState === 1;
        const redisReady = await cacheService.ping();

        let pythonModelReady = false;
        try {
            const response = await axios.get(`${environment.PYTHON_MODEL_URL}/health`, { timeout: 2000 });
            pythonModelReady = response.status >= 200 && response.status < 300;
        } catch {
            pythonModelReady = false;
        }

        const ready = mongoReady && redisReady && pythonModelReady;
        return res.status(ready ? 200 : 503).json({
            status: ready ? 'READY' : 'NOT_READY',
            checks: {
                mongo: mongoReady,
                redis: redisReady,
                pythonModel: pythonModelReady,
            },
            timestamp: new Date().toISOString(),
        });
    }

}

import { Request, Response } from 'express';
import { getDependencyStatus } from '../utils/checks';

export class ReadinessController {
    static async ready(_req: Request, res: Response) {
        const checks = await getDependencyStatus();
        const ready = checks.mongo && checks.redis && checks.pythonModel;

        return res.status(ready ? 200 : 503).json({
            status: ready ? 'READY' : 'NOT_READY',
            checks,
            timestamp: new Date().toISOString(),
        });
    }
}

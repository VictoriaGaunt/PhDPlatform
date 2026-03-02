import IORedis from 'ioredis';
import environment from '../config/environment';
import { PredictionService } from '../services/prediction.service';
import { RegionService } from '../services/region.service';
import { TaskPayload } from '../queues/task.queue';

let worker: any = null;

const loadBullMq = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('bullmq');
    } catch {
        return null;
    }
};

export const startTaskWorker = (): any | null => {
    if (worker) return worker;

    const bullMq = loadBullMq();
    if (!bullMq) return null;

    try {
        const connection = new IORedis(environment.REDIS_URL, { maxRetriesPerRequest: null });

        worker = new bullMq.Worker(
            'heavy-tasks',
            async (job: { data: TaskPayload }) => {
                if (job.data.type === 'forecast') {
                    return PredictionService.forecast(job.data.payload as any);
                }
                if (job.data.type === 'importGeoJson') {
                    return RegionService.importFromGeoJSON(job.data.payload as any);
                }
                throw new Error('Unknown job type');
            },
            { connection, concurrency: 2 }
        );

        worker.on('failed', (job: { id?: string }, err: Error) => {
            console.error(`Worker job failed (${job?.id}):`, err.message);
        });

        return worker;
    } catch {
        return null;
    }
};

export const stopTaskWorker = async (): Promise<void> => {
    if (worker) await worker.close();
    worker = null;
};

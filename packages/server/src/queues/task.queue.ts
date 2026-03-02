import IORedis from 'ioredis';
import environment from '../config/environment';

export type TaskKind = 'forecast' | 'importGeoJson';

export interface TaskPayload {
    type: TaskKind;
    payload: unknown;
}

let connection: IORedis | null = null;
let taskQueue: any = null;

const loadBullMq = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('bullmq');
    } catch {
        return null;
    }
};

const getConnection = () => {
    if (!connection) {
        connection = new IORedis(environment.REDIS_URL, { maxRetriesPerRequest: null });
    }
    return connection;
};

export const getTaskQueue = (): any | null => {
    if (taskQueue) return taskQueue;

    const bullMq = loadBullMq();
    if (!bullMq) return null;

    try {
        taskQueue = new bullMq.Queue('heavy-tasks', { connection: getConnection() });
        return taskQueue;
    } catch {
        return null;
    }
};

export const enqueueTask = async (task: TaskPayload): Promise<string | null> => {
    const queue = getTaskQueue();
    if (!queue) return null;

    const job = await queue.add(task.type, task, {
        removeOnComplete: 200,
        removeOnFail: 200,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
    });

    return job.id || null;
};

export const getTaskStatus = async (jobId: string): Promise<{ status: string; result?: unknown; failedReason?: string } | null> => {
    const queue = getTaskQueue();
    if (!queue) return null;

    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return { status: state, result: job.returnvalue, failedReason: job.failedReason };
};

export const closeTaskQueue = async (): Promise<void> => {
    if (taskQueue) await taskQueue.close();
    if (connection) await connection.quit();
    taskQueue = null;
    connection = null;
};

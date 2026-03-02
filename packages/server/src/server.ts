import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import environment from './config/environment';
import connectDB, { disconnectDB } from './config/database';
import { startTaskWorker, stopTaskWorker } from './workers/task.worker';
import { closeTaskQueue } from './queues/task.queue';
import { cacheService } from './services/cache.service';

const PORT = environment.PORT;
const NODE_ENV = environment.NODE_ENV;

const server = http.createServer(app);

const startServer = async (): Promise<void> => {
    try {
        await connectDB();
    } catch {
        // connectDB already logs details; server can still start for degraded mode.
    }
    startTaskWorker();

    server.listen(PORT, () => {
        console.log('='.repeat(70));
        console.log('🚀 PhD RESEARCH PLATFORM - SERVER STARTED');
        console.log('='.repeat(70));
        console.log(`📡 Окружение: ${NODE_ENV}`);
        console.log(`🌐 Сервер: http://localhost:${PORT}`);
        console.log(`🩺 Проверка: http://localhost:${PORT}/health`);
        console.log(`🔗 API: http://localhost:${PORT}/api/v1/test`);
        console.log(`🗺️ Регионы: http://localhost:${PORT}/api/v1/regions`);
        console.log('='.repeat(70));

        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB: Подключена');
        } else {
            console.log('⚠️  MongoDB: Не подключена (режим без БД)');
        }
        console.log('='.repeat(70));
    });
};

const shutdown = async (signal: string): Promise<void> => {
    console.log(`🛑 Получен ${signal}, завершение работы...`);
    server.close(async () => {
        await stopTaskWorker();
        await closeTaskQueue();
        await cacheService.quit();
        await disconnectDB();
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});

void startServer();

export default app;
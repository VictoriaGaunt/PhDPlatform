import mongoose from 'mongoose';
import logger from './logger';
import environment from './environment';

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(environment.MONGODB_URI, {
            // Настройки соединения
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });

        logger.info(`✅ MongoDB подключена: ${conn.connection.host}`);

        // Обработка ошибок после успешного подключения
        mongoose.connection.on('error', (err) => {
            logger.error(`❌ Ошибка MongoDB: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB отключена');
        });

    } catch (error) {
        logger.error(`❌ Не удалось подключиться к MongoDB: ${error}`);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        logger.info('🛑 Соединение с MongoDB закрыто');
    } catch (error) {
        logger.error(`❌ Ошибка при закрытии соединения MongoDB: ${error}`);
    }
};

export default connectDB;
import mongoose from 'mongoose';
import logger from './logger';
import environment from './environment';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const connectDB = async (): Promise<void> => {
    const conn = await mongoose.connect(environment.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true,
    });
    logger.info(`✅ MongoDB подключена: ${conn.connection.host}`);
    mongoose.connection.on('error', (err) => {
        logger.error(`❌ Ошибка MongoDB: ${err}`);
    });
    mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB отключена');
    });
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
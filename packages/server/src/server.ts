import mongoose from 'mongoose';
import app from './app';
import environment from "./config/environment";

const PORT = environment.PORT;
const NODE_ENV = environment.NODE_ENV;

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(environment.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB подключена успешно');
    } catch (error: any) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        console.log('🔄 Используем режим без базы данных...');
    }
};

const startServer = async (): Promise<void> => {
    await connectDB();

    app.listen(PORT, () => {
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

process.on('SIGTERM', () => {
    console.log('🛑 Получен SIGTERM, завершение работы...');
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Получен SIGINT, завершение работы...');
    mongoose.connection.close();
    process.exit(0);
});

startServer();

export default app;
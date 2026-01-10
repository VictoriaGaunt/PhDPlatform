import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        // Используем локальную MongoDB
        const mongoURI = 'mongodb://localhost:27017/excel_db';

        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB подключен на localhost:27017');
    } catch (error: any) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        console.log('💡 Убедитесь, что MongoDB запущена локально');
        console.log('💡 Для Windows: запустите "mongod" из командной строки');
        console.log('💡 Или используйте Docker: docker run -d -p 27017:27017 mongo');
    }
};
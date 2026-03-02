import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { format } from 'date-fns';

dotenv.config();

const BACKUP_DIR = path.join(__dirname, '../../backups');

const backupDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI не задан в .env');
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Подключено к MongoDB');

        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
        fs.mkdirSync(backupPath);

        // Получаем список коллекций из базы данных
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        for (const name of collectionNames) {
            // Пропускаем системные коллекции
            if (name.startsWith('system.')) continue;

            console.log(`📦 Экспортируем коллекцию ${name}...`);
            const collection = mongoose.connection.db.collection(name);
            const data = await collection.find({}).toArray();

            const filePath = path.join(backupPath, `${name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Сохранено ${data.length} записей в ${filePath}`);
        }

        console.log(`🎉 Резервное копирование завершено в ${backupPath}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при резервном копировании:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

backupDatabase();
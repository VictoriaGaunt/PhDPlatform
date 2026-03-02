import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Импортируем модели
import { Region } from '../models/Region.model';
import { Indicator } from '../models/Indicator.model';
import { User } from '../models/User.model';

/**
 * Список миграций с версиями
 * Каждая миграция должна быть функцией, возвращающей Promise
 */
const migrations = [
    {
        version: 1,
        name: 'add-hci-to-regions',
        run: async () => {
            // Пример: добавить поле hci для регионов, где его нет
            const result = await Region.updateMany(
                { hci: { $exists: false } },
                { $set: { hci: 0.5 } } // значение по умолчанию
            );
            console.log(`✅ Миграция 1: обновлено ${result.modifiedCount} регионов`);
        },
    },
    {
        version: 2,
        name: 'create-indices',
        run: async () => {
            // Создаём индексы, если их нет
            await Indicator.collection.createIndex({ regionCode: 1, year: 1 }, { unique: true });
            await User.collection.createIndex({ email: 1 }, { unique: true });
            console.log('✅ Миграция 2: индексы созданы');
        },
    },
    // Добавляйте новые миграции здесь с увеличением version
];

/**
 * Получает текущую версию из специальной коллекции migrations
 */
const getCurrentVersion = async (): Promise<number> => {
    const Migration = mongoose.connection.collection('migrations');
    const record = await Migration.findOne({});
    return record?.version || 0;
};

/**
 * Устанавливает новую версию
 */
const setCurrentVersion = async (version: number): Promise<void> => {
    const Migration = mongoose.connection.collection('migrations');
    await Migration.updateOne({}, { $set: { version } }, { upsert: true });
};

/**
 * Запуск миграций
 */
const runMigrations = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI не задан');
        await mongoose.connect(mongoUri);
        console.log('✅ Подключено к MongoDB');

        const currentVersion = await getCurrentVersion();
        console.log(`📌 Текущая версия БД: ${currentVersion}`);

        // Сортируем миграции по версии и применяем только новые
        const pendingMigrations = migrations
            .filter(m => m.version > currentVersion)
            .sort((a, b) => a.version - b.version);

        if (pendingMigrations.length === 0) {
            console.log('✅ База данных актуальна, миграции не требуются');
            process.exit(0);
        }

        console.log(`🚀 Будет применено ${pendingMigrations.length} миграций`);

        for (const migration of pendingMigrations) {
            console.log(`🔄 Применяем миграцию v${migration.version}: ${migration.name}`);
            await migration.run();
            await setCurrentVersion(migration.version);
            console.log(`✅ Миграция v${migration.version} завершена`);
        }

        console.log('🎉 Все миграции успешно применены');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграций:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

runMigrations();
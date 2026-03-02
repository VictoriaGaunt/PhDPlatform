/**
 * Периодическая задача очистки кэша
 * Запускается по расписанию (например, каждые 6 часов)
 */

import logger from '../config/logger';
import { cacheService } from '../services/cache.service';

export const runCacheCleanup = async (): Promise<void> => {
    try {
        logger.info('🧹 Запуск очистки кэша...');
        await cacheService.cleanup();
        logger.info('✅ Кэш успешно очищен');
    } catch (error) {
        logger.error(`❌ Ошибка при очистке кэша: ${error}`);
    }
};

// Если нужно запланировать периодический запуск через node-cron
// import cron from 'node-cron';
// cron.schedule('0 */6 * * *', runCacheCleanup);
import Redis from 'ioredis';
import environment from '../config/environment';

class CacheService {
    private client: Redis | null = null;
    private isConnected = false;

    constructor() {
        if (environment.REDIS_URL) {
            this.client = new Redis(environment.REDIS_URL);
            this.client.on('connect', () => {
                this.isConnected = true;
                console.log('✅ Redis подключен');
            });
            this.client.on('error', (err) => {
                console.error('❌ Redis error:', err);
                this.isConnected = false;
            });
        } else {
            console.warn('⚠️ REDIS_URL не задан, кэширование отключено');
        }
    }

    /**
     * Получить значение из кэша
     */
    async get<T = any>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;
        const value = await this.client?.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as any;
        }
    }

    /**
     * Сохранить значение в кэш
     * @param key ключ
     * @param value значение
     * @param ttl время жизни в секундах (по умолчанию 3600)
     */
    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        if (!this.isConnected) return;
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await this.client?.setex(key, ttl, stringValue);
    }

    /**
     * Удалить ключ из кэша
     */
    async del(key: string): Promise<void> {
        if (!this.isConnected) return;
        await this.client?.del(key);
    }

    /**
     * Очистить кэш по шаблону
     */
    async clearPattern(pattern: string): Promise<void> {
        if (!this.isConnected) return;
        const keys = await this.client?.keys(pattern);
        if (keys && keys.length) {
            await this.client?.del(...keys);
        }
    }

    /**
     * Очистка устаревших данных кэша (например, прогнозов)
     */
    async cleanup(): Promise<void> {
        // Удаляем все ключи, связанные с прогнозами (можно настроить шаблон)
        await this.clearPattern('prediction:*');
        // Можно добавить другие шаблоны
        console.log('🧹 Кэш очищен (удалены устаревшие записи)');
    }

    /**
     * Закрыть соединение с Redis
     */
    async quit(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

export const cacheService = new CacheService();
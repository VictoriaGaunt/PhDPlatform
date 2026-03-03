import Redis from 'ioredis';
import environment from '../config/environment';

class CacheService {
    private client: Redis | null = null;
    private isConnected = false;

    constructor() {
        if (environment.REDIS_URL) {
            try {
                this.client = new Redis(environment.REDIS_URL, {
                    lazyConnect: true,
                    maxRetriesPerRequest: 1,
                });
                this.client.connect().catch(() => {
                    this.isConnected = false;
                });
                this.client.on('connect', () => {
                    this.isConnected = true;
                    console.log('✅ Redis подключен');
                });
                this.client.on('error', (err) => {
                    console.error('❌ Redis error:', err);
                    this.isConnected = false;
                });  // Log only once
            } catch (err) {
                console.warn('❌ Redis init fail:', err);
                this.client = null;  // Fallback null
            }
        } else {
            console.warn('⚠️ REDIS_URL не задан, кэширование отключено');
        }
    }

    async get<T = unknown>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;
        const value = await this.client?.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    async set(key: string, value: unknown, ttl: number = 3600): Promise<void> {
        if (!this.isConnected) return;
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await this.client?.setex(key, ttl, stringValue);
    }

    async del(key: string): Promise<void> {
        if (!this.isConnected) return;
        await this.client?.del(key);
    }

    async clearPattern(pattern: string): Promise<void> {
        if (!this.isConnected) return;
        const keys = await this.client?.keys(pattern);
        if (keys && keys.length) {
            await this.client?.del(...keys);
        }
    }

    async cleanup(): Promise<void> {
        await this.clearPattern('prediction:*');
        console.log('🧹 Кэш очищен (удалены устаревшие записи)');
    }

    async ping(): Promise<boolean> {
        if (!this.client || !this.isConnected) return false;
        try {
            return (await this.client.ping()) === 'PONG';
        } catch {
            return false;
        }
    }

    async quit(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

export const cacheService = new CacheService();
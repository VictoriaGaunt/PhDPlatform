import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const environment = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: parseInt(process.env.PORT || '5000'),

    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/phd-platform',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

    // Cache
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600'),

    // File upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
    PYTHON_MODEL_URL: process.env.PYTHON_MODEL_URL || 'http://localhost:8000',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_LOGIN: process.env.ADMIN_USERNAME,
    LOG_LEVEL: process.env.LOG_LEVEL,
};

export default environment;
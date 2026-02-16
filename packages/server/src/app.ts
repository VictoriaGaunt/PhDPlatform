import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import environment from './config/environment';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';

const app = express();

app.use(cors({
    origin: environment.CORS_ORIGIN,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: environment.RATE_LIMIT_WINDOW_MS,
    max: environment.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (environment.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(loggerMiddleware);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: environment.NODE_ENV
    });
});

// API Routes
app.use('/api/v1', routes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Error handling
app.use(errorHandler);

export default app;
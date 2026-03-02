import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from "helmet";
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import environment from './config/environment';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { ReadinessController } from './controllers/readiness.controller';

const app = express();

app.use(helmet());

app.use(cors({
    origin: environment.CORS_ORIGIN,
    credentials: true
}));

const limiter = rateLimit({
    windowMs: environment.RATE_LIMIT_WINDOW_MS,
    max: environment.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

if (environment.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(loggerMiddleware);

app.use(authMiddleware);

app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
    res.redirect('/health/live');
});

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: environment.NODE_ENV
    });
});

app.get('/health/ready', ReadinessController.ready);

app.use('/api/v1', routes);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

app.use(errorHandler);

export default app;
import winston from 'winston';
import path from 'path';
import environment from './environment';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Формат для вывода в консоль (разработка)
const consoleFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

// Формат для записи в файл (продакшн) — JSON для удобства парсинга
const fileFormat = combine(
    timestamp(),
    json()
);

// Определяем уровни логирования
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Создаём экземпляр логгера
const logger = winston.createLogger({
    levels,
    level: environment.LOG_LEVEL || 'info',
    transports: [
        // Всегда пишем ошибки и предупреждения в файл
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: fileFormat,
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            format: fileFormat,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(__dirname, '../../logs/exceptions.log') }),
    ],
});

// В режиме разработки добавляем вывод в консоль
if (environment.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}

export default logger;
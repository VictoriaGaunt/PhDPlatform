/**
 * Константы приложения
 */

export const APP_NAME = 'PhD Research Platform';
export const APP_VERSION = '1.0.0';

// Роли пользователей
export const ROLES = {
    GUEST: 'guest',
    ADMIN: 'admin',
} as const;

// HTTP статусы
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// Временные интервалы (в миллисекундах)
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Лимиты для пагинации
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// Типы моделей прогнозирования
export const MODEL_TYPES = {
    GRADIENT_BOOSTING: 'gradientBoosting',
    REGRESSION: 'regression',
    TIME_SERIES: 'timeSeries',
} as const;

// Сценарии прогнозирования
export const SCENARIOS = {
    BASELINE: 'baseline',
    OPTIMISTIC: 'optimistic',
    PESSIMISTIC: 'pessimistic',
} as const;

// Федеральные округа РФ
export const FEDERAL_DISTRICTS = [
    'Центральный',
    'Северо-Западный',
    'Южный',
    'Северо-Кавказский',
    'Приволжский',
    'Уральский',
    'Сибирский',
    'Дальневосточный',
] as const;
/**
 * Общий формат успешного ответа API
 */
export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    pagination?: PaginationInfo;
}

/**
 * Общий формат ответа с ошибкой
 */
export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: any; // дополнительные детали, ошибки валидации
    stack?: string; // в dev-режиме
}

/**
 * Информация о пагинации
 */
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Унифицированный тип ответа
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Типы для запросов с пагинацией
 */
export interface PaginatedQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Типы для фильтрации регионов
 */
export interface RegionFilter extends PaginatedQuery {
    federalDistrict?: string;
    minPopulation?: number;
    maxPopulation?: number;
    minHci?: number;
    maxHci?: number;
}
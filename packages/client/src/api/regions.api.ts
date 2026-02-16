// import { apiClient } from './axios.config';
// import type {
//     Region,
//     RegionIndicator,
//     RegionFilters,
//     PaginatedResponse,
//     ComparisonRequest,
//     ComparisonResult
// } from '@/types/region.types';
//
// export const RegionApi = {
//     // Получение списка регионов
//     async getAllRegions(filters?: RegionFilters, page = 1, limit = 20): Promise<PaginatedResponse<Region>> {
//         const params = new URLSearchParams();
//
//         if (filters) {
//             Object.entries(filters).forEach(([key, value]) => {
//                 if (value !== undefined && value !== null && value !== '') {
//                     params.append(key, String(value));
//                 }
//             });
//         }
//
//         params.append('page', String(page));
//         params.append('limit', String(limit));
//
//         return apiClient.get<PaginatedResponse<Region>>(`/regions?${params.toString()}`);
//     },
//
//     // Получение региона по коду
//     async getRegionByCode(code: string): Promise<Region> {
//         return apiClient.get<Region>(`/regions/${code}`);
//     },
//
//     // Получение показателей региона
//     async getRegionIndicators(
//         code: string,
//         startYear?: number,
//         endYear?: number,
//         indicators?: string[]
//     ): Promise<RegionIndicator[]> {
//         const params = new URLSearchParams();
//
//         if (startYear) params.append('startYear', String(startYear));
//         if (endYear) params.append('endYear', String(endYear));
//         if (indicators?.length) params.append('indicators', indicators.join(','));
//
//         return apiClient.get<RegionIndicator[]>(`/regions/${code}/indicators?${params.toString()}`);
//     },
//
//     // Сравнение регионов
//     async compareRegions(request: ComparisonRequest): Promise<ComparisonResult> {
//         return apiClient.post<ComparisonResult>('/regions/compare', request);
//     },
//
//     // Обновление данных региона (только для администраторов)
//     async updateRegionData(code: string, data: Partial<Region>): Promise<Region> {
//         return apiClient.put<Region>(`/regions/${code}`, data);
//     },
//
//     // Получение статистики по регионам
//     async getRegionsStats(): Promise<{
//         totalRegions: number;
//         averageHCI: number;
//         topRegions: Array<{ code: string; name: string; hci: number }>;
//         bottomRegions: Array<{ code: string; name: string; hci: number }>;
//     }> {
//         return apiClient.get('/regions/stats');
//     },
//
//     // Экспорт данных регионов
//     exportRegions(format: 'xlsx' | 'csv' | 'json', filters?: RegionFilters): void {
//         let query = '';
//
//         if (filters) {
//             const params = new URLSearchParams();
//             Object.entries(filters).forEach(([key, value]) => {
//                 if (value !== undefined && value !== null && value !== '') {
//                     params.append(key, String(value));
//                 }
//             });
//             query = `?${params.toString()}`;
//         }
//
//         apiClient.download(`/export/regions/${format}${query}`, `regions_export_${Date.now()}.${format}`);
//     }
// };
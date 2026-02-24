import { Region } from '../models/Region.model';
import { BadRequestError } from '../utils/errorHandler';

export class ValidationService {
    /**
     * Проверить, что код региона уникален
     */
    static async ensureRegionCodeUnique(code: string, excludeId?: string): Promise<void> {
        const query: any = { code };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existing = await Region.findOne(query);
        if (existing) {
            throw new BadRequestError(`Регион с кодом ${code} уже существует`);
        }
    }

    /**
     * Проверить, что регион существует
     */
    static async ensureRegionExists(code: string): Promise<void> {
        const region = await Region.findOne({ code });
        if (!region) {
            throw new BadRequestError(`Регион с кодом ${code} не найден`);
        }
    }

    /**
     * Валидация данных индикатора
     */
    static validateIndicatorData(data: any) {
        // Проверить, что год в разумных пределах
        if (data.year && (data.year < 1950 || data.year > 2100)) {
            throw new BadRequestError('Год должен быть между 1950 и 2100');
        }
        // Проверить категорию
        const validCategories = ['education', 'health', 'economy', 'social'];
        if (data.category && !validCategories.includes(data.category)) {
            throw new BadRequestError('Некорректная категория');
        }
        return true;
    }
}
import { Indicator, IIndicator } from '../models/Indicator.model';
import { Region } from '../models/Region.model';

export class IndicatorService {
    /**
     * Создаёт или обновляет показатели региона за определённый год
     */
    static async upsertIndicator(
        regionCode: string,
        year: number,
        data: Partial<Omit<IIndicator, 'regionCode' | 'year'>>
    ): Promise<IIndicator> {
        // Проверка существования региона
        const region = await Region.findOne({ code: regionCode });
        if (!region) {
            throw new Error(`Region with code ${regionCode} not found`);
        }

        const indicator = await Indicator.findOneAndUpdate(
            { regionCode, year },
            { $set: data },
            { new: true, upsert: true, runValidators: true }
        );
        return indicator;
    }

    /**
     * Получает показатели региона за указанные годы
     */
    static async getIndicators(
        regionCode: string,
        startYear?: number,
        endYear?: number,
        fields?: string[]
    ): Promise<IIndicator[]> {
        const query: any = { regionCode };
        if (startYear || endYear) {
            query.year = {};
            if (startYear) query.year.$gte = startYear;
            if (endYear) query.year.$lte = endYear;
        }

        let projection: any = {};
        if (fields?.length) {
            fields.forEach(f => (projection[f] = 1));
        }

        return Indicator.find(query, projection).sort({ year: 1 });
    }

    /**
     * Удаляет показатели региона за год
     */
    static async deleteIndicator(regionCode: string, year: number): Promise<boolean> {
        const result = await Indicator.deleteOne({ regionCode, year });
        return result.deletedCount > 0;
    }

    /**
     * Получает доступные года для региона
     */
    static async getAvailableYears(regionCode: string): Promise<number[]> {
        const years = await Indicator.distinct('year', { regionCode });
        return years.sort((a, b) => a - b);
    }
}
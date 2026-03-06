import axios from 'axios';
import { Indicator, IIndicator } from '../models/Indicator.model';
import logger from '../config/logger';

const ONLINE_API_URL = process.env.ONLINE_API_URL || 'http://localhost:3001/indicators';
const REQUEST_TIMEOUT = 3000;

export class DataProvider {
static async getRegionData(regionCode: string, year?: number): Promise<IIndicator | null> {
        try {
            const onlineData = await this.fetchFromOnline(regionCode, year);
            if (onlineData) {
                logger.info(`📡 Данные для региона ${regionCode} получены из онлайн-источника`);
                return onlineData;
            }
        } catch (error) {
            logger.warn(`⚠️ Онлайн-источник недоступен: ${(error as Error).message}`);
        }
        logger.info(`🗄️ Используем локальные данные для региона ${regionCode}`);
        return this.fetchFromLocal(regionCode, year);
    }
private static async fetchFromOnline(regionCode: string, year?: number): Promise<IIndicator | null> {
        const url = `${ONLINE_API_URL}?regionCode=${regionCode}${year ? `&year=${year}` : ''}`;
        const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0] as IIndicator;
        }
        return null;
    }
private static async fetchFromLocal(regionCode: string, year?: number): Promise<IIndicator | null> {
        const query: any = { regionCode, source: 'xlsx' };
        if (year) query.year = year;
        return await Indicator.findOne(query).exec();
    }
static async getRegionHistory(regionCode: string, startYear?: number, endYear?: number): Promise<IIndicator[]> {
        try {
            const onlineData = await this.fetchHistoryFromOnline(regionCode, startYear, endYear);
            if (onlineData.length > 0) {
                logger.info(`📡 История для региона ${regionCode} получена из онлайн-источника`);
                return onlineData;
            }
        } catch (error) {
            logger.warn(`⚠️ Онлайн-источник истории недоступен: ${(error as Error).message}`);
        }
        logger.info(`🗄️ Используем локальную историю для региона ${regionCode}`);
        const query: any = { regionCode, source: 'xlsx' };
        if (startYear || endYear) {
            query.year = {};
            if (startYear) query.year.$gte = startYear;
            if (endYear) query.year.$lte = endYear;
        }
        return await Indicator.find(query).sort({ year: 1 }).exec();
    }

    private static async fetchHistoryFromOnline(regionCode: string, startYear?: number, endYear?: number): Promise<IIndicator[]> {
        let url = `${ONLINE_API_URL}?regionCode=${regionCode}`;
        if (startYear) url += `&year_gte=${startYear}`;
        if (endYear) url += `&year_lte=${endYear}`;
        const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });
        return response.data || [];
    }
}
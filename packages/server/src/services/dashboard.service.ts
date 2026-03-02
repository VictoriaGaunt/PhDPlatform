import { Region } from '../models/Region.model';
import { Indicator } from '../models/Indicator.model';
import { User } from '../models/User.model';
import { Prediction } from '../models/Prediction.model';
//import { Types } from 'mongoose';

export class DashboardService {
    /**
     * Получает общую статистику для главного дашборда
     */
    static async getDashboardStats(): Promise<any> {
        const [
            totalRegions,
            totalIndicators,
            totalUsers,
            avgHci,
            latestPredictions,
            topRegions
        ] = await Promise.all([
            Region.countDocuments(),
            Indicator.countDocuments(),
            User.countDocuments(),
            Region.aggregate([
                { $match: { hci: { $exists: true } } },
                { $group: { _id: null, avg: { $avg: '$hci' } } }
            ]),
            Prediction.find().sort({ createdAt: -1 }).limit(5).populate('regionCode'),
            Region.find({ hci: { $exists: true } }).sort({ hci: -1 }).limit(5).select('name code hci')
        ]);

        return {
            totalRegions,
            totalIndicators,
            totalUsers,
            averageHci: avgHci[0]?.avg || 0,
            recentPredictions: latestPredictions,
            topRegionsByHci: topRegions
        };
    }

    /**
     * Получает временные ряды для графиков (например, динамика среднего HCI по годам)
     */
    static async getTimeSeriesData(
        indicator: string = 'hci',
        startYear?: number,
        endYear?: number
    ): Promise<any[]> {
        const match: any = {};
        if (startYear || endYear) {
            match.year = {};
            if (startYear) match.year.$gte = startYear;
            if (endYear) match.year.$lte = endYear;
        }

        // Агрегация по годам: среднее значение индикатора
        const data = await Indicator.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$year',
                    avgValue: { $avg: `$${indicator}` },
                    min: { $min: `$${indicator}` },
                    max: { $max: `$${indicator}` }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return data.map(item => ({
            year: item._id,
            value: item.avgValue,
            min: item.min,
            max: item.max
        }));
    }

    /**
     * Получает распределение HCI по федеральным округам
     */
    static async getHciByDistrict(): Promise<any[]> {
        return Region.aggregate([
            { $match: { hci: { $exists: true } } },
            {
                $group: {
                    _id: '$federalDistrict',
                    avgHci: { $avg: '$hci' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { avgHci: -1 } }
        ]);
    }
}
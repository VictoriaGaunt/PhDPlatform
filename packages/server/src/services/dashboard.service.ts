import { Region } from '../models/Region.model';
import { Indicator } from '../models/Indicator.model';
import { User } from '../models/User.model';
import { Prediction } from '../models/Prediction.model';

interface TimeSeriesPoint {
    year: number;
    value: number;
    min: number;
    max: number;
}

export class DashboardService {
    static async getDashboardStats() {
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
            Region.aggregate([{ $match: { hci: { $exists: true } } }, { $group: { _id: null, avg: { $avg: '$hci' } } }]),
            Prediction.find().sort({ createdAt: -1 }).limit(5).lean(),
            Region.find({ hci: { $exists: true } }).sort({ hci: -1 }).limit(5).select('name code hci').lean()
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

    static async getTimeSeriesData(
        indicator: 'humanCapitalIndex' = 'humanCapitalIndex',
        startYear?: number,
        endYear?: number
    ): Promise<TimeSeriesPoint[]> {
        const match: { year?: { $gte?: number; $lte?: number } } = {};
        if (startYear || endYear) {
            match.year = {};
            if (startYear) match.year.$gte = startYear;
            if (endYear) match.year.$lte = endYear;
        }
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

        return data.map((item) => ({
            year: item._id,
            value: item.avgValue,
            min: item.min,
            max: item.max
        }));
    }

    static async getHciByDistrict(): Promise<Array<{
        district: string;
        avgHci: number;
        count: number
    }>> {
        const grouped = await Region.aggregate([
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
        return grouped.map((item) => ({
            district: item._id,
            avgHci: item.avgHci,
            count: item.count }));
    }
}
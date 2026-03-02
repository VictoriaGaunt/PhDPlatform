import { Request, Response } from 'express';
import { RegionService } from '../services/region.service';

export class DashboardController {
    static async getSummary(_req: Request, res: Response) {
        try {
            const { data: regions } = await RegionService.getAll({ limit: 1000 });

            const totalRegions = regions.length;
            const avgHCI = regions.reduce((sum, r) => sum + (r.hci || 0), 0) / totalRegions || 0;
            const totalPopulation = regions.reduce((sum, r) => sum + (r.population || 0), 0);
            const totalArea = regions.reduce((sum, r) => sum + (r.area || 0), 0);
            res.json({
                success: true,
                data: {
                    totalRegions,
                    avgHCI: Number(avgHCI.toFixed(3)),
                    totalPopulation,
                    totalArea,
                    lastUpdated: new Date(),
                },
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
import { Request, Response, NextFunction } from 'express';
import RegionService from '../services/region.service';
import ApiError from '../utils/errorHandler';

export class RegionController {
    async getAllRegions(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, sort = 'name', ...filters } = req.query;

            const result = await RegionService.getAllRegions({
                page: Number(page),
                limit: Number(limit),
                sort: String(sort),
                filters
            });

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async getRegionByCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.params;
            const region = await RegionService.getRegionByCode(code);

            if (!region) {
                throw new ApiError(404, 'Region not found');
            }

            res.status(200).json({
                success: true,
                data: region
            });
        } catch (error) {
            next(error);
        }
    }

    async getRegionIndicators(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.params;
            const { startYear, endYear, indicators } = req.query;

            const data = await RegionService.getRegionIndicators(
                code,
                {
                    startYear: startYear ? Number(startYear) : undefined,
                    endYear: endYear ? Number(endYear) : undefined,
                    indicators: indicators ? String(indicators).split(',') : []
                }
            );

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRegionData(req: Request, res: Response, next: NextFunction) {
        try {
            // Проверка прав администратора
            if (req.user?.role !== 'admin') {
                throw new ApiError(403, 'Access denied. Admin rights required');
            }

            const { code } = req.params;
            const updateData = req.body;

            const updatedRegion = await RegionService.updateRegionData(code, updateData);

            res.status(200).json({
                success: true,
                message: 'Region data updated successfully',
                data: updatedRegion
            });
        } catch (error) {
            next(error);
        }
    }

    async compareRegions(req: Request, res: Response, next: NextFunction) {
        try {
            const { regions, indicators, years } = req.body;

            const comparison = await RegionService.compareRegions({
                regionCodes: regions,
                indicators: indicators,
                years: years
            });

            res.status(200).json({
                success: true,
                data: comparison
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new RegionController();
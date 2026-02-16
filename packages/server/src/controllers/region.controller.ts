import { Request, Response } from 'express';
import { RegionService } from '../services/region.service';
import { Region } from '../models/Region.model';

export class RegionController {
    static async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filter: any = {};
            if (req.query.district) {
                filter.federalDistrict = req.query.district;
            }

            const result = await RegionService.getAll({ page, limit, filter });
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getByCode(req: Request, res: Response) {
        try {
            const region = await RegionService.getByCode(req.params.code);
            if (!region) {
                return res.status(404).json({ success: false, error: 'Регион не найден' });
            }
            res.json({ success: true, data: region });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const region = await RegionService.create(req.body);
            res.status(201).json({ success: true, data: region });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const region = await RegionService.update(req.params.code, req.body);
            if (!region) {
                return res.status(404).json({ success: false, error: 'Регион не найден' });
            }
            res.json({ success: true, data: region });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            const deleted = await RegionService.delete(req.params.code);
            if (!deleted) {
                return res.status(404).json({ success: false, error: 'Регион не найден' });
            }
            res.json({ success: true, message: 'Регион удалён' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
import { Request, Response } from 'express';
import { RegionService } from '../services/region.service';
import { enqueueTask, getTaskStatus } from '../queues/task.queue';
import { DataProvider } from '../services/dataProvider.service';

export class RegionController {
    static async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filter: Record<string, unknown> = {};
            if (req.query.district) {
                filter.federalDistrict = req.query.district;
            }

            const result = await RegionService.getAll({ page, limit, filter });
            res.json({ success: true, ...result });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка получения регионов';
            res.status(500).json({ success: false, error: message });
        }
    }

    static async getByCode(req: Request, res: Response) {
        try {
            const region = await RegionService.getByCode(req.params.code);
            if (!region) {
                return res.status(404).json({ success: false, error: 'Регион не найден' });
            }
            return res.json({ success: true, data: region });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка получения региона';
            return res.status(500).json({ success: false, error: message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const region = await RegionService.create(req.body);
            return res.status(201).json({ success: true, data: region });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка создания региона';
            return res.status(500).json({ success: false, error: message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const region = await RegionService.update(req.params.code, req.body);
            if (!region) {
                return res.status(404).json({ success: false, error: 'Регион не найден' });
            }
            return res.json({ success: true, data: region });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка обновления региона';
            return res.status(500).json({ success: false, error: message });
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            const deleted = await RegionService.delete(req.params.code);
            if (!deleted) {
                return res.status(404).json({ success: false, error: 'Регион не найден' });
            }
            return res.json({ success: true, message: 'Регион удалён' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка удаления региона';
            return res.status(500).json({ success: false, error: message });
        }
    }
    static async importGeoJSON(req: Request, res: Response) {
        try {
            if (req.query.async === 'true') {
                const jobId = await enqueueTask({ type: 'importGeoJson', payload: req.body });
                if (!jobId) {
                    return res.status(503).json({ success: false, error: 'Очередь задач недоступна' });
                }
                return res.status(202).json({ success: true, data: { jobId, status: 'queued' } });
            }

            const result = await RegionService.importFromGeoJSON(req.body);
            return res.json({ success: true, data: result });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка импорта GeoJSON';
            return res.status(500).json({ success: false, error: message });
        }
    }

    static async getImportTask(req: Request, res: Response) {
        const task = await getTaskStatus(req.params.jobId);
        if (!task) return res.status(404).json({ success: false, error: 'Задача не найдена' });
        return res.json({ success: true, data: task });
    }
}
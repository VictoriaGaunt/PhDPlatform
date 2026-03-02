import { RegionService } from './region.service';
import { Indicator } from '../models/Indicator.model';
import { Dataset } from '../models/Dataset.model';
import { Readable } from 'stream';
import csv from 'csv-parser';
import {Region} from "../models/Region.model";

export class DataService {
    /**
     * Импорт регионов из CSV-строки или буфера
     */
    static async importRegionsFromCSV(buffer: Buffer): Promise<{ imported: number; errors: any[] }> {
        const results: any[] = [];
        const errors: any[] = [];

        const stream = Readable.from(buffer.toString());
        const parser = stream.pipe(csv());

        return new Promise((resolve, reject) => {
            parser.on('data', (data) => results.push(data));
            parser.on('error', (err) => reject(err));
            parser.on('end', async () => {
                let imported = 0;
                for (const row of results) {
                    try {
                        // Преобразовать строку в регион (код, название и т.д.)
                        const regionData = {
                            code: row.code,
                            name: row.name,
                            population: row.population ? parseInt(row.population) : undefined,
                            area: row.area ? parseFloat(row.area) : undefined,
                            hci: row.hci ? parseFloat(row.hci) : undefined,
                            federalDistrict: row.federalDistrict,
                        };
                        await RegionService.create(regionData);
                        imported++;
                    } catch (err: any) {
                        errors.push({ row, error: err.message });
                    }
                }
                resolve({ imported, errors });
            });
        });
    }

    /**
     * Получить статистику по данным (общее количество регионов, средний ИЧК и т.д.)
     */
    static async getStats() {
        const totalRegions = await RegionService.count(); // нужно добавить метод count в RegionService
        const avgHci = await Region.aggregate([
            { $match: { hci: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$hci' } } },
        ]);
        const totalIndicators = await Indicator.countDocuments();

        return {
            totalRegions,
            avgHci: avgHci[0]?.avg || null,
            totalIndicators,
        };
    }

    /**
     * Загрузить датасет (сохранить метаданные в БД)
     */
    static async uploadDataset(file: Express.Multer.File, uploadedBy: string, name: string, description?: string) {
        const dataset = new Dataset({
            name,
            description,
            filename: file.originalname,
            filePath: file.path,
            format: file.mimetype.includes('csv') ? 'csv' : file.mimetype.includes('json') ? 'json' : 'xlsx',
            size: file.size,
            uploadedBy,
            tags: [],
        });
        await dataset.save();
        return dataset;
    }
}
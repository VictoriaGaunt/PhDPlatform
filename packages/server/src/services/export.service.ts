import * as ExcelJS from 'exceljs';
import { RegionService } from './region.service';
import { PredictionService, ForecastResult } from './prediction.service';
//import { Readable } from 'stream';

export class ExportService {
    static async exportRegionsToExcel(): Promise<Buffer> {
    const { data: regions } = await RegionService.getAll({ limit: 1000 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Regions');

    worksheet.columns = [
        { header: 'Код', key: 'code', width: 10 },
        { header: 'Название', key: 'name', width: 30 },
        { header: 'Население', key: 'population', width: 15 },
        { header: 'Площадь', key: 'area', width: 15 },
        { header: 'ИЧК', key: 'hci', width: 10 },
        { header: 'Федеральный округ', key: 'federalDistrict', width: 20 },
    ];

        regions.forEach((region) => {
            worksheet.addRow({
                code: region.code,
                name: region.name,
                population: region.population,
                area: region.area,
                hci: region.hci,
                federalDistrict: region.federalDistrict,
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer as unknown as Buffer;
    }

    static exportPredictionsToCSV(predictions: ForecastResult): string {
        const rows = predictions.predictions.map(p => `${p.year},${p.value}`);
        return ['year,value', ...rows].join('\n');
    }
}
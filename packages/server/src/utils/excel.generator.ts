import ExcelJS from 'exceljs';
import { RegionType } from '../types/models';

/**
 * Генерация Excel-файла с регионами
 */
export async function generateRegionsExcel(regions: RegionType[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Регионы');

    worksheet.columns = [
        { header: 'Код', key: 'code', width: 10 },
        { header: 'Название', key: 'name', width: 30 },
        { header: 'Население', key: 'population', width: 15 },
        { header: 'Площадь', key: 'area', width: 15 },
        { header: 'ИЧК', key: 'hci', width: 10 },
        { header: 'Федеральный округ', key: 'federalDistrict', width: 20 },
    ];

    regions.forEach(region => {
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

/**
 * Генерация Excel с прогнозами
 */
export async function generatePredictionsExcel(_predictions: any[]): Promise<Buffer> {
    // аналогично
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('Прогнозы');
    // ... логика
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
}
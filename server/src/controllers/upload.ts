import { Request, Response } from 'express';
import { ExcelService } from '../services/excel.service';

const excelService = new ExcelService();

export class UploadController {
    async upload(req: Request, res: Response) {
        try {
            // Проверяем тип запроса
            if (req.headers['content-type']?.includes('multipart/form-data')) {
                // Используем встроенный multer для теста
                const multer = require('multer');
                const upload = multer({ storage: multer.memoryStorage() });

                upload.single('file')(req, res, async (err: any) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }

                    if (!req.file) {
                        return res.status(400).json({ error: 'No file uploaded' });
                    }

                    const result = await excelService.uploadExcel(
                        req.file.buffer,
                        req.file.originalname
                    );

                    return res.json({ success: true, data: result });
                });
            } else {
                // Простой текст для теста
                res.send('Используйте форму загрузки');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async listSheets(req: Request, res: Response) {
        try {
            const sheets = await excelService.getSheets();
            res.json({ success: true, data: sheets });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://torikoenit_db_user:4NzapMFnkCWzooNe@cluster0.rk2wmpy.mongodb.net/excel_db?retryWrites=true&w=majority';

async function connectDB() {
    try {
        console.log('🔄 Подключаемся к MongoDB Atlas...');

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Успешно подключено к MongoDB Atlas!');
        console.log(`📊 База данных: ${mongoose.connection.db?.databaseName || 'not available'}`);
        console.log(`🌐 Хост: ${mongoose.connection.host || 'not available'}`);

    } catch (error: any) {
        console.error('❌ Ошибка подключения к MongoDB Atlas:', error.message);
        process.exit(1);
    }
}

connectDB();

// Модель для хранения Excel данных
const ExcelDataSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    sheetName: { type: String, required: true },
    data: { type: [mongoose.Schema.Types.Mixed], required: true },
    columns: { type: [String], required: true },
    stats: {
        rows: { type: Number, default: 0 },
        columns: { type: Number, default: 0 }
    },
    uploadedAt: { type: Date, default: Date.now }
});

const ExcelData = mongoose.model('ExcelData', ExcelDataSchema);

// Настройка multer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') ||
            file.originalname.match(/\.(xlsx|xls)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только Excel файлы (.xlsx, .xls)'));
        }
    }
});

// HTML форма для загрузки
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Excel → MongoDB Atlas</title></head>
    <body>
      <h1>Загрузи Excel файл</h1>
      <form id="uploadForm">
        <input type="file" id="fileInput" accept=".xlsx,.xls">
        <button>Загрузить</button>
      </form>
      <div id="result"></div>
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const fileInput = document.getElementById('fileInput');
          const formData = new FormData();
          formData.append('file', fileInput.files[0]);
          
          try {
            const response = await fetch('/upload', { method: 'POST', body: formData });
            const data = await response.json();
            document.getElementById('result').innerHTML = JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').innerHTML = 'Ошибка: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Маршрут для загрузки файла - ИСПРАВЛЕННАЯ ВЕРСИЯ
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Файл не загружен'
            });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const results: Array<{sheetName: string, rows: number, columns: number}> = [];
        let totalRows = 0;
        let totalColumns = 0;

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, any>>;

            let columns: string[] = [];
            if (jsonData.length > 0 && jsonData[0]) {
                // Безопасное получение ключей
                const firstRow = jsonData[0];
                if (firstRow && typeof firstRow === 'object' && firstRow !== null) {
                    columns = Object.keys(firstRow);
                }
            }

            results.push({
                sheetName,
                rows: jsonData.length,
                columns: columns.length
            });

            totalRows += jsonData.length;
            totalColumns = Math.max(totalColumns, columns.length);
        }

        res.json({
            success: true,
            data: {
                fileName: req.file.originalname,
                sheets: results,
                totalRows,
                totalColumns,
                uploadedAt: new Date()
            }
        });

    } catch (error: any) {
        console.error('❌ Ошибка загрузки:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Ошибка при обработке файла'
        });
    }
});

// Маршрут для просмотра данных
app.get('/data', async (req, res) => {
    try {
        const allData = await ExcelData.find().sort({ uploadedAt: -1 }).limit(50);

        res.json({
            success: true,
            count: allData.length,
            data: allData
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check - ИСПРАВЛЕННАЯ ВЕРСИЯ
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    let dbText = 'unknown';

    switch(dbStatus) {
        case 0: dbText = 'disconnected'; break;
        case 1: dbText = 'connected'; break;
        case 2: dbText = 'connecting'; break;
        case 3: dbText = 'disconnecting'; break;
    }

    res.json({
        status: 'ok',
        serverTime: new Date().toISOString(),
        database: {
            status: dbText,
            name: mongoose.connection.db?.databaseName || 'not connected',
            host: mongoose.connection.host || 'not connected'
        }
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Открой в браузере: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

interface Region {
    code: string;
    name: string;
    population: number;
    area: number;
    hci: number;
    federalDistrict: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const app = express();
const PORT = parseInt(process.env.PORT || '5000');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phd-platform';

        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB подключена успешно');
    } catch (error: any) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        console.log('🔄 Используем режим без базы данных...');
    }
};

// Маршруты
app.get('/', (_req: Request, res: Response) => {
    const response: ApiResponse = {
        success: true,
        message: 'PhD Research Platform API',
        data: {
            version: '1.0.0',
            status: 'running',
            environment: NODE_ENV,
            timestamp: new Date().toISOString(),
            endpoints: {
                health: '/health',
                test: '/api/v1/test',
                regions: '/api/v1/regions'
            }
        }
    };
    res.json(response);
});

app.get('/health', (_req: Request, res: Response) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const response: ApiResponse = {
        success: true,
        data: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbStatus,
            environment: NODE_ENV
        }
    };

    res.status(200).json(response);
});

app.get('/api/v1/test', (_req: Request, res: Response) => {
    const regions: Region[] = [
        { code: '77', name: 'Москва', population: 13000000, area: 2561, hci: 0.85, federalDistrict: 'Центральный' },
        { code: '78', name: 'Санкт-Петербург', population: 5600000, area: 1439, hci: 0.78, federalDistrict: 'Северо-Западный' },
        { code: '54', name: 'Новосибирская область', population: 2800000, area: 177756, hci: 0.65, federalDistrict: 'Сибирский' }
    ];

    const response: ApiResponse<{ regions: Region[]; metrics: any }> = {
        success: true,
        message: 'API работает успешно!',
        data: {
            regions,
            metrics: {
                totalRegions: regions.length,
                averageHCI: +(regions.reduce((sum, r) => sum + r.hci, 0) / regions.length).toFixed(3),
                maxPopulation: Math.max(...regions.map(r => r.population)),
                minPopulation: Math.min(...regions.map(r => r.population))
            }
        }
    };

    res.json(response);
});

app.get('/api/v1/regions', (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const allRegions: Region[] = [
        { code: '77', name: 'Москва', population: 13000000, area: 2561, hci: 0.85, federalDistrict: 'Центральный' },
        { code: '78', name: 'Санкт-Петербург', population: 5600000, area: 1439, hci: 0.78, federalDistrict: 'Северо-Западный' },
        { code: '54', name: 'Новосибирская область', population: 2800000, area: 177756, hci: 0.65, federalDistrict: 'Сибирский' },
        { code: '66', name: 'Свердловская область', population: 4300000, area: 194307, hci: 0.72, federalDistrict: 'Уральский' },
        { code: '23', name: 'Краснодарский край', population: 5700000, area: 75485, hci: 0.68, federalDistrict: 'Южный' }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRegions = allRegions.slice(startIndex, endIndex);
    const total = allRegions.length;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<Region[]> = {
        success: true,
        data: paginatedRegions,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };

    res.json(response);
});

app.get('/api/v1/regions/:code', (req: Request, res: Response) => {
    const { code } = req.params;

    const regionsMap: { [key: string]: Region & { indicators?: any[] } } = {
        '77': {
            code: '77',
            name: 'Москва',
            population: 13000000,
            area: 2561,
            hci: 0.85,
            federalDistrict: 'Центральный',
            indicators: [
                {
                    year: 2021,
                    education: { literacyRate: 99.9, higherEducationRate: 57.2 },
                    health: { lifeExpectancy: 77.8, mortalityRate: 7.9 },
                    economy: { gdpPerCapita: 920000, unemploymentRate: 1.9 },
                    social: { povertyRate: 7.8, crimeRate: 420 },
                    humanCapitalIndex: 0.85
                }
            ]
        }
    };

    const region = regionsMap[code];

    if (!region) {
        const response: ApiResponse = {
            success: false,
            error: `Регион с кодом ${code} не найден`
        };
        res.status(404).json(response);
        return;
    }

    const response: ApiResponse<typeof region> = {
        success: true,
        data: region
    };

    res.json(response);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
    const response: ApiResponse = {
        success: false,
        error: 'Маршрут не найден',
        message: `Запрошенный путь ${req.originalUrl} не существует`
    };

    res.status(404).json(response);
});

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: any) => {
    console.error('❌ Ошибка сервера:', error.stack);

    const response: ApiResponse = {
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: NODE_ENV === 'development' ? error.message : undefined
    };

    res.status(500).json(response);
});

// Запуск сервера
const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log('='.repeat(70));
            console.log('🚀 PhD RESEARCH PLATFORM - SERVER STARTED');
            console.log('='.repeat(70));
            console.log(`📡 Окружение: ${NODE_ENV}`);
            console.log(`🌐 Сервер: http://localhost:${PORT}`);
            console.log(`🩺 Проверка: http://localhost:${PORT}/health`);
            console.log(`🔗 API: http://localhost:${PORT}/api/v1/test`);
            console.log(`🗺️ Регионы: http://localhost:${PORT}/api/v1/regions`);
            console.log('='.repeat(70));

            if (mongoose.connection.readyState === 1) {
                console.log('✅ MongoDB: Подключена');
            } else {
                console.log('⚠️  MongoDB: Не подключена (режим без БД)');
            }
            console.log('='.repeat(70));
        });

    } catch (error: any) {
        console.error('❌ Не удалось запустить сервер:', error.message);
        process.exit(1);
    }
};

// Обработка завершения работы
process.on('SIGTERM', () => {
    console.log('🛑 Получен SIGTERM, завершение работы...');
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Получен SIGINT, завершение работы...');
    mongoose.connection.close();
    process.exit(0);
});

// Запускаем сервер
startServer();

export default app;
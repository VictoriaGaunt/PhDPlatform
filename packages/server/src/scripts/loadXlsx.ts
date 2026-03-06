import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import path from 'path';
import dotenv from 'dotenv';
import { Indicator } from '../models/Indicator.model';

dotenv.config();

const FILE_PATH = path.join(__dirname, '../../data/regions_data.xlsx');
const SHEET_MAPPINGS = [
    {
        sheetName: 'Устойчивое развитие',
        indicators: [
            { modelField: 'demography.birthRate', rowOffset: 0 },               // Рождаемость – первая таблица
            { modelField: 'poverty.povertyRate', rowOffset: 1 },                // Ликвидация нищеты – вторая таблица
            { modelField: 'poverty.povertyLine', rowOffset: 2 },                // Граница бедности
            { modelField: 'poverty.socialBenefitsPercent', rowOffset: 3 },      // Пособия и социальная помощь
            { modelField: 'demography.infantMortality', rowOffset: 4 },         // Младенческая смертность
            { modelField: 'demography.morbidity', rowOffset: 5 },               // Заболеваемость
            { modelField: 'demography.lifeExpectancy', rowOffset: 6 },          // Ожидаемая продолжительность жизни
            { modelField: 'education.educationExpenditurePercent', rowOffset: 7 }, // Качественное образование
            { modelField: 'education.graduateEmploymentRate', rowOffset: 8 },   // Трудоустройство выпускников
            { modelField: 'ecology.freshWaterUse', rowOffset: 9 },              // Чистая вода и санитария
            { modelField: 'ecology.environmentProtectionExpenses', rowOffset: 10 }, // Расходы на охрану среды
            { modelField: 'ecology.pollutionCaptureRate', rowOffset: 11 },      // Доля обезвреженных веществ
            { modelField: 'innovation.innovativeGoodsPercent', rowOffset: 12 }, // Уд. вес инновационных товаров
            { modelField: 'innovation.innovationCostsPercent', rowOffset: 13 }, // Затраты на инновации
            { modelField: 'innovation.innovativeOrganizationsPercent', rowOffset: 14 }, // Организации с инновациями
            { modelField: 'housing.housingPerCapita', rowOffset: 15 },          // Общая площадь жилья
            { modelField: 'housing.familiesInNeedHousing', rowOffset: 16 },     // Число семей, нуждающихся в жилье
            { modelField: 'finance.taxRevenues', rowOffset: 17 },               // Налоговые поступления
            { modelField: 'finance.internetSubscribersPer100', rowOffset: 18 }, // Абоненты интернета
        ],
    },
    {
        sheetName: 'Достойный труд',
        indicators: [
            { modelField: 'labor.decentWageRatio', rowOffset: 0 },              // Достойная зарплата
            { modelField: 'labor.wageToPMLRatio', rowOffset: 1 },               // Соотношение с ПМ
            { modelField: 'labor.employmentRate', rowOffset: 2 },               // Доля занятых
            { modelField: 'labor.unemploymentRate', rowOffset: 3 },             // Уровень безработицы
            { modelField: 'labor.informalEmploymentRate', rowOffset: 4 },       // Занятые в неформальном секторе
            { modelField: 'labor.healthInvestments', rowOffset: 5 },            // Инвестиции в здравоохранение
            { modelField: 'poverty.giniCoefficient', rowOffset: 6 },            // Индекс концентрации доходов
            { modelField: 'poverty.fundsRatio', rowOffset: 7 },                 // Коэффициент фондов
            { modelField: 'labor.injuredWorkers', rowOffset: 8 },               // Численность пострадавших
            { modelField: 'labor.harmfulWorkersPercent', rowOffset: 9 },        // Уд. вес работников с вредными условиями
            { modelField: 'labor.disabilityDays', rowOffset: 10 },              // Человеко-дней нетрудоспособности
            { modelField: 'labor.laborProtectionExpenses', rowOffset: 11 },     // Расходы на охрану труда
        ],
    },
    {
        sheetName: 'Результативность труда',
        indicators: [
            { modelField: 'economy.gdpPerCapita', rowOffset: 0 },               // ВРП на душу
            { modelField: 'economy.investmentsPerCapita', rowOffset: 1 },       // Инвестиции на душу
            { modelField: 'economy.laborProductivityIndex', rowOffset: 2 },     // Индекс производительности труда
        ],
    },
    {
        sheetName: 'Инфляция, задолженность населен',
        indicators: [
            { modelField: 'additional.inflation', rowOffset: 1 },               // Инфляция
            { modelField: 'additional.loanDebt', rowOffset: 3 },                // Задолженность по кредитам
        ],
    },
];

function setNestedField(obj: any, path: string, value: any) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

const loadXlsxData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Подключено к MongoDB');
        const workbook = XLSX.readFile(FILE_PATH);
        const regionYearMap = new Map<string, Set<number>>();

        for (const sheetMapping of SHEET_MAPPINGS) {
            const sheet = workbook.Sheets[sheetMapping.sheetName];
            if (!sheet) {
                console.warn(`⚠️ Лист ${sheetMapping.sheetName} не найден, пропускаем`);
                continue;
            }
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            if (rows.length < 4) continue;
            const regionNames = rows.slice(3).map((row: any[]) => row[1]);
            const years = rows[1].slice(2).map((cell: any) => parseInt(cell, 10)).filter((y: number) => !isNaN(y));

            for (let r = 0; r < regionNames.length; r++) {
                const regionName = regionNames[r];
                if (!regionName) continue;
                for (let y = 0; y < years.length; y++) {
                    const year = years[y];
                    const key = `${regionName}_${year}`;
                    if (!regionYearMap.has(key)) {
                        regionYearMap.set(key, new Set());
                    }
                }
            }
        }

        const docsMap = new Map<string, any>();
        regionYearMap.forEach((_, key) => {
            docsMap.set(key, {
                regionCode: key.split('_')[0],
                year: parseInt(key.split('_')[1], 10),
            });
        });

        for (const sheetMapping of SHEET_MAPPINGS) {
            const sheet = workbook.Sheets[sheetMapping.sheetName];
            if (!sheet) continue;

            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            let yearRowIndex = -1;
            for (let i = 0; i < Math.min(5, rows.length); i++) {
                const row = rows[i];
                if (row && row.some(cell => typeof cell === 'number' && cell >= 2000 && cell <= 2030)) {
                    yearRowIndex = i;
                    break;
                }
            }
            if (yearRowIndex === -1) {
                console.warn(`Не удалось найти строку с годами на листе ${sheetMapping.sheetName}`);
                continue;
            }

            const years = rows[yearRowIndex].slice(2).map(cell => parseInt(cell, 10)).filter(y => !isNaN(y));
            const regionStartRow = yearRowIndex + 2;
            const regionColumn = 1;

            for (let i = 0; i < sheetMapping.indicators.length; i++) {
                const indicator = sheetMapping.indicators[i];
                const dataRowIndex = regionStartRow + indicator.rowOffset;
                if (dataRowIndex >= rows.length) continue;
                const dataRow = rows[dataRowIndex];
                if (!dataRow) continue;

                for (let r = 0; r < rows.length - regionStartRow; r++) {
                    const regionName = rows[regionStartRow + r]?.[regionColumn];
                    if (!regionName) continue;
                    for (let y = 0; y < years.length; y++) {
                        const year = years[y];
                        const value = dataRow[2 + y];
                        if (value === undefined || value === null || value === '') continue;
                        const key = `${regionName}_${year}`;
                        const doc = docsMap.get(key);
                        if (doc) {
                            setNestedField(doc, indicator.modelField, value);
                        }
                    }
                }
            }
        }

        const indicators = Array.from(docsMap.values());
        console.log(`📊 Сформировано ${indicators.length} документов`);
        await Indicator.deleteMany({ source: 'xlsx' });
        const result = await Indicator.insertMany(indicators, { ordered: false });
        console.log(`✅ Загружено ${result.length} записей в MongoDB`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка загрузки XLSX:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

void loadXlsxData();
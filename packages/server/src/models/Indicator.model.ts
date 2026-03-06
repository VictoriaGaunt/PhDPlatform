import mongoose, { Schema, Document } from 'mongoose';

export interface IIndicator extends Document {
    regionCode: string;          // Код региона (например, 'RU-MOW')
    year: number;                // Год наблюдения

    // ========== Устойчивое развитие (лист 1) ==========
    demography: {
        birthRate: number;         // Рождаемость (на 1000 чел.)
        infantMortality: number;   // Младенческая смертность (%)
        lifeExpectancy: number;    // Ожидаемая продолжительность жизни (лет)
        morbidity: number;         // Заболеваемость (на 1000 чел.)
    };

    poverty: {
        povertyRate: number;               // Доля населения с доходами ниже ПМ (%)
        povertyLine: number;               // Граница бедности (руб.)
        socialBenefitsPercent: number;     // Доля пособий и соц. помощи (%)
        giniCoefficient: number;           // Коэффициент Джини
        fundsRatio: number;                 // Коэффициент фондов (разы)
    };

    education: {
        educationExpenditurePercent: number;   // Доля расходов на образование (% от платных услуг)
        graduateEmploymentRate: number;        // Трудоустройство выпускников ВУЗов (%)
    };

    ecology: {
        freshWaterUse: number;                 // Использование свежей воды (млн м³)
        environmentProtectionExpenses: number; // Расходы на охрану окружающей среды (млн руб.)
        pollutionCaptureRate: number;          // Доля уловленных загрязняющих веществ (%)
    };

    innovation: {
        innovativeGoodsPercent: number;        // Удельный вес инновационных товаров (%)
        innovationCostsPercent: number;        // Затраты на инновации (% от отгруженных товаров)
        innovativeOrganizationsPercent: number; // Доля организаций, осуществлявших инновации (%)
    };

    housing: {
        housingPerCapita: number;              // Общая площадь жилья на человека (м²)
        familiesInNeedHousing: number;         // Число семей, нуждающихся в жилье (тыс.)
    };

    finance: {
        taxRevenues: number;                   // Налоговые поступления в региональный бюджет (млн руб.)
        internetSubscribersPer100: number;     // Число абонентов фиксированного интернета на 100 чел.
    };

    // ========== Достойный труд (лист 2) ==========
    labor: {
        decentWageRatio: number;               // Соотношение начисленной ЗП с достойной ЗП (%)
        wageToPMLRatio: number;                // Соотношение ЗП с прожиточным минимумом (%)
        employmentRate: number;                // Доля занятых в трудоспособном возрасте (%)
        unemploymentRate: number;              // Уровень безработицы (%)
        informalEmploymentRate: number;        // Занятые в неформальном секторе (%)
        healthInvestments: number;             // Инвестиции в здравоохранение и соц. услуги (млн руб.)
        injuredWorkers: number;                // Численность пострадавших на производстве (чел.)
        harmfulWorkersPercent: number;         // Доля работников с вредными/опасными условиями (%)
        disabilityDays: number;                // Человеко-дней нетрудоспособности
        laborProtectionExpenses: number;       // Расходы на охрану труда (тыс. руб.)
    };

    // ========== Результативность труда (лист 3) ==========
    economy: {
        gdpPerCapita: number;                  // ВРП на душу населения (руб.)
        investmentsPerCapita: number;          // Инвестиции в основной капитал на душу (руб.)
        laborProductivityIndex: number;        // Индекс производительности труда (%)
    };

    // ========== Инфляция и задолженность (лист 4) ==========
    additional: {
        inflation: number;                     // Индекс потребительских цен (%, к декабрю предыдущего года)
        loanDebt: number;                      // Задолженность по кредитам физ. лиц (млн руб.)
    };
}

const IndicatorSchema = new Schema<IIndicator>({
    regionCode: { type: String, required: true, index: true },
    year: { type: Number, required: true },

    demography: {
        birthRate: Number,
        infantMortality: Number,
        lifeExpectancy: Number,
        morbidity: Number,
    },

    poverty: {
        povertyRate: Number,
        povertyLine: Number,
        socialBenefitsPercent: Number,
        giniCoefficient: Number,
        fundsRatio: Number,
    },

    education: {
        educationExpenditurePercent: Number,
        graduateEmploymentRate: Number,
    },

    ecology: {
        freshWaterUse: Number,
        environmentProtectionExpenses: Number,
        pollutionCaptureRate: Number,
    },

    innovation: {
        innovativeGoodsPercent: Number,
        innovationCostsPercent: Number,
        innovativeOrganizationsPercent: Number,
    },

    housing: {
        housingPerCapita: Number,
        familiesInNeedHousing: Number,
    },

    finance: {
        taxRevenues: Number,
        internetSubscribersPer100: Number,
    },

    labor: {
        decentWageRatio: Number,
        wageToPMLRatio: Number,
        employmentRate: Number,
        unemploymentRate: Number,
        informalEmploymentRate: Number,
        healthInvestments: Number,
        injuredWorkers: Number,
        harmfulWorkersPercent: Number,
        disabilityDays: Number,
        laborProtectionExpenses: Number,
    },

    economy: {
        gdpPerCapita: Number,
        investmentsPerCapita: Number,
        laborProductivityIndex: Number,
    },

    additional: {
        inflation: Number,
        loanDebt: Number,
    },
}, { timestamps: true });

IndicatorSchema.index({ regionCode: 1, year: 1 }, { unique: true });

export const Indicator = mongoose.model<IIndicator>('Indicator', IndicatorSchema);
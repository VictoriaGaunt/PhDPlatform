// shared/types.ts
export interface RegionIndicator {
    name: string;
    value: number;
    unit: string;
    year: number;
}

export interface RegionData {
    id?: string;
    name: string;
    code: string; // Код региона ОКАТО
    year: number;

    // Блок 1: Устойчивое развитие
    block1: 'favorable' | 'moderate' | 'unfavorable';
    block1Score: number;
    birthrate: number;      // Рождаемость
    poverty: number;        // Уровень бедности
    lifeExpectancy: number; // Продолжительность жизни
    infantMortality: number;// Младенческая смертность

    // Блок 2: Достойный труд
    block2: 'favorable' | 'moderate' | 'unfavorable';
    block2Score: number;
    employment: number;     // Занятость
    salary: number;         // Средняя зарплата
    socialSupport: number;  // Социальная поддержка
    povertyLine: number;    // Граница бедности

    // Блок 3: Результативность труда
    block3: 'favorable' | 'moderate' | 'unfavorable';
    block3Score: number;
    productivity: number;   // Производительность труда
    educationSpending: number; // Расходы на образование
    morbidity: number;      // Заболеваемость

    // Рассчитываемые поля
    compositeScore: number;
    updatedAt: Date;
}

export interface ApiResponse<T> {
    data: T;
    meta: {
        total: number;
        year: number;
        updated: string;
    };
}
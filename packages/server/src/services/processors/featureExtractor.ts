import { IIndicator } from '../../models/Indicator.model';

export interface ExtractedFeatures {
    education: number;
    health: number;
    economy: number;
    social: number;
    // можно добавить год
    year?: number;
}

export class FeatureExtractor {
    /**
     * Извлечение признаков из массива индикаторов
     */
    static extractFromIndicators(indicators: IIndicator[]): ExtractedFeatures[] {
        return indicators.map(ind => ({
            education: this.calculateEducationScore(ind.education),
            health: ind.health?.lifeExpectancy ?? 0,
            economy: ind.economy?.gdpPerCapita ? ind.economy.gdpPerCapita / 10000 : 0, // масштабирование
            social: ind.social?.povertyRate ? (100 - ind.social.povertyRate) / 100 : 0,
            year: ind.year,
        }));
    }

    /**
     * Вспомогательный метод для расчёта образования
     */
    private static calculateEducationScore(education: any): number {
        if (!education) return 0;
        // Если есть literacyRate и higherEducationRate, усредняем
        const literacy = education.literacyRate ?? 0;
        const higher = education.higherEducationRate ?? 0;
        return (literacy + higher) / 2;
    }

    /**
     * Нормализация признаков (пример)
     */
    static normalizeFeatures(features: ExtractedFeatures[]): ExtractedFeatures[] {
        // Находим минимумы и максимумы для каждого признака
        const mins = {
            education: Math.min(...features.map(f => f.education)),
            health: Math.min(...features.map(f => f.health)),
            economy: Math.min(...features.map(f => f.economy)),
            social: Math.min(...features.map(f => f.social)),
        };
        const maxs = {
            education: Math.max(...features.map(f => f.education)),
            health: Math.max(...features.map(f => f.health)),
            economy: Math.max(...features.map(f => f.economy)),
            social: Math.max(...features.map(f => f.social)),
        };

        return features.map(f => ({
            education: (f.education - mins.education) / (maxs.education - mins.education || 1),
            health: (f.health - mins.health) / (maxs.health - mins.health || 1),
            economy: (f.economy - mins.economy) / (maxs.economy - mins.economy || 1),
            social: (f.social - mins.social) / (maxs.social - mins.social || 1),
            year: f.year,
        }));
    }

    /**
     * Создание лаговых признаков (для временных рядов)
     */
    static createLagFeatures(features: ExtractedFeatures[], lags: number[] = [1, 2, 3]): any[] {
        // Преобразуем массив признаков в формат с лагами
        const result: any[] = [];
        for (let i = 0; i < features.length; i++) {
            const lagged: any = { ...features[i] };
            for (const lag of lags) {
                if (i - lag >= 0) {
                    lagged[`education_lag_${lag}`] = features[i - lag].education;
                    lagged[`health_lag_${lag}`] = features[i - lag].health;
                    lagged[`economy_lag_${lag}`] = features[i - lag].economy;
                    lagged[`social_lag_${lag}`] = features[i - lag].social;
                } else {
                    lagged[`education_lag_${lag}`] = null;
                    lagged[`health_lag_${lag}`] = null;
                    lagged[`economy_lag_${lag}`] = null;
                    lagged[`social_lag_${lag}`] = null;
                }
            }
            result.push(lagged);
        }
        return result;
    }
}
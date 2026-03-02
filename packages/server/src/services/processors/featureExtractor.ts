import { IIndicator } from '../../models/Indicator.model';

export interface ExtractedFeatures {
    education: number;
    health: number;
    economy: number;
    social: number;
    target?: number;
    year?: number;
}

export type LaggedFeatures = ExtractedFeatures & Record<string, number | null | undefined>;

export class FeatureExtractor {
    static extractFromIndicators(indicators: IIndicator[]): ExtractedFeatures[] {
        return indicators.map((ind) => ({
            education: this.calculateEducationScore(ind.education),
            health: this.calculateHealthScore(ind),
            economy: this.calculateEconomyScore(ind),
            social: this.calculateSocialScore(ind),
            target: ind.humanCapitalIndex,
            year: ind.year,
        }));
    }

    private static calculateEducationScore(education: IIndicator['education']): number {
        const literacy = education?.literacyRate ?? 0;
        const higher = education?.higherEducationRate ?? literacy;
        const enrollment = education?.schoolEnrollment ?? literacy;
        return (literacy * 0.4 + higher * 0.35 + enrollment * 0.25) / 100;
    }

    private static calculateHealthScore(indicator: IIndicator): number {
        const lifeExp = indicator.health?.lifeExpectancy ?? 0;
        const mortality = indicator.health?.mortalityRate ?? 10;
        const beds = indicator.health?.hospitalBeds ?? 60;
        return Math.max(0, Math.min(1, lifeExp / 100 * 0.6 + (1 - mortality / 20) * 0.25 + (beds / 100) * 0.15));
    }

    private static calculateEconomyScore(indicator: IIndicator): number {
        const gdpPerCapita = indicator.economy?.gdpPerCapita ?? 0;
        const unemployment = indicator.economy?.unemploymentRate ?? 7;
        const salary = indicator.economy?.averageSalary ?? 0;

        const gdpNorm = Math.min(1, gdpPerCapita / 1_000_000);
        const salaryNorm = Math.min(1, salary / 120_000);
        const unemploymentNorm = Math.max(0, 1 - unemployment / 20);

        return gdpNorm * 0.5 + salaryNorm * 0.3 + unemploymentNorm * 0.2;
    }

    private static calculateSocialScore(indicator: IIndicator): number {
        const poverty = indicator.social?.povertyRate ?? 15;
        const crime = indicator.social?.crimeRate ?? 1200;
        const housing = indicator.social?.housingPerCapita ?? 20;

        const povertyNorm = Math.max(0, 1 - poverty / 30);
        const crimeNorm = Math.max(0, 1 - crime / 3000);
        const housingNorm = Math.min(1, housing / 40);

        return povertyNorm * 0.45 + crimeNorm * 0.25 + housingNorm * 0.3;
    }

    static normalizeFeatures(features: ExtractedFeatures[]): ExtractedFeatures[] {
        if (!features.length) return [];
        const mins = {
            education: Math.min(...features.map((f) => f.education)),
            health: Math.min(...features.map((f) => f.health)),
            economy: Math.min(...features.map((f) => f.economy)),
            social: Math.min(...features.map((f) => f.social)),
        };
        const maxs = {
            education: Math.max(...features.map((f) => f.education)),
            health: Math.max(...features.map((f) => f.health)),
            economy: Math.max(...features.map((f) => f.economy)),
            social: Math.max(...features.map((f) => f.social)),
        };

        return features.map((f) => ({
            education: (f.education - mins.education) / (maxs.education - mins.education || 1),
            health: (f.health - mins.health) / (maxs.health - mins.health || 1),
            economy: (f.economy - mins.economy) / (maxs.economy - mins.economy || 1),
            social: (f.social - mins.social) / (maxs.social - mins.social || 1),
            target: f.target,
            year: f.year,
        }));
    }

    static createLagFeatures(features: ExtractedFeatures[], lags: number[] = [1, 2, 3]): LaggedFeatures[] {
        return features.map((current, i) => {
            const lagged: LaggedFeatures = { ...current };
            for (const lag of lags) {
                const prev = features[i - lag];
                lagged[`education_lag_${lag}`] = prev?.education ?? null;
                lagged[`health_lag_${lag}`] = prev?.health ?? null;
                lagged[`economy_lag_${lag}`] = prev?.economy ?? null;
                lagged[`social_lag_${lag}`] = prev?.social ?? null;
                lagged[`target_lag_${lag}`] = prev?.target ?? null;
            }
            return lagged;
        });
    }
    static addMovingAverages(features: LaggedFeatures[], windows: number[] = [3]): LaggedFeatures[] {
        return features.map((row, index) => {
            const extended: LaggedFeatures = { ...row };

            for (const window of windows) {
                const slice = features.slice(Math.max(0, index - window + 1), index + 1);
                const targetValues = slice.map((item) => item.target).filter((v): v is number => typeof v === 'number');
                extended[`target_ma_${window}`] =
                    targetValues.length > 0
                        ? targetValues.reduce((sum, value) => sum + value, 0) / targetValues.length
                        : null;
            }

            return extended;
        });
    }
}
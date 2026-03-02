// Множественная линейная регрессия
export class RegressionModel {
    private coefficients: number[] = [0.35, 0.25, 0.20, 0.15]; // β1..β4
    private intercept: number = 0.05; // α

    async predict(features: any[], horizon: number): Promise<any[]> {
        const predictions = [];
        const lastYear = features.length > 0 ? features[features.length - 1].year : new Date().getFullYear();
        // Для каждого года прогноза используем средние значения признаков или последние
        const lastFeatures = features.length > 0 ? features[features.length - 1].features : { education: 0.8, health: 0.7, economy: 0.6, social: 0.7 };
        for (let i = 1; i <= horizon; i++) {
            const edu = lastFeatures.education + 0.01 * i;
            const hlt = lastFeatures.health + 0.005 * i;
            const eco = lastFeatures.economy + 0.015 * i;
            const soc = lastFeatures.social + 0.008 * i;
            const value = this.intercept +
                this.coefficients[0] * edu +
                this.coefficients[1] * hlt +
                this.coefficients[2] * eco +
                this.coefficients[3] * soc;
            predictions.push({
                year: lastYear + i,
                value: Math.min(1, Math.max(0, value))
            });
        }
        return predictions;
    }

    getModelEquation(): string {
        return `HCI = α + β₁·EDU + β₂·HLT + β₃·ECO + β₄·SOC + ε`;
    }
}
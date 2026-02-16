// import Region from '../models/Region.model';
// import Prediction from '../models/Prediction.model';
// import CacheService from './cache.service';
// import { GradientBoostingModel } from './prediction/models/gradientBoosting.model';
//
// export class PredictionService {
//     private cacheService: CacheService;
//     private model: GradientBoostingModel;
//
//     constructor() {
//         this.cacheService = new CacheService();
//         this.model = new GradientBoostingModel();
//     }
//
//     async forecast(regionCode: string, options: {
//         horizon: number;
//         modelType: 'gradientBoosting' | 'regression' | 'timeSeries';
//         confidenceLevel: number;
//         scenarios: string[];
//     }) {
//         const cacheKey = `prediction:${regionCode}:${options.horizon}:${options.modelType}`;
//
//         // Проверка кэша
//         const cachedResult = await this.cacheService.get(cacheKey);
//         if (cachedResult) {
//             return cachedResult;
//         }
//
//         // Получение исторических данных
//         const region = await Region.findOne({ code: regionCode });
//         if (!region) {
//             throw new Error('Region not found');
//         }
//
//         // Подготовка данных
//         const historicalData = this.prepareTrainingData(region.indicators);
//
//         // Обучение модели (или загрузка предобученной)
//         let predictions;
//         switch (options.modelType) {
//             case 'gradientBoosting':
//                 predictions = await this.model.predict(historicalData, options.horizon);
//                 break;
//             case 'regression':
//                 predictions = await this.runRegressionModel(historicalData, options.horizon);
//                 break;
//             case 'timeSeries':
//                 predictions = await this.runTimeSeriesModel(historicalData, options.horizon);
//                 break;
//         }
//
//         // Расчет доверительных интервалов
//         const confidenceIntervals = this.calculateConfidenceIntervals(
//             predictions,
//             options.confidenceLevel
//         );
//
//         // Создание сценариев
//         const scenarioResults = this.generateScenarios(predictions, options.scenarios);
//
//         const result = {
//             region: region.name,
//             forecastPeriod: options.horizon,
//             predictions: predictions,
//             confidenceIntervals: confidenceIntervals,
//             scenarios: scenarioResults,
//             metrics: this.calculateModelMetrics(predictions, historicalData),
//             generatedAt: new Date()
//         };
//
//         // Сохранение в базу данных
//         const predictionRecord = new Prediction({
//             regionCode: regionCode,
//             modelType: options.modelType,
//             horizon: options.horizon,
//             results: result,
//             metadata: {
//                 confidenceLevel: options.confidenceLevel,
//                 scenarios: options.scenarios
//             }
//         });
//         await predictionRecord.save();
//
//         // Кэширование результатов
//         await this.cacheService.set(cacheKey, result, 3600); // 1 час
//
//         return result;
//     }
//
//     private prepareTrainingData(indicators: any[]) {
//         // Нормализация данных
//         return indicators
//             .sort((a, b) => a.year - b.year)
//             .map(indicator => ({
//                 year: indicator.year,
//                 features: {
//                     education: indicator.education,
//                     health: indicator.health,
//                     economy: indicator.economy,
//                     social: indicator.social
//                 },
//                 target: indicator.humanCapitalIndex
//             }));
//     }
//
//     private calculateConfidenceIntervals(predictions: any[], confidenceLevel: number) {
//         // Реализация расчета доверительных интервалов
//         return predictions.map(pred => ({
//             value: pred.value,
//             lowerBound: pred.value * (1 - confidenceLevel / 100),
//             upperBound: pred.value * (1 + confidenceLevel / 100)
//         }));
//     }
//
//     private generateScenarios(predictions: any[], scenarioTypes: string[]) {
//         // Генерация различных сценариев развития
//         const scenarios: any = {};
//
//         scenarioTypes.forEach(scenario => {
//             switch (scenario) {
//                 case 'optimistic':
//                     scenarios.optimistic = predictions.map(p => p.value * 1.15);
//                     break;
//                 case 'pessimistic':
//                     scenarios.pessimistic = predictions.map(p => p.value * 0.85);
//                     break;
//                 case 'baseline':
//                     scenarios.baseline = predictions.map(p => p.value);
//                     break;
//             }
//         });
//
//         return scenarios;
//     }
//
//     private calculateModelMetrics(predictions: any[], historicalData: any[]) {
//         // Расчет метрик качества модели
//         return {
//             rmse: this.calculateRMSE(predictions, historicalData),
//             rSquared: this.calculateRSquared(predictions, historicalData),
//             mae: this.calculateMAE(predictions, historicalData)
//         };
//     }
//
//     private calculateRMSE(predictions: any[], historicalData: any[]): number {
//         // Реализация RMSE
//         return 0.045; // Примерное значение из README
//     }
//
//     private calculateRSquared(predictions: any[], historicalData: any[]): number {
//         // Реализация R²
//         return 0.89; // Примерное значение из README
//     }
//
//     private calculateMAE(predictions: any[], historicalData: any[]): number {
//         // Реализация MAE
//         return 0.032; // Примерное значение из README
//     }
// }
//
// export default new PredictionService();
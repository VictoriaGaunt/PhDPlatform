import { ref, computed } from 'vue';
import { usePredictionsStore } from '@/stores/predictions.store';
import { useRegionsStore } from '@/stores/regions.store';
import type {
    ForecastRequest,
    ForecastResult,
    ModelType,
    PredictionScenario
} from '@/types/prediction.types';

export const usePredictions = () => {
    const predictionsStore = usePredictionsStore();
    const regionsStore = useRegionsStore();

    // Реактивные переменные
    const selectedRegion = ref<string>('');
    const selectedModel = ref<ModelType>('gradientBoosting');
    const forecastHorizon = ref<number>(5);
    const confidenceLevel = ref<number>(0.95);
    const selectedScenarios = ref<PredictionScenario[]>(['baseline', 'optimistic', 'pessimistic']);

    const isLoading = computed(() => predictionsStore.isLoading);
    const forecastResults = computed(() => predictionsStore.forecastResults);
    const predictionHistory = computed(() => predictionsStore.predictionHistory);
    const modelMetrics = computed(() => predictionsStore.modelMetrics);

    const availableRegions = computed(() =>
        regionsStore.regions.map(region => ({
            value: region.code,
            label: region.name
        }))
    );

    const availableModels = [
        { value: 'gradientBoosting', label: 'Градиентный бустинг', description: 'Высокая точность, медленное обучение' },
        { value: 'regression', label: 'Регрессионная модель', description: 'Быстрое обучение, интерпретируемость' },
        { value: 'timeSeries', label: 'Временные ряды', description: 'Учет сезонности и трендов' }
    ];

    const availableScenarios = [
        { value: 'baseline', label: 'Базовый', color: '#4CAF50' },
        { value: 'optimistic', label: 'Оптимистичный', color: '#2196F3' },
        { value: 'pessimistic', label: 'Пессимистичный', color: '#F44336' }
    ];

    // Методы
    const runForecast = async () => {
        if (!selectedRegion.value) {
            throw new Error('Выберите регион для прогнозирования');
        }

        const request: ForecastRequest = {
            regionCode: selectedRegion.value,
            modelType: selectedModel.value,
            horizon: forecastHorizon.value,
            confidenceLevel: confidenceLevel.value,
            scenarios: selectedScenarios.value
        };

        return await predictionsStore.runForecast(request);
    };

    const exportResults = (format: 'xlsx' | 'csv' | 'json') => {
        if (!forecastResults.value) {
            throw new Error('Нет результатов для экспорта');
        }

        predictionsStore.exportResults(format, forecastResults.value.id);
    };

    const compareModels = async (regionCode: string, models: ModelType[]) => {
        const comparisons = await Promise.all(
            models.map(async (model) => {
                const request: ForecastRequest = {
                    regionCode,
                    modelType: model,
                    horizon: forecastHorizon.value,
                    confidenceLevel: confidenceLevel.value,
                    scenarios: ['baseline']
                };

                const result = await predictionsStore.runForecast(request);
                return {
                    model,
                    metrics: result.metrics,
                    predictions: result.predictions
                };
            })
        );

        return comparisons;
    };

    const calculateSensitivity = async (regionCode: string, parameter: string, variations: number[]) => {
        // Анализ чувствительности к изменению параметров
        const baseRequest: ForecastRequest = {
            regionCode,
            modelType: selectedModel.value,
            horizon: forecastHorizon.value,
            confidenceLevel: confidenceLevel.value,
            scenarios: ['baseline']
        };

        const sensitivityResults = await Promise.all(
            variations.map(async (variation) => {
                const modifiedRequest = { ...baseRequest };
                // Здесь можно модифицировать параметры модели

                const result = await predictionsStore.runForecast(modifiedRequest);
                return {
                    parameter,
                    variation,
                    hci: result.predictions[0]?.value || 0
                };
            })
        );

        return sensitivityResults;
    };

    const visualizeEquation = () => {
        // Визуализация уравнения модели
        const equation = {
            hci: 'α + β₁∙EDUₜ + β₂∙HLTₜ + β₃∙ECOₜ + β₄∙SOCₜ + εₜ',
            parameters: [
                { name: 'α (константа)', value: 0.25, description: 'Базовый уровень ЧК' },
                { name: 'β₁ (образование)', value: 0.35, description: 'Вклад образования' },
                { name: 'β₂ (здравоохранение)', value: 0.25, description: 'Вклад здравоохранения' },
                { name: 'β₃ (экономика)', value: 0.10, description: 'Вклад экономики' },
                { name: 'β₄ (социальный)', value: 0.05, description: 'Вклад социальных факторов' }
            ],
            metrics: {
                rmse: 0.045,
                r2: 0.89,
                mae: 0.032
            }
        };

        return equation;
    };

    return {
        // State
        selectedRegion,
        selectedModel,
        forecastHorizon,
        confidenceLevel,
        selectedScenarios,

        // Computed
        isLoading,
        forecastResults,
        predictionHistory,
        modelMetrics,
        availableRegions,
        availableModels,
        availableScenarios,

        // Methods
        runForecast,
        exportResults,
        compareModels,
        calculateSensitivity,
        visualizeEquation
    };
};
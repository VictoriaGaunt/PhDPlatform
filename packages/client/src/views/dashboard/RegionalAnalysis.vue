<template>
  <DashboardLayout>
    <template #header>
      <div class="page-header">
        <h1>Региональный анализ</h1>
        <p>Детальный анализ человеческого капитала по регионам РФ</p>
      </div>
    </template>

    <div class="regional-analysis">
      <!-- Фильтры и контролы -->
      <div class="analysis-controls">
        <div class="control-group">
          <label>Выберите регион:</label>
          <select v-model="selectedRegionCode" class="region-select">
            <option value="">Все регионы</option>
            <option v-for="region in regions" :key="region.code" :value="region.code">
              {{ region.name }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>Период анализа:</label>
          <div class="range-selector">
            <input type="number" v-model="startYear" placeholder="С" min="2000" max="2023">
            <span>—</span>
            <input type="number" v-model="endYear" placeholder="По" min="2000" max="2023">
          </div>
        </div>

        <div class="control-group">
          <label>Показатели:</label>
          <select v-model="selectedIndicators" multiple class="indicators-select">
            <option value="education">Образование</option>
            <option value="health">Здравоохранение</option>
            <option value="economy">Экономика</option>
            <option value="social">Социальные факторы</option>
            <option value="hci">Индекс ЧК</option>
          </select>
        </div>

        <button @click="loadAnalysis" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Загрузка...' : 'Анализировать' }}
        </button>
      </div>

      <!-- Карта России -->
      <div class="map-section">
        <h2>Географическое распределение индекса ЧК</h2>
        <RussiaMap
            :regions="regions"
            :selected-region="selectedRegionCode"
            @region-click="handleRegionClick"
        />
        <div class="map-legend">
          <div class="legend-item" v-for="item in legendItems" :key="item.label">
            <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Графики и показатели -->
      <div class="charts-section">
        <div class="row">
          <div class="col-md-6">
            <TimeSeriesChart
                v-if="regionData"
                :data="regionData.indicators"
                title="Динамика показателей"
                :indicators="selectedIndicators"
            />
          </div>
          <div class="col-md-6">
            <RadarChart
                v-if="regionData"
                :data="regionData.indicators[regionData.indicators.length - 1]"
                title="Структура ЧК (текущий год)"
            />
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-md-12">
            <ComparativeChart
                :regions="comparisonRegions"
                :indicators="selectedIndicators"
                title="Сравнительный анализ регионов"
            />
          </div>
        </div>
      </div>

      <!-- KPI показатели -->
      <div class="kpi-section">
        <h2>Ключевые показатели</h2>
        <div class="kpi-grid">
          <KpiCard
              title="Индекс ЧК"
              :value="kpi.hci"
              :change="kpi.hciChange"
              :trend="kpi.hciTrend"
              icon="📊"
          />
          <KpiCard
              title="Среднее образование"
              :value="kpi.education"
              :change="kpi.educationChange"
              :trend="kpi.educationTrend"
              icon="🎓"
          />
          <KpiCard
              title="Здравоохранение"
              :value="kpi.health"
              :change="kpi.healthChange"
              :trend="kpi.healthTrend"
              icon="🏥"
          />
          <KpiCard
              title="Экономика"
              :value="kpi.economy"
              :change="kpi.economyChange"
              :trend="kpi.economyTrend"
              icon="💰"
          />
        </div>
      </div>

      <!-- Экспорт и действия -->
      <div class="actions-section">
        <button @click="exportAnalysis" class="btn-secondary">
          <i class="export-icon">📥</i> Экспорт анализа
        </button>
        <button @click="runForecast" class="btn-primary" v-if="selectedRegionCode">
          <i class="forecast-icon">🔮</i> Запустить прогноз
        </button>
        <button @click="compareWithAverage" class="btn-outline">
          <i class="compare-icon">📊</i> Сравнить со средним по РФ
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import RussiaMap from '@/components/maps/RussiaMap.vue';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart.vue';
import RadarChart from '@/components/charts/RadarChart.vue';
import ComparativeChart from '@/components/charts/ComparativeChart.vue';
import KpiCard from '@/components/dashboard/KpiCard.vue';
import { useRegionsStore } from '@/stores/regions.store';
import { usePredictionsStore } from '@/stores/predictions.store';
import type { Region, RegionIndicator } from '@/types/region.types';

const regionsStore = useRegionsStore();
const predictionsStore = usePredictionsStore();

const selectedRegionCode = ref<string>('');
const startYear = ref<number>(2010);
const endYear = ref<number>(2023);
const selectedIndicators = ref<string[]>(['hci', 'education', 'health', 'economy', 'social']);
const isLoading = ref<boolean>(false);
const regionData = ref<Region | null>(null);
const comparisonRegions = ref<Region[]>([]);

const regions = computed(() => regionsStore.regions);

const legendItems = [
  { color: '#006837', label: 'Высокий ЧК (0.8-1.0)' },
  { color: '#31a354', label: 'Выше среднего (0.6-0.8)' },
  { color: '#78c679', label: 'Средний (0.4-0.6)' },
  { color: '#c2e699', label: 'Ниже среднего (0.2-0.4)' },
  { color: '#ffffcc', label: 'Низкий ЧК (0.0-0.2)' }
];

const kpi = computed(() => {
  if (!regionData.value || !regionData.value.indicators.length) {
    return {
      hci: 0,
      hciChange: 0,
      hciTrend: 'neutral',
      education: 0,
      educationChange: 0,
      educationTrend: 'neutral',
      health: 0,
      healthChange: 0,
      healthTrend: 'neutral',
      economy: 0,
      economyChange: 0,
      economyTrend: 'neutral'
    };
  }

  const indicators = regionData.value.indicators;
  const last = indicators[indicators.length - 1];
  const previous = indicators.length > 1 ? indicators[indicators.length - 2] : last;

  return {
    hci: last.humanCapitalIndex,
    hciChange: ((last.humanCapitalIndex - previous.humanCapitalIndex) / previous.humanCapitalIndex * 100),
    hciTrend: last.humanCapitalIndex > previous.humanCapitalIndex ? 'up' : 'down',
    education: last.education.literacyRate,
    educationChange: ((last.education.literacyRate - previous.education.literacyRate) / previous.education.literacyRate * 100),
    educationTrend: last.education.literacyRate > previous.education.literacyRate ? 'up' : 'down',
    health: last.health.lifeExpectancy,
    healthChange: ((last.health.lifeExpectancy - previous.health.lifeExpectancy) / previous.health.lifeExpectancy * 100),
    healthTrend: last.health.lifeExpectancy > previous.health.lifeExpectancy ? 'up' : 'down',
    economy: last.economy.gdpPerCapita,
    economyChange: ((last.economy.gdpPerCapita - previous.economy.gdpPerCapita) / previous.economy.gdpPerCapita * 100),
    economyTrend: last.economy.gdpPerCapita > previous.economy.gdpPerCapita ? 'up' : 'down'
  };
});

const loadAnalysis = async () => {
  isLoading.value = true;

  try {
    if (selectedRegionCode.value) {
      regionData.value = await regionsStore.fetchRegionByCode(selectedRegionCode.value);

      // Загружаем данные для сравнения (регионы того же федерального округа)
      if (regionData.value) {
        comparisonRegions.value = await regionsStore.fetchRegionsByDistrict(
            regionData.value.federalDistrict,
            5
        );
      }
    } else {
      // Загружаем все регионы для сравнения
      await regionsStore.fetchAllRegions();
      comparisonRegions.value = regionsStore.regions.slice(0, 10);
    }
  } catch (error) {
    console.error('Ошибка загрузки анализа:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleRegionClick = (regionCode: string) => {
  selectedRegionCode.value = regionCode;
  loadAnalysis();
};

const exportAnalysis = () => {
  if (!selectedRegionCode.value) {
    regionsStore.exportRegions('xlsx');
  } else {
    // Экспорт конкретного региона
    const filename = `region_analysis_${selectedRegionCode.value}_${Date.now()}.xlsx`;
    regionsStore.exportRegionData(selectedRegionCode.value, filename);
  }
};

const runForecast = async () => {
  if (!selectedRegionCode.value) return;

  try {
    await predictionsStore.runForecast({
      regionCode: selectedRegionCode.value,
      modelType: 'gradientBoosting',
      horizon: 5,
      confidenceLevel: 0.95,
      scenarios: ['baseline', 'optimistic', 'pessimistic']
    });

    // Переход на страницу прогнозов
    router.push({
      name: 'predictions-results',
      params: { id: predictionsStore.forecastResults?.id }
    });
  } catch (error) {
    console.error('Ошибка прогнозирования:', error);
  }
};

const compareWithAverage = () => {
  // Сравнение с средними показателями по РФ
  console.log('Сравнение со средним по РФ');
  // Реализация сравнения
};

onMounted(async () => {
  await regionsStore.fetchAllRegions();
  // Загружаем данные для первого региона по умолчанию
  if (regions.value.length > 0) {
    selectedRegionCode.value = regions.value[0].code;
    await loadAnalysis();
  }
});
</script>

<style scoped>
.regional-analysis {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
}

.page-header p {
  margin: 10px 0 0 0;
  color: #7f8c8d;
}

.analysis-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.control-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.region-select,
.indicators-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.indicators-select {
  height: 120px;
}

.range-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-selector input {
  width: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.btn-primary {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.map-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.map-section h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.map-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-label {
  font-size: 0.9rem;
  color: #666;
}

.charts-section {
  margin-bottom: 30px;
}

.kpi-section {
  margin-bottom: 30px;
}

.kpi-section h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  padding: 10px 20px;
  background: transparent;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: #4CAF50;
  color: white;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: -10px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 10px;
}

.col-md-12 {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 10px;
}

.mt-4 {
  margin-top: 1.5rem;
}

.export-icon,
.forecast-icon,
.compare-icon {
  margin-right: 8px;
}
</style>
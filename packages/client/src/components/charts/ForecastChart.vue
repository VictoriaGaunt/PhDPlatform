<template>
  <div class="forecast-chart">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="chart-controls">
        <button @click="toggleConfidenceIntervals" class="btn-sm">
          {{ showConfidenceIntervals ? 'Скрыть доверительные интервалы' : 'Показать доверительные интервалы' }}
        </button>
        <select v-model="selectedScenario" class="form-select-sm">
          <option value="all">Все сценарии</option>
          <option v-for="scenario in availableScenarios" :key="scenario.value" :value="scenario.value">
            {{ scenario.label }}
          </option>
        </select>
      </div>
    </div>

    <div ref="chartContainer" class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div v-if="metrics" class="chart-metrics">
      <div class="metric">
        <span class="metric-label">RMSE:</span>
        <span class="metric-value">{{ metrics.rmse.toFixed(4) }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">R²:</span>
        <span class="metric-value">{{ metrics.rSquared.toFixed(4) }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">MAE:</span>
        <span class="metric-value">{{ metrics.mae.toFixed(4) }}</span>
      </div>
    </div>

    <div v-if="equation" class="equation-display">
      <h4>Математическая модель:</h4>
      <div class="equation">
        HCIₜ = {{ equation.constants.alpha.toFixed(2) }}
        + {{ equation.constants.beta1.toFixed(2) }}∙EDUₜ
        + {{ equation.constants.beta2.toFixed(2) }}∙HLTₜ
        + {{ equation.constants.beta3.toFixed(2) }}∙ECOₜ
        + {{ equation.constants.beta4.toFixed(2) }}∙SOCₜ
        + εₜ
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { ForecastResult, PredictionMetrics } from '@/types/prediction.types';

Chart.register(...registerables);

interface Props {
  forecastData: ForecastResult | null;
  title?: string;
  height?: number;
}

const props = withDefaults(Props, {
  title: 'Прогноз индекса человеческого капитала',
  height: 400
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartContainer = ref<HTMLElement | null>(null);
const showConfidenceIntervals = ref<boolean>(true);
const selectedScenario = ref<string>('all');

let chart: Chart | null = null;

const availableScenarios = computed(() => {
  if (!props.forecastData) return [];

  return Object.keys(props.forecastData.scenarios).map(key => ({
    value: key,
    label: key === 'baseline' ? 'Базовый' :
        key === 'optimistic' ? 'Оптимистичный' :
            key === 'pessimistic' ? 'Пессимистичный' : key
  }));
});

const metrics = computed<PredictionMetrics | null>(() => {
  return props.forecastData?.metrics || null;
});

const equation = computed(() => {
  // Генерация уравнения на основе данных модели
  if (!props.forecastData) return null;

  return {
    constants: {
      alpha: 0.25,
      beta1: 0.35,
      beta2: 0.25,
      beta3: 0.10,
      beta4: 0.05
    },
    description: 'Модель градиентного бустинга с регуляризацией'
  };
});

const prepareChartData = () => {
  if (!props.forecastData) return null;

  const { predictions, confidenceIntervals, scenarios } = props.forecastData;
  const years = predictions.map(p => p.year);

  const datasets = [];

  // Исторические данные (если есть)
  if (props.forecastData.historicalData) {
    datasets.push({
      label: 'Исторические данные',
      data: props.forecastData.historicalData.map(d => ({ x: d.year, y: d.value })),
      borderColor: '#666',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 3,
      fill: false,
      tension: 0.1
    });
  }

  // Прогнозные значения
  datasets.push({
    label: 'Прогноз (базовый)',
    data: predictions.map(p => ({ x: p.year, y: p.value })),
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
    borderWidth: 3,
    pointRadius: 4,
    fill: false,
    tension: 0.4
  });

  // Доверительные интервалы
  if (showConfidenceIntervals.value && confidenceIntervals) {
    datasets.push({
      label: 'Доверительный интервал (95%)',
      data: confidenceIntervals.map((ci, index) => ({
        x: predictions[index].year,
        y: ci.upperBound
      })),
      borderColor: 'rgba(76, 175, 80, 0.2)',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 1,
      pointRadius: 0,
      fill: '-1', // Заполнение до предыдущего dataset
      tension: 0.4
    });
  }

  // Сценарии
  if (selectedScenario.value === 'all' || selectedScenario.value === 'scenarios') {
    Object.entries(scenarios).forEach(([key, values]) => {
      if (key === 'baseline') return; // Базовый уже добавлен

      const color = key === 'optimistic' ? '#2196F3' : '#F44336';

      datasets.push({
        label: key === 'optimistic' ? 'Оптимистичный' : 'Пессимистичный',
        data: values.map((value, index) => ({
          x: predictions[index].year,
          y: value
        })),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        fill: false,
        tension: 0.4
      });
    });
  }

  return {
    datasets,
    labels: years
  };
};

const initChart = () => {
  if (!chartCanvas.value || !props.forecastData) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  // Уничтожаем предыдущий график
  if (chart) {
    chart.destroy();
  }

  const chartData = prepareChartData();
  if (!chartData) return;

  chart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y.toFixed(4);
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Год',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Индекс человеческого капитала (HCI)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          min: 0,
          max: 1,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: (value) => value.toFixed(2)
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      elements: {
        line: {
          tension: 0.4
        }
      }
    }
  });
};

const toggleConfidenceIntervals = () => {
  showConfidenceIntervals.value = !showConfidenceIntervals.value;
  initChart();
};

// Наблюдатели
watch(() => props.forecastData, () => {
  initChart();
}, { deep: true });

watch(selectedScenario, () => {
  initChart();
});

// Жизненный цикл
onMounted(() => {
  initChart();
  window.addEventListener('resize', initChart);
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
  window.removeEventListener('resize', initChart);
});
</script>

<style scoped>
.forecast-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 20px;
}

.chart-metrics {
  display: flex;
  gap: 30px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4CAF50;
}

.equation-display {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #4CAF50;
}

.equation-display h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.equation {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  color: #2196F3;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.btn-sm {
  padding: 5px 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.btn-sm:hover {
  background: #45a049;
}

.form-select-sm {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
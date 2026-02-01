<template>
  <div class="app">
    <header class="header">
      <h1>PhD Research Platform</h1>
      <p class="subtitle">Платформа анализа человеческого капитала регионов РФ</p>
    </header>

    <main class="main">
      <div class="status">
        <div class="status-item" :class="statusClass">
          Сервер: {{ serverStatus }}
        </div>
        <button
            @click="testApi"
            :disabled="loading"
            class="btn"
        >
          {{ loading ? 'Проверка...' : 'Проверить API' }}
        </button>
        <button
            @click="loadRegions"
            :disabled="loadingRegions"
            class="btn"
        >
          {{ loadingRegions ? 'Загрузка...' : 'Загрузить регионы' }}
        </button>
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div v-if="regions.length > 0" class="regions-section">
        <h2>Регионы России (Индекс человеческого капитала)</h2>
        <div class="regions-grid">
          <div v-for="region in regions" :key="region.code" class="region-card">
            <h3>{{ region.name }}</h3>
            <p>Код: {{ region.code }}</p>
            <p>Население: {{ formatNumber(region.population) }}</p>
            <p>Индекс ЧК: {{ region.hci.toFixed(3) }}</p>
            <div class="hci-bar">
              <div
                  class="hci-fill"
                  :style="{ width: (region.hci * 100) + '%' }"
                  :title="'HCI: ' + region.hci"
              ></div>
            </div>
            <div class="hci-value">
              {{ (region.hci * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <div v-if="apiData" class="api-data">
        <h3>Ответ API:</h3>
        <pre>{{ JSON.stringify(apiData, null, 2) }}</pre>
      </div>

      <div class="features">
        <h2>Функционал платформы</h2>
        <div class="features-grid">
          <div class="feature">
            <h3>📊 Анализ данных</h3>
            <p>Визуализация показателей ЧК по регионам</p>
          </div>
          <div class="feature">
            <h3>🔮 Прогнозирование</h3>
            <p>Математические модели прогноза</p>
          </div>
          <div class="feature">
            <h3>🗺️ Карты</h3>
            <p>Интерактивные тепловые карты</p>
          </div>
          <div class="feature">
            <h3>📈 Сравнение</h3>
            <p>Сравнительный анализ регионов</p>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>© 2024 PhD Research Platform</p>
      <p>Диссертационное исследование по человеческому капиталу</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

interface Region {
  code: string
  name: string
  population: number
  hci: number
}

export default defineComponent({
  name: 'App',
  setup() {
    const serverStatus = ref<string>('Не проверен')
    const loading = ref<boolean>(false)
    const loadingRegions = ref<boolean>(false)
    const error = ref<string | null>(null)
    const apiData = ref<any>(null)
    const regions = ref<Region[]>([])

    const statusClass = computed(() => {
      if (serverStatus.value.includes('✅')) return 'status-ok'
      if (serverStatus.value.includes('❌')) return 'status-error'
      return 'status-unknown'
    })

    const testApi = async (): Promise<void> => {
      loading.value = true
      error.value = null
      serverStatus.value = 'Проверка...'

      try {
        const response = await fetch('http://localhost:5000/api/v1/test')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        apiData.value = data
        serverStatus.value = '✅ Работает'
      } catch (err: any) {
        error.value = `Ошибка подключения: ${err.message}`
        serverStatus.value = '❌ Недоступен'
      } finally {
        loading.value = false
      }
    }

    const loadRegions = async (): Promise<void> => {
      loadingRegions.value = true
      error.value = null

      try {
        const response = await fetch('http://localhost:5000/api/v1/regions')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (data.success && data.data) {
          regions.value = data.data
        } else {
          throw new Error('Некорректный формат данных')
        }
      } catch (err: any) {
        error.value = `Ошибка загрузки регионов: ${err.message}`
      } finally {
        loadingRegions.value = false
      }
    }

    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    // Автопроверка при загрузке
    setTimeout(() => {
      testApi()
    }, 1000)

    return {
      serverStatus,
      loading,
      loadingRegions,
      error,
      apiData,
      regions,
      statusClass,
      testApi,
      loadRegions,
      formatNumber
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f8f9fa;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

.status {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-item {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: 500;
}

.status-ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-error {
  background: #ffebee;
  color: #c62828;
}

.status-unknown {
  background: #f5f5f5;
  color: #666;
}

.btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn:hover:not(:disabled) {
  background: #45a049;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 2rem;
  border-left: 4px solid #c62828;
}

.regions-section {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.regions-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.region-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.region-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.region-card h3 {
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.region-card p {
  margin: 0.5rem 0;
  color: #666;
}

.hci-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
}

.hci-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF5722, #FF9800, #4CAF50);
  border-radius: 4px;
  transition: width 1s ease;
}

.hci-value {
  text-align: center;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 0.5rem;
}

.api-data {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.api-data h3 {
  margin-bottom: 1rem;
  color: #333;
}

.api-data pre {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
}

.features {
  margin-bottom: 2rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.feature h3 {
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #666;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 2rem;
}

.footer p {
  margin: 0.5rem 0;
  opacity: 0.8;
}
</style>
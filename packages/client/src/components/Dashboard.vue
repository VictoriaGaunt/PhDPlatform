<template>
  <div class="dashboard">
    <DashboardHeader />

    <div class="dashboard-controls">
      <RegionSelector v-model="selectedRegion" />
      <YearSelector v-model="selectedYear" :years="availableYears" />
      <BlockSelector v-model="selectedBlock" />
    </div>

    <div class="classification-blocks">
      <ClassificationBlock
          v-for="block in blocks"
          :key="block.id"
          :block="block"
          :region-data="currentRegionData"
      />
    </div>

    <CompositeScore :score="compositeScore" :region="selectedRegion" />

    <div class="charts-container">
      <RadarChart :data="radarData" />
      <TrendChart :data="trendData" />
    </div>

    <RegionsTable
        :regions="filteredRegions"
        :highlight-region="selectedRegion"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRegionsStore } from '@/stores/regions'
import { RegionData } from '@/types'

// Store
const regionsStore = useRegionsStore()

// Реактивные переменные
const selectedRegion = ref<string>('all')
const selectedYear = ref<number>(2023)
const selectedBlock = ref<string>('all')

// Загружаем данные при монтировании
onMounted(async () => {
  await regionsStore.fetchRegions(selectedYear.value)
})

// Вычисляемые свойства
const currentRegionData = computed(() => {
  return regionsStore.regions.find(r => r.name === selectedRegion.value)
})

const compositeScore = computed(() => {
  return currentRegionData.value?.compositeScore || 0
})

const availableYears = computed(() => {
  return [2023, 2022, 2021, 2020, 2019]
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/dashboard.scss';
</style>
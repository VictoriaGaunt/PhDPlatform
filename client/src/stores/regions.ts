// stores/regions.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RegionData } from '@/types'
import { api } from '@/services/api'

export const useRegionsStore = defineStore('regions', () => {
    const regions = ref<RegionData[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchRegions = async (year: number) => {
        loading.value = true
        error.value = null

        try {
            const response = await api.get(`/api/regions?year=${year}`)
            regions.value = response.data
        } catch (err) {
            error.value = 'Ошибка загрузки данных'
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const updateRegion = async (regionId: string, data: Partial<RegionData>) => {
        try {
            await api.put(`/api/regions/${regionId}`, data)
            // Обновляем локальное состояние
            const index = regions.value.findIndex(r => r.id === regionId)
            if (index !== -1) {
                regions.value[index] = { ...regions.value[index], ...data }
            }
        } catch (err) {
            console.error('Ошибка обновления региона:', err)
        }
    }

    // Вычисляемые статистики
    const blockStats = computed(() => {
        const stats = {
            block1: { favorable: 0, moderate: 0, unfavorable: 0 },
            block2: { favorable: 0, moderate: 0, unfavorable: 0 },
            block3: { favorable: 0, moderate: 0, unfavorable: 0 }
        }

        regions.value.forEach(region => {
            stats.block1[region.block1]++
            stats.block2[region.block2]++
            stats.block3[region.block3]++
        })

        return stats
    })

    return {
        regions,
        loading,
        error,
        fetchRegions,
        updateRegion,
        blockStats
    }
})
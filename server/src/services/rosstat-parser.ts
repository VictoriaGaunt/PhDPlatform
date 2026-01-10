// server/src/services/rosstat-parser.ts
import axios from 'axios'
import * as cheerio from 'cheerio'
import { Region } from '../models/Region'

export class RosstatParser {
    private baseUrl = 'https://rosstat.gov.ru'

    async fetchRegionData(year: number): Promise<Partial<Region>[]> {
        try {
            // Пример URL - нужно найти конкретные страницы с данными
            const urls = [
                `${this.baseUrl}/folder/210/document/${year}-birthrate`,
                `${this.baseUrl}/folder/210/document/${year}-employment`,
                `${this.baseUrl}/storage/mediabank/${year}-regions-data.xlsx`
            ]

            const regionsData: Partial<Region>[] = []

            // 1. Парсим HTML страницы
            for (const url of urls) {
                const html = await this.fetchHtml(url)
                const data = this.parseHtml(html, year)
                regionsData.push(...data)
            }

            // 2. Обрабатываем Excel файлы (если есть)
            const excelData = await this.parseExcelFiles(year)
            regionsData.push(...excelData)

            return this.normalizeData(regionsData, year)

        } catch (error) {
            console.error('Ошибка парсинга Rosstat:', error)
            throw new Error('Не удалось загрузить данные')
        }
    }

    private async fetchHtml(url: string): Promise<string> {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PhD/1.0)'
            },
            timeout: 30000
        })
        return response.data
    }

    private parseHtml(html: string, year: number): Partial<Region>[] {
        const $ = cheerio.load(html)
        const regions: Partial<Region>[] = []

        // Пример парсинга таблицы - НУЖНО АДАПТИРОВАТЬ ПОД РЕАЛЬНУЮ СТРУКТУРУ
        $('table tbody tr').each((i, row) => {
            const cells = $(row).find('td')
            if (cells.length >= 5) {
                const region: Partial<Region> = {
                    name: $(cells[0]).text().trim(),
                    year: year,
                    birthrate: this.parseNumber($(cells[1]).text()),
                    employment: this.parseNumber($(cells[2]).text()),
                    salary: this.parseNumber($(cells[3]).text()),
                    // ... другие поля
                }

                // Рассчитываем score на основе данных
                region.block1Score = this.calculateBlock1Score(region)
                region.block2Score = this.calculateBlock2Score(region)
                region.block3Score = this.calculateBlock3Score(region)
                region.compositeScore = this.calculateCompositeScore(region)

                regions.push(region)
            }
        })

        return regions
    }

    private parseNumber(text: string): number {
        return parseFloat(text.replace(',', '.').replace(/\s/g, '')) || 0
    }

    private calculateBlock1Score(region: Partial<Region>): number {
        // Логика расчета на основе birthrate, poverty и т.д.
        // Нормализация значений от 0 до 1
        const scores = []
        if (region.birthrate) scores.push(this.normalize(region.birthrate, 5, 20))
        if (region.poverty) scores.push(1 - this.normalize(region.poverty, 0, 30))
        return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0.5
    }

    private normalize(value: number, min: number, max: number): number {
        return Math.max(0, Math.min(1, (value - min) / (max - min)))
    }

    // ... другие методы расчета
}
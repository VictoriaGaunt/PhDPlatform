// server/src/routes/regions.ts
import express from 'express'
import { Region } from '../models/Region'

const router = express.Router()

// GET /api/regions?year=2023&limit=50
router.get('/', async (req, res) => {
    try {
        const { year, limit = 50, sort = '-compositeScore' } = req.query

        const query: any = {}
        if (year) query.year = parseInt(year as string)

        const regions = await Region.find(query)
            .limit(parseInt(limit as string))
            .sort(sort as string)

        res.json({
            data: regions,
            meta: {
                total: await Region.countDocuments(query),
                year: year || 'all',
                updated: new Date().toISOString()
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки данных' })
    }
})

// GET /api/regions/stats?year=2023
router.get('/stats', async (req, res) => {
    try {
        const { year } = req.query
        const query = year ? { year: parseInt(year as string) } : {}

        const [block1Stats, block2Stats, block3Stats] = await Promise.all([
            Region.aggregate([
                { $match: query },
                { $group: { _id: '$block1', count: { $sum: 1 } } }
            ]),
            Region.aggregate([
                { $match: query },
                { $group: { _id: '$block2', count: { $sum: 1 } } }
            ]),
            Region.aggregate([
                { $match: query },
                { $group: { _id: '$block3', count: { $sum: 1 } } }
            ])
        ])

        res.json({ block1Stats, block2Stats, block3Stats })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка расчета статистики' })
    }
})

// POST /api/regions/import - запуск импорта из Rosstat
router.post('/import', async (req, res) => {
    try {
        const { year } = req.body
        const parser = new RosstatParser()
        const data = await parser.fetchRegionData(year || 2023)

        // Сохраняем в базу
        const operations = data.map(region => ({
            updateOne: {
                filter: { name: region.name, year: region.year },
                update: { $set: region },
                upsert: true
            }
        }))

        await Region.bulkWrite(operations)

        res.json({
            message: 'Данные успешно импортированы',
            imported: data.length
        })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка импорта данных' })
    }
})

export default router
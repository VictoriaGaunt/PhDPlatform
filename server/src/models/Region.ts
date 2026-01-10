// server/src/models/Region.ts
import mongoose from 'mongoose'

const regionSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true },
    year: { type: Number, required: true, index: true },

    // Блок 1
    block1: {
        type: String,
        enum: ['favorable', 'moderate', 'unfavorable'],
        required: true
    },
    block1Score: { type: Number, min: 0, max: 1 },
    birthrate: Number,
    poverty: Number,
    lifeExpectancy: Number,
    infantMortality: Number,

    // Блок 2
    block2: {
        type: String,
        enum: ['favorable', 'moderate', 'unfavorable'],
        required: true
    },
    block2Score: { type: Number, min: 0, max: 1 },
    employment: Number,
    salary: Number,
    socialSupport: Number,
    povertyLine: Number,

    // Блок 3
    block3: {
        type: String,
        enum: ['favorable', 'moderate', 'unfavorable'],
        required: true
    },
    block3Score: { type: Number, min: 0, max: 1 },
    productivity: Number,
    educationSpending: Number,
    morbidity: Number,

    compositeScore: { type: Number, min: 0, max: 1 },
    source: { type: String, default: 'rosstat' },
    lastUpdated: { type: Date, default: Date.now }
})

// Составной индекс для быстрого поиска
regionSchema.index({ name: 1, year: 1 }, { unique: true })

export const Region = mongoose.model('Region', regionSchema)
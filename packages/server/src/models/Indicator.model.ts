import mongoose, { Schema, Document } from 'mongoose';

export interface IIndicator extends Document {
    regionCode: string;
    year: number;
    education: {
        literacyRate: number;
        higherEducationRate?: number;
        schoolEnrollment?: number;
    };
    health: {
        lifeExpectancy: number;
        mortalityRate?: number;
        hospitalBeds?: number;
    };
    economy: {
        gdpPerCapita: number;
        unemploymentRate?: number;
        averageSalary?: number;
    };
    social: {
        povertyRate: number;
        crimeRate?: number;
        housingPerCapita?: number;
    };
    humanCapitalIndex?: number;
}

const IndicatorSchema = new Schema<IIndicator>({
    regionCode: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    education: {
        literacyRate: { type: Number, required: true },
        higherEducationRate: Number,
        schoolEnrollment: Number,
    },
    health: {
        lifeExpectancy: { type: Number, required: true },
        mortalityRate: Number,
        hospitalBeds: Number,
    },
    economy: {
        gdpPerCapita: { type: Number, required: true },
        unemploymentRate: Number,
        averageSalary: Number,
    },
    social: {
        povertyRate: { type: Number, required: true },
        crimeRate: Number,
        housingPerCapita: Number,
    },
    humanCapitalIndex: Number,
}, { timestamps: true });

// Уникальный индекс по региону и году (один документ на год для региона)
IndicatorSchema.index({ regionCode: 1, year: 1 }, { unique: true });

export const Indicator = mongoose.model<IIndicator>('Indicator', IndicatorSchema);
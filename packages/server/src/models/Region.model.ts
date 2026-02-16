// import mongoose, { Schema, Document } from 'mongoose';
//
// export interface IRegion extends Document {
//     code: string; // Код региона (например, 77 для Москвы)
//     name: string;
//     federalDistrict: string;
//     population: number;
//     area: number;
//     coordinates: {
//         lat: number;
//         lng: number;
//     };
//     indicators: Array<{
//         year: number;
//         education: {
//             literacyRate: number;
//             higherEducationRate: number;
//             schoolEnrollment: number;
//         };
//         health: {
//             lifeExpectancy: number;
//             mortalityRate: number;
//             hospitalBeds: number;
//         };
//         economy: {
//             gdpPerCapita: number;
//             unemploymentRate: number;
//             averageSalary: number;
//         };
//         social: {
//             povertyRate: number;
//             crimeRate: number;
//             housingPerCapita: number;
//         };
//         humanCapitalIndex: number;
//     }>;
//     createdAt: Date;
//     updatedAt: Date;
// }
//
// const RegionSchema: Schema = new Schema({
//     code: { type: String, required: true, unique: true, index: true },
//     name: { type: String, required: true },
//     federalDistrict: { type: String, required: true },
//     population: { type: Number, required: true },
//     area: { type: Number, required: true },
//     coordinates: {
//         lat: { type: Number, required: true },
//         lng: { type: Number, required: true }
//     },
//     indicators: [{
//         year: { type: Number, required: true },
//         education: {
//             literacyRate: { type: Number, min: 0, max: 100 },
//             higherEducationRate: { type: Number, min: 0, max: 100 },
//             schoolEnrollment: { type: Number, min: 0, max: 100 }
//         },
//         health: {
//             lifeExpectancy: { type: Number, min: 0 },
//             mortalityRate: { type: Number, min: 0 },
//             hospitalBeds: { type: Number, min: 0 }
//         },
//         economy: {
//             gdpPerCapita: { type: Number, min: 0 },
//             unemploymentRate: { type: Number, min: 0, max: 100 },
//             averageSalary: { type: Number, min: 0 }
//         },
//         social: {
//             povertyRate: { type: Number, min: 0, max: 100 },
//             crimeRate: { type: Number, min: 0 },
//             housingPerCapita: { type: Number, min: 0 }
//         },
//         humanCapitalIndex: { type: Number, min: 0, max: 1 }
//     }]
// }, {
//     timestamps: true
// });
//
// // Индексы для оптимизации запросов
// RegionSchema.index({ 'indicators.year': 1 });
// RegionSchema.index({ 'indicators.humanCapitalIndex': 1 });
// RegionSchema.index({ federalDistrict: 1 });
//
// export default mongoose.model<IRegion>('Region', RegionSchema);
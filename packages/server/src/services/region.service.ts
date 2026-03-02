import { Region, IRegion } from '../models/Region.model';

interface GetAllOptions {
    page?: number;
    limit?: number;
    filter?: Record<string, unknown>;
    sort?: Record<string, 1 | -1>;
}

interface GeoJSONFeature {
    properties?: Record<string, unknown>;
    geometry?: {
        type?: string;
        coordinates?: unknown;
    };
}

interface GeoJSONInput {
    features?: GeoJSONFeature[];
}

export class RegionService {
    static async getAll(options: GetAllOptions) {
        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
        const filter = options.filter ?? {};
        const sort = options.sort ?? { name: 1 };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Region.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Region.countDocuments(filter),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getByCode(code: string): Promise<IRegion | null> {
        return Region.findOne({ code });
    }

    static async create(data: Partial<IRegion>): Promise<IRegion> {
        const region = new Region(data);
        return region.save();
    }

    static async delete(code: string): Promise<boolean> {
        const result = await Region.deleteOne({ code });
        return result.deletedCount > 0;
    }

    static async importFromGeoJSON(geojson: GeoJSONInput): Promise<{ imported: number; skipped: number }> {
        const features = Array.isArray(geojson.features) ? geojson.features : [];
        let imported = 0;
        let skipped = 0;
        for (const feature of features) {
            const properties = feature.properties ?? {};
            const code = String(properties.code ?? properties.region_code ?? '').trim();
            const name = String(properties.name ?? properties.region_name ?? '').trim();
            if (!code || !name) {
                skipped += 1;
                continue;
            }
            const updateDoc: Partial<IRegion> = {
                code,
                name,
                federalDistrict: typeof properties.federalDistrict === 'string' ? properties.federalDistrict : undefined,
                population: this.toNumberOrUndefined(properties.population),
                area: this.toNumberOrUndefined(properties.area),
                hci: this.toNumberOrUndefined(properties.hci),
            };
            if (feature.geometry) {
                updateDoc.geometry = feature.geometry as unknown as any;
            }
            await Region.findOneAndUpdate({ code }, { $set: updateDoc }, { upsert: true, new: true, runValidators: true });
            imported += 1;
        }
        return { imported, skipped };
    }
    static async update(code: string, updateData: Partial<IRegion>) {
        return Region.findOneAndUpdate(
            { code },
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }
    static async count(filter: Record<string, unknown> = {}) {
        return Region.countDocuments(filter);
    }
    private static toNumberOrUndefined(value: unknown): number | undefined {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : undefined;
    }
}
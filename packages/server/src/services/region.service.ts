import { Region, IRegion } from '../models/Region.model';

interface GetAllOptions {
    page?: number;
    limit?: number;
    filter?: Record<string, any>;
    sort?: Record<string, 1 | -1>;
}

export class RegionService {
    static async getAll(options: GetAllOptions) {
        const { page = 1, limit = 10, filter = {}, sort = { name: 1 } } = options;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Region.find(filter).sort(sort).skip(skip).limit(limit),
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

    static async importFromGeoJSON(geojson: any): Promise<void> {
        // Преобразовать GeoJSON features в документы регионов
        // ...
    }

    static async update(code: string, updateData: any) {
        const updatedRegion = await Region.findOneAndUpdate(
            { code },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedRegion;
    } catch (error) {
        console.error('Error updating region:', error);
        throw error;
    }

    static async count(filter = {}) {
        return Region.countDocuments(filter);
    }
}
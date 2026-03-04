import { RegionService } from '../../src/services/region.service';
import { Region } from '../../src/models/Region.model';

jest.mock('../../src/models/Region.model', () => ({
    Region: {
        findOneAndUpdate: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

describe('RegionService.importFromGeoJSON', () => {
    it('imports valid features and skips invalid ones', async () => {
        const payload = {
            features: [
                { properties: { code: 'RU', name: 'Russia', hci: 0.73 } },
                { properties: { code: '', name: 'Invalid' } },
            ],
        };

        const result = await RegionService.importFromGeoJSON(payload);

        expect(result.imported).toBe(1);
        expect(result.skipped).toBe(1);
        expect(Region.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });
});

import mongoose from 'mongoose';
import axios from 'axios';
import environment from '../config/environment';
import { cacheService } from '../services/cache.service';

export interface DependencyStatus {
    mongo: boolean;
    redis: boolean;
    pythonModel: boolean;
}

export const getDependencyStatus = async (): Promise<DependencyStatus> => {
    const mongo = mongoose.connection.readyState === 1;
    const redis = await cacheService.ping();

    let pythonModel = false;
    try {
        const response = await axios.get(`${environment.PYTHON_MODEL_URL}/health`, { timeout: 2000 });
        pythonModel = response.status >= 200 && response.status < 300;
    } catch {
        pythonModel = false;
    }

    return { mongo, redis, pythonModel };
};

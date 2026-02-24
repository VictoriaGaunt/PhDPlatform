export interface BaseDocument {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegionType extends BaseDocument {
    code: string;
    name: string;
    population?: number;
    area?: number;
    hci?: number;
    federalDistrict?: string;
    geometry?: any; // GeoJSON
    metadata?: Record<string, any>;
}

export interface UserType extends BaseDocument {
    username: string;
    passwordHash: string;
    role: 'admin';
}

export interface IndicatorType extends BaseDocument {
    regionCode: string;
    year: number;
    category: 'education' | 'health' | 'economy' | 'social';
    subcategory?: string;
    value: number;
    source?: string;
    confidence?: number;
    metadata?: any;
}

export interface PredictionType extends BaseDocument {
    regionCode: string;
    modelName: string;
    horizon: number;
    generatedAt: Date;
    predictions: Array<{
        year: number;
        value: number;
        confidenceLower?: number;
        confidenceUpper?: number;
    }>;
    metrics?: {
        rmse?: number;
        mae?: number;
        mape?: number;
    };
    parameters?: any;
    createdBy?: string;
}

export interface DatasetType extends BaseDocument {
    name: string;
    description?: string;
    filename: string;
    filePath: string;
    format: 'csv' | 'json' | 'xlsx';
    size: number;
    uploadedBy: string;
    tags?: string[];
    metadata?: any;
}

export interface AuditLogType extends BaseDocument {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    targetCollection: string;
    documentId?: string;
    changes?: any;
    ip?: string;
    userAgent?: string;
}
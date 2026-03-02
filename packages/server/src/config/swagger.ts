import swaggerJsdoc from 'swagger-jsdoc';
import { APP_NAME, APP_VERSION } from './constants';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: APP_NAME,
            version: APP_VERSION,
            description: 'API для платформы исследования человеческого капитала',
            contact: {
                name: 'Виктория Гонт',
                email: 'research@phd-platform.example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Development server',
            },
            // В продакшене добавить реальный URL
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './src/models/*.ts',
        './src/schemas/*.ts',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
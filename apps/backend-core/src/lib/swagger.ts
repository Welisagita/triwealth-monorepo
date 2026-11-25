import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TriWealth API Documentation',
            version: '1.0.0',
            description: 'Dokumentasi interaktif untuk TriWealth Backend Core.',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development Server',
            },
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
    },
    // Memberitahu Swagger di mana letak komentar dokumentasi kita
    apis: ['./src/modules/**/*.routes.ts'], 
};

export const swaggerSpec = swaggerJsdoc(options);
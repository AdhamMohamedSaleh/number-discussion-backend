import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Number Discussion API',
      version: '1.0.0',
      description: 'A collaborative number calculation platform API with tree-based calculations',
      contact: {
        name: 'Adham Mohamed Saleh',
        url: 'https://github.com/AdhamMohamedSaleh/number-discussion-backend',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://number-discussion-backend-production.up.railway.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                statusCode: {
                  type: 'number',
                  example: 400,
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            username: {
              type: 'string',
              example: 'john_doe',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-16T10:00:00.000Z',
            },
          },
        },
        Calculation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            userId: {
              type: 'integer',
              example: 1,
            },
            username: {
              type: 'string',
              example: 'john_doe',
            },
            parentId: {
              type: 'integer',
              nullable: true,
              example: null,
            },
            value: {
              type: 'number',
              example: 42,
            },
            operation: {
              type: 'string',
              nullable: true,
              enum: ['add', 'subtract', 'multiply', 'divide'],
              example: null,
            },
            operand: {
              type: 'number',
              nullable: true,
              example: null,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-16T10:00:00.000Z',
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Calculation',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Calculations',
        description: 'Calculation tree operations',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

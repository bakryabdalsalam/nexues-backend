import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Board API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Job Board platform',
      contact: {
        name: 'API Support',
        email: 'support@jobboard.com'
      }
    },
    servers: [
      {
        url: 'https://automatic-space-broccoli-46w9jq6jg5wc775r-3000.app.github.dev/0',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes
};

export default swaggerOptions;

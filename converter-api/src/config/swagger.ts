import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AI to Template Converter API',
    version: '1.0.0',
    description: 'REST API for converting AI-generated content to VoiceIdeal Studio templates',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://ideatemplates.elearningsolutions.net',
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          uptime: {
            type: 'number',
            description: 'Server uptime in seconds'
          },
          memory: {
            type: 'object',
            properties: {
              rss: { type: 'number' },
              heapTotal: { type: 'number' },
              heapUsed: { type: 'number' },
              external: { type: 'number' },
              arrayBuffers: { type: 'number' }
            }
          },
          version: {
            type: 'string',
            example: '1.0.0'
          }
        }
      },
      ConversionRequest: {
        type: 'object',
        required: ['aiOutputPath', 'templatePath'],
        properties: {
          aiOutputPath: {
            type: 'string',
            description: 'Path to AI output JSON file',
            example: '/path/to/ai-output.json'
          },
          templatePath: {
            type: 'string',
            description: 'Path to template JSON file',
            example: '/path/to/template.json'
          }
        }
      },
      ConversionResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Conversion completed successfully'
          },
          data: {
            type: 'object',
            properties: {
              convertedTemplate: {
                type: 'object',
                description: 'The converted VoiceIdeal Studio template',
                example: {
                  'training-title': 'Sample Course Title',
                  'training-description': 'Course description',
                  'type1_1:title': 'Section 1 Title',
                  'type1_1:imageurl': 'https://example.com/image.jpg'
                }
              },
              stats: {
                type: 'object',
                properties: {
                  sections: { type: 'number', example: 16 },
                  quizzes: { type: 'number', example: 3 },
                  totalTags: { type: 'number', example: 91 },
                  replacedTags: { type: 'number', example: 91 }
                }
              },
              templateType: {
                type: 'string',
                example: 'Capsule-Default'
              }
            }
          }
        }
      },
      TemplateRequest: {
        type: 'object',
        required: ['size', 'brand'],
        properties: {
          size: {
            type: 'string',
            enum: ['Capsule', 'XL', 'Maxi', 'Micro', 'Midi', 'Mini'],
            description: 'Template size',
            example: 'Capsule'
          },
          brand: {
            type: 'string',
            enum: ['creatio', 'samsung', 'sompo', 'default'],
            description: 'Template brand',
            example: 'creatio'
          }
        }
      },
      TemplateResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          template: {
            type: 'string',
            description: 'Raw template content with placeholders',
            example: '{"present": {"globalConfig": {...}, "boxesById": {...}}}'
          },
          metadata: {
            type: 'object',
            properties: {
              size: {
                type: 'string',
                example: 'Capsule'
              },
              brand: {
                type: 'string',
                example: 'creatio'
              },
              fileName: {
                type: 'string',
                example: 'voiceidealStudioTemplate_creatio.json'
              },
              fileSize: {
                type: 'string',
                example: '0.25 MB'
              },
              boxesCount: {
                type: 'number',
                example: 0,
                description: 'Number of boxes in template (0 for raw templates)'
              },
              lastModified: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-21T08:25:37.000Z'
              }
            }
          }
        }
      },
      TemplateListResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          templates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                size: {
                  type: 'string',
                  example: 'Capsule'
                },
                brand: {
                  type: 'string',
                  example: 'creatio'
                },
                fileName: {
                  type: 'string',
                  example: 'voiceidealStudioTemplate_creatio.json'
                },
                filePath: {
                  type: 'string',
                  example: '/templates/LSCapsule/voiceidealStudioTemplate_creatio.json'
                },
                fileSize: {
                  type: 'string',
                  example: '0.25 MB'
                },
                lastModified: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-10-21T08:25:37.000Z'
                }
              }
            }
          }
        }
      },
      TemplateInfo: {
        type: 'object',
        properties: {
          templateType: {
            type: 'string',
            example: 'LSCapsule'
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'voiceidealStudioTemplate_black.json' },
                path: { type: 'string', example: '/path/to/template.json' },
                templateType: { type: 'string', example: 'LSCapsule' }
              }
            }
          }
        }
      },
      OutputInfo: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            example: 'converted-2025-10-17T07-07-30-465Z.json'
          },
          size: {
            type: 'number',
            example: 462593
          },
          created: {
            type: 'string',
            format: 'date-time'
          },
          downloadUrl: {
            type: 'string',
            example: '/outputs/converted/output.json'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Error description'
              },
              statusCode: {
                type: 'number',
                example: 400
              }
            }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Conversion',
      description: 'AI to Template conversion endpoints'
    },
    {
      name: 'Templates',
      description: 'Template management and request endpoints'
    },
    {
      name: 'Template Request',
      description: 'Request specific templates by size and brand'
    },
    {
      name: 'Outputs',
      description: 'Output file management endpoints'
    },
    {
      name: 'Type0',
      description: 'Type0 (intro scene) template generation endpoints'
    },
    {
      name: 'Scene',
      description: 'Scene analysis and prediction endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);


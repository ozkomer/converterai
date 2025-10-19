# AI Template Converter API

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/express-4+-red.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](Dockerfile)

A production-ready REST API for converting AI-generated educational content to VoiceIdeal Studio templates. Built with TypeScript, Express.js, and comprehensive error handling.

## 🚀 Features

### Core API Functionality
- **File Upload Conversion**: Multipart form-data support for AI output and template files
- **URL-based Conversion**: Process existing files using server-side paths
- **Template Management**: Dynamic discovery and cataloging of available templates
- **Output Management**: Track and download converted template files
- **Health Monitoring**: Comprehensive health checks with system metrics

### Technical Features
- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Robust web framework with middleware support
- **Swagger Documentation**: Interactive API documentation with live testing
- **Docker Support**: Containerized deployment with health checks
- **Error Handling**: Comprehensive error management and logging
- **Security**: CORS, Helmet security headers, and input validation
- **Performance**: Request compression, logging, and optimization

## 📦 Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- TypeScript 5+

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ai-template-converter.git
cd ai-template-converter/converter-api

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev

# Or start production server
npm start
```

### Docker Setup (Recommended)

```bash
# From project root
docker-compose up --build -d

# The API will be available at http://localhost:3000
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000
```

### Health & Monitoring
```http
GET /api/health              # Basic health check
GET /api/health/detailed     # Detailed system information
GET /                        # API information and endpoints
```

### Conversion Operations
```http
POST /api/convert            # File upload conversion
POST /api/convert/url        # URL-based conversion
GET /api/convert/templates   # List available templates
GET /api/convert/outputs     # List converted outputs
```

### Documentation
```http
GET /api-docs               # Swagger UI documentation
```

## 📝 Usage Examples

### 1. File Upload Conversion

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "aiOutput=@/path/to/ai-output.json" \
  -F "template=@/path/to/template.json"
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion completed successfully",
  "data": {
    "outputPath": "/app/outputs/converted/converted-2025-10-19T13-05-27-420Z.json",
    "downloadUrl": "/outputs/converted/converted-2025-10-19T13-05-27-420Z.json",
    "stats": {
      "sections": 16,
      "quizzes": 3,
      "totalTags": 91,
      "replacedTags": 91
    },
    "fileSize": "0.00 MB"
  }
}
```

### 2. URL-based Conversion

```bash
curl -X POST http://localhost:3000/api/convert/url \
  -H "Content-Type: application/json" \
  -d '{
    "aiOutputPath": "/project/sample-ai-output.json",
    "templatePath": "/project/sample-template.json"
  }'
```

### 3. List Available Templates

```bash
curl http://localhost:3000/api/convert/templates
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "templateType": "Capsule-Siyah",
      "files": [
        {
          "name": "Capsule-Siyah.json",
          "path": "/project/scene_templates/Capsule-Siyah/Capsule-Siyah.json",
          "templateType": "Capsule-Siyah"
        }
      ]
    }
  ]
}
```

### 4. List Converted Outputs

```bash
curl http://localhost:3000/api/convert/outputs
```

### 5. Health Check

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-19T13:02:02.487Z",
  "uptime": 2.917412792,
  "memory": {
    "rss": 313737216,
    "heapTotal": 241205248,
    "heapUsed": 99787448,
    "external": 8254308,
    "arrayBuffers": 5129851
  },
  "version": "1.0.0"
}
```

## 📁 Project Structure

```
converter-api/
├── src/
│   ├── config/
│   │   └── swagger.ts        # Swagger/OpenAPI configuration
│   ├── middleware/
│   │   └── errorHandler.ts   # Error handling middleware
│   ├── routes/
│   │   ├── conversion.ts     # Conversion endpoints
│   │   └── health.ts         # Health check endpoints
│   ├── services/
│   │   └── conversionService.ts # Core conversion logic
│   ├── types/                # TypeScript type definitions
│   ├── utils/
│   │   └── logger.ts         # Logging utility
│   └── server.ts             # Main server file
├── uploads/                  # Uploaded files directory
├── outputs/                  # Converted outputs directory
├── dist/                     # Compiled JavaScript
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Logging level |

### File Processing Limits

- **Maximum file size**: 50MB
- **Supported formats**: JSON only
- **Concurrent uploads**: Limited by server resources
- **Request timeout**: 30 seconds

### Security Configuration

```typescript
// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data object
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Detailed error description",
    "statusCode": 400,
    "timestamp": "2025-10-19T13:02:02.487Z"
  }
}
```

## 🚀 Quick Start Guide

### 1. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build && npm start
```

### 2. Verify Installation

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response: {"status":"OK",...}
```

### 3. Test Conversion

```bash
# Upload files for conversion
curl -X POST http://localhost:3000/api/convert \
  -F "aiOutput=@sample-ai-output.json" \
  -F "template=@sample-template.json"
```

### 4. View Documentation

Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser for interactive API documentation.

## 🔄 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:watch        # Start with auto-reload
npm run build            # Build TypeScript
npm run start            # Start production server

# Testing
npm test                 # Run test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
```

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Test locally** with `npm run dev`
3. **Build** with `npm run build`
4. **Run tests** with `npm test`
5. **Commit** changes with conventional commit messages

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test template listing
curl http://localhost:3000/api/convert/templates

# Test conversion with sample data
curl -X POST http://localhost:3000/api/convert/url \
  -H "Content-Type: application/json" \
  -d '{"aiOutputPath":"/path/to/test.json","templatePath":"/path/to/template.json"}'
```

### Load Testing

```bash
# Install artillery (if not already installed)
npm install -g artillery

# Run basic load test
artillery quick --count 10 --num 5 http://localhost:3000/api/health
```

## 🐳 Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t ai-template-converter-api .

# Run container
docker run -p 3000:3000 ai-template-converter-api

# Or use docker-compose
docker-compose up -d
```

### Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["npm", "start"]
```

## 📋 Requirements

### Runtime Requirements
- **Node.js**: 16.0.0 or higher
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB available disk space
- **Network**: HTTP/HTTPS connectivity

### Development Requirements
- **TypeScript**: 5.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: 2.30.0 or higher

## 🛠 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### File Upload Errors
```bash
# Check file size (must be < 50MB)
ls -lh your-file.json

# Verify file format (must be JSON)
file your-file.json
```

#### Memory Issues
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/server.js
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or set log level
LOG_LEVEL=debug npm run dev
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

- **Documentation**: [API Docs](http://localhost:3000/api-docs)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-template-converter/issues)
- **Email**: support@example.com

---

**Built with ❤️ using TypeScript, Express.js, and modern web technologies**


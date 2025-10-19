# AI to Template Converter API

REST API for converting AI-generated content to VoiceIdeal Studio templates.

## 🚀 Features

- **File Upload**: Upload AI output and template files
- **URL Conversion**: Convert using file paths
- **Template Management**: List available templates
- **Output Management**: List and download converted outputs
- **Health Monitoring**: Health check endpoints
- **Error Handling**: Comprehensive error handling and logging

## 📦 Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start

# Start development server
npm run dev

# Start with auto-reload
npm run dev:watch
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health information

### Conversion
- `POST /api/convert` - Convert using file upload
- `POST /api/convert/url` - Convert using file paths
- `GET /api/convert/templates` - List available templates
- `GET /api/convert/outputs` - List converted outputs

## 📝 Usage Examples

### 1. File Upload Conversion

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "aiOutput=@/path/to/ai-output.json" \
  -F "template=@/path/to/template.json"
```

### 2. URL-based Conversion

```bash
curl -X POST http://localhost:3000/api/convert/url \
  -H "Content-Type: application/json" \
  -d '{
    "aiOutputPath": "/path/to/ai-output.json",
    "templatePath": "/path/to/template.json"
  }'
```

### 3. List Templates

```bash
curl http://localhost:3000/api/convert/templates
```

### 4. List Outputs

```bash
curl http://localhost:3000/api/convert/outputs
```

## 📁 Project Structure

```
converter-api/
├── src/
│   ├── controllers/     # Request controllers
│   ├── middleware/      # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── server.ts       # Main server file
├── uploads/            # Uploaded files
├── outputs/            # Converted outputs
└── dist/               # Compiled JavaScript
```

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### File Limits

- Maximum file size: 50MB
- Supported formats: JSON only

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Conversion completed successfully",
  "data": {
    "outputPath": "/path/to/output.json",
    "downloadUrl": "/outputs/converted/output.json",
    "stats": {
      "sections": 49,
      "quizzes": 15,
      "totalTags": 71,
      "replacedTags": 71
    },
    "fileSize": "1.62 MB"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Convert a file:**
   ```bash
   curl -X POST http://localhost:3000/api/convert \
     -F "aiOutput=@ai-output.json" \
     -F "template=@template.json"
   ```

## 📋 Requirements

- Node.js 16+
- TypeScript 5+
- Express.js 4+

## 🔄 Development

```bash
# Watch mode for development
npm run dev:watch

# Build for production
npm run build

# Start production server
npm start
```

## 📝 License

MIT License


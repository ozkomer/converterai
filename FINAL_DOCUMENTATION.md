# AI Template Converter API - Final Documentation

**Version:** v0.0.1  
**Author:** Omer Ozkan  
**Last Updated:** October 20, 2025

## 🎯 Project Overview

The AI Template Converter API is a production-ready REST API that converts AI-generated educational content into VoiceIdeal Studio templates. The API has been evolved to use a simplified JSON input/output format for easy integration.

## 🚀 Current API Architecture

### Single Endpoint Design

The API now uses a single, simplified endpoint:

```
POST /api/convert
```

**Input Format:**
```json
{
  "aiOutput": {
    "CourseInfo": {
      "Title": "Course Title",
      "Description": "Course Description"
    },
    "Sections": [
      {
        "Title": "Section Title",
        "PageStyle": 26,
        "Images": [{"ImageUrl": "https://example.com/image.jpg"}]
      }
    ],
    "GeneralQuiz": [
      {
        "Question": "Quiz Question",
        "Options": ["Option A", "Option B", "Option C"]
      }
    ]
  },
  "template": {
    "training-title": "{{title}}",
    "training-description": "{{description}}",
    "type1_1:title": "{{section1_title}}",
    "type1_1:imageurl": "{{section1_image}}"
  },
  "templateType": "Capsule-Default"
}
```

**Output Format:**
```json
{
  "success": true,
  "message": "Conversion completed successfully",
  "data": {
    "convertedTemplate": {
      "training-title": "Course Title",
      "training-description": "Course Description",
      "type1_1:title": "Section Title",
      "type1_1:imageurl": "https://example.com/image.jpg"
    },
    "stats": {
      "sections": 1,
      "quizzes": 1,
      "totalTags": 20,
      "replacedTags": 20
    },
    "templateType": "Capsule-Default"
  }
}
```

## 📋 Supported Template Types

### Capsule Templates
- **Capsule-Default**: Standard capsule template
- **Capsule-Siyah**: Black-themed capsule template
- **Capsule-YEŞİL**: Green-themed capsule template
- **Capsule-MAVİ**: Blue-themed capsule template
- **Capsule-SAMSUNG**: Samsung-branded capsule template
- **Capsule-CREATIO**: Creatio-specific capsule template

### XL Templates
- **XL-MAVİ**: Blue-themed XL template
- **XL-SAMSUNG**: Samsung-branded XL template
- **XL-Sompo**: Sompo-specific XL template

## 🔧 Technical Specifications

### Technology Stack
- **Backend**: Node.js 16+ with TypeScript
- **Framework**: Express.js 4+
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker with docker-compose
- **API Format**: JSON REST API

### Key Features
- **Direct JSON Processing**: No file uploads required
- **Real-time Conversion**: Immediate response
- **Template Support**: Multiple template formats
- **Health Monitoring**: Built-in health checks
- **Error Handling**: Comprehensive error management
- **Documentation**: Interactive Swagger UI

## 🐳 Deployment

### Docker Deployment (Recommended)
```bash
# Clone repository
git clone https://github.com/ozkomer/converterai.git
cd converterai

# Start with Docker
docker-compose up --build -d

# API will be available at http://localhost:3000
```

### Local Development
```bash
cd converter-api
npm install
npm run build
npm run dev
```

## 🌐 API Endpoints

### Primary Endpoint
- `POST /api/convert` - Convert AI content to template

### Supporting Endpoints
- `GET /api/health` - Health check
- `GET /api/convert/templates` - List available templates
- `GET /api/convert/outputs` - List converted outputs
- `GET /api-docs` - Swagger documentation
- `GET /` - API information

## 📊 Usage Examples

### Basic Conversion
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "aiOutput": {
      "CourseInfo": {"Title": "Test Course"},
      "Sections": [{"Title": "Section 1", "PageStyle": 26}]
    },
    "template": {
      "training-title": "{{title}}",
      "type1_1:title": "{{section1_title}}"
    }
  }'
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### List Templates
```bash
curl http://localhost:3000/api/convert/templates
```

## 🔄 API Evolution History

### v0.0.1 (Current)
- **Initial Release**: Basic API functionality
- **File Upload Support**: Multipart form-data uploads
- **URL-based Conversion**: Server-side file processing
- **Template Management**: Dynamic template discovery
- **Docker Support**: Containerized deployment
- **Swagger Documentation**: Interactive API docs

### Latest Evolution
- **Simplified API**: Single POST endpoint
- **JSON Input/Output**: Direct data exchange
- **Removed File Dependencies**: No file uploads needed
- **Faster Processing**: Direct memory processing
- **Easier Integration**: Simple JSON format

## 📁 Project Structure

```
converterai/
├── converter-api/           # Main API implementation
│   ├── src/
│   │   ├── config/         # Swagger configuration
│   │   ├── middleware/     # Error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   └── server.ts       # Main server
│   ├── uploads/            # Upload directory
│   ├── outputs/            # Output directory
│   ├── Dockerfile          # Docker config
│   └── README.md           # API documentation
├── converter/              # Core converter library
├── scene_templates/        # Template files
├── XLSamples/             # XL template samples
├── docker-compose.yml     # Docker orchestration
├── README.md              # Main documentation
└── FINAL_DOCUMENTATION.md # This file
```

## 🧪 Testing

### API Testing
```bash
# Test conversion
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"aiOutput": {...}, "template": {...}}'

# Test health
curl http://localhost:3000/api/health
```

### Docker Testing
```bash
# Check container status
docker ps

# View logs
docker-compose logs -f
```

## 📈 Performance Metrics

### Typical Response Times
- **Health Check**: ~10ms
- **Template Conversion**: ~100-500ms
- **Template Listing**: ~50ms

### Resource Usage
- **Memory**: ~50-100MB RAM
- **CPU**: Low usage during idle
- **Storage**: Minimal (no file persistence)

## 🔒 Security Features

- **CORS Support**: Configurable origins
- **Helmet Security**: Security headers
- **Input Validation**: JSON schema validation
- **Error Handling**: Secure error responses
- **Rate Limiting**: Built-in protection

## 🚀 Future Enhancements

### Planned Features
- **Authentication**: JWT token support
- **Rate Limiting**: Advanced throttling
- **Caching**: Redis integration
- **Monitoring**: Prometheus metrics
- **Load Balancing**: Multi-instance support

### Potential Improvements
- **Batch Processing**: Multiple conversions
- **Template Validation**: Schema validation
- **Custom Templates**: Dynamic template creation
- **API Versioning**: Version management

## 📞 Support & Contact

- **Repository**: [https://github.com/ozkomer/converterai](https://github.com/ozkomer/converterai)
- **Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Author**: Omer Ozkan
- **License**: MIT

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Omer Ozkan**

*Transforming AI content into professional educational templates since 2025*

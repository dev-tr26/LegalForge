# LegalForge
AI -based legal documents generator app .

#  Legal Document Generator

AI-powered legal document processing system using OCR and LLM technology.


System Architecture

<img width="637" height="400" alt="image" src="https://github.com/user-attachments/assets/17e6b42c-987d-44c3-aab9-d2f3e6f9bfca" />


##  Features

- **Smart OCR**: Extract text from PDFs and images using PaddleOCR
- **AI Analysis**: Automatic extraction of parties, dates, and clauses using Grok AI
- **Document Generation**: Create professional legal documents from templates
- **Modern UI**: Beautiful, responsive React interface
- **Real-time Processing**: Live status updates during document processing

##  Tech Stack

- **Frontend**: React 18, TailwindCSS, Lucide Icons
- **Backend**: Django 5, Django REST Framework
- **Database**: MongoDB
- **OCR**: PaddleOCR (free, open-source)
- **LLM**: Grok API via LangChain
- **Deployment**: Docker, Docker Compose


##  Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/legal-document-generator.git
cd legal-document-generator
```

### 2. Set Environment Variables

Create `.env` file in root:
```env
GROK_API_KEY=your_grok_api_key_here
DJANGO_SECRET_KEY=your_secret_key_here
```

### 3. Start Services
```bash
docker-compose up --build
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **MongoDB**: localhost:27017

##  API Documentation

### Upload Document
```bash
POST /api/upload/
Content-Type: multipart/form-data

file: [PDF/Image file]
user_id: "user_001"
```

### List Documents
```bash
GET /api/documents/?user_id=user_001
```

### Generate Document
```bash
POST /api/generate/
Content-Type: application/json

{
  "document_id": "507f1f77bcf86cd799439011",
  "template_type": "NDA",
  "prompt": "For software development project"
}
```

##  Frontend Features

- **Drag & Drop Upload**: Easy file upload interface
- **Real-time Status**: Live processing updates
- **Document Editor**: Built-in rich text editor
- **Template Library**: Pre-built legal document templates
- **Responsive Design**: Works on desktop and mobile


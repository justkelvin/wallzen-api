<div align="center">
  <h1>🖼️ Wallzen Backend</h1>
  <p>A modern, high-performance wallpaper management API built with Node.js, Express, and PostgreSQL</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-endpoints">API Endpoints</a> •
    <a href="#environment-variables">Environment Setup</a>
  </p>
</div>

---

## ✨ Features

- 🚀 High-performance image serving
- 🔒 Rate limiting for API protection
- 📱 Responsive image resizing
- 🔍 Advanced search capabilities
- 🏷️ Tag-based categorization
- 🎨 Color extraction and filtering
- 📊 Download and view statistics
- 🗃️ PostgreSQL database with Prisma ORM

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Image Processing**: Sharp
- **File Storage**: Local filesystem
- **API Security**: Express Rate Limit
- **Documentation**: Swagger/OpenAPI

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wallzen-backend.git
cd wallzen-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Initialize the database**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start the development server**
```bash
npm run dev
```

## 📡 API Endpoints

### Wallpapers
- `GET /api/wallpapers` - Get all wallpapers (paginated)
- `GET /api/wallpapers/:id` - Get wallpaper by ID
- `GET /api/wallpapers/random` - Get random wallpapers
- `GET /api/wallpapers/search` - Search wallpapers
- `GET /api/wallpapers/filter` - Filter wallpapers

### Downloads
- `GET /api/wallpapers/:id/download` - Download wallpaper
- `GET /api/wallpapers/:id/preview` - Get wallpaper preview

### Statistics
- `GET /api/status` - Get API status
- `GET /api/health` - Health check endpoint

## 🔧 Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wallpaper_db"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT=100
DOWNLOAD_RATE_LIMIT=30
SEARCH_RATE_LIMIT=50

# File Storage
UPLOAD_DIR="./uploads"
PREVIEWS_DIR="./previews"
```

## 📊 API Response Format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

## 🔒 Rate Limiting

- API: 100 requests per 15 minutes
- Downloads: 30 downloads per 15 minutes
- Search: 50 searches per 15 minutes
- Health: 10 requests per minute

## 📦 Project Structure

```
src/
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/        # Database models
├── routes/        # API routes
├── services/      # Business logic
├── utils/         # Helper functions
└── app.ts         # Application entry
```

## 📝 License

MIT © [justkelvin]

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/justkelvin">justkelvin</a>
</div>
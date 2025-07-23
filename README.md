# Wallpaper CMS

Admin panel for managing wallpapers, categories, and collections for the wallpaper mobile app.

## Features

- 📱 Responsive admin dashboard
- 🖼️ Wallpaper management with upload functionality  
- 📂 Category and collection management
- ☁️ Google Cloud Storage integration
- 🎨 Modern UI with Ant Design
- 📊 Dashboard with statistics

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design
- **State Management**: Zustand
- **HTTP Client**: Axios
- **File Upload**: Google Cloud Storage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see wallpaper-backend)

### Installation

```bash
# Clone repository
git clone https://github.com/VAR-META-Tech/wallpaper-cms.git
cd wallpaper-cms

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Configure the following environment variables in `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8082/api

# File Upload Configuration  
VITE_UPLOAD_MAX_SIZE=52428800

# App Configuration
VITE_APP_NAME=Wallpaper CMS
VITE_APP_VERSION=1.0.0
```

**⚠️ Security Note**: Only VITE_ prefixed variables are exposed to client-side code. Never put sensitive information in VITE_ variables.

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── FileUpload.tsx  # File upload component
│   └── Layout.tsx      # App layout
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard page
│   ├── Wallpapers.tsx  # Wallpaper management
│   ├── Categories.tsx  # Category management
│   └── Collections.tsx # Collection management
├── services/           # API services
│   └── api.ts         # API client configuration
├── stores/            # Zustand stores
│   └── authStore.ts   # Authentication store
├── types/             # TypeScript type definitions
│   └── interfaces.ts  # API interfaces
└── utils/             # Utility functions
```

## API Integration

The CMS integrates with the wallpaper backend API:

- **GET /api/wallpapers** - Get wallpapers list
- **POST /api/admin/wallpapers** - Create wallpaper
- **PUT /api/admin/wallpapers/:id** - Update wallpaper
- **DELETE /api/admin/wallpapers/:id** - Delete wallpaper
- **POST /api/admin/upload** - Upload files

## Features

### File Upload
- Drag & drop interface
- Image support (JPG, PNG, GIF, WebP)  
- Strict file type validation
- Size limits (10MB max)
- Google Cloud Storage integration

### Dashboard
- Statistics overview
- Recent wallpapers
- Quick actions

### Wallpaper Management
- CRUD operations
- Bulk actions
- Search and filtering
- Status toggle

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Security

### Authentication

This CMS includes a placeholder authentication system for development purposes. **For production use:**

1. **Implement proper server-side authentication**
2. **Configure environment variables** - Copy `.env.example` to `.env` and set your values
3. **Enable CORS properly** - Configure your API server's CORS settings
4. **Use HTTPS** - Always use HTTPS in production
5. **Validate uploads** - File uploads include client-side validation, but implement server-side validation too

### Development vs Production

- **Development**: Uses placeholder authentication (currently disabled)
- **Production**: Requires proper authentication implementation
- **Environment Variables**: Use `.env.example` as a template

⚠️ **Important**: This repository contains no sensitive credentials and is safe for public use, but requires proper authentication setup for production deployment.

## License

This project is licensed under the MIT License.
# SnapEat - AI-Powered Nutrition Tracking Platform

AI-powered Multi-platform Nutrition Tracking System built with NestJS, FastAPI, React, and React Native. Features include AI Vision for meal analysis, TDEE calculation, meal planning, and comprehensive progress analytics.

## 🏗️ Architecture

### Monorepo Structure
```
SnapEat/
├── apps/
│   ├── backend/          # NestJS API (Node.js + TypeScript)
│   ├── ai-service/       # FastAPI AI Service (Python)
│   ├── web/             # React Web App (TypeScript)
│   └── mobile/          # React Native App (TypeScript) - Coming Soon
├── packages/
│   └── shared/          # Shared types and utilities
├── docker-compose.yml   # Docker orchestration
└── package.json         # Root workspace configuration
```

## 🚀 Features

### Core Features
- **User Authentication (JWT)**: Secure authentication and authorization
- **Meal Logging**: Manual entry and AI-powered photo recognition
- **TDEE Calculation**: Calculate Total Daily Energy Expenditure based on user profile
- **Meal Planning**: Create and manage weekly meal plans
- **Progress Analytics**: Track nutrition intake and weight over time

### Technology Stack

#### Backend (NestJS)
- **Runtime**: Node.js 18+
- **Framework**: NestJS
- **Databases**: 
  - PostgreSQL (Primary - User data, meals, plans)
  - MongoDB (Logs and analytics)
  - Redis (Caching and sessions)
- **ORM**: Prisma
- **Authentication**: JWT + Passport

#### AI Service (FastAPI)
- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **Features**: Food image recognition and nutritional analysis
- **Libraries**: PIL, PyTorch (for future ML models)

#### Frontend Web (React)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6

#### Frontend Mobile (React Native)
- **Framework**: React Native + TypeScript
- **Status**: Coming Soon

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **Python**: 3.11 or higher
- **Docker & Docker Compose**: Latest version
- **npm**: 9.x or higher

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/thinhtapcode/SnapEat.git
cd SnapEat
```

### 2. Install Dependencies

#### Root & Shared Packages
```bash
npm install
```

#### Backend
```bash
cd apps/backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npx prisma generate
npx prisma migrate dev
cd ../..
```

#### AI Service
```bash
cd apps/ai-service
pip install -r requirements.txt
cd ../..
```

#### Web App
```bash
cd apps/web
npm install
cd ../..
```

### 3. Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://snapeat:snapeat_password@localhost:5432/snapeat_db"
MONGODB_URI="mongodb://snapeat:snapeat_password@localhost:27017/snapeat_logs"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
AI_SERVICE_URL="http://localhost:8000"
```
#### AI Service (.env)
GEMINI_API_KEY=your-key-here

#### Web App (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_AI_SERVICE_URL=http://localhost:8000
```

## 🚀 Running the Application

### Using Docker Compose (Recommended)

Start all services:
```bash
docker-compose up -d
```

Services will be available at:
- **Web App**: http://localhost:80
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **AI Service**: http://localhost:8000
- **AI Docs**: http://localhost:8000/docs

### Manual Development Mode

#### Terminal 1 - Start Databases
```bash
docker-compose up postgres mongodb redis -d
```

#### Terminal 2 - Backend
```bash
npm run backend:dev
```

#### Terminal 3 - AI Service
```bash
npm run ai:dev
```

#### Terminal 4 - Web App
```bash
npm run web:dev
```

Services will be available at:
- **Web App**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **AI Service**: http://localhost:8000

## 📚 API Documentation

### Backend API
Visit http://localhost:3000/api/docs for Swagger documentation

### AI Service API
Visit http://localhost:8000/docs for FastAPI documentation

## 🏛️ Architecture Principles

### Clean Architecture
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Inversion**: Dependencies point inward
- **Modularity**: Each module is independent and reusable

### Backend Structure
```
apps/backend/src/
├── auth/              # Authentication module
├── meal/              # Meal logging module
├── tdee/              # TDEE calculation module
├── meal-plan/         # Meal planning module
├── analytics/         # Progress analytics module
├── common/            # Shared services (Prisma, Redis)
├── app.module.ts      # Root application module
└── main.ts            # Application entry point
```

### Database Schema

#### PostgreSQL (Prisma)
- **Users**: User accounts and authentication
- **UserProfile**: User profile data for TDEE calculation
- **Meals**: Logged meals with nutritional data
- **MealPlans**: Weekly meal plans
- **Progress**: Daily progress tracking

#### MongoDB
- Used for application logs and analytics data

#### Redis
- Session storage
- Caching frequently accessed data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm test --workspace=apps/backend

# Run web tests
npm test --workspace=apps/web
```

## 📦 Building for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build --workspace=apps/backend
npm run build --workspace=apps/web
```

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with class-validator
- SQL injection protection via Prisma
- Environment variable management

## 📱 Mobile App (Coming Soon)

React Native mobile application will include:
- Camera integration for food photos
- Offline meal logging
- Push notifications for meal reminders
- Native performance optimizations

## 🛣️ Roadmap

- [ ] Advanced AI model integration for better food recognition
- [ ] Barcode scanning for packaged foods
- [ ] Social features (share meals, challenges)
- [ ] Recipe recommendations
- [ ] Integration with fitness trackers
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Developed by the SnapEat Team

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**SnapEat** - Track smarter, eat better! 🥗📱

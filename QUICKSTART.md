# SnapEat Quick Start Guide

This guide will help you get SnapEat up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Python** 3.11 or higher ([Download](https://www.python.org/))
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## Option 1: Quick Start with Docker (Recommended)

This is the fastest way to run SnapEat with all services.

### Step 1: Clone and Setup
```bash
git clone https://github.com/thinhtapcode/SnapEat.git
cd SnapEat
```

### Step 2: Start All Services
```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database
- MongoDB
- Redis
- Backend API (NestJS)
- AI Service (FastAPI)
- Web Application (React)

### Step 3: Access the Application
- **Web App**: http://localhost:80
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **AI Service**: http://localhost:8000
- **AI Documentation**: http://localhost:8000/docs

### Step 4: Create an Account
1. Open http://localhost:80 in your browser
2. Click "Register" to create a new account
3. Fill in your details and submit
4. You'll be automatically logged in

### Step 5: Stop Services
```bash
docker-compose down
```

## Option 2: Manual Development Setup

For development with hot reload and better debugging.

### Step 1: Clone the Repository
```bash
git clone https://github.com/thinhtapcode/SnapEat.git
cd SnapEat
```

### Step 2: Install Dependencies

#### Root & Shared Packages
```bash
npm install
```

#### Backend Dependencies
```bash
cd apps/backend
npm install
cd ../..
```

#### Web App Dependencies
```bash
cd apps/web
npm install
cd ../..
```

#### AI Service Dependencies
```bash
cd apps/ai-service
pip install -r requirements.txt
cd ../..
```

### Step 3: Configure Environment Variables

#### Backend Configuration
```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env` and update if needed:
```env
DATABASE_URL="postgresql://snapeat:snapeat_password@localhost:5432/snapeat_db"
MONGODB_URI="mongodb://snapeat:snapeat_password@localhost:27017/snapeat_logs"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
AI_SERVICE_URL="http://localhost:8000"
```

#### Web App Configuration
```bash
cd apps/web
cp .env.example .env
```

### Step 4: Start Database Services
```bash
# From project root
docker-compose up postgres mongodb redis -d
```

### Step 5: Setup Database Schema
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### Step 6: Start Development Servers

Open 3 terminals:

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - AI Service:**
```bash
npm run ai:dev
```

**Terminal 3 - Web App:**
```bash
npm run web:dev
```

### Step 7: Access the Application
- **Web App**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **AI Service**: http://localhost:8000
- **AI Documentation**: http://localhost:8000/docs

## Option 3: Mobile App Setup (React Native)

### Prerequisites
- Complete Option 1 or 2 above
- Install Expo CLI: `npm install -g expo-cli`
- Have Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Steps
```bash
cd apps/mobile
npm install
npm start
```

Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

## First Time Usage

### 1. Create Your Account
- Register with email, username, and password
- You'll be logged in automatically

### 2. Complete Your Profile
- Go to Profile section
- Enter your details:
  - Age, gender, height, weight
  - Activity level
  - Fitness goal
- Click "Update Profile"

### 3. View Your TDEE
- Your Total Daily Energy Expenditure will be calculated
- See recommended daily calories and macros

### 4. Log Your First Meal
- Go to Meals section
- Click "Add Manual Meal" or "Scan Food Photo"
- Enter meal details
- Submit

### 5. Track Your Progress
- Go to Analytics
- View daily, weekly, and monthly summaries
- Track weight changes and adherence

## Common Issues & Solutions

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9  # Mac/Linux
```

### Database Connection Error
```bash
# Restart database services
docker-compose restart postgres mongodb redis
```

### Prisma Client Not Generated
```bash
cd apps/backend
npx prisma generate
```

### Python Dependencies Error
```bash
cd apps/ai-service
pip install --upgrade pip
pip install -r requirements.txt
```

### Docker Build Fails
```bash
# Clean and rebuild
docker-compose down -v
docker-compose up -d --build
```

## Testing the System

### Test Authentication
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

### Test AI Service
```bash
curl http://localhost:8000/health
```

### Test Meal Logging
1. Login to web app
2. Update your profile
3. Log a manual meal
4. Check dashboard for updated stats

## Next Steps

- Read the [Architecture Documentation](ARCHITECTURE.md)
- Explore the [API Documentation](http://localhost:3000/api/docs)
- Check out the [Backend README](apps/backend/README.md)
- Try the [Mobile App](apps/mobile/README.md)

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/thinhtapcode/SnapEat/issues)
- **Documentation**: See README.md and ARCHITECTURE.md
- **API Docs**: http://localhost:3000/api/docs (when running)

## Development Tips

### Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Run backend tests
cd apps/backend && npm test

# Format code
npm run format

# Lint code
npm run lint

# Database management
cd apps/backend
npx prisma studio  # Open Prisma Studio
npx prisma migrate dev  # Run migrations
```

### Recommended VS Code Extensions
- ESLint
- Prettier
- Prisma
- Python
- React Native Tools

---

Happy coding! 🚀 If you encounter any issues, please check the main README.md or create an issue on GitHub.

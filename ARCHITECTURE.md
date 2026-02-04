# SnapEat Architecture Documentation

## System Overview

SnapEat is a full-stack AI-powered nutrition tracking platform following a modular, scalable architecture with Clean Architecture principles.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│  ┌──────────────┐                    ┌──────────────┐           │
│  │  React Web   │                    │React Native  │           │
│  │   (Vite)     │                    │   (Expo)     │           │
│  └──────────────┘                    └──────────────┘           │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
             │ HTTP/REST                        │ HTTP/REST
             │                                  │
┌────────────┴──────────────────────────────────┴─────────────────┐
│                      Backend Application Layer                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           NestJS Backend (Port 3000)                 │       │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐     │       │
│  │  │  Auth  │ │  Meal  │ │  TDEE  │ │Analytics │     │       │
│  │  └────────┘ └────────┘ └────────┘ └──────────┘     │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────┬──────────────────────────────────────────────┘
```
```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│  ┌──────────────┐                    ┌──────────────┐           │
│  │  React Web   │                    │React Native  │           │
│  │   (Vite)     │                    │   (Expo)     │           │
│  │  - UI / Auth │                    │ - UI / Auth  │           │
│  │  - Meal Forms│                    │ - Meal Forms │           │
│  │  - Charts    │                    │ - Charts     │           │
│  └──────────────┘                    └──────────────┘           │
└────────────┬──────────────────────────────────┬─────────────────┘
             │ HTTP/REST + JWT                  │ HTTP/REST + JWT
             │                                  │
┌────────────┴──────────────────────────────────┴─────────────────┐
│                Backend Application Layer (NestJS)               │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐       │
│  │   Auth    │ │   Meal   │ │   TDEE   │ │  Analytics   │       │
│  │           │ │          │ │          │ │              │       │
│  │JWT / OAuth│ │CRUD + Log│ │Calculation││Dashboard/Graph│      │
│  └───────────┘ └──────────┘ └──────────┘ └──────────────┘       │
│         │                     │                     │           │
│         │ Sync HTTP           │ Async Job Queue     │           │
└─────────┴─────────────┬───────┴───────────────┬─────┴───────────┘
                        │                       │
                        ▼                       ▼
┌────────────────────────────┐      ┌───────────────────────────┐
│        Redis Queue         │      │        S3 Storage         │
│ - Async AI jobs            │      │ - Food / User images      │
│ - Notifications            │      │ - Backup                  │
└────────────────────────────┘      └───────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  AI Service Layer               │
│          FastAPI + PyTorch/TensorFlow           │
│  ┌─────────────────────────────────────────┐    │
│  │  Food Recognition & Nutrition Analysis  │    │
│  │  - Predict calories / macros            │    │
│  │  - Return structured result to backend  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                     Data Layer                  │
│  ┌──────────┐    ┌──────────────┐    ┌────────┐ │
│  │PostgreSQL│    │   MongoDB    │    │  Redis │ │
│  │ (Core    │    │ (Food Meta & │    │ (Cache/│ │
│  │  Data)   │    │ AI Logs)     │    │ Queue) │ │
│  └──────────┘    └──────────────┘    └────────┘ │
└─────────────────────────────────────────────────┘
```

## Technology Stack

### Backend (NestJS)
- **Framework**: NestJS 10.x
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Architecture Pattern**: Modular + Clean Architecture

#### Key Modules:
1. **Auth Module**: JWT-based authentication
2. **Meal Module**: Meal logging and retrieval
3. **TDEE Module**: Total Daily Energy Expenditure calculation
4. **Meal Plan Module**: Meal planning and scheduling
5. **Analytics Module**: Progress tracking and analytics

### Database Layer

#### PostgreSQL (Primary Database)
- **ORM**: Prisma
- **Purpose**: Core application data
- **Schema**:
  - Users & Authentication
  - User Profiles
  - Meals & Food Items
  - Meal Plans
  - Progress Tracking

#### MongoDB
- **Purpose**: Application logs and analytics data
- **Use Cases**: 
  - Request/Response logs
  - Error tracking
  - Usage analytics

#### Redis
- **Purpose**: Caching and session management
- **Use Cases**:
  - Session storage
  - Rate limiting
  - Frequently accessed data caching

### AI Service (FastAPI)
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Features**: 
  - Food image recognition
  - Nutritional analysis
  - Future: ML model integration

### Frontend Web (React)
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6

### Frontend Mobile (React Native)
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Routing**: Expo Router (File-based)
- **State Management**: Zustand
- **Camera**: Expo Camera & Image Picker

## Clean Architecture Principles

### Layer Separation

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                     │
│  (Controllers, DTOs, Validators)                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│           Business Logic Layer                   │
│  (Services, Use Cases, Domain Logic)            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│           Data Access Layer                      │
│  (Repositories, Prisma, MongoDB, Redis)         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│           Infrastructure Layer                   │
│  (Database, External Services, Cache)           │
└──────────────────────────────────────────────────┘
```

### Module Structure Example (Backend)

```
src/
├── auth/
│   ├── dto/                    # Data Transfer Objects
│   ├── guards/                 # Auth guards
│   ├── decorators/             # Custom decorators
│   ├── auth.controller.ts      # HTTP endpoints
│   ├── auth.service.ts         # Business logic
│   ├── auth.module.ts          # Module definition
│   └── jwt.strategy.ts         # JWT strategy
├── meal/
│   ├── dto/
│   ├── meal.controller.ts
│   ├── meal.service.ts
│   └── meal.module.ts
└── common/
    ├── prisma.service.ts       # Database service
    └── redis.service.ts        # Cache service
```

## API Design

### RESTful Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Meals
- `GET /meals` - Get all meals
- `POST /meals` - Create meal
- `GET /meals/:id` - Get specific meal
- `PATCH /meals/:id` - Update meal
- `DELETE /meals/:id` - Delete meal
- `GET /meals/daily-summary` - Get daily summary

#### TDEE
- `GET /tdee/calculate` - Calculate TDEE
- `PUT /tdee/profile` - Update user profile

#### Meal Plans
- `GET /meal-plans` - Get all meal plans
- `POST /meal-plans` - Create meal plan
- `GET /meal-plans/active` - Get active plans

#### Analytics
- `GET /analytics/history` - Get progress history
- `GET /analytics/summary` - Get analytics summary
- `POST /analytics/track` - Track daily progress

#### AI Service
- `POST /api/recognize` - Recognize food from base64 image
- `POST /api/recognize/upload` - Recognize food from uploaded file
- `GET /api/foods` - Get food database

## Security Architecture

### Authentication Flow

```
1. User logs in with credentials
2. Backend validates credentials
3. JWT token generated and returned
4. Client stores token
5. Subsequent requests include token in Authorization header
6. Backend validates token using JWT strategy
7. Request processed if token valid
```

### Security Features
- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Passport.js integration
- CORS configuration
- Input validation using class-validator
- SQL injection protection via Prisma ORM
- Environment variable management

## Data Flow

### Meal Logging Flow (with AI)

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Mobile  │────>│  Web    │────>│  Backend │────>│   AI     │
│  App    │     │   App   │     │   API    │     │ Service  │
└─────────┘     └─────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  1. Photo      │                │                │
     │────────────────>                │                │
     │                │  2. Upload     │                │
     │                │────────────────>                │
     │                │                │  3. Recognize  │
     │                │                │───────────────>│
     │                │                │  4. Food Data  │
     │                │                │<───────────────│
     │                │  5. Save Meal  │                │
     │                │────────────────>                │
     │                │                │  6. Store DB   │
     │                │                │────────┐       │
     │                │                │        │       │
     │                │  7. Response   │<───────┘       │
     │                │<────────────────                │
     │  8. Update UI  │                │                │
     │<────────────────                │                │
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Session storage in Redis
- Database connection pooling
- Load balancer ready

### Caching Strategy
- Redis for frequently accessed data
- Query result caching
- Rate limiting with Redis

### Database Optimization
- Indexed queries on frequently accessed fields
- Pagination for large datasets
- Connection pooling
- Query optimization with Prisma

## Deployment Architecture

### Docker Compose Setup

```yaml
Services:
├── postgres (PostgreSQL database)
├── mongodb (MongoDB for logs)
├── redis (Redis cache)
├── backend (NestJS API)
├── ai-service (FastAPI)
└── web (React web app with Nginx)
```

### Environment Configuration
- Development: Docker Compose with hot reload
- Production: Docker Compose with optimized builds
- CI/CD ready structure

## Monitoring & Logging

### Logging Strategy
- Application logs to MongoDB
- Structured logging format
- Request/Response logging
- Error tracking

### Health Checks
- Backend: `/health` endpoint
- AI Service: `/health` endpoint
- Database connection monitoring

## Future Enhancements

1. **Microservices**: Split backend into smaller services
2. **Message Queue**: Add RabbitMQ/Kafka for async processing
3. **GraphQL**: Add GraphQL API alongside REST
4. **Real-time**: WebSocket support for live updates
5. **CDN**: Static asset delivery via CDN
6. **Multi-region**: Database replication across regions
7. **Kubernetes**: Container orchestration with K8s
8. **Observability**: Prometheus + Grafana monitoring

## Development Workflow

### Local Development
1. Start databases: `docker-compose up postgres mongodb redis -d`
2. Start backend: `npm run backend:dev`
3. Start AI service: `npm run ai:dev`
4. Start web: `npm run web:dev`

### Testing
- Unit tests per module
- Integration tests for API endpoints
- E2E tests for critical flows

### Code Quality
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Husky for pre-commit hooks (future)

## Conclusion

SnapEat follows modern architectural patterns and best practices to ensure:
- **Modularity**: Easy to maintain and extend
- **Scalability**: Ready to handle growth
- **Security**: Industry-standard security measures
- **Developer Experience**: Clear structure and documentation
- **Clean Architecture**: Separation of concerns and dependency inversion

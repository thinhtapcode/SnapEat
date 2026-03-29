<div align="center">
  <img src="./graphics/SnapEat.svg" alt="SnapEat Logo" width="200" onerror="this.style.display='none'"/>

  # 🥗 SnapEat: AI-Powered Nutrition Intelligence

  <p>
    SnapEat is an intelligent, AI-driven nutrition tracking platform designed to simplify dietary logging. By analyzing food images instantly, SnapEat delivers accurate macronutrient data, empowering users on their journey to better health with unparalleled convenience and precision.
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## ✨ Key Features

- 📸 **AI Food Scanning (Core Feature)**: Snap a photo of your meal, and our AI service will instantly detect the food type, portion sizes, and breakdown the exact macronutrients using state-of-the-art vision models.
- 🧮 **TDEE & Macronutrient Calculation**: Automatically estimates your Total Daily Energy Expenditure and tracks Protein, Carbs, and Fats tailored to your goals.
- 📊 **Analytics Dashboard**: Visualize your progress over time with rich, interactive charts.
- 📚 **Comprehensive Food Library**: A massive database of food items allowing manual logging and adjustments.

## 🛠 Tech Stack

SnapEat is built using modern, highly scalable technologies designed for a Microservices environment.

### Frontend
| Technology | Description |
| --- | --- |
| **React & Vite** | Blazing fast development and optimized UI delivery |
| **TailwindCSS** | Utility-first styling for a highly responsive design |
| **Zustand** | Minimalist and fast state management |
| **React Query** | Asynchronous state management and data fetching |

### Backend
| Technology | Description |
| --- | --- |
| **NestJS** | Scalable Node.js framework using TypeScript |
| **Prisma ORM** | Type-safe database access |
| **PostgreSQL** | Robust relational database |
| **Redis** | High-performance caching and job queuing |

### 🧠 AI Service
| Technology | Description |
| --- | --- |
| **Python & FastAPI** | High-performance, async-ready API serving the ML models |
| **Gemini API & GROQ** | Cutting-edge LLM and Vision models (with intelligent key rotation for high availability) |
| **OpenCV** | Advanced image processing before inference |

### DevOps
| Technology | Description |
| --- | --- |
| **Docker & Compose** | Containerized microservices architecture |
| **Nginx** | Reverse proxy and static file serving |

## 📐 System Architecture

SnapEat is structured as a **Microservices Monorepo**. 
- The **Frontend SPA** talks to the **NestJS Backend Gateway**.
- The **Backend** handles authentication, database reading/writing, and caches frequent queries in **Redis**.
- When an image is uploaded for scanning, the **Backend** routes the payload to the independent **Python AI Service**.
- All services communicate securely via internal **Docker Networks**, isolated from external access except through designated exposed ports.

## 🗄 Database Schema

The core relational entities in our PostgreSQL database include:
- **`User`**: Manages authentication, profiles, and customizable targets.
- **`MealLog`**: Represents a daily diary entry, detailing meals consumed throughout the day.
- **`Food`**: The core directory of foods, holding base macronutrient values.
- **`Goal`**: Tracks user milestones (e.g., Target Weight, Caloric Deficit).

## 🚀 Installation & Setup

Running SnapEat locally is streamlined thanks to Docker. Ensure you have Docker and Docker Compose installed.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/SnapEat.git
cd SnapEat
```

### 2. Environment Variables
Create a root `.env` file based on the provided sample. 
```bash
cp .env.example .env
```
*Note: Make sure to populate `DATABASE_URL`, `GEMINI_KEYS`, and other necessary secrets in your `.env`.*

### 3. Spin up the containers
```bash
# This will build and start the Database, Backend, AI-Service, and Frontend
docker-compose up -d --build
```
Once up, the services will be available at:
- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:3000`
- **AI Service**: `http://localhost:8000`

## 👥 Team & Contribution

SnapEat is proudly built by a group of **8 passionate engineering students** from a leading technical university. 

As the **Team Leader & Core Developer**, I designed the system architecture, established the CI/CD and Docker topology, and architected both the NestJS Backend and the FastAPI AI microservice.

*If you are interested in contributing, please feel free to open a Pull Request!*

# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/apps/backend
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npm run build --workspace=apps/backend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN npm install --production

# Copy built files
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma
COPY apps/backend/prisma ./apps/backend/prisma

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

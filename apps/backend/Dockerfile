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

# Generate Prisma client - Sửa đường dẫn build tại đây
WORKDIR /app/apps/backend
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npm run build --workspace=apps/backend

# Production stage
FROM node:18-alpine3.17

WORKDIR /app
RUN apk add --no-cache openssl
# Copy package files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/

# Chỉ cài production dependencies
RUN npm install --production

# --- ĐOẠN SỬA QUAN TRỌNG NHẤT ---
# Copy dist bình thường
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Sửa lại đường dẫn copy Prisma từ thư mục gốc của builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# -------------------------------

COPY apps/backend/prisma ./apps/backend/prisma

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
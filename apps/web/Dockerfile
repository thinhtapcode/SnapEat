# Web Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build --workspace=apps/web

# Production stage with Nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

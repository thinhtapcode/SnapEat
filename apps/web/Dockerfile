# Stage 1: Build Image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Pass VITE_API_URL via Build Arguments to be injected into the built app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the React/Vite application
RUN npm run build

# Stage 2: Nginx Web Server
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built app to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace with custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

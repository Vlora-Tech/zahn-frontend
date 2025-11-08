# syntax=docker/dockerfile:1

# ---- Build stage: compile Vite app ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build-time environment (used by Vite)
ARG VITE_APP_API_BASE_URL
ENV VITE_APP_API_BASE_URL=${VITE_APP_API_BASE_URL}

# Build the production bundle
RUN npm run build

# ---- Runtime stage: serve with NGINX ----
FROM nginx:alpine

# Copy NGINX config (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
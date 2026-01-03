# -------- Build Stage --------#
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build

 # -------- Runtime Stage --------#
    FROM node:20-alpine
    
    WORKDIR /app
    
    COPY --from=builder /app/dist ./dist
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    EXPOSE 3000
    
    CMD ["node", "dist/server.js"]


# docker-compose -f docker-compose.yml up --build -d
    
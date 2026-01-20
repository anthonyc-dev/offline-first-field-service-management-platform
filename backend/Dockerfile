# =======================
# Multi-Stage Dockerfile
# =======================

# -------- Build Stage -------- #
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm ci

# Copy full source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the project
RUN npm run build

# Verify build output
RUN test -d /app/dist || (echo "Build failed - dist directory not found" && exit 1)
RUN test -f /app/dist/server.js || (echo "Build failed - dist/server.js not found" && exit 1)


# -------- Runtime Stage -------- #
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application and Prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src/generated ./src/generated

# Generate Prisma client in runtime
RUN npx prisma generate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000


CMD ["node", "dist/server.js"]

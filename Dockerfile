# Multi-stage Docker build for AI Masterclass Application

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ .

# Build frontend for production
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies (including dev dependencies for potential build steps)
RUN npm ci

# Copy backend source code
COPY backend/ .

# Remove dev dependencies for production
RUN npm prune --production

# Stage 3: Production Image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built backend from builder stage
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend ./backend

# Copy built frontend from builder stage
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/build ./frontend/build

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nextjs:nodejs /app/logs /app/uploads

# Copy production environment template
COPY .env.production /app/.env.example

# Install production dependencies and clean up
WORKDIR /app/backend
RUN npm ci --only=production && \
    npm cache clean --force

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { \
        if (res.statusCode === 200) { process.exit(0) } else { process.exit(1) } \
    }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "index.improved.js"]
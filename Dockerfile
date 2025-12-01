# ============================================================================
# FortLoot Store (Next.js 15) - Production Dockerfile
# ============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --loglevel=error

# Copy source code
COPY . .

# Build Next.js app standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production (minimal image)
FROM node:20-alpine AS runtime

# Create user first (before copying files)
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy only what's needed for standalone (no node_modules needed!)
COPY --from=builder --chown=nextjs:root /app/public ./public
COPY --from=builder --chown=nextjs:root /app/.next/standalone ./
COPY --from=builder --chown=nextjs:root /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

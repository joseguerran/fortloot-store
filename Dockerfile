# ============================================================================
# FortLoot Store (Next.js 15) - Production Dockerfile
# ============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --include=dev --loglevel=error

# Copy source code
COPY . .

# Build Next.js app standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000

# Copy built Next.js app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN adduser --system --uid 1001 appuser && chown -R appuser /app
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget -qO- http://localhost:3000 || exit 1
CMD ["node", "server.js"]

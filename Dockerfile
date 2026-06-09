# =============================================================================
# GAD (Global Archeological Database) — Backend Dockerfile
# =============================================================================
# Multi-stage build: install deps in a full image, then copy to a lean runtime.
# =============================================================================

# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install ALL dependencies (including devDependencies for tests)
RUN npm ci

# ---- Stage 2: Production image ----
FROM node:22-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 gad

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy application source
COPY index.js ./
COPY src/ ./src/

# Use the non-root user
USER gad

# Cloud Run expects the process to listen on PORT env var (default 8080)
EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "index.js"]

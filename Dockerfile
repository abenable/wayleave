# ───────────────────────────────────────────────
#  Stage 1: Dependencies + Prisma Client
# ───────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy prisma schema and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# ───────────────────────────────────────────────
#  Stage 2: Build the application
# ───────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy all source
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# ───────────────────────────────────────────────
#  Stage 3: Production runtime
# ───────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Only copy what's needed at runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --chmod=+x docker-entrypoint.sh /app/docker-entrypoint.sh
COPY --from=builder /app/server.production.mjs ./
COPY --from=builder /app/package.json ./

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]

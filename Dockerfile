# ───────────────────────────────────────────────
#  Stage 1: Dependencies + Prisma Client
# ───────────────────────────────────────────────
FROM node:24-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy prisma schema and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./

# prisma.config.ts resolves DATABASE_URL at load time; generate does not connect,
# so a placeholder is enough to satisfy the config loader during the build.
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder?schema=public"
RUN npx prisma generate

# ───────────────────────────────────────────────
#  Stage 2: Build the application
# ───────────────────────────────────────────────
FROM node:24-alpine AS builder

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
FROM node:24-alpine AS runner

# Prisma's query engine is linked against glibc; on Alpine it needs gcompat.
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Only copy what's needed at runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/src/data ./src/data
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

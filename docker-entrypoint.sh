#!/bin/sh
set -e

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running seed (skips if data already present)..."
npx tsx prisma/seed.ts

echo "🚀 Starting server..."
exec node server.production.mjs

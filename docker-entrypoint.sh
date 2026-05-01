#!/bin/sh
set -e

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "📊 Checking seed status..."

# Use psql (already in the PostGIS image) to check if detections exist
SEED_COUNT=$(psql "$DATABASE_URL" -t -A -c "SELECT COUNT(*)::text FROM detections;" 2>/dev/null || echo "0")

if [ "$SEED_COUNT" = "0" ] || [ "$SEED_COUNT" = "" ]; then
  echo "🌱 Database empty — seeding with mock data..."
  npx tsx prisma/seed.ts
else
  echo "✅ Data already present (detections: $SEED_COUNT)"
fi

echo "🚀 Starting server..."
exec node server.production.mjs

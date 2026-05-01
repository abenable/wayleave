#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Check if we need to seed by querying via a small node script
SEED_NEEDED=$(node -e "
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma/client.js');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
prisma.detection.count().then(c => { console.log(c === 0 ? 'yes' : 'no'); prisma.\$disconnect(); }).catch(() => { console.log('yes'); });
")

if [ "$SEED_NEEDED" = "yes" ]; then
  echo "🌱 Database empty — seeding..."
  npx tsx prisma/seed.ts
else
  echo "✅ Data already present"
fi

echo "🚀 Starting server..."
exec node server.production.mjs

import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

import {
  transmissionLines,
  wayleaveBuffers,
  detections,
} from '../src/data/geoData.js'

const args = process.argv.slice(2)
const forceReseed = args.includes('--force')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Check if already seeded
  const existingCount = await prisma.detection.count()
  if (existingCount > 0 && !forceReseed) {
    console.log(`ℹ️  Database already seeded (${existingCount} detections). Use --force to reseed.`)
    return
  }

  if (forceReseed) {
    console.log('⚠️  Force reseed — clearing existing data...')
    await prisma.detection.deleteMany()
    await prisma.wayleaveBuffer.deleteMany()
    await prisma.transmissionLine.deleteMany()
  }

  // Seed transmission lines
  for (const line of transmissionLines.features) {
    await prisma.transmissionLine.create({
      data: {
        id: line.properties!.id as string,
        name: line.properties!.name as string,
        voltage: line.properties!.voltage as string,
        geometry: line.geometry as any,
        lengthKm: (line.properties as any).lengthKm ?? 0,
      },
    })
  }
  console.log(`✅ Seeded ${transmissionLines.features.length} transmission lines`)

  // Seed wayleave buffers
  for (const buf of wayleaveBuffers.features) {
    await prisma.wayleaveBuffer.create({
      data: {
        id: buf.properties!.id as string,
        lineId: buf.properties!.lineId as string,
        bufferRadius: buf.properties!.bufferRadius as number,
        geometry: buf.geometry as any,
      },
    })
  }
  console.log(`✅ Seeded ${wayleaveBuffers.features.length} wayleave buffers`)

  // Seed detections
  for (const d of detections.features) {
    const p = d.properties as any
    await prisma.detection.create({
      data: {
        id: p.id,
        lineId: p.lineId,
        type: p.type,
        severity: p.severity,
        confidenceScore: p.confidence_score,
        dateDetected: new Date(p.date_detected),
        status: p.status,
        distanceToCenterline: p.distance_to_centerline,
        chainage: p.chainage,
        coordinates: p.coordinates,
        geometry: d.geometry as any,
        transmissionLineName: p.transmission_line,
      },
    })
  }
  console.log(`✅ Seeded ${detections.features.length} detections`)

  console.log('\n🎉 Database seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

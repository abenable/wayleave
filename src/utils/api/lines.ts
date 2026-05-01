import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'

export type LineOutput = {
  id: string
  name: string
  voltage: string
  geometry: GeoJSON.LineString
  lengthKm: number
}

export const getLines = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LineOutput[]> => {
    const lines = await prisma.transmissionLine.findMany({
      orderBy: { name: 'asc' },
    })
    return lines.map((l) => ({
      id: l.id,
      name: l.name,
      voltage: l.voltage,
      geometry: l.geometry as unknown as GeoJSON.LineString,
      lengthKm: l.lengthKm,
    }))
  }
)

export const getLineById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<LineOutput | null> => {
    const line = await prisma.transmissionLine.findUnique({
      where: { id: data.id },
    })
    if (!line) return null
    return {
      id: line.id,
      name: line.name,
      voltage: line.voltage,
      geometry: line.geometry as unknown as GeoJSON.LineString,
      lengthKm: line.lengthKm,
    }
  })

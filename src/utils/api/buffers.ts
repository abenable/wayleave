import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'

export type BufferOutput = {
  id: string
  lineId: string
  bufferRadius: number
  geometry: GeoJSON.Polygon
}

export const getBuffers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<BufferOutput[]> => {
    const buffers = await prisma.wayleaveBuffer.findMany()
    return buffers.map((b) => ({
      id: b.id,
      lineId: b.lineId,
      bufferRadius: b.bufferRadius,
      geometry: b.geometry as unknown as GeoJSON.Polygon,
    }))
  }
)

export const getBuffersByLineId = createServerFn({ method: 'GET' })
  .inputValidator((data: { lineId: string }) => data)
  .handler(async ({ data }): Promise<BufferOutput[]> => {
    const buffers = await prisma.wayleaveBuffer.findMany({
      where: { lineId: data.lineId },
    })
    return buffers.map((b) => ({
      id: b.id,
      lineId: b.lineId,
      bufferRadius: b.bufferRadius,
      geometry: b.geometry as unknown as GeoJSON.Polygon,
    }))
  })

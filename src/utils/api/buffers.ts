import { createServerFn } from '@tanstack/react-start'
import { wayleaveBuffers } from '#/data/geoData'

export type BufferOutput = {
  id: string
  lineId: string
  bufferRadius: number
  geometry: GeoJSON.Polygon
}

function mapBuffer(feature: any): BufferOutput {
  return {
    id: feature.properties.id,
    lineId: feature.properties.lineId,
    bufferRadius: feature.properties.bufferRadius,
    geometry: feature.geometry as GeoJSON.Polygon,
  }
}

export const getBuffers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<BufferOutput[]> => {
    return wayleaveBuffers.features.map(mapBuffer)
  }
)

export const getBuffersByLineId = createServerFn({ method: 'GET' })
  .inputValidator((data: { lineId: string }) => data)
  .handler(async ({ data }): Promise<BufferOutput[]> => {
    return wayleaveBuffers.features
      .filter((f: any) => f.properties.lineId === data.lineId)
      .map(mapBuffer)
  })

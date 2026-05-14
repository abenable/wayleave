import { createServerFn } from '@tanstack/react-start'
import { transmissionLines, lineKilometers } from '#/data/geoData'

export type LineOutput = {
  id: string
  name: string
  voltage: string
  geometry: GeoJSON.LineString
  lengthKm: number
}

function mapLine(feature: any): LineOutput {
  const id = feature.properties.id
  return {
    id,
    name: feature.properties.name,
    voltage: feature.properties.voltage,
    geometry: feature.geometry as GeoJSON.LineString,
    lengthKm: lineKilometers[id] ?? 0,
  }
}

export const getLines = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LineOutput[]> => {
    return transmissionLines.features.map(mapLine)
  }
)

export const getLineById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<LineOutput | null> => {
    const feature = transmissionLines.features.find(
      (f: any) => f.properties.id === data.id
    )
    if (!feature) return null
    return mapLine(feature)
  })

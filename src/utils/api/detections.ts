import { createServerFn } from '@tanstack/react-start'
import { detections } from '#/data/geoData'

export type DetectionOutput = {
  id: string
  lineId: string
  type: 'Structure' | 'Vegetation'
  severity: 'Critical' | 'Warning'
  confidenceScore: number
  dateDetected: string
  status: 'Unverified' | 'Dispatched' | 'Resolved'
  distanceToCenterline: string
  chainage: string
  coordinates: string
  geometry: GeoJSON.Point
  transmissionLineName: string
  nearestTown: string | null
  village: string | null
  district: string | null
}

export interface DetectionFilters {
  lineId?: string | null
  type?: string
  severity?: string
  dateRange?: string // 'all' | '7' | '30'
  sortBy?: string // 'newest' | 'confidence' | 'critical'
}

function mapDetection(feature: any): DetectionOutput {
  const p = feature.properties
  return {
    id: p.id,
    lineId: p.lineId,
    type: p.type,
    severity: p.severity,
    confidenceScore: p.confidence_score,
    dateDetected: p.date_detected,
    status: p.status,
    distanceToCenterline: p.distance_to_centerline,
    chainage: p.chainage,
    coordinates: p.coordinates,
    geometry: feature.geometry as GeoJSON.Point,
    transmissionLineName: p.transmission_line,
    nearestTown: p.nearest_town ?? null,
    village: p.village ?? null,
    district: p.district ?? null,
  }
}

export const getDetections = createServerFn({ method: 'GET' })
  .inputValidator((data: DetectionFilters) => data)
  .handler(async ({ data }): Promise<DetectionOutput[]> => {
    let results = detections.features.map(mapDetection)

    if (data.lineId && data.lineId !== 'all') {
      results = results.filter((d) => d.lineId === data.lineId)
    }
    if (data.type && data.type !== 'all') {
      results = results.filter((d) => d.type === data.type)
    }
    if (data.severity && data.severity !== 'all') {
      results = results.filter((d) => d.severity === data.severity)
    }
    if (data.dateRange && data.dateRange !== 'all') {
      const days = parseInt(data.dateRange, 10)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      results = results.filter((d) => new Date(d.dateDetected) >= cutoff)
    }

    if (data.sortBy === 'confidence') {
      results.sort((a, b) => b.confidenceScore - a.confidenceScore)
    } else if (data.sortBy === 'critical') {
      results.sort((a, b) => {
        const sevA = a.severity === 'Critical' ? 1 : 0
        const sevB = b.severity === 'Critical' ? 1 : 0
        if (sevB !== sevA) return sevB - sevA
        return b.confidenceScore - a.confidenceScore
      })
    } else {
      // newest (default)
      results.sort(
        (a, b) =>
          new Date(b.dateDetected).getTime() - new Date(a.dateDetected).getTime()
      )
    }

    return results
  })

export const getDetectionById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<DetectionOutput | null> => {
    const feature = detections.features.find(
      (f: any) => f.properties.id === data.id
    )
    if (!feature) return null
    return mapDetection(feature)
  })

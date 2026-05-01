import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'

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

export const getDetections = createServerFn({ method: 'GET' })
  .inputValidator((data: DetectionFilters) => data)
  .handler(async ({ data }): Promise<DetectionOutput[]> => {
    const where: any = {}

    if (data.lineId && data.lineId !== 'all') {
      where.lineId = data.lineId
    }
    if (data.type && data.type !== 'all') {
      where.type = data.type
    }
    if (data.severity && data.severity !== 'all') {
      where.severity = data.severity
    }
    if (data.dateRange && data.dateRange !== 'all') {
      const days = parseInt(data.dateRange, 10)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      where.dateDetected = { gte: cutoff }
    }

    let orderBy: any = { dateDetected: 'desc' }
    if (data.sortBy === 'confidence') {
      orderBy = { confidenceScore: 'desc' }
    }

    const detections = await prisma.detection.findMany({
      where,
      orderBy,
    })

    let results = detections.map((d) => ({
      id: d.id,
      lineId: d.lineId,
      type: d.type as 'Structure' | 'Vegetation',
      severity: d.severity as 'Critical' | 'Warning',
      confidenceScore: d.confidenceScore,
      dateDetected: d.dateDetected.toISOString().split('T')[0],
      status: d.status as 'Unverified' | 'Dispatched' | 'Resolved',
      distanceToCenterline: d.distanceToCenterline,
      chainage: d.chainage,
      coordinates: d.coordinates,
      geometry: d.geometry as unknown as GeoJSON.Point,
      transmissionLineName: d.transmissionLineName,
      nearestTown: d.nearestTown,
      village: d.village,
      district: d.district,
    }))

    if (data.sortBy === 'critical') {
      results.sort((a, b) => {
        const sevA = a.severity === 'Critical' ? 1 : 0
        const sevB = b.severity === 'Critical' ? 1 : 0
        if (sevB !== sevA) return sevB - sevA
        return b.confidenceScore - a.confidenceScore
      })
    }

    return results
  })

export const getDetectionById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<DetectionOutput | null> => {
    const d = await prisma.detection.findUnique({ where: { id: data.id } })
    if (!d) return null
    return {
      id: d.id,
      lineId: d.lineId,
      type: d.type as 'Structure' | 'Vegetation',
      severity: d.severity as 'Critical' | 'Warning',
      confidenceScore: d.confidenceScore,
      dateDetected: d.dateDetected.toISOString().split('T')[0],
      status: d.status as 'Unverified' | 'Dispatched' | 'Resolved',
      distanceToCenterline: d.distanceToCenterline,
      chainage: d.chainage,
      coordinates: d.coordinates,
      geometry: d.geometry as unknown as GeoJSON.Point,
      transmissionLineName: d.transmissionLineName,
      nearestTown: d.nearestTown,
      village: d.village,
      district: d.district,
    }
  })

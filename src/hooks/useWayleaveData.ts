import { useQuery } from '@tanstack/react-query'
import { getLines, getLineById } from '#/utils/api/lines'
import { getBuffers, getBuffersByLineId } from '#/utils/api/buffers'
import { getDetections, getViolationMasks } from '#/utils/api/detections'
import type { DetectionFilters } from '#/utils/api/detections'

/* ------------------------------------------------------------------ */
/*  Transmission Lines                                                */
/* ------------------------------------------------------------------ */

export function useLines() {
  return useQuery({
    queryKey: ['lines'],
    queryFn: () => getLines({ data: undefined }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLine(lineId: string | null) {
  return useQuery({
    queryKey: ['lines', lineId],
    queryFn: () =>
      lineId ? getLineById({ data: { id: lineId } }) : Promise.resolve(null),
    enabled: !!lineId,
    staleTime: 5 * 60 * 1000,
  })
}

/* ------------------------------------------------------------------ */
/*  Wayleave Buffers                                                  */
/* ------------------------------------------------------------------ */

export function useBuffers() {
  return useQuery({
    queryKey: ['buffers'],
    queryFn: () => getBuffers({ data: undefined }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBuffersByLineId(lineId: string | null) {
  return useQuery({
    queryKey: ['buffers', lineId],
    queryFn: () =>
      lineId
        ? getBuffersByLineId({ data: { lineId } })
        : getBuffers({ data: undefined }),
    staleTime: 5 * 60 * 1000,
  })
}

/* ------------------------------------------------------------------ */
/*  Detections                                                        */
/* ------------------------------------------------------------------ */

export function useDetections(filters: DetectionFilters) {
  return useQuery({
    queryKey: ['detections', filters],
    queryFn: () => getDetections({ data: filters }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/* ------------------------------------------------------------------ */
/*  Violation Masks                                                   */
/* ------------------------------------------------------------------ */

export function useViolationMasks(lineId: string | null) {
  return useQuery({
    queryKey: ['masks', lineId],
    queryFn: () => getViolationMasks({ data: { lineId } }),
    staleTime: 5 * 60 * 1000,
  })
}

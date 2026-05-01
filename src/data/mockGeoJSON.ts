import type { FeatureCollection, LineString, Polygon, Point, Feature } from 'geojson'

/* ------------------------------------------------------------------ */
/*  Transmission Lines — LineString features (Uganda centred)          */
/* ------------------------------------------------------------------ */

function lineFeature(
  id: string,
  name: string,
  voltage: string,
  coords: [number, number][]
): Feature<LineString> {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties: { id, name, voltage },
  }
}

const transmissionLines: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [
    lineFeature('TL-001', 'Kampala–Jinja', '132kV', [
      [32.5825, 0.3136],
      [32.6000, 0.3220],
      [32.6200, 0.3300],
      [32.6400, 0.3380],
      [32.6600, 0.3450],
      [32.6800, 0.3520],
      [32.7000, 0.3600],
      [32.7200, 0.3680],
      [32.7400, 0.3750],
      [32.7600, 0.3830],
      [32.7800, 0.3900],
      [32.8000, 0.3980],
      [32.8200, 0.4050],
      [32.8400, 0.4120],
      [32.8600, 0.4200],
      [32.8800, 0.4280],
      [32.9000, 0.4350],
      [32.9200, 0.4420],
      [32.9400, 0.4500],
      [32.9600, 0.4580],
      [32.9800, 0.4650],
      [33.0000, 0.4720],
      [33.0200, 0.4800],
      [33.0400, 0.4880],
      [33.0600, 0.4950],
      [33.0800, 0.5020],
      [33.1000, 0.5100],
      [33.1200, 0.5180],
      [33.1400, 0.5250],
      [33.1600, 0.5320],
      [33.1800, 0.5400],
      [33.2000, 0.5480],
      [33.2200, 0.5550],
      [33.2400, 0.5620],
      [33.2600, 0.5700],
      [33.2800, 0.5780],
      [33.3000, 0.5850],
      [33.3200, 0.5920],
      [33.3400, 0.6000],
      [33.3600, 0.6080],
      [33.3800, 0.6150],
      [33.4000, 0.6220],
      [33.4200, 0.6300],
      [33.4400, 0.6380],
      [33.4600, 0.6450],
      [33.4800, 0.6520],
      [33.5000, 0.6600],
      [33.5200, 0.6680],
      [33.5400, 0.6750],
      [33.5600, 0.6820],
      [33.5800, 0.6900],
    ]),
    lineFeature('TL-002', 'Kampala–Entebbe', '66kV', [
      [32.5825, 0.3136],
      [32.5600, 0.3050],
      [32.5400, 0.2980],
      [32.5200, 0.2900],
      [32.5000, 0.2820],
      [32.4800, 0.2750],
      [32.4600, 0.2680],
      [32.4400, 0.2600],
      [32.4200, 0.2520],
      [32.4000, 0.2450],
      [32.3800, 0.2380],
      [32.3600, 0.2300],
      [32.3400, 0.2230],
      [32.3200, 0.2150],
      [32.3000, 0.2080],
      [32.2800, 0.2000],
      [32.2600, 0.1920],
      [32.2400, 0.1850],
      [32.2200, 0.1780],
      [32.2000, 0.1700],
      [32.1800, 0.1630],
      [32.1600, 0.1550],
      [32.1400, 0.1480],
      [32.1200, 0.1400],
      [32.1000, 0.1330],
      [32.0800, 0.1250],
      [32.0600, 0.1180],
      [32.0400, 0.1100],
      [32.0200, 0.1030],
      [32.0000, 0.0950],
      [31.9800, 0.0880],
      [31.9600, 0.0800],
      [31.9400, 0.0730],
      [31.9200, 0.0650],
      [31.9000, 0.0580],
      [31.8800, 0.0500],
      [31.8600, 0.0430],
      [31.8400, 0.0350],
      [31.8200, 0.0280],
      [31.8000, 0.0200],
      [31.7800, 0.0130],
      [31.7600, 0.0050],
      [31.7400, -0.0030],
      [31.7200, -0.0100],
      [31.7000, -0.0180],
      [31.6800, -0.0250],
      [31.6600, -0.0330],
      [31.6400, -0.0400],
    ]),
    lineFeature('TL-003', 'Kampala–Masaka', '132kV', [
      [32.5825, 0.3136],
      [32.5700, 0.2950],
      [32.5550, 0.2780],
      [32.5400, 0.2600],
      [32.5250, 0.2420],
      [32.5100, 0.2250],
      [32.4950, 0.2080],
      [32.4800, 0.1900],
      [32.4650, 0.1720],
      [32.4500, 0.1550],
      [32.4350, 0.1380],
      [32.4200, 0.1200],
      [32.4050, 0.1020],
      [32.3900, 0.0850],
      [32.3750, 0.0680],
      [32.3600, 0.0500],
      [32.3450, 0.0320],
      [32.3300, 0.0150],
      [32.3150, -0.0030],
      [32.3000, -0.0200],
      [32.2850, -0.0380],
      [32.2700, -0.0550],
      [32.2550, -0.0720],
      [32.2400, -0.0900],
      [32.2250, -0.1070],
      [32.2100, -0.1250],
      [32.1950, -0.1420],
      [32.1800, -0.1600],
      [32.1650, -0.1770],
      [32.1500, -0.1950],
      [32.1350, -0.2120],
      [32.1200, -0.2300],
      [32.1050, -0.2470],
      [32.0900, -0.2650],
      [32.0750, -0.2820],
      [32.0600, -0.3000],
      [32.0450, -0.3170],
      [32.0300, -0.3350],
      [32.0150, -0.3520],
      [32.0000, -0.3700],
      [31.9850, -0.3870],
      [31.9700, -0.4050],
      [31.9550, -0.4220],
      [31.9400, -0.4400],
    ]),
  ],
}

/* ------------------------------------------------------------------ */
/*  Geo helpers                                                        */
/* ------------------------------------------------------------------ */

function offsetKm(lon: number, lat: number, dxKm: number, dyKm: number): [number, number] {
  const dLon = dxKm / (111.32 * Math.cos((lat * Math.PI) / 180))
  const dLat = dyKm / 110.574
  return [lon + dLon, lat + dLat]
}

function bufferPolygon(
  coords: [number, number][],
  radiusM: number
): [number, number][] {
  const left: [number, number][] = []
  const right: [number, number][] = []
  for (let i = 0; i < coords.length; i++) {
    let angle = 0
    if (i === 0) {
      const next = coords[1]
      angle = Math.atan2(next[1] - coords[i][1], next[0] - coords[i][0])
    } else if (i === coords.length - 1) {
      const prev = coords[i - 1]
      angle = Math.atan2(coords[i][1] - prev[1], coords[i][0] - prev[0])
    } else {
      const prev = coords[i - 1]
      const next = coords[i + 1]
      angle = Math.atan2(next[1] - prev[1], next[0] - prev[0])
    }
    left.push(offsetKm(coords[i][0], coords[i][1], -radiusM / 1000 * Math.sin(angle), radiusM / 1000 * Math.cos(angle)))
    right.push(offsetKm(coords[i][0], coords[i][1], radiusM / 1000 * Math.sin(angle), -radiusM / 1000 * Math.cos(angle)))
  }
  const polygon = [...left, ...right.reverse()]
  polygon.push(polygon[0])
  return polygon
}

/* ------------------------------------------------------------------ */
/*  Wayleave Buffers — Polygon features                                */
/* ------------------------------------------------------------------ */

function wayleaveFeature(
  id: string,
  lineId: string,
  coords: [number, number][]
): Feature<Polygon> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [bufferPolygon(coords, 30)],
    },
    properties: { id, lineId, bufferRadius: 30 },
  }
}

const wayleaveBuffers: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: transmissionLines.features.map((f) =>
    wayleaveFeature(
      `WB-${f.properties!.id.split('-')[1]}`,
      f.properties!.id,
      f.geometry.coordinates as [number, number][]
    )
  ),
}

/* ------------------------------------------------------------------ */
/*  ML Detections — Point features with lineId                         */
/* ------------------------------------------------------------------ */

function detectionFeature(
  id: string,
  type: 'Structure' | 'Vegetation',
  severity: 'Critical' | 'Warning',
  confidence: number,
  date: string,
  lineId: string,
  coords: [number, number]
): Feature<Point> {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: coords },
    properties: { id, type, severity, confidence_score: confidence, date_detected: date, lineId },
  }
}

const detections: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    // TL-001: Kampala–Jinja
    detectionFeature('V-001', 'Structure', 'Critical', 0.94, '2026-04-15', 'TL-001', [32.6100, 0.3250]),
    detectionFeature('V-002', 'Vegetation', 'Warning', 0.72, '2026-04-16', 'TL-001', [32.6500, 0.3400]),
    detectionFeature('V-003', 'Vegetation', 'Critical', 0.89, '2026-04-17', 'TL-001', [32.7200, 0.3700]),
    detectionFeature('V-004', 'Structure', 'Warning', 0.68, '2026-04-18', 'TL-001', [32.7800, 0.3950]),
    detectionFeature('V-005', 'Structure', 'Critical', 0.96, '2026-04-19', 'TL-001', [32.8500, 0.4200]),
    detectionFeature('V-006', 'Vegetation', 'Warning', 0.55, '2026-04-20', 'TL-001', [32.9200, 0.4450]),
    detectionFeature('V-007', 'Vegetation', 'Critical', 0.91, '2026-04-21', 'TL-001', [33.0000, 0.4750]),
    detectionFeature('V-008', 'Structure', 'Warning', 0.77, '2026-04-22', 'TL-001', [33.0800, 0.5050]),
    detectionFeature('V-009', 'Structure', 'Critical', 0.88, '2026-04-23', 'TL-001', [33.1600, 0.5350]),
    detectionFeature('V-010', 'Vegetation', 'Warning', 0.63, '2026-04-24', 'TL-001', [33.2400, 0.5650]),
    detectionFeature('V-011', 'Vegetation', 'Critical', 0.93, '2026-04-25', 'TL-001', [33.3200, 0.5950]),
    detectionFeature('V-012', 'Structure', 'Warning', 0.71, '2026-04-26', 'TL-001', [33.4000, 0.6250]),
    detectionFeature('V-013', 'Structure', 'Critical', 0.85, '2026-04-27', 'TL-001', [33.4800, 0.6550]),
    detectionFeature('V-014', 'Vegetation', 'Warning', 0.49, '2026-04-28', 'TL-001', [33.5600, 0.6850]),
    // TL-002: Kampala–Entebbe
    detectionFeature('V-015', 'Vegetation', 'Critical', 0.82, '2026-04-15', 'TL-002', [32.5000, 0.2800]),
    detectionFeature('V-016', 'Structure', 'Warning', 0.67, '2026-04-16', 'TL-002', [32.4000, 0.2400]),
    detectionFeature('V-017', 'Vegetation', 'Critical', 0.90, '2026-04-17', 'TL-002', [32.3000, 0.2000]),
    detectionFeature('V-018', 'Structure', 'Warning', 0.74, '2026-04-18', 'TL-002', [32.1000, 0.1300]),
    detectionFeature('V-019', 'Vegetation', 'Critical', 0.86, '2026-04-19', 'TL-002', [31.9000, 0.0550]),
    // TL-003: Kampala–Masaka
    detectionFeature('V-020', 'Structure', 'Warning', 0.61, '2026-04-15', 'TL-003', [32.5200, 0.2400]),
    detectionFeature('V-021', 'Vegetation', 'Critical', 0.95, '2026-04-16', 'TL-003', [32.4000, 0.1500]),
    detectionFeature('V-022', 'Structure', 'Warning', 0.58, '2026-04-17', 'TL-003', [32.2000, 0.0500]),
    detectionFeature('V-023', 'Vegetation', 'Critical', 0.79, '2026-04-18', 'TL-003', [32.0000, -0.0500]),
    detectionFeature('V-024', 'Structure', 'Warning', 0.70, '2026-04-19', 'TL-003', [31.8000, -0.1500]),
  ],
}

/* ------------------------------------------------------------------ */
/*  Distance calc (Haversine)                                          */
/* ------------------------------------------------------------------ */

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[1] - a[1]) * Math.PI) / 180
  const dLon = ((b[0] - a[0]) * Math.PI) / 180
  const lat1 = (a[1] * Math.PI) / 180
  const lat2 = (b[1] * Math.PI) / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function lineKilometers(lineId: string): number {
  const line = transmissionLines.features.find((f) => f.properties!.id === lineId)
  if (!line) return 0
  const c = line.geometry.coordinates as [number, number][]
  let total = 0
  for (let i = 1; i < c.length; i++) {
    total += haversine(c[i - 1], c[i])
  }
  return Math.round(total)
}

export function totalLineKilometers(): number {
  let total = 0
  transmissionLines.features.forEach((f) => {
    const c = f.geometry.coordinates as [number, number][]
    for (let i = 1; i < c.length; i++) {
      total += haversine(c[i - 1], c[i])
    }
  })
  return Math.round(total)
}

export { transmissionLines, wayleaveBuffers, detections }

import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import type { FeatureCollection, LineString, Polygon, Point, Feature } from 'geojson'

interface MapViewProps {
  lines: FeatureCollection<LineString>
  buffers: FeatureCollection<Polygon>
  detections: FeatureCollection<Point>
  masks: FeatureCollection<Polygon>
  heatmap?: [number, number, number][]
  selectedId: string | null
  flyToCoords: [number, number] | null
  flyToKey?: number
  fitBounds?: { southWest: [number, number]; northEast: [number, number] } | null
  sidebarOpen?: boolean
}

/* Resize handler to notify Leaflet when container size changes */
function ResizeHandler({ open }: { open?: boolean }) {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 310) // wait for CSS transition (300ms)
    return () => clearTimeout(timer)
  }, [open, map])
  return null
}

/* Leaflet.heat layer for vegetation density */
function HeatmapLayer({ points }: { points?: [number, number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return

    const layer = L.heatLayer(points, {
      radius: 18,
      blur: 25,
      maxZoom: 14,
      max: 1.0,
      gradient: {
        0.2: '#84cc16', // lime-500  (low / Minor)
        0.4: '#eab308', // yellow-500 (Moderate)
        0.6: '#f97316', // orange-500 (elevated)
        0.8: '#dc2626', // red-600    (Severe)
      },
    })

    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [points, map])
  return null
}

/* Custom div icons for detections */
function createDetectionIcon(severity: 'Critical' | 'Warning') {
  const color = severity === 'Critical' ? '#D30005' : '#EAB308'
  return L.divIcon({
    className: '',
    html: `<div class="pill-marker" style="background-color:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.18);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

/* Fly-to helper component */
function MapController({
  coords,
  flyKey,
  fitBounds,
}: {
  coords: [number, number] | null
  flyKey?: number
  fitBounds?: { southWest: [number, number]; northEast: [number, number] } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16, { duration: 1.2 })
    }
  }, [coords, flyKey, map])

  useEffect(() => {
    if (fitBounds) {
      const bounds = L.latLngBounds(
        [fitBounds.southWest[0], fitBounds.southWest[1]],
        [fitBounds.northEast[0], fitBounds.northEast[1]]
      )
      map.flyToBounds(bounds, { duration: 1.2, padding: [40, 40] })
    }
  }, [fitBounds, map])

  return null
}

/* Convert polygon ring to SVG path string scaled to viewBox */
function polygonToSvgPath(ring: number[][], viewBoxSize = 100, padding = 4) {
  if (ring.length < 3) return ''
  const xs = ring.map((c) => c[0])
  const ys = ring.map((c) => c[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const w = maxX - minX || 1
  const h = maxY - minY || 1
  const scale = Math.min(
    (viewBoxSize - padding * 2) / w,
    (viewBoxSize - padding * 2) / h
  )
  const offX = (viewBoxSize - w * scale) / 2 - minX * scale
  const offY = (viewBoxSize - h * scale) / 2 - minY * scale

  return ring
    .map((coord, i) => {
      const x = coord[0] * scale + offX
      // Flip Y so it renders upright (lat increases north)
      const y = viewBoxSize - (coord[1] * scale + offY)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ') + ' Z'
}

/* Render actual mask polygon as SVG preview */
function MaskPreview({ mask, type }: { mask: Feature<Polygon>; type: string }) {
  const color = type === 'Structure' ? '#D30005' : '#FF5000'
  const ring = mask.geometry.coordinates[0]
  const pathD = polygonToSvgPath(ring, 200, 8)
  const p = mask.properties as any
  const area = p?.area_m2 ? `${Math.round(p.area_m2)} m²` : ''

  return (
    <div className="w-full h-16 sm:h-24 bg-[#F5F5F5] rounded-[12px] flex items-center justify-center overflow-hidden mt-2 relative">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <rect width="200" height="100" fill="#F5F5F5" />
        {pathD && (
          <path
            d={pathD}
            fill={color}
            opacity="0.22"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {area && (
        <span className="absolute bottom-1 right-2 text-[8px] font-medium text-[#707072] bg-white/80 px-1 rounded">
          {area}
        </span>
      )}
    </div>
  )
}

/* Popup content for a detection */
function DetectionPopup({ feature, maskFeature }: { feature: Feature<Point>; maskFeature?: Feature<Polygon> }) {
  const p = feature.properties as {
    id: string
    type: 'Structure' | 'Vegetation'
    severity: 'Critical' | 'Warning'
    confidence_score: number
    date_detected: string
    village: string | null
    district: string | null
    chainage: string
    distance_to_centerline: string
    class_name?: string
    area_m2?: number
    dist_to_line_m?: number
  }

  const locationParts = [
    p.village,
    p.district ? `${p.district} District` : null,
  ].filter(Boolean)
  const locationText = locationParts.join(', ')

  return (
    <div className="min-w-[200px] max-w-[260px] sm:max-w-[320px]">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: p.severity === 'Critical' ? '#D30005' : '#EAB308',
          }}
        />
        <span className="text-sm font-bold text-[#111111] truncate">{p.id}</span>
      </div>

      {locationText && (
        <p className="text-xs text-[#707072] mb-2 leading-relaxed">
          {locationText}
        </p>
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-xs gap-4">
          <span className="text-[#707072] shrink-0">Type</span>
          <span className="font-medium text-[#111111]">{p.type}</span>
        </div>
        {p.class_name && p.class_name !== 'unknown' && (
          <div className="flex justify-between text-xs gap-4">
            <span className="text-[#707072] shrink-0">Class</span>
            <span className="font-medium text-[#111111] capitalize">{p.class_name.replace(/_/g, ' ')}</span>
          </div>
        )}
        <div className="flex justify-between text-xs gap-4">
          <span className="text-[#707072] shrink-0">Severity</span>
          <span
            className="font-medium"
            style={{
              color: p.severity === 'Critical' ? '#D30005' : '#EAB308',
            }}
          >
            {p.severity}
          </span>
        </div>
        <div className="flex justify-between text-xs gap-4">
          <span className="text-[#707072] shrink-0">Chainage</span>
          <span className="font-medium text-[#111111]">{p.chainage}</span>
        </div>
        <div className="flex justify-between text-xs gap-4">
          <span className="text-[#707072] shrink-0">Distance</span>
          <span className="font-medium text-[#111111]">{p.distance_to_centerline}</span>
        </div>
        {typeof p.dist_to_line_m === 'number' && (
          <div className="flex justify-between text-xs gap-4">
            <span className="text-[#707072] shrink-0">Dist. to line</span>
            <span className="font-medium text-[#111111]">{p.dist_to_line_m.toFixed(1)} m</span>
          </div>
        )}
        <div className="flex justify-between text-xs gap-4">
          <span className="text-[#707072] shrink-0">Confidence</span>
          <span className="font-medium text-[#111111]">
            {Math.round(p.confidence_score * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs gap-4">
          <span className="text-[#707072] shrink-0">Date</span>
          <span className="font-medium text-[#111111]">{p.date_detected}</span>
        </div>
        {p.area_m2 ? (
          <div className="flex justify-between text-xs gap-4">
            <span className="text-[#707072] shrink-0">Area</span>
            <span className="font-medium text-[#111111]">{Math.round(p.area_m2)} m²</span>
          </div>
        ) : null}
      </div>
      {maskFeature ? (
        <MaskPreview mask={maskFeature} type={p.type} />
      ) : (
        <div className="w-full h-16 sm:h-24 bg-[#F5F5F5] rounded-[12px] flex items-center justify-center mt-2">
          <span className="text-[10px] text-[#9E9EA0]">No mask available</span>
        </div>
      )}
    </div>
  )
}

export function MapView({ lines, buffers, detections, masks, heatmap, flyToCoords, flyToKey, fitBounds, sidebarOpen }: MapViewProps) {
  const center: [number, number] = [0.35, 32.65]

  const maskById = useMemo(() => {
    const map = new Map<string, Feature<Polygon>>()
    masks.features.forEach((f) => {
      const id = (f.properties as Record<string, unknown>).id as string | undefined
      if (id) map.set(id, f)
    })
    return map
  }, [masks])

  const lineLayer = useMemo(
    () => (
      <GeoJSON
        data={lines}
        style={() => ({
          color: '#4270a8',
          weight: 3,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        })}
      />
    ),
    [lines]
  )

  const bufferLayer = useMemo(
    () => (
      <GeoJSON
        data={buffers}
        style={() => ({
          color: 'rgba(112,112,114,0.5)',
          weight: 1,
          fillColor: 'rgba(112,112,114,0.12)',
          fillOpacity: 0.35,
        })}
      />
    ),
    [buffers]
  )

  const maskLayer = useMemo(
    () => (
      <GeoJSON
        data={masks}
        style={(feature) => {
          const p = feature?.properties as Record<string, unknown> | undefined
          const type = p?.type as string | undefined
          const color = type === 'Structure' ? '#D30005' : '#FF5000'
          return {
            color,
            weight: 1.5,
            fillColor: color,
            fillOpacity: 0.25,
            opacity: 0.7,
          }
        }}
        onEachFeature={(feature, layer) => {
          layer.bindTooltip(`Mask ${(feature.properties as Record<string, unknown>).id as string}`, {
            direction: 'top',
            offset: [0, -4],
            className: 'text-[10px] font-medium',
          })
        }}
      />
    ),
    [masks]
  )

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={10}
        minZoom={3}
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={heatmap} />
        {lineLayer}
        {bufferLayer}
        {maskLayer}
        {detections.features.map((f) => {
          const p = f.properties as any
          const coords = f.geometry.coordinates as [number, number]
          const maskFeature = maskById.get(p.id)
          return (
            <Marker
              key={p.id}
              position={[coords[1], coords[0]]}
              icon={createDetectionIcon(p.severity)}
            >
              <Popup>
                <DetectionPopup feature={f} maskFeature={maskFeature} />
              </Popup>
            </Marker>
          )
        })}
        <ResizeHandler open={sidebarOpen} />
        <MapController coords={flyToCoords} flyKey={flyToKey} fitBounds={fitBounds} />
      </MapContainer>
    </div>
  )
}

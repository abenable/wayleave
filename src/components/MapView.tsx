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
import type { FeatureCollection, LineString, Polygon, Point, Feature } from 'geojson'

interface MapViewProps {
  lines: FeatureCollection<LineString>
  buffers: FeatureCollection<Polygon>
  detections: FeatureCollection<Point>
  selectedId: string | null
  flyToCoords: [number, number] | null
  flyToKey?: number
  fitBounds?: { southWest: [number, number]; northEast: [number, number] } | null
}

/* Custom div icons for detections */
function createDetectionIcon(type: 'Structure' | 'Vegetation') {
  const color = type === 'Structure' ? '#D30005' : '#FF5000'
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

/* ML Mask placeholder as SVG */
function MLMaskPlaceholder({ type }: { type: string }) {
  const color = type === 'Structure' ? '#D30005' : '#FF5000'
  return (
    <div className="w-full h-24 bg-[#F5F5F5] rounded-[12px] flex items-center justify-center overflow-hidden mt-2">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <rect width="200" height="100" fill="#F5F5F5" />
        <circle cx="80" cy="50" r="25" fill={color} opacity="0.3" />
        <circle cx="120" cy="45" r="20" fill={color} opacity="0.2" />
        <path
          d="M40 80 Q100 20 160 80"
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.5"
          strokeDasharray="4 4"
        />
        <text x="100" y="92" textAnchor="middle" fontSize="8" fill="#707072" fontFamily="Inter, sans-serif">
          ML MASK VERIFICATION
        </text>
      </svg>
    </div>
  )
}

/* Popup content for a detection */
function DetectionPopup({ feature }: { feature: Feature<Point> }) {
  const p = feature.properties as {
    id: string
    type: 'Structure' | 'Vegetation'
    severity: 'Critical' | 'Warning'
    confidence_score: number
    date_detected: string
    nearest_town: string | null
    village: string | null
    district: string | null
    chainage: string
    distance_to_centerline: string
  }

  const locationParts = [
    p.village,
    p.nearest_town,
    p.district ? `${p.district} District` : null,
  ].filter(Boolean)
  const locationText = locationParts.join(', ')

  return (
    <div className="min-w-0 sm:min-w-[240px]">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: p.type === 'Structure' ? '#D30005' : '#FF5000',
          }}
        />
        <span className="text-sm font-bold text-[#111111]">{p.id}</span>
      </div>

      {locationText && (
        <p className="text-xs text-[#707072] mb-2 leading-relaxed">
          {locationText}
        </p>
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#707072]">Type</span>
          <span className="font-medium text-[#111111]">{p.type}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#707072]">Severity</span>
          <span
            className="font-medium"
            style={{
              color: p.severity === 'Critical' ? '#D30005' : '#FF5000',
            }}
          >
            {p.severity}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#707072]">Chainage</span>
          <span className="font-medium text-[#111111]">{p.chainage}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#707072]">Distance</span>
          <span className="font-medium text-[#111111]">{p.distance_to_centerline}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#707072]">Confidence</span>
          <span className="font-medium text-[#111111]">
            {Math.round(p.confidence_score * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#707072]">Date</span>
          <span className="font-medium text-[#111111]">{p.date_detected}</span>
        </div>
      </div>
      <MLMaskPlaceholder type={p.type} />
    </div>
  )
}

export function MapView({ lines, buffers, detections, flyToCoords, flyToKey, fitBounds }: MapViewProps) {
  const center: [number, number] = [0.35, 32.65]

  const lineLayer = useMemo(
    () => (
      <GeoJSON
        data={lines}
        style={() => ({
          color: '#1151FF',
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
        {lineLayer}
        {bufferLayer}
        {detections.features.map((f) => {
          const p = f.properties as any
          const coords = f.geometry.coordinates as [number, number]
          return (
            <Marker
              key={p.id}
              position={[coords[1], coords[0]]}
              icon={createDetectionIcon(p.type)}
            >
              <Popup>
                <DetectionPopup feature={f} />
              </Popup>
            </Marker>
          )
        })}
        <MapController coords={flyToCoords} flyKey={flyToKey} fitBounds={fitBounds} />
      </MapContainer>
    </div>
  )
}

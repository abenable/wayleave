import { cn } from '#/lib/utils'
import { MapPin } from 'lucide-react'
import type { Feature, Point, Polygon } from 'geojson'

interface ViolationCardProps {
  feature: Feature<Point>
  maskFeature?: Feature<Polygon>
  isSelected: boolean
  onClick: () => void
}

function polygonToSvgPath(ring: number[][], viewBoxSize = 64, padding = 4) {
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
      const y = viewBoxSize - (coord[1] * scale + offY)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ') + ' Z'
}

function MaskThumbnail({ mask, type }: { mask: Feature<Polygon>; type: string }) {
  const color = type === 'Structure' ? '#D30005' : '#FF5000'
  const ring = mask.geometry.coordinates[0]
  const pathD = polygonToSvgPath(ring, 64, 4)

  return (
    <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-[10px] sm:rounded-[12px] bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect width="64" height="64" fill="#F5F5F5" />
        {pathD ? (
          <path
            d={pathD}
            fill={color}
            opacity="0.22"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ) : (
          <circle cx="32" cy="32" r="12" fill={color} opacity="0.15" />
        )}
      </svg>
    </div>
  )
}

export function ViolationCard({ feature, maskFeature, isSelected, onClick }: ViolationCardProps) {
  const p = feature.properties as {
    id: string
    type: 'Structure' | 'Vegetation'
    severity: 'Critical' | 'Warning'
    confidence_score: number
    date_detected: string
    transmission_line: string
    status: 'Unverified' | 'Dispatched' | 'Resolved'
    distance_to_centerline: string
    chainage: string
    coordinates: string
    village: string | null
    district: string | null
    class_name?: string
    area_m2?: number
  }

  const typeColor = p.type === 'Structure' ? 'bg-[#D30005]' : 'bg-[#FF5000]'

  const statusColor =
    p.status === 'Unverified'
      ? 'border-[#707072] text-[#707072] bg-[#F5F5F5]'
      : p.status === 'Dispatched'
      ? 'border-[#4270a8] text-[#4270a8] bg-[#d6e4f0]'
      : 'border-[#007D48] text-[#007D48] bg-[#DFFFB9]'

  const locationParts = [
    p.village,
    p.district ? `${p.district} District` : null,
  ].filter(Boolean)
  const locationText = locationParts.join(', ')

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-[16px] sm:rounded-[20px] border p-3 sm:p-3.5 transition-all duration-200',
        isSelected
          ? 'border-[#4270a8] bg-[#f5f8fb]'
          : 'border-[#E5E5E5] bg-white hover:border-[#CACACB] hover:bg-[#FAFAFA]'
      )}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="flex-1 min-w-0">
          {/* Top row: ID + type dot + severity badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <span className={cn('w-2 h-2 rounded-full shrink-0', typeColor)} />
            <span className="text-xs sm:text-sm font-bold text-[#111111] truncate">{p.id}</span>
            <span
              className={cn(
                'text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 leading-none',
                p.severity === 'Critical'
                  ? 'border-[#D30005] text-[#D30005] bg-[#FFE5E5]'
                  : 'border-[#FF5000] text-[#FF5000] bg-[#FFE2D6]'
              )}
            >
              {p.severity}
            </span>
          </div>

          {/* Line name */}
          <p className="text-xs sm:text-[13px] font-semibold text-[#111111] leading-snug mb-1 truncate">
            {p.transmission_line}
          </p>

          {/* Location */}
          {locationText && (
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#707072] shrink-0" />
              <p className="text-[10px] sm:text-[11px] text-[#707072] truncate">{locationText}</p>
            </div>
          )}

          {/* Meta row: chainage + distance + date */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#707072] mb-1 flex-wrap">
            <span className="font-medium text-[#111111]">{p.chainage}</span>
            <span className="text-[#CACACB]">·</span>
            <span>{p.distance_to_centerline}</span>
            <span className="text-[#CACACB]">·</span>
            <span>{p.date_detected}</span>
          </div>

          {/* Bottom row: status badge + confidence bar + type */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                'text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 leading-none',
                statusColor
              )}
            >
              {p.status}
            </span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="flex-1 h-1 bg-[#E5E5E5] rounded-full overflow-hidden max-w-[60px] sm:max-w-[80px]">
                <div
                  className="h-full rounded-full bg-[#111111]"
                  style={{ width: `${p.confidence_score * 100}%` }}
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#111111] shrink-0">
                {Math.round(p.confidence_score * 100)}%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#9E9EA0] shrink-0">{p.type}</span>
          </div>

          {/* Coordinates */}
          <p className="text-[9px] sm:text-[10px] text-[#9E9EA0] mt-1 font-mono tracking-tight truncate">
            {p.coordinates}
          </p>
        </div>

        {maskFeature ? (
          <MaskThumbnail mask={maskFeature} type={p.type} />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-[10px] sm:rounded-[12px] bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <rect width="64" height="64" fill="#F5F5F5" />
              <circle cx="28" cy="30" r="14" fill={typeColor === 'bg-[#D30005]' ? '#D30005' : '#FF5000'} opacity="0.22" />
              <circle cx="38" cy="26" r="10" fill={typeColor === 'bg-[#D30005]' ? '#D30005' : '#FF5000'} opacity="0.14" />
              <path
                d="M12 52 Q32 20 52 52"
                stroke={typeColor === 'bg-[#D30005]' ? '#D30005' : '#FF5000'}
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

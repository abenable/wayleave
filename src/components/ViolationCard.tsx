import { cn } from '#/lib/utils'
import { MapPin } from 'lucide-react'
import type { Feature, Point } from 'geojson'

interface ViolationCardProps {
  feature: Feature<Point>
  isSelected: boolean
  onClick: () => void
}

function MiniThumbnail({ type }: { type: 'Structure' | 'Vegetation' }) {
  const color = type === 'Structure' ? '#D30005' : '#FF5000'
  return (
    <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-[10px] sm:rounded-[12px] bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect width="64" height="64" fill="#F5F5F5" />
        <circle cx="28" cy="30" r="14" fill={color} opacity="0.22" />
        <circle cx="38" cy="26" r="10" fill={color} opacity="0.14" />
        <path
          d="M12 52 Q32 20 52 52"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  )
}

export function ViolationCard({ feature, isSelected, onClick }: ViolationCardProps) {
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
    nearest_town: string | null
    village: string | null
    district: string | null
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
    p.nearest_town,
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

        <MiniThumbnail type={p.type} />
      </div>
    </button>
  )
}

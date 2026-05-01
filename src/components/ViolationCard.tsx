import { cn } from '#/lib/utils'
import type { Feature, Point } from 'geojson'

interface ViolationCardProps {
  feature: Feature<Point>
  isSelected: boolean
  onClick: () => void
}

/* Mini thumbnail — geometric placeholder representing detection type */
function MiniThumbnail({ type }: { type: 'Structure' | 'Vegetation' }) {
  const color = type === 'Structure' ? '#D30005' : '#FF5000'
  return (
    <div className="w-16 h-16 shrink-0 rounded-[12px] bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
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
  }

  const typeColor = p.type === 'Structure' ? 'bg-[#D30005]' : 'bg-[#FF5000]'

  const statusColor =
    p.status === 'Unverified'
      ? 'border-[#707072] text-[#707072] bg-[#F5F5F5]'
      : p.status === 'Dispatched'
      ? 'border-[#1151FF] text-[#1151FF] bg-[#D6EEFF]'
      : 'border-[#007D48] text-[#007D48] bg-[#DFFFB9]'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-[20px] border p-3.5 transition-all duration-200',
        isSelected
          ? 'border-[#111111] bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-white hover:border-[#CACACB] hover:bg-[#FAFAFA]'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top row: ID + type dot + severity badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('w-2 h-2 rounded-full shrink-0', typeColor)} />
            <span className="text-sm font-bold text-[#111111]">{p.id}</span>
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0',
                p.severity === 'Critical'
                  ? 'border-[#D30005] text-[#D30005] bg-[#FFE5E5]'
                  : 'border-[#FF5000] text-[#FF5000] bg-[#FFE2D6]'
              )}
            >
              {p.severity}
            </span>
          </div>

          {/* Transmission line name — prominent */}
          <p className="text-[13px] font-semibold text-[#111111] leading-snug mb-1 truncate">
            {p.transmission_line}
          </p>

          {/* Meta row: chainage + distance + date */}
          <div className="flex items-center gap-2 text-[11px] text-[#707072] mb-1.5 flex-wrap">
            <span className="font-medium text-[#111111]">{p.chainage}</span>
            <span className="text-[#CACACB]">·</span>
            <span>{p.distance_to_centerline} from center</span>
            <span className="text-[#CACACB]">·</span>
            <span>{p.date_detected}</span>
          </div>

          {/* Bottom row: status badge + confidence bar + type */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0',
                statusColor
              )}
            >
              {p.status}
            </span>
            <div className="flex items-center gap-1.5 flex-1">
              <div className="flex-1 h-1 bg-[#E5E5E5] rounded-full overflow-hidden max-w-[80px]">
                <div
                  className="h-full rounded-full bg-[#111111]"
                  style={{ width: `${p.confidence_score * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-[#111111]">
                {Math.round(p.confidence_score * 100)}%
              </span>
            </div>
            <span className="text-[11px] text-[#9E9EA0] shrink-0">{p.type}</span>
          </div>

          {/* Coordinates — tiny */}
          <p className="text-[10px] text-[#9E9EA0] mt-1 font-mono tracking-tight">
            {p.coordinates}
          </p>
        </div>

        {/* Right: mini thumbnail */}
        <MiniThumbnail type={p.type} />
      </div>
    </button>
  )
}

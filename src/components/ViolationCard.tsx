import { cn } from '#/lib/utils'
import type { Feature, Point } from 'geojson'

interface ViolationCardProps {
  feature: Feature<Point>
  isSelected: boolean
  onClick: () => void
}

export function ViolationCard({ feature, isSelected, onClick }: ViolationCardProps) {
  const p = feature.properties as {
    id: string
    type: 'Structure' | 'Vegetation'
    severity: 'Critical' | 'Warning'
    confidence_score: number
    date_detected: string
  }

  const typeColor = p.type === 'Structure' ? 'bg-[#D30005]' : 'bg-[#FF5000]'
  const severityBorder =
    p.severity === 'Critical' ? 'border-[#D30005]' : 'border-[#FF5000]'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-[20px] border p-4 transition-all duration-200',
        isSelected
          ? 'border-[#111111] bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-white hover:border-[#CACACB] hover:bg-[#FAFAFA]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', typeColor)} />
          <span className="text-sm font-semibold text-[#111111]">{p.id}</span>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
            p.severity === 'Critical'
              ? 'border-[#D30005] text-[#D30005] bg-[#FFE5E5]'
              : 'border-[#FF5000] text-[#FF5000] bg-[#FFE2D6]'
          )}
        >
          {p.severity}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#707072]">{p.type}</span>
        <span className="text-xs text-[#9E9EA0]">{p.date_detected}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="text-xs text-[#9E9EA0]">Confidence</span>
        <div className="flex-1 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#111111]"
            style={{ width: `${p.confidence_score * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#111111]">
          {Math.round(p.confidence_score * 100)}%
        </span>
      </div>
    </button>
  )
}

import { Activity, AlertTriangle, MapPin, TreePine } from 'lucide-react'
import type { FeatureCollection, Point } from 'geojson'

const UETCL_BLUE = '#4270a8'
const UETCL_BLUE_LIGHT = '#d6e4f0'

interface MetricsBarProps {
  lineKm: number
  detections: FeatureCollection<Point>
}

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-[12px] sm:rounded-[20px] px-2.5 sm:px-4 py-2 sm:py-3 min-w-0">
      <div
        className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full shrink-0"
        style={{ backgroundColor: accent || '#F5F5F5' }}
      >
        {icon}
      </div>
      <div className="min-w-0 overflow-hidden">
        <div className="text-sm sm:text-lg font-bold text-[#111111] leading-tight truncate">{value}</div>
        <div className="text-[9px] sm:text-[11px] font-medium text-[#707072] uppercase tracking-wide truncate">
          {label}
        </div>
      </div>
    </div>
  )
}

export function MetricsBar({ lineKm, detections }: MetricsBarProps) {
  const total = detections.features.length
  const critical = detections.features.filter(
    (f) => (f.properties as any).severity === 'Critical'
  ).length
  const structures = detections.features.filter(
    (f) => (f.properties as any).type === 'Structure'
  ).length
  const vegetation = detections.features.filter(
    (f) => (f.properties as any).type === 'Vegetation'
  ).length

  return (
    <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-[#FAFAFA] border-b border-[#E5E5E5] md:overflow-x-auto">
      <KpiCard
        label="Lines Monitored"
        value={`${lineKm} km`}
        icon={<MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5" style={{ color: UETCL_BLUE }} />}
        accent={UETCL_BLUE_LIGHT}
      />
      <KpiCard
        label="Active Violations"
        value={total}
        icon={<Activity className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#111111]" />}
        accent="#F5F5F5"
      />
      <KpiCard
        label="Critical Alerts"
        value={critical}
        icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#D30005]" />}
        accent="#FFE5E5"
      />
      <KpiCard
        label="Structure vs Veg"
        value={`${structures} / ${vegetation}`}
        icon={<TreePine className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#FF5000]" />}
        accent="#FFE2D6"
      />
    </div>
  )
}

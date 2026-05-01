import { Activity, AlertTriangle, MapPin, TreePine } from 'lucide-react'
import type { FeatureCollection, Point } from 'geojson'

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
    <div className="flex items-center gap-3 bg-white border border-[#E5E5E5] rounded-[20px] px-4 py-3 min-w-[180px]">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
        style={{ backgroundColor: accent || '#F5F5F5' }}
      >
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-[#111111] leading-tight">{value}</div>
        <div className="text-[11px] font-medium text-[#707072] uppercase tracking-wide">
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
    <div className="flex items-center justify-center gap-4 px-6 py-3.5 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-x-auto">
      <KpiCard
        label="Lines Monitored"
        value={`${lineKm} km`}
        icon={<MapPin className="w-5 h-5 text-[#1151FF]" />}
        accent="#D6EEFF"
      />
      <KpiCard
        label="Active Violations"
        value={total}
        icon={<Activity className="w-5 h-5 text-[#111111]" />}
        accent="#F5F5F5"
      />
      <KpiCard
        label="Critical Alerts"
        value={critical}
        icon={<AlertTriangle className="w-5 h-5 text-[#D30005]" />}
        accent="#FFE5E5"
      />
      <KpiCard
        label="Structure vs Veg"
        value={`${structures} / ${vegetation}`}
        icon={<TreePine className="w-5 h-5 text-[#FF5000]" />}
        accent="#FFE2D6"
      />
    </div>
  )
}

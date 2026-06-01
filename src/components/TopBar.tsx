import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { FeatureCollection, LineString } from 'geojson'

interface TopBarProps {
  lines: FeatureCollection<LineString>
  selectedLineId: string | null
  onSelectLine: (id: string | null) => void
}

/* UETCL brand colours scraped from https://uetcl.go.ug/ */
const UETCL_BLUE = '#4270a8'
const UETCL_BLUE_DARK = '#2c5998'

export function TopBar({ lines, selectedLineId, onSelectLine }: TopBarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const lineInfos = lines.features.map((f) => ({
    id: f.properties!.id as string,
    name: f.properties!.name as string,
    voltage: f.properties!.voltage as string,
  }))

  const selectedLabel =
    selectedLineId === null
      ? 'All Transmission Lines'
      : lineInfos.find((l) => l.id === selectedLineId)?.name ?? 'All Lines'

  const options = [
    { label: 'All Transmission Lines', value: null as string | null },
    ...lineInfos.map((l) => ({
      label: `${l.name}  ·  ${l.voltage}`,
      value: l.id,
    })),
  ]

  return (
    <header
      className="relative z-50 px-4 md:px-6 py-3 md:py-4 border-b border-white/10"
      style={{ backgroundColor: UETCL_BLUE }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left spacer — mirrors the dropdown width so center is truly centered */}
        <div className="hidden md:block" />

        {/* Logo + Branding — centered */}
        <div className="flex items-center justify-center gap-3 min-w-0">
          <img
            src="/uetcl.png"
            alt="UETCL Logo"
            className="h-14 md:h-20 w-auto object-contain shrink-0"
          />
          <div className="min-w-0 overflow-hidden text-center">
            <h1 className="text-base md:text-[1.75rem] font-bold tracking-tight text-white uppercase leading-none truncate">
              Wayleave Monitor
            </h1>
            <p className="hidden md:block text-[11px] font-medium text-white/70 uppercase tracking-wider mt-0.5">
              Geospatial + ML Analytics
            </p>
          </div>
        </div>

        {/* Line Selector Dropdown — right aligned */}
        <div ref={ref} className="relative shrink-0 justify-self-end">
          <label className="hidden md:block text-[11px] font-medium text-white/70 mb-1 uppercase tracking-wider">
            Inspecting
          </label>
          <button
            onClick={() => setOpen((s) => !s)}
            className={cn(
              'flex items-center justify-between gap-2 md:gap-6 pl-3 md:pl-5 pr-3 py-2 text-sm font-medium rounded-[30px] border transition-colors w-[150px] md:w-auto md:min-w-[280px]',
              open
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20'
            )}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-white/70 transition-transform shrink-0',
                open && 'rotate-180'
              )}
            />
          </button>

          {open && (
            <div className="absolute right-0 left-auto z-50 mt-1.5 w-[260px] md:w-full md:min-w-[280px] bg-white border border-[#CACACB] rounded-[12px] overflow-hidden shadow-lg">
              {options.map((opt) => (
                <button
                  key={opt.value ?? 'all'}
                  onClick={() => {
                    onSelectLine(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'block w-full text-left px-4 md:px-5 py-2 md:py-2.5 text-sm font-medium transition-colors border-b border-[#F5F5F5] last:border-b-0',
                    opt.value === selectedLineId
                      ? 'text-white'
                      : 'text-[#111111] hover:bg-[#F5F5F5]'
                  )}
                  style={opt.value === selectedLineId ? { backgroundColor: UETCL_BLUE } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

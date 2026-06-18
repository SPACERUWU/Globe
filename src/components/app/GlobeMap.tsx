import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo'
import { feature } from 'topojson-client'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Equator as a GeoJSON LineString
const EQUATOR = {
  type: 'Feature' as const,
  geometry: {
    type: 'LineString' as const,
    coordinates: Array.from({ length: 361 }, (_, i) => [i - 180, 0] as [number, number]),
  },
  properties: {},
}

type Rot = [number, number, number]

interface GlobeMapProps {
  visitedGeoNames: string[]
  wishlistGeoNames?: string[]
  onCountryClick?: (name: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoFeature = any

export function GlobeMap({ visitedGeoNames, wishlistGeoNames = [], onCountryClick }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(400)
  const [rotation, setRotation] = useState<Rot>([0, -20, 0])
  const rotRef = useRef<Rot>([0, -20, 0])
  const [countries, setCountries] = useState<GeoFeature[]>([])
  const [hovered, setHovered] = useState<{ name: string; visited: boolean; wishlist: boolean } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()
  const isSpinning = useRef(true)
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>()

  // Responsive size: fills the container, keeping globe square
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      const s = Math.min(rect.width, rect.height)
      if (s > 0) setSize(s)
    })
    obs.observe(el)
    const rect = el.getBoundingClientRect()
    const s = Math.min(rect.width, rect.height)
    if (s > 0) setSize(s)
    return () => obs.disconnect()
  }, [])

  // Load world atlas
  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(world => {
        const fc = feature(world, world.objects.countries) as unknown as GeoJSON.FeatureCollection
        setCountries(fc.features)
      })
  }, [])

  // Spin loop
  useEffect(() => {
    const tick = () => {
      if (isSpinning.current) {
        rotRef.current = [rotRef.current[0] + 0.15, rotRef.current[1], 0]
        setRotation([...rotRef.current])
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [])

  const stopSpin = useCallback(() => {
    isSpinning.current = false
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }, [])

  const scheduleSpin = useCallback((delay: number) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { isSpinning.current = true }, delay)
  }, [])

  // Mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    hasMoved.current = false
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    if (!hasMoved.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      hasMoved.current = true
      stopSpin()
    }
    if (!hasMoved.current) return
    lastPos.current = { x: e.clientX, y: e.clientY }
    rotRef.current = [
      rotRef.current[0] + dx * 0.5,
      Math.max(-85, Math.min(85, rotRef.current[1] - dy * 0.5)),
      0,
    ]
    setRotation([...rotRef.current])
  }, [stopSpin])

  const handleMouseUp = useCallback(() => {
    if (isDragging.current && hasMoved.current) scheduleSpin(2500)
    isDragging.current = false
  }, [scheduleSpin])

  // Touch drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    isDragging.current = true
    hasMoved.current = false
    lastPos.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const t = e.touches[0]
    const dx = t.clientX - lastPos.current.x
    const dy = t.clientY - lastPos.current.y
    if (!hasMoved.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      hasMoved.current = true
      stopSpin()
    }
    if (!hasMoved.current) return
    lastPos.current = { x: t.clientX, y: t.clientY }
    rotRef.current = [
      rotRef.current[0] + dx * 0.5,
      Math.max(-85, Math.min(85, rotRef.current[1] - dy * 0.5)),
      0,
    ]
    setRotation([...rotRef.current])
    e.preventDefault()
  }, [stopSpin])

  const handleTouchEnd = useCallback(() => {
    if (hasMoved.current) scheduleSpin(2500)
    isDragging.current = false
  }, [scheduleSpin])

  // Projection + paths (recalculated on size/rotation change)
  const { radius, pathFn, graticuleD, equatorD } = useMemo(() => {
    const r = size / 2 - 2
    const proj = geoOrthographic()
      .scale(r)
      .translate([size / 2, size / 2])
      .rotate(rotation)
      .clipAngle(90)
    const pg = geoPath(proj)
    const grat = geoGraticule()
    return {
      radius: r,
      pathFn: pg,
      graticuleD: pg(grat()) ?? '',
      equatorD: pg(EQUATOR as Parameters<typeof pg>[0]) ?? '',
    }
  }, [size, rotation])

  const cx = size / 2
  const cy = size / 2

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
    >
      <svg
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="cursor-grab active:cursor-grabbing"
        style={{ display: 'block', touchAction: 'none' }}
      >
        <defs>
          {/* 3D light sheen */}
          <radialGradient id="globe-sheen" cx="32%" cy="28%" r="62%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
          </radialGradient>
          {/* Outer atmosphere glow */}
          <radialGradient id="globe-atmo" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(61,129,227,0.18)" />
          </radialGradient>
          {/* Clip to sphere */}
          <clipPath id="globe-sphere-clip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
        </defs>

        {/* Atmosphere rings */}
        <circle cx={cx} cy={cy} r={radius + 12} fill="rgba(61,129,227,0.04)" />
        <circle cx={cx} cy={cy} r={radius + 6}  fill="rgba(61,129,227,0.07)" />
        <circle cx={cx} cy={cy} r={radius + 2}  fill="rgba(61,129,227,0.10)" />

        {/* Ocean */}
        <circle cx={cx} cy={cy} r={radius} fill="#06101e" />

        {/* Graticule */}
        {graticuleD && (
          <path
            d={graticuleD}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
            clipPath="url(#globe-sphere-clip)"
          />
        )}

        {/* Equator */}
        {equatorD && (
          <path
            d={equatorD}
            fill="none"
            stroke="rgba(61,129,227,0.35)"
            strokeWidth="0.9"
            strokeDasharray="3 4"
            clipPath="url(#globe-sphere-clip)"
          />
        )}

        {/* Countries */}
        {countries.map((f, i) => {
          const name = (f.properties?.name ?? '') as string
          const visited = visitedGeoNames.includes(name)
          const wish = !visited && wishlistGeoNames.includes(name)
          const d = pathFn(f)
          if (!d) return null

          return (
            <path
              key={i}
              d={d}
              fill={visited ? '#1a3f7a' : wish ? '#3d2200' : '#13202e'}
              stroke={visited ? '#2a5fa8' : wish ? '#92400e' : '#1a2d40'}
              strokeWidth="0.35"
              clipPath="url(#globe-sphere-clip)"
              style={{ cursor: onCountryClick ? 'pointer' : 'default' }}
              onClick={() => !hasMoved.current && onCountryClick?.(name)}
              onMouseEnter={(e) => {
                setHovered({ name, visited, wishlist: wish })
                setTooltipPos({ x: e.clientX, y: e.clientY })
              }}
              onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {/* 3D sheen overlay */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#globe-sheen)"  pointerEvents="none" />
        <circle cx={cx} cy={cy} r={radius} fill="url(#globe-atmo)"   pointerEvents="none" />

        {/* Border ring */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(61,129,227,0.22)"
          strokeWidth="1.5"
          pointerEvents="none"
        />
      </svg>

      {/* Country tooltip */}
      {hovered && hovered.name && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 46 }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111418]/95 border border-white/[0.12] text-xs text-white/80 backdrop-blur-sm shadow-2xl whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              hovered.visited ? 'bg-[#3D81E3]' : hovered.wishlist ? 'bg-amber-500' : 'bg-white/15'
            }`} />
            {hovered.name}
          </div>
        </div>
      )}

      {/* Hint */}
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/15 font-mono tracking-[0.25em] uppercase pointer-events-none">
        Drag to rotate
      </p>
    </div>
  )
}

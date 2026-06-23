import { useState, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  visitedGeoNames: string[]
  wishlistGeoNames?: string[]
  onCountryClick?: (name: string) => void
}

export function WorldMap({ visitedGeoNames, wishlistGeoNames = [], onCountryClick }: WorldMapProps) {
  const [tooltip, setTooltip] = useState('')
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([0, 15])

  const handleMoveEnd = useCallback(
    ({ coordinates, zoom }: { coordinates: [number, number]; zoom: number }) => {
      setCenter(coordinates)
      setZoom(zoom)
    },
    []
  )

  return (
    <div className="relative w-full h-full select-none">
      <ComposableMap
        projectionConfig={{ scale: 155, center }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          minZoom={0.8}
          maxZoom={8}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name as string
                const visited = visitedGeoNames.includes(name)
                const wishlisted = !visited && wishlistGeoNames.includes(name)

                let defaultFill = '#13202e'
                let hoverFill = '#1e3048'
                if (visited) { defaultFill = '#1a3f7a'; hoverFill = '#B2D5E5' }
                else if (wishlisted) { defaultFill = '#3d2200'; hoverFill = '#d97706' }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setTooltip(name)}
                    onMouseLeave={() => setTooltip('')}
                    onClick={() => onCountryClick?.(name)}
                    style={{
                      default: { fill: defaultFill, stroke: '#020202', strokeWidth: 0.5, outline: 'none', transition: 'fill 0.15s' },
                      hover:   { fill: hoverFill,   stroke: '#020202', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
                      pressed: { fill: '#0a1a24', outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {[{ label: '+', delta: 1.5 }, { label: '−', delta: 1 / 1.5 }].map(({ label, delta }) => (
          <button
            key={label}
            onClick={() => setZoom(z => Math.min(Math.max(z * delta, 0.8), 8))}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => { setZoom(1); setCenter([0, 15]) }}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all text-[10px]"
          title="Reset view"
        >
          ↺
        </button>
      </div>

      {/* Country tooltip */}
      {tooltip && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-xs text-white/80 pointer-events-none whitespace-nowrap">
          {visitedGeoNames.includes(tooltip) && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B2D5E5] mr-2 mb-px" />
          )}
          {wishlistGeoNames.includes(tooltip) && !visitedGeoNames.includes(tooltip) && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 mb-px" />
          )}
          {tooltip}
        </div>
      )}
    </div>
  )
}

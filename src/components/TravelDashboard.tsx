import { motion } from 'motion/react'
import { MapPin, Map, BookOpen, Globe2, Star, Sparkles, Image, Clock } from 'lucide-react'

const sidebarNav = [
  { icon: Globe2, label: 'World Map', active: true },
  { icon: Map, label: 'Trips' },
  { icon: BookOpen, label: 'Memories' },
  { icon: MapPin, label: 'Countries' },
  { icon: Star, label: 'Wishlist' },
]

const trips = [
  { flag: '🇯🇵', country: 'Japan', city: 'Tokyo', label: 'Cherry Blossom Season', date: 'Apr 2024', unread: true, active: true },
  { flag: '🇫🇷', country: 'France', city: 'Paris', label: 'Anniversary Trip', date: 'Sep 2023', unread: true },
  { flag: '🇮🇹', country: 'Italy', city: 'Amalfi Coast', label: 'Summer Road Trip', date: 'Aug 2023' },
  { flag: '🇹🇭', country: 'Thailand', city: 'Chiang Mai', label: 'Digital Nomad Month', date: 'Jan 2023' },
  { flag: '🇮🇸', country: 'Iceland', city: 'Reykjavik', label: 'Northern Lights', date: 'Dec 2022' },
  { flag: '🇵🇹', country: 'Portugal', city: 'Lisbon', label: 'Solo Adventure', date: 'Oct 2022' },
]

const stats = [
  { label: 'Countries', value: '17' },
  { label: 'Memories', value: '43' },
  { label: 'Continents', value: '5' },
]

// Decorative wireframe globe
function WireframeGlobe() {
  const R = 78
  const cx = 100
  const cy = 100
  const lats = [-60, -30, 0, 30, 60]
  const lngs = [0, 36, 72, 108, 144]

  const visitedDots = [
    { x: 148, y: 68 },  // Japan
    { x: 100, y: 73 },  // France
    { x: 106, y: 80 },  // Italy
    { x: 149, y: 86 },  // Thailand
    { x: 88,  y: 60 },  // Iceland
    { x: 91,  y: 79 },  // Portugal
  ]

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="gb-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a3a6a" />
          <stop offset="55%" stopColor="#0a1a3a" />
          <stop offset="100%" stopColor="#03080f" />
        </radialGradient>
        <radialGradient id="gb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B2D5E5" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#B2D5E5" stopOpacity="0" />
        </radialGradient>
        <clipPath id="gb-clip">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <filter id="dot-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sphere */}
      <circle cx={cx} cy={cy} r={R} fill="url(#gb-grad)" />

      {/* Latitude & longitude grid */}
      <g clipPath="url(#gb-clip)" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6">
        {lats.map(lat => {
          const y = cy - (lat / 90) * R
          const rx = Math.sqrt(Math.max(0, R * R - (y - cy) * (y - cy)))
          return <ellipse key={lat} cx={cx} cy={y} rx={rx} ry={rx * 0.32} />
        })}
        {lngs.map((lng, i) => (
          <ellipse
            key={i}
            cx={cx} cy={cy}
            rx={R * Math.abs(Math.cos((lng * Math.PI) / 180))}
            ry={R}
            transform={`rotate(${lng} ${cx} ${cy})`}
          />
        ))}
      </g>

      {/* Inner glow */}
      <circle cx={cx} cy={cy} r={R} fill="url(#gb-glow)" clipPath="url(#gb-clip)" />

      {/* Visited location dots */}
      <g clipPath="url(#gb-clip)" filter="url(#dot-glow)">
        {visitedDots.map(({ x, y }, i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill="#B2D5E5" opacity={0.18} />
            <circle cx={x} cy={y} r={2.5} fill="#B2D5E5" opacity={0.95} />
          </g>
        ))}
      </g>

      {/* Rim */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(0,210,255,0.12)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    </svg>
  )
}

// Photo placeholder tiles for the detail panel
const photoColors = [
  'from-[#1a3a5c] to-[#0a1e38]',
  'from-[#1e2a1a] to-[#0a1208]',
  'from-[#2a1a1a] to-[#180a0a]',
  'from-[#1a1a3a] to-[#0a0818]',
]

export function TravelDashboard() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span className="text-xs text-white/50">Globe — World Map</span>
          <div className="w-16" />
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 h-[520px]">

          {/* Sidebar */}
          <div className="col-span-3 border-r border-white/10 bg-black/30 p-4 flex flex-col gap-4">
            <button className="flex items-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 w-full">
              <MapPin className="w-3 h-3" />
              Add Memory
            </button>

            <nav className="flex flex-col gap-0.5">
              {sidebarNav.map(({ icon: Icon, label, active }) => (
                <button
                  key={label}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors w-full text-left${
                    active ? ' bg-white/10 text-white' : ' text-white/60 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Stats */}
            <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 space-y-2">
              {stats.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
                  <span className="text-xs font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trip list */}
          <div className="col-span-4 border-r border-white/10 flex flex-col">
            <div className="px-3 py-2.5 border-b border-white/10">
              <span className="text-xs font-semibold text-white/50">Recent Trips</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {trips.map((trip) => (
                <div
                  key={trip.label}
                  className={`px-3 py-3 border-b border-white/[0.06] cursor-pointer transition-colors${
                    trip.active ? ' bg-white/[0.06]' : ' hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none flex-shrink-0">{trip.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-semibold truncate${trip.unread ? ' text-white' : ' text-white/60'}`}>
                          {trip.city}, {trip.country}
                        </span>
                        <span className="text-[10px] text-white/40 ml-2 flex-shrink-0">{trip.date}</span>
                      </div>
                      <p className="text-[11px] text-white/40 truncate">{trip.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="col-span-5 flex flex-col">
            {/* Globe visualization */}
            <div className="relative border-b border-white/10 flex items-center justify-center bg-black/20" style={{ height: 200 }}>
              <div className="w-44 h-44">
                <WireframeGlobe />
              </div>
              {/* Overlay label */}
              <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B2D5E5] opacity-90" />
                <span className="text-[10px] text-white/50">6 countries plotted</span>
              </div>
            </div>

            {/* Memory detail */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Cherry Blossom Season</h3>
                <p className="text-[11px] text-white/40 mt-0.5">Tokyo, Japan · Apr 2024 · 8 memories</p>
              </div>

              {/* AI highlight */}
              <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3" style={{ color: '#B2D5E5' }} />
                  <span className="text-[10px] font-semibold text-white/70">Highlight by Globe</span>
                </div>
                <p className="text-white/60 text-[11px] leading-[1.5]">
                  5 days in Tokyo during peak sakura season. 8 memories, 47 photos.
                  Most-visited: Shinjuku Gyoen, Shibuya Crossing, Senso-ji.
                </p>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {photoColors.map((gradient, i) => (
                  <div
                    key={i}
                    className={`rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center aspect-video`}
                  >
                    <Image className="w-4 h-4 text-white/20" />
                  </div>
                ))}
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 pt-1">
                {[
                  { icon: Image, val: '47 photos' },
                  { icon: Clock, val: '5 days' },
                  { icon: MapPin, val: '12 places' },
                ].map(({ icon: Icon, val }) => (
                  <div key={val} className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-white/30" />
                    <span className="text-[11px] text-white/50">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  )
}

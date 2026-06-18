import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Globe2, Images, BookOpen, BarChart2, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LogoMark, gradientStyle } from '../components/Primitives'
import { GlobeMap } from '../components/app/GlobeMap'

// Noise filter for shiny text
function NoiseFilter() {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none">
      <defs>
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </defs>
    </svg>
  )
}

const DEMO_TRIPS = [
  { flag: '🇯🇵', country: 'Japan', title: 'Cherry Blossom Season', date: 'Apr 2024', bg: 'from-[#1a0a1e] to-[#350d3a]', mems: 14 },
  { flag: '🇫🇷', country: 'France', title: 'Paris in December', date: 'Dec 2023', bg: 'from-[#091020] to-[#0d2040]', mems: 9 },
  { flag: '🇹🇭', country: 'Thailand', title: 'Island Hopping', date: 'Jan 2024', bg: 'from-[#051a10] to-[#0a2518]', mems: 22 },
  { flag: '🇮🇹', country: 'Italy', title: 'Rome & Amalfi Coast', date: 'Sep 2023', bg: 'from-[#1a1000] to-[#251800]', mems: 17 },
  { flag: '🇰🇷', country: 'South Korea', title: 'Seoul & Busan', date: 'Oct 2024', bg: 'from-[#0d0a2a] to-[#190b3d]', mems: 11 },
  { flag: '🇲🇦', country: 'Morocco', title: 'Desert & Medina', date: 'Mar 2023', bg: 'from-[#1a0a00] to-[#2a1200]', mems: 8 },
]

const DEMO_VISITED = [
  'France', 'Japan', 'Thailand', 'Italy', 'United States of America',
  'Spain', 'South Korea', 'Greece', 'Portugal', 'Vietnam',
  'Mexico', 'United Kingdom', 'Germany', 'Indonesia', 'Morocco',
]
const DEMO_WISHLIST = ['New Zealand', 'Iceland', 'Peru', 'Kenya', 'Jordan']

const FEATURES = [
  {
    icon: Globe2,
    title: 'Interactive World Map',
    desc: "See every country you've visited glow on the map. Click any country to view your trips and memories there.",
    color: '#3D81E3',
    badge: '195 countries',
  },
  {
    icon: Images,
    title: 'Memory Journal',
    desc: 'Log photos, captions, and moments for each trip. Browse a beautiful chronological feed of every memory.',
    color: '#00d2ff',
    badge: 'Unlimited photos',
  },
  {
    icon: BookOpen,
    title: 'Passport Stamps',
    desc: 'Collect a virtual stamp for every country you visit. Watch your passport fill up as you explore the world.',
    color: '#a78bfa',
    badge: 'Auto-collected',
  },
  {
    icon: BarChart2,
    title: 'Journey Stats',
    desc: 'Track countries, continents, trips, and memories. Filter by year to relive any chapter of your journey.',
    color: '#f59e0b',
    badge: 'Year breakdown',
  },
]

const DEMO_STAMPS = [
  { flag: '🇯🇵', name: 'Japan', date: 'Apr 2024' },
  { flag: '🇫🇷', name: 'France', date: 'Dec 2023' },
  { flag: '🇹🇭', name: 'Thailand', date: 'Jan 2024' },
  { flag: '🇮🇹', name: 'Italy', date: 'Sep 2023' },
  { flag: '🇰🇷', name: 'Korea', date: 'Oct 2024' },
  { flag: '🇲🇦', name: 'Morocco', date: 'Mar 2023' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white overflow-x-hidden">
      <NoiseFilter />

      {/* Video background — hero only */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-25"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/30 via-transparent to-[#0c0c0c]" />
      </div>

      {/* ────────────────── NAVBAR ────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <LogoMark className="w-7 h-7" />
          <span className="text-sm font-semibold tracking-tight">Globe</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          {user ? (
            <Link
              to="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              Open App →
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                Get started
              </Link>
            </>
          )}
        </motion.div>
      </nav>

      {/* ────────────────── HERO ────────────────── */}
      <section className="relative z-10 min-h-[82vh] flex flex-col items-center justify-center text-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/50 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3D81E3]" />
          Your personal travel journal
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.9] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="block text-white">Your world.</span>
          <span className="block animate-shiny" style={gradientStyle}>
            Remembered.
          </span>
        </motion.h1>

        <motion.p
          className="text-white/50 max-w-sm text-base leading-relaxed mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Log every trip, capture every memory, and watch your world light up country by country.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <Link
            to="/auth"
            className="px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            Start for free →
          </Link>
          <Link
            to="/auth"
            className="text-sm text-white/35 hover:text-white/60 transition-colors"
          >
            Sign in to your account
          </Link>
        </motion.div>

        {/* Floating stat chips */}
        <motion.div
          className="mt-12 flex gap-2.5 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {[
            { icon: '🌍', text: '195 countries to collect' },
            { icon: '📸', text: 'Unlimited memories' },
            { icon: '🗺', text: 'Interactive world map' },
            { icon: '🏅', text: 'Passport stamps' },
          ].map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/40"
            >
              {icon} {text}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ────────────────── TRIP CARD STRIP ────────────────── */}
      <section className="relative z-10 pb-24">
        <div className="px-6 mb-5 max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Your trips</p>
          <p className="text-[11px] text-white/20">{DEMO_TRIPS.length} of many</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-6 scrollbar-none">
          {DEMO_TRIPS.map((trip, i) => (
            <motion.div
              key={trip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`flex-shrink-0 w-48 h-64 rounded-2xl overflow-hidden relative bg-gradient-to-br ${trip.bg} cursor-default`}
            >
              {/* Flag watermark */}
              <div className="absolute inset-0 flex items-center justify-center select-none">
                <span className="text-8xl opacity-[0.08]">{trip.flag}</span>
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
              {/* Content */}
              <div className="absolute top-3 left-3 text-2xl">{trip.flag}</div>
              <div className="absolute bottom-0 p-4">
                <p className="text-[10px] text-white/40 mb-0.5">{trip.country} · {trip.date}</p>
                <p className="text-xs font-semibold text-white mb-2 line-clamp-1">{trip.title}</p>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-white/25" />
                  <span className="text-[10px] text-white/35">{trip.mems} memories</span>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Placeholder */}
          <div className="flex-shrink-0 w-48 h-64 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-2 text-white/20">
            <span className="text-3xl">+</span>
            <span className="text-[10px]">Add yours</span>
          </div>
        </div>
      </section>

      {/* ────────────────── WORLD MAP ────────────────── */}
      <section className="relative z-10 pb-24">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-1">World Map</p>
          <h2 className="text-2xl font-semibold tracking-tight">Watch your world fill in</h2>
          <p className="text-white/40 text-sm mt-2">
            Every trip you log lights up on the map. <span className="text-[#1a3f7a]">■</span> Visited &nbsp;
            <span className="text-amber-600">■</span> Wishlist
          </p>
        </div>
        <div
          className="mx-4 md:mx-6 rounded-3xl overflow-hidden border border-white/[0.06]"
          style={{ height: 'min(50vh, 420px)', background: '#0a101a' }}
        >
          <GlobeMap
            visitedGeoNames={DEMO_VISITED}
            wishlistGeoNames={DEMO_WISHLIST}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-5 flex gap-6">
          <span className="text-xs text-white/30">
            <span className="font-semibold text-white/60">{DEMO_VISITED.length}</span> countries visited
          </span>
          <span className="text-xs text-white/30">
            <span className="font-semibold text-white/60">{DEMO_WISHLIST.length}</span> on wishlist
          </span>
        </div>
      </section>

      {/* ────────────────── FEATURES ────────────────── */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-2">Features</p>
          <h2 className="text-2xl font-semibold tracking-tight">Everything your travels deserve</h2>
          <p className="text-white/40 text-sm mt-2 max-w-sm">
            One app to log, remember, and relive every place you've ever been.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, badge }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="liquid-glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-1 rounded-lg"
                  style={{ background: `${color}14`, color }}
                >
                  {badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────────────────── PASSPORT STAMPS PREVIEW ────────────────── */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-2">Passport</p>
          <h2 className="text-2xl font-semibold tracking-tight">Collect a stamp for every country</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {DEMO_STAMPS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 20 }}
              className="aspect-square rounded-2xl border-2 border-dashed border-[#3D81E3]/25 bg-[#3D81E3]/[0.04] flex flex-col items-center justify-center gap-1.5 p-2"
            >
              <span className="text-3xl">{s.flag}</span>
              <p className="text-[9px] font-semibold text-white/60 text-center leading-tight">{s.name}</p>
              <p className="text-[8px] text-white/25">{s.date}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────────────────── STATS MOCKUP ────────────────── */}
      <section className="relative z-10 px-6 pb-28 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Journey Stats</p>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-white/30">All time</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { n: '15', label: 'Countries' },
              { n: '4', label: 'Continents' },
              { n: '28', label: 'Trips' },
              { n: '163', label: 'Memories' },
            ].map(({ n, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="text-center"
              >
                <div className="text-3xl font-bold tabular-nums text-white">{n}</div>
                <div className="text-xs text-white/35 mt-1">{label}</div>
              </motion.div>
            ))}
          </div>
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-white/25 mb-2">
              <span>World progress</span>
              <span>15 / 195</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#1a3f7a] to-[#3D81E3]"
                initial={{ width: 0 }}
                whileInView={{ width: '7.7%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-white/20 mt-2">7.7% of the world explored</p>
          </div>
        </motion.div>
      </section>

      {/* ────────────────── FINAL CTA ────────────────── */}
      <section className="relative z-10 px-6 pb-32 text-center max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          The world is waiting.
          <br />
          <span className="animate-shiny" style={gradientStyle}>Go collect it.</span>
        </motion.h2>
        <motion.p
          className="text-white/40 text-sm mb-10 max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Start logging your trips today. Your travel story deserves to be remembered.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            <LogoMark className="w-4 h-4" />
            Start for free
          </Link>
        </motion.div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-5 h-5 opacity-30" />
            <span className="text-xs text-white/20">Globe</span>
          </div>
          <p className="text-[11px] text-white/15">Your personal travel journal</p>
        </div>
      </footer>
    </div>
  )
}

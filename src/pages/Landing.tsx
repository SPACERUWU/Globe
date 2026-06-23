import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Globe2, Images, Users, MapPin, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LogoMark, gradientStyle } from '../components/Primitives'
import { GlobeMap } from '../components/app/GlobeMap'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  delay: number
}

function FeatureCard({ title, description, icon: Icon, gradient, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
      className="relative flex flex-col justify-start items-start w-full max-w-[260px] md:max-w-[300px] group mx-auto"
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 w-full h-[260px] md:h-[300px] opacity-60 rounded-[40px] pointer-events-none"
        style={{ background: gradient, filter: 'blur(45px)' }}
      />

      {/* Card with gradient border */}
      <div
        className="relative self-stretch h-[260px] md:h-[300px] rounded-[40px] z-10 overflow-hidden"
        style={{
          border: '8px solid transparent',
          background: `linear-gradient(#1A1A1C, #1A1A1C) padding-box, ${gradient} border-box`,
        }}
      >
        <div className="w-full h-full p-7 flex flex-col justify-between">
          <div className="text-white/90">
            <Icon size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white font-medium text-xl mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-400 text-[14px] leading-[1.6] font-normal selection:bg-white/20">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

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

const DEMO_VISITED = [
  'France', 'Japan', 'Thailand', 'Italy', 'United States of America',
  'Spain', 'South Korea', 'Greece', 'Portugal', 'Vietnam',
  'Mexico', 'United Kingdom', 'Germany', 'Indonesia', 'Morocco',
  'Turkey', 'Netherlands', 'Switzerland', 'Austria',
]
const DEMO_WISHLIST = ['New Zealand', 'Iceland', 'Peru', 'Kenya', 'Jordan', 'Norway']

const FEATURE_CARDS = [
  {
    title: 'World Map',
    description: 'Every country you visit lights up on a 3D globe. Drag, spin, and explore your entire travel history at a glance.',
    icon: Globe2,
    gradient: 'linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)',
    delay: 0.1,
  },
  {
    title: 'Memory Journal',
    description: 'Photos, captions, moments — captured in a beautiful timeline. Every trip becomes a story worth keeping.',
    icon: Images,
    gradient: 'linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)',
    delay: 0.2,
  },
  {
    title: 'Travel Together',
    description: 'Invite friends to co-build a trip. Share invite links and plan your next adventure as a team in real time.',
    icon: Users,
    gradient: 'linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)',
    delay: 0.3,
  },
]

const DEMO_TRIPS = [
  { flag: '🇯🇵', country: 'Japan',       title: 'Cherry Blossom Season', mems: 14, bg: 'from-[#1a0a1e] to-[#2a0d30]' },
  { flag: '🇫🇷', country: 'France',      title: 'Paris in December',     mems: 9,  bg: 'from-[#090909] to-[#0d2040]' },
  { flag: '🇹🇭', country: 'Thailand',    title: 'Island Hopping',        mems: 22, bg: 'from-[#051a10] to-[#0a2518]' },
  { flag: '🇮🇹', country: 'Italy',       title: 'Rome & Amalfi Coast',   mems: 17, bg: 'from-[#1a1000] to-[#251800]' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      <NoiseFilter />

      {/* ── Background glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse at center, #1a3d52 0%, transparent 70%)' }} />
      </div>

      {/* ════════════════ NAV ════════════════ */}
      <header className="relative z-20 border-b border-white/[0.06]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5"
          >
            <LogoMark className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-tight">Globe</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            {user ? (
              <Link to="/app" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all active:scale-[0.98]">
                Open App <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block">
                  Sign in
                </Link>
                <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all active:scale-[0.98]">
                  Get started free
                </Link>
              </>
            )}
          </motion.div>
        </nav>
      </header>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative z-10 pt-20 pb-0 text-center">
        <div className="max-w-4xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] text-xs text-white/50 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B2D5E5] animate-pulse" />
            Personal travel journal
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">Your world,</span>
            <br />
            <span className="animate-shiny" style={gradientStyle}>remembered.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg text-white/45 max-w-lg mx-auto leading-relaxed mb-10"
          >
            Log every trip, capture every memory, and watch your world light up country by country on an interactive 3D globe.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <Link
              to="/auth"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth"
              className="px-6 py-3 rounded-full border border-white/15 text-sm text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        {/* ── Globe ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 mx-auto"
          style={{ maxWidth: 680, height: 680 }}
        >
          {/* Glow beneath globe */}
          <div className="absolute inset-0 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #1a3d52 0%, transparent 65%)', transform: 'scale(0.7) translateY(10%)' }} />
          <GlobeMap visitedGeoNames={DEMO_VISITED} wishlistGeoNames={DEMO_WISHLIST} />

          {/* Fade to bg at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #020202 0%, transparent 100%)' }} />
        </motion.div>
      </section>

      {/* ════════════════ STATS STRIP ════════════════ */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { n: '195', label: 'Countries to collect' },
            { n: '7', label: 'Continents to explore' },
            { n: '∞', label: 'Memories to capture' },
            { n: '100%', label: 'Free to start' },
          ].map(({ n, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="text-3xl font-bold text-white tabular-nums">{n}</div>
              <div className="text-xs text-white/35 mt-1.5 tracking-wide">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════ APP PREVIEW ════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#B2D5E5] uppercase tracking-widest mb-3">The app</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything in one place
            </h2>
            <p className="text-white/40 text-base max-w-md mx-auto">
              A beautiful, fast journal for your travels — from first trip to full passport.
            </p>
          </div>

          {/* Fake app mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0a101c]"
            style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#080d18]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-8 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-[10px] text-white/25 font-mono">
                  globe.app/dashboard
                </div>
              </div>
            </div>

            {/* App body: sidebar + content */}
            <div className="flex min-h-0" style={{ height: 380 }}>
              {/* Sidebar */}
              <div className="w-[180px] flex-shrink-0 border-r border-white/[0.06] bg-black/30 flex flex-col p-3 gap-1 hidden sm:flex">
                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                  <div className="w-5 h-5 bg-white/20 rounded" />
                  <span className="text-[11px] font-semibold text-white/60">Globe</span>
                </div>
                {[
                  { icon: '🌍', label: 'World', active: true },
                  { icon: '📸', label: 'Feed', active: false },
                  { icon: '🗺', label: 'Trips', active: false },
                  { icon: '📊', label: 'Stats', active: false },
                  { icon: '🏅', label: 'Passport', active: false },
                ].map(({ icon, label, active }) => (
                  <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] ${active ? 'bg-white/10 text-white font-medium' : 'text-white/35'}`}>
                    <span>{icon}</span>{label}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div className="flex-1 overflow-hidden p-5">
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-4">Your Trips</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 h-full">
                  {DEMO_TRIPS.map((trip) => (
                    <div
                      key={trip.title}
                      className={`rounded-xl overflow-hidden relative bg-gradient-to-br ${trip.bg} cursor-default`}
                      style={{ height: 140 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-[0.08]">{trip.flag}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      <div className="absolute inset-0 rounded-xl border border-white/[0.08]" />
                      <div className="absolute top-2.5 left-2.5 text-xl">{trip.flag}</div>
                      <div className="absolute bottom-0 p-3">
                        <p className="text-[9px] text-white/40">{trip.country}</p>
                        <p className="text-[11px] font-semibold text-white leading-tight">{trip.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-2.5 h-2.5 text-white/25" />
                          <span className="text-[9px] text-white/30">{trip.mems} memories</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="relative z-10 py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#B2D5E5] uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for travelers, not spreadsheets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-3 lg:gap-3 w-full max-w-[936px] mx-auto">
            {FEATURE_CARDS.map(card => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="relative z-10 py-32 px-6">
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(ellipse, #1a3d52 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
          >
            The world is waiting.
            <br />
            <span className="animate-shiny" style={gradientStyle}>Go collect it.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-base mb-10 max-w-sm mx-auto"
          >
            Start logging your trips today. Free forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/auth"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <LogoMark className="w-4 h-4" />
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-5 h-5 opacity-25" />
            <span className="text-xs text-white/20">Globe</span>
          </div>
          <p className="text-[11px] text-white/15">Your personal travel journal</p>
        </div>
      </footer>
    </div>
  )
}

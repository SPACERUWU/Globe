import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, Facebook, Twitter, Dribbble, Youtube, Linkedin, Instagram } from 'lucide-react'
import { LogoMark } from '../components/Primitives'

const NAV_LINKS = ['Home', 'My Trips', 'Feed', 'Stats', 'Passport']

const FOOTER_COLS = [
  {
    title: 'FEATURES',
    links: ['World Map', 'Memory Journal', 'Travel Stats', 'Passport Stamps', 'Quick Search', 'Invite Friends'],
  },
  {
    title: 'TRIPS',
    links: ['Create a Trip', 'My Trips', 'Shared Trips', 'Export Card', 'Join a Trip'],
  },
  {
    title: 'EXPLORE',
    links: ['195 Countries', '7 Continents', 'All Memories', 'Year in Review', 'Memory Feed'],
  },
  {
    title: 'ABOUT',
    links: ['About Globe', 'Privacy', 'Open Source', 'GitHub', 'Contact'],
  },
]

const SOCIAL_ICONS = [Facebook, Twitter, Dribbble, Youtube, Linkedin, Instagram]

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mobileMenuOpen) {
      const t = setTimeout(() => setMenuVisible(true), 10)
      return () => clearTimeout(t)
    }
  }, [mobileMenuOpen])

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMobileMenuOpen(true)
  }

  const closeMenu = () => {
    setMenuVisible(false)
    closeTimer.current = setTimeout(() => setMobileMenuOpen(false), 500)
  }

  const toggleMenu = () => (mobileMenuOpen ? closeMenu() : openMenu())

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ fontFamily: '"Helvetica Now Var", Helvetica, Arial, sans-serif' }}
    >
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25" style={{ zIndex: 1 }} />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <LogoMark className="w-8 h-8" />
            <span className="text-white text-xl font-bold tracking-wider">Globe</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link}
                to={link === 'Home' ? '/' : '/app'}
                className="text-white/80 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Desktop login */}
          <div className="hidden lg:block">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              LOG IN <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center z-[60]"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu
              className={`absolute w-6 h-6 text-white transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
              }`}
            />
            <X
              className={`absolute w-6 h-6 text-white transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              }`}
            />
          </button>
        </nav>

        {/* ── MOBILE MENU ── */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-[400ms]"
              style={{ opacity: menuVisible ? 1 : 0 }}
              onClick={closeMenu}
            />

            {/* Panel */}
            <div className="absolute left-0 right-0 top-[68px] z-50">
              <div className="absolute inset-0 backdrop-blur-xl rounded-b-2xl" />
              <div className="relative z-10 flex flex-col items-center gap-1 py-8 px-6">
                {NAV_LINKS.map((link, i) => (
                  <Link
                    key={link}
                    to={link === 'Home' ? '/' : '/app'}
                    onClick={closeMenu}
                    className="text-lg sm:text-xl font-light tracking-[0.08em] text-white/80 hover:text-white py-2.5 transition-colors"
                    style={{
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                      transition: 'opacity 400ms ease-out, transform 400ms ease-out',
                      transitionDelay: menuVisible ? `${350 + i * 50}ms` : '0ms',
                    }}
                  >
                    {link}
                  </Link>
                ))}
                <Link
                  to="/auth"
                  onClick={closeMenu}
                  className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full"
                  style={{
                    opacity: menuVisible ? 1 : 0,
                    transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 400ms ease-out, transform 400ms ease-out',
                    transitionDelay: menuVisible ? `${350 + NAV_LINKS.length * 50}ms` : '0ms',
                  }}
                >
                  LOG IN <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ── HERO / 404 ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 md:py-0">
          <h1 className="text-white/80 text-lg sm:text-3xl md:text-5xl font-light leading-snug tracking-tight mb-1 sm:mb-2">
            This page seems to have
          </h1>
          <h1 className="text-white/80 text-lg sm:text-3xl md:text-5xl font-light leading-snug tracking-tight mb-8 sm:mb-12">
            slipped beyond our reach :/
          </h1>

          <div className="relative mb-8 sm:mb-12 w-full flex justify-center overflow-visible">
            <span className="four-oh-four text-[80px] sm:text-[140px] md:text-[200px] lg:text-[260px] font-black text-white leading-none tracking-tighter select-none">
              404
            </span>
          </div>

          <Link
            to="/"
            className="liquid-glass text-white text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full uppercase"
          >
            Return to Main Page
          </Link>
        </div>

        {/* ── FOOTER ── */}
        <footer className="px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-10 pt-10 sm:pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-6">
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#/"
                        className="text-white/50 hover:text-white/80 text-[10px] sm:text-xs transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter + Social */}
            <div className="col-span-2 lg:col-span-2">
              <p className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4">
                JOIN FOR EXCLUSIVE DEALS
              </p>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Type your email to sign up"
                  className="flex-1 bg-white text-black text-xs px-3 py-2 rounded-l-md outline-none placeholder:text-black/40 min-w-0"
                />
                <button className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-[10px] sm:text-xs font-bold tracking-wider px-3 sm:px-4 py-2 rounded-r-md whitespace-nowrap">
                  SEND IT
                </button>
              </div>

              <p className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mt-5 sm:mt-6 mb-3">
                CONNECT
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL_ICONS.map((Icon, i) => (
                  <a key={i} href="#" className="text-white/50 hover:text-white transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

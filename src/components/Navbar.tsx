import { motion } from 'motion/react'
import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoMark, AppleButton } from './Primitives'

const NAV_LINKS = ['Explore', 'Trips', 'Memories', 'Countries', 'Premium']

export function Navbar() {
  const { user } = useAuth()

  return (
    <nav className="relative z-10 py-5">
      <motion.div
        className="max-w-6xl mx-auto px-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Link to="/">
          <LogoMark className="w-8 h-8 hover:opacity-70 transition-opacity" />
        </Link>

        <div className="hidden md:flex gap-8">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link}
              href="#"
              className="text-white/70 text-sm font-medium hover:text-white transition-colors"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
            >
              {link}
            </motion.a>
          ))}
        </div>

        <div className="hidden md:block">
          {user ? (
            <Link
              to="/app"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Open App →
            </Link>
          ) : (
            <AppleButton label="Get Started Free" to="/auth" />
          )}
        </div>

        <button
          className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4 text-white/70" />
        </button>
      </motion.div>
    </nav>
  )
}

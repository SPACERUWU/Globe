import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { AppleButton } from './Primitives'

export function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
      <motion.div
        className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)' }}
        />

        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
            The world is waiting.<br />Go collect it.
          </h2>
          <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
            Join 50,000 travelers preserving the journeys that shaped them — one memory at a time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <AppleButton label="Get Started Free" to="/auth" />
            <Link
              to="/auth"
              className="rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

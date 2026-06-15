import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { AppleButton, gradientStyle } from './Primitives'

export function Hero() {
  return (
    <section className="pt-16 md:pt-28 pb-20 text-center flex flex-col items-center relative z-10">
      <motion.h1
        className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="block text-white">Your world.</span>
        <span className="block animate-shiny" style={gradientStyle}>
          Remembered.
        </span>
      </motion.h1>

      <motion.p
        className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
      >
        Globe is the premier travel memory platform for the curious era. It maps every journey,
        captures every moment, and turns your passport stamps into a living story.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
      >
        <AppleButton label="Get Started Free" to="/auth" />
        <Link to="/auth" className="text-xs text-white/40 hover:text-white/60 transition-colors">
          Sign in to your account →
        </Link>
      </motion.div>
    </section>
  )
}

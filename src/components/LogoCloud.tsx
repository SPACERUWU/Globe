import { motion } from 'motion/react'

const logos = ['Airbnb', 'Google Maps', 'Instagram', 'Strava', 'Notion', 'Spotify', 'Apple Maps', 'TripAdvisor']

export function LogoCloud() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-10">
      <p className="text-center text-xs uppercase tracking-widest text-white/40">
        Works beautifully with the tools you already use
      </p>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
        {logos.map((name, i) => (
          <motion.div
            key={name}
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          >
            <span className="text-sm font-semibold tracking-tight text-white/50 hover:text-white transition-colors cursor-default text-center">
              {name}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

import { motion } from 'motion/react'

const testimonials = [
  {
    quote:
      'Globe has become my digital passport. I can relive any trip in seconds and share entire collections with my readers without losing a single detail.',
    name: 'Sarah Kim',
    role: 'Travel Blogger',
    company: 'WANDERLUST',
  },
  {
    quote:
      'As someone who moves to a new country every month, Globe is how I stay emotionally connected to every place I\'ve called home. It\'s indispensable.',
    name: 'Marcus Weber',
    role: 'Product Designer',
    company: 'REMOTE',
  },
  {
    quote:
      'Every shot I take now has context — when, where, the mood, the memory. Globe makes my photography feel like a complete body of work.',
    name: 'Priya Patel',
    role: 'Adventure Photographer',
    company: 'NAT GEO',
  },
]

export function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10 relative z-10">
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map(({ quote, name, role, company }, i) => (
          <motion.figure
            key={name}
            className="liquid-glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-white/50 mt-0.5">{role}</p>
              <p className="text-xs text-white font-semibold tracking-wide mt-1">{company}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}

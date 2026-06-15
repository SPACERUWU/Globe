import { motion } from 'motion/react'
import { SectionEyebrow } from './Primitives'
import { MapPin, Camera, Users, Utensils } from 'lucide-react'

const memoryCategories = [
  {
    icon: MapPin,
    label: 'Places',
    count: 12,
    color: '#ffffff',
    items: ['Shinjuku Gyoen, Tokyo', 'Eiffel Tower, Paris'],
  },
  {
    icon: Camera,
    label: 'Moments',
    count: 28,
    color: '#e5e5e5',
    items: ['Sakura at dawn', 'Sunset over Amalfi'],
  },
  {
    icon: Users,
    label: 'People',
    count: 9,
    color: '#a3a3a3',
    items: ['Met in Chiang Mai', 'Hostel crew in Lisbon'],
  },
  {
    icon: Utensils,
    label: 'Food',
    count: 15,
    color: '#525252',
    items: ['Ramen at 2am · Pastéis de Belém · Pad Thai'],
  },
]

const chips = ['Auto-tagging', 'Route mapping', 'Photo journals', 'Share collections']

export function FeatureMemories() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">

        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <SectionEyebrow label="Memories" tag="AI-powered" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02] text-white">
            Capture every journey.<br />Forever.
          </h2>
          <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
            Globe reads your photos, understands your route, and weaves every detail into a story
            you can relive any time. The world deserves more than a highlights reel.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right column — memory categories card */}
        <motion.div
          className="liquid-glass rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          <p className="text-xs text-white/40 mb-4">Tokyo trip · 54 moments captured</p>
          {memoryCategories.map(({ icon: Icon, label, count, color, items }) => (
            <div key={label} className="liquid-glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3" style={{ color }} />
                  <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color }}>{count}</span>
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <p key={item} className="text-[11px] text-white/50">{item}</p>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

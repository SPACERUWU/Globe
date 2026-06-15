import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { AppleLogo } from './Primitives'

const MENU_ITEMS = ['File', 'View', 'Map', 'Trips', 'Window', 'Help']

export function MenuBar() {
  return (
    <motion.div
      className="relative z-10 h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <AppleLogo className="w-3.5 h-3.5 text-white" />
          <span className="font-bold text-white">Globe</span>
          {MENU_ITEMS.map((item, i) => (
            <span
              key={item}
              className={`text-white/70 cursor-default hover:text-white transition-colors${
                i > 2 ? ' hidden sm:inline' : ''
              }${i > 3 ? ' hidden md:inline' : ''}`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-white/60">
          <MapPin className="w-3.5 h-3.5" />
          <span>17 countries · 43 memories</span>
        </div>
      </div>
    </motion.div>
  )
}

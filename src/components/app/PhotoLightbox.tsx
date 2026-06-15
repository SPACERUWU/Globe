import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

export interface LightboxPhoto {
  url: string
  caption: string | null
  location: string | null
  category: string
}

interface Props {
  photos: LightboxPhoto[]
  initialIndex: number
  onClose: () => void
}

export function PhotoLightbox({ photos, initialIndex, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex)
  const current = photos[idx]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIdx(i => Math.min(photos.length - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photos.length, onClose])

  // Sync when initialIndex changes (e.g. opening a different photo)
  useEffect(() => { setIdx(initialIndex) }, [initialIndex])

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(photos.length - 1, i + 1))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Nav arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            disabled={idx === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            disabled={idx === photos.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Image + info */}
      <motion.div
        key={idx}
        className="relative z-10 flex flex-col items-center px-16 max-w-5xl w-full"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
      >
        <img
          src={current.url}
          alt={current.caption ?? ''}
          className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
          draggable={false}
        />

        {(current.caption || current.location) && (
          <div className="mt-4 text-center max-w-lg">
            {current.caption && (
              <p className="text-sm text-white/85 leading-relaxed">{current.caption}</p>
            )}
            {current.location && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-white/40 mt-1.5">
                <MapPin className="w-3 h-3" />{current.location}
              </p>
            )}
          </div>
        )}

        {photos.length > 1 && (
          <p className="mt-3 text-xs text-white/25 tabular-nums">{idx + 1} / {photos.length}</p>
        )}
      </motion.div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Globe2, MapPin, Utensils, Users, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Trip, Memory } from '../types'
import { flagEmoji, fmtDate } from '../lib/countries'
import { LogoMark } from '../components/Primitives'

const CATEGORY_META: Record<string, { icon: typeof MapPin; color: string }> = {
  place:  { icon: MapPin,   color: '#B2D5E5' },
  moment: { icon: Sparkles, color: '#B2D5E5' },
  food:   { icon: Utensils, color: '#f59e0b' },
  people: { icon: Users,    color: '#a78bfa' },
}

export default function ShareView() {
  const { slug } = useParams<{ slug: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      const { data: t, error } = await supabase
        .from('trips')
        .select('*')
        .eq('public_slug', slug)
        .eq('is_public', true)
        .single()
      if (error || !t) { setNotFound(true); setLoading(false); return }
      setTrip(t as Trip)
      const { data: m } = await supabase
        .from('memories')
        .select('*')
        .eq('trip_id', t.id)
        .order('memory_date', { ascending: false })
      setMemories((m as Memory[]) ?? [])
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
    </div>
  )

  if (notFound || !trip) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-white gap-3">
      <Globe2 className="w-12 h-12 text-white/10" />
      <p className="text-sm text-white/50">This trip isn't available</p>
      <p className="text-xs text-white/30">The link may have expired or the trip was made private.</p>
      <a href="/" className="mt-4 text-xs text-[#B2D5E5] hover:text-[#c8e5ef] transition-colors">
        Go to Globe →
      </a>
    </div>
  )

  const dateLine = [fmtDate(trip.start_date), fmtDate(trip.end_date)].filter(Boolean).join(' – ')
  const photoCount = memories.filter(m => m.photo_url).length

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#020202]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <LogoMark className="w-5 h-5" />
          <span className="text-sm font-medium">Globe</span>
        </a>
        <a
          href="/auth"
          className="text-xs text-white/40 hover:text-white transition-colors"
        >
          Sign in →
        </a>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '300px' }}>
        {trip.cover_photo_url ? (
          <img src={trip.cover_photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0d2040] via-[#0a1520] to-[#060e18]">
            <div className="absolute inset-0 flex items-center justify-center select-none">
              <span className="text-[140px] opacity-[0.07] blur-sm">{flagEmoji(trip.country_code)}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 max-w-4xl mx-auto">
          <div className="flex items-end gap-4 mb-2">
            <span className="text-5xl leading-none">{flagEmoji(trip.country_code)}</span>
            <h1 className="text-3xl font-bold text-white leading-tight">{trip.title}</h1>
          </div>
          <p className="text-sm text-white/50">
            {[trip.city, trip.country_name].filter(Boolean).join(', ')}
            {dateLine ? ` · ${dateLine}` : ''}
          </p>
          {trip.description && (
            <p className="text-xs text-white/35 mt-1.5 max-w-lg leading-relaxed">{trip.description}</p>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-b border-white/[0.05] px-6 py-3 max-w-5xl mx-auto flex gap-6">
        <span className="text-xs text-white/40">
          <span className="text-white/80 font-medium">{memories.length}</span> memories
        </span>
        {photoCount > 0 && (
          <span className="text-xs text-white/40">
            <span className="text-white/80 font-medium">{photoCount}</span> photos
          </span>
        )}
      </div>

      {/* Memories grid */}
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {memories.length === 0 ? (
          <p className="text-center text-sm text-white/25 py-20">No memories in this trip yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {memories.map((mem, i) => {
              const meta = CATEGORY_META[mem.category] ?? CATEGORY_META.moment
              const Icon = meta.icon
              return (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="liquid-glass rounded-2xl overflow-hidden"
                >
                  {mem.photo_url ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={mem.photo_url}
                        alt={mem.caption ?? ''}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-white/[0.03] flex items-center justify-center">
                      <Icon className="w-8 h-8 opacity-20" style={{ color: meta.color }} />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: meta.color }} />
                      <span className="text-[10px] uppercase tracking-wide" style={{ color: meta.color }}>
                        {mem.category}
                      </span>
                    </div>
                    {mem.caption && (
                      <p className="text-xs text-white/80 leading-relaxed line-clamp-2">{mem.caption}</p>
                    )}
                    <p className="text-[10px] text-white/30 mt-1.5">
                      {[mem.location_name, fmtDate(mem.memory_date)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div className="border-t border-white/[0.06] px-6 py-10 text-center">
        <p className="text-xs text-white/25 mb-4">Shared with Globe — your personal travel journal</p>
        <a
          href="/auth"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all"
        >
          <LogoMark className="w-4 h-4" />
          Start your own travel journal
        </a>
      </div>
    </div>
  )
}

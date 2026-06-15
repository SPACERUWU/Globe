import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MapPin, Utensils, Users, Sparkles, Images } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { flagEmoji, fmtDate } from '../lib/countries'
import { AppLayout } from '../components/app/AppLayout'

const CATEGORY_META: Record<string, { icon: typeof MapPin; color: string; bg: string }> = {
  place:  { icon: MapPin,   color: '#00d2ff', bg: 'bg-[#00d2ff]/10' },
  moment: { icon: Sparkles, color: '#A4F4FD', bg: 'bg-[#A4F4FD]/10' },
  food:   { icon: Utensils, color: '#f59e0b', bg: 'bg-amber-500/10'  },
  people: { icon: Users,    color: '#a78bfa', bg: 'bg-violet-400/10' },
}

interface FeedMemory {
  id: string
  trip_id: string
  caption: string | null
  photo_url: string | null
  location_name: string | null
  memory_date: string | null
  category: 'place' | 'moment' | 'food' | 'people'
  created_at: string
  trips: { id: string; title: string; country_name: string; country_code: string } | null
}

function monthKey(iso: string | null): string {
  if (!iso) return 'Unknown date'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function Feed() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [memories, setMemories] = useState<FeedMemory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('memories')
      .select('id, trip_id, caption, photo_url, location_name, memory_date, category, created_at, trips(id, title, country_name, country_code)')
      .eq('user_id', user.id)
      .order('memory_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMemories((data as unknown as FeedMemory[]) ?? [])
        setLoading(false)
      })
  }, [user])

  // Group by month
  const grouped: [string, FeedMemory[]][] = []
  const seen = new Set<string>()
  for (const mem of memories) {
    const key = monthKey(mem.memory_date)
    if (!seen.has(key)) { seen.add(key); grouped.push([key, []]) }
    grouped[grouped.length - 1][1].push(mem)
  }

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <h1 className="text-sm font-semibold text-white">Memory Feed</h1>
        <p className="text-xs text-white/40 mt-0.5">All your travel memories, chronologically</p>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto">
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.03] h-64 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Images className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm text-white/50 mb-1">No memories yet</p>
            <p className="text-xs text-white/30">Add memories to your trips to see them here</p>
          </div>
        )}

        {!loading && grouped.map(([month, mems], gi) => (
          <div key={month} className="mb-10">
            {/* Month header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">{month}</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-[10px] text-white/20">{mems.length}</span>
            </div>

            {/* Memory cards */}
            <div className="space-y-3">
              {mems.map((mem, i) => {
                const meta = CATEGORY_META[mem.category] ?? CATEGORY_META.moment
                const Icon = meta.icon
                return (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (gi * 3 + i) * 0.03 }}
                    className="liquid-glass rounded-2xl overflow-hidden cursor-pointer hover:bg-white/[0.03] transition-colors"
                    onClick={() => navigate(`/app/trips/${mem.trip_id}`)}
                  >
                    {/* Photo */}
                    {mem.photo_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={mem.photo_url}
                          alt={mem.caption ?? ''}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className={`aspect-video ${meta.bg} flex items-center justify-center`}>
                        <Icon className="w-10 h-10 opacity-20" style={{ color: meta.color }} />
                      </div>
                    )}

                    <div className="px-4 pt-3 pb-4">
                      {/* Trip context */}
                      {mem.trips && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base leading-none">{flagEmoji(mem.trips.country_code)}</span>
                          <span className="text-xs text-white/40 truncate">{mem.trips.title}</span>
                          <span className="ml-auto flex items-center gap-1">
                            <Icon className="w-3 h-3" style={{ color: meta.color }} />
                            <span className="text-[10px]" style={{ color: meta.color }}>{mem.category}</span>
                          </span>
                        </div>
                      )}

                      {mem.caption && (
                        <p className="text-sm text-white/85 leading-relaxed">{mem.caption}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
                        {mem.location_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{mem.location_name}
                          </span>
                        )}
                        {mem.memory_date && <span>{fmtDate(mem.memory_date)}</span>}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search, X, MapPin, Utensils, Users, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { flagEmoji, fmtDate } from '../../lib/countries'

const CAT_COLOR: Record<string, string> = {
  place: '#B2D5E5', moment: '#B2D5E5', food: '#f59e0b', people: '#a78bfa',
}
const CAT_ICON: Record<string, typeof MapPin> = {
  place: MapPin, moment: Sparkles, food: Utensils, people: Users,
}

interface TripResult { id: string; title: string; country_name: string; country_code: string; start_date: string | null }
interface MemResult  { id: string; trip_id: string; caption: string | null; photo_url: string | null; category: string; location_name: string | null; trips: { title: string; country_code: string } | null }

interface Props { onClose: () => void }

export function SearchModal({ onClose }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [trips, setTrips] = useState<TripResult[]>([])
  const [mems, setMems] = useState<MemResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const doSearch = useCallback(async (q: string) => {
    if (!user || q.length < 2) { setTrips([]); setMems([]); return }
    setLoading(true)

    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from('trips')
        .select('id, title, country_name, country_code, start_date')
        .eq('user_id', user.id)
        .or(`title.ilike.%${q}%,country_name.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(5),
      supabase.from('memories')
        .select('id, trip_id, caption, photo_url, category, location_name, trips(title, country_code)')
        .eq('user_id', user.id)
        .or(`caption.ilike.%${q}%,location_name.ilike.%${q}%`)
        .limit(6),
    ])

    setTrips((t as unknown as TripResult[]) ?? [])
    setMems((m as unknown as MemResult[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(query), 280)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, doSearch])

  const goTrip = (id: string) => { onClose(); navigate(`/app/trips/${id}`) }
  const goMem  = (tripId: string) => { onClose(); navigate(`/app/trips/${tripId}`) }

  const hasResults = trips.length > 0 || mems.length > 0
  const showEmpty = query.length >= 2 && !loading && !hasResults

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-lg bg-[#111418] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search trips, memories, countries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] text-white/20 bg-white/[0.05] px-1.5 py-0.5 rounded-md">esc</kbd>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
            </div>
          )}

          {!loading && query.length < 2 && (
            <p className="text-center text-xs text-white/25 py-8">Type at least 2 characters to search</p>
          )}

          {showEmpty && (
            <p className="text-center text-xs text-white/30 py-8">No results for "{query}"</p>
          )}

          {!loading && hasResults && (
            <>
              {/* Trips */}
              {trips.length > 0 && (
                <div>
                  <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-white/25 uppercase tracking-widest">Trips</p>
                  {trips.map(t => (
                    <button
                      key={t.id}
                      onClick={() => goTrip(t.id)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <span className="text-xl leading-none flex-shrink-0">{flagEmoji(t.country_code)}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white/80 truncate">{t.title}</p>
                        <p className="text-[11px] text-white/35">
                          {t.country_name}{t.start_date ? ` · ${fmtDate(t.start_date)}` : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Memories */}
              {mems.length > 0 && (
                <div className={trips.length > 0 ? 'border-t border-white/[0.05]' : ''}>
                  <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-white/25 uppercase tracking-widest">Memories</p>
                  {mems.map(m => {
                    const Icon = CAT_ICON[m.category] ?? Sparkles
                    const color = CAT_COLOR[m.category] ?? '#B2D5E5'
                    return (
                      <button
                        key={m.id}
                        onClick={() => goMem(m.trip_id)}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
                      >
                        {m.photo_url ? (
                          <img src={m.photo_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/80 truncate">{m.caption ?? m.location_name ?? m.category}</p>
                          {m.trips && (
                            <p className="text-[11px] text-white/35 flex items-center gap-1">
                              <span>{flagEmoji(m.trips.country_code)}</span>
                              <span>{m.trips.title}</span>
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          <div className="h-2" />
        </div>
      </motion.div>
    </div>
  )
}

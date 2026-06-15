import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Map } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trip } from '../types'
import { flagEmoji, fmtDate } from '../lib/countries'
import { AppLayout } from '../components/app/AppLayout'
import { AddTripModal } from '../components/app/AddTripModal'

type SortKey = 'date' | 'name' | 'memories'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date',     label: 'Date'     },
  { key: 'name',     label: 'Name'     },
  { key: 'memories', label: 'Most'     },
]

export default function Trips() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('date')

  const fetchTrips = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('trips')
      .select('*, memories(count)')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false, nullsFirst: false })
    setTrips((data as Trip[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const sorted = [...trips].sort((a, b) => {
    if (sortBy === 'date') return (b.start_date ?? '').localeCompare(a.start_date ?? '')
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    if (sortBy === 'memories') return (b.memories?.[0]?.count ?? 0) - (a.memories?.[0]?.count ?? 0)
    return 0
  })

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-sm font-semibold text-white">All Trips</h1>
            {!loading && trips.length > 0 && (
              <p className="text-xs text-white/40 mt-0.5">{trips.length} trips logged</p>
            )}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Trip
          </button>
        </div>

        {/* Sort tabs */}
        {trips.length > 1 && (
          <div className="flex gap-1">
            <span className="text-[10px] text-white/25 self-center mr-1">Sort:</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  sortBy === key
                    ? 'bg-white/10 text-white'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-6">
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Map className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm text-white/50 mb-6">No trips yet</p>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add your first trip
            </button>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <div className="space-y-2.5">
            {sorted.map((trip, i) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-stretch liquid-glass rounded-2xl overflow-hidden cursor-pointer hover:bg-white/[0.04] transition-all group h-[76px]"
                onClick={() => navigate(`/app/trips/${trip.id}`)}
              >
                {/* Thumbnail */}
                <div className="w-[76px] flex-shrink-0 relative overflow-hidden">
                  {trip.cover_photo_url ? (
                    <img
                      src={trip.cover_photo_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0d2040] to-[#060e18] flex items-center justify-center">
                      <span className="text-2xl leading-none">{flagEmoji(trip.country_code)}</span>
                    </div>
                  )}
                  {trip.cover_photo_url && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0c0c]/20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center gap-4 px-5 min-w-0">
                  {trip.cover_photo_url && (
                    <span className="text-xl leading-none flex-shrink-0">{flagEmoji(trip.country_code)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{trip.title}</p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">
                      {[trip.city, trip.country_name].filter(Boolean).join(', ')}
                      {trip.start_date ? ` · ${fmtDate(trip.start_date)}` : ''}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-white/50">{trip.memories?.[0]?.count ?? 0}</p>
                    <p className="text-[10px] text-white/25">memories</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AddTripModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={fetchTrips} />
    </AppLayout>
  )
}

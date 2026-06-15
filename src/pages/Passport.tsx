import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trip } from '../types'
import { COUNTRIES, ALL_CONTINENTS, flagEmoji, fmtDate } from '../lib/countries'
import { AppLayout } from '../components/app/AppLayout'

interface StampEntry {
  code: string
  name: string
  continent: string
  firstVisit: string | null
  tripCount: number
}

export default function Passport() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('trips')
      .select('country_code, country_name, country_geo, start_date')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setTrips((data as Trip[]) ?? [])
        setLoading(false)
      })
  }, [user])

  // Build stamp map: one entry per country
  const stampMap = new Map<string, StampEntry>()
  for (const trip of trips) {
    const existing = stampMap.get(trip.country_code)
    const c = COUNTRIES.find(c => c.code === trip.country_code)
    if (!existing) {
      stampMap.set(trip.country_code, {
        code: trip.country_code,
        name: trip.country_name,
        continent: c?.continent ?? 'Asia',
        firstVisit: trip.start_date,
        tripCount: 1,
      })
    } else {
      existing.tripCount++
      if (trip.start_date && (!existing.firstVisit || trip.start_date < existing.firstVisit)) {
        existing.firstVisit = trip.start_date
      }
    }
  }

  // Group by continent
  const grouped = ALL_CONTINENTS
    .map(cont => ({
      continent: cont,
      stamps: [...stampMap.values()].filter(s => s.continent === cont),
    }))
    .filter(g => g.stamps.length > 0)

  const total = stampMap.size

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-white">Passport</h1>
            <p className="text-xs text-white/40 mt-0.5">Countries you've set foot in</p>
          </div>
          {total > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white tabular-nums">{total}</p>
              <p className="text-[10px] text-white/30">countries</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-8">
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && total === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm text-white/50 mb-1">Your passport is empty</p>
            <p className="text-xs text-white/30">Add trips to start collecting stamps</p>
          </div>
        )}

        {!loading && grouped.map(({ continent, stamps }, gi) => (
          <div key={continent} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">{continent}</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-[10px] text-white/20">{stamps.length}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {stamps.map((stamp, i) => (
                <motion.div
                  key={stamp.code}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (gi * 6 + i) * 0.04, type: 'spring', damping: 20, stiffness: 300 }}
                  className="relative group"
                >
                  {/* Stamp card */}
                  <div className="relative border border-dashed border-white/[0.13] hover:border-white/25 rounded-xl p-3 text-center bg-[#0a0f14] transition-all cursor-default overflow-hidden">
                    {/* Perforation dots (top + bottom) */}
                    <div className="absolute top-0 left-0 right-0 h-px flex justify-between px-1 pointer-events-none">
                      {[...Array(8)].map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-[#0c0c0c] mt-[-2px]" />
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px flex justify-between px-1 pointer-events-none">
                      {[...Array(8)].map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-[#0c0c0c] mb-[-2px]" />
                      ))}
                    </div>

                    {/* "VISITED" watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <span className="text-[28px] font-black text-white opacity-[0.03] -rotate-12 tracking-widest whitespace-nowrap">
                        VISITED
                      </span>
                    </div>

                    {/* Flag */}
                    <div className="text-4xl mb-2 leading-none">{flagEmoji(stamp.code)}</div>

                    {/* Country name */}
                    <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wide leading-tight line-clamp-2">
                      {stamp.name}
                    </p>

                    {/* Date */}
                    {stamp.firstVisit && (
                      <p className="text-[9px] text-white/25 mt-1">{fmtDate(stamp.firstVisit)}</p>
                    )}

                    {/* Multi-trip badge */}
                    {stamp.tripCount > 1 && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#3D81E3]/80 text-[9px] text-white flex items-center justify-center font-bold">
                        {stamp.tripCount}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}

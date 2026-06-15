import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trip } from '../types'
import { COUNTRIES, ALL_CONTINENTS, flagEmoji, fmtDate } from '../lib/countries'
import { AppLayout } from '../components/app/AppLayout'

export default function Stats() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('trips')
      .select('*, memories(count)')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .then(({ data: t }) => {
        setTrips((t as Trip[]) ?? [])
        setLoading(false)
      })
  }, [user])

  // Available years from trips
  const years = [...new Set(
    trips.map(t => t.start_date?.slice(0, 4)).filter(Boolean) as string[]
  )].map(Number).sort((a, b) => b - a)

  // Filtered trips for selected year
  const filteredTrips = selectedYear
    ? trips.filter(t => t.start_date?.startsWith(String(selectedYear)))
    : trips

  // Stats derived from filtered trips
  const visitedCodes = [...new Set(filteredTrips.map(t => t.country_code))]
  const countryCount = visitedCodes.length
  const worldPercent = Math.round((countryCount / 195) * 1000) / 10
  const memCount = filteredTrips.reduce((n, t) => n + (t.memories?.[0]?.count ?? 0), 0)

  // Continent breakdown
  const continentMap: Record<string, Set<string>> = {}
  filteredTrips.forEach(trip => {
    const country = COUNTRIES.find(c => c.code === trip.country_code)
    if (!country) return
    const cont = country.continent
    if (!continentMap[cont]) continentMap[cont] = new Set()
    continentMap[cont].add(trip.country_code)
  })
  const continentsVisited = Object.keys(continentMap).length

  // Countries sorted by trip count
  const countryCounts = filteredTrips.reduce<Record<string, { code: string; name: string; lastDate: string | null; count: number }>>(
    (acc, t) => {
      if (!acc[t.country_code]) {
        acc[t.country_code] = { code: t.country_code, name: t.country_name, lastDate: t.start_date, count: 0 }
      }
      acc[t.country_code].count++
      return acc
    },
    {}
  )
  const topCountries = Object.values(countryCounts).sort((a, b) => b.count - a.count)

  const bigStats = [
    { value: countryCount, label: 'Countries', sub: `${worldPercent}% of the world` },
    { value: continentsVisited, label: 'Continents', sub: `out of ${ALL_CONTINENTS.length}` },
    { value: filteredTrips.length, label: 'Trips', sub: '' },
    { value: memCount, label: 'Memories', sub: '' },
  ]

  const yearLabel = selectedYear ? `${selectedYear} recap` : 'All time'

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-sm font-semibold text-white">Journey Stats</h1>
            <p className="text-xs text-white/40 mt-0.5">{yearLabel}</p>
          </div>
          {/* Year pills */}
          {years.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  !selectedYear
                    ? 'bg-white text-black'
                    : 'text-white/40 hover:text-white/70 bg-white/[0.05]'
                }`}
              >
                All
              </button>
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    selectedYear === y
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white/70 bg-white/[0.05]'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-8 max-w-2xl">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Big number stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {bigStats.map(({ value, label, sub }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="liquid-glass rounded-2xl p-4 text-center"
                >
                  <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
                  <div className="text-xs text-white/50 mt-1">{label}</div>
                  {sub && <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>}
                </motion.div>
              ))}
            </div>

            {filteredTrips.length === 0 ? (
              <p className="text-center text-sm text-white/30 py-12">
                {selectedYear ? `No trips in ${selectedYear}.` : 'Start logging trips to see your stats here.'}
              </p>
            ) : (
              <>
                {/* Continents */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="mb-10"
                >
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
                    Continents — {continentsVisited} / {ALL_CONTINENTS.length}
                  </h2>
                  <div className="space-y-1.5">
                    {ALL_CONTINENTS.map(cont => {
                      const countries = continentMap[cont]
                      const visited = !!countries
                      return (
                        <div
                          key={cont}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                            visited ? 'bg-white/[0.05]' : 'bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${visited ? 'bg-[#3D81E3]' : 'bg-white/10'}`} />
                            <span className={`text-sm ${visited ? 'text-white' : 'text-white/30'}`}>{cont}</span>
                          </div>
                          <span className={`text-xs ${visited ? 'text-white/40' : 'text-white/20'}`}>
                            {visited
                              ? `${countries.size} countr${countries.size === 1 ? 'y' : 'ies'}`
                              : 'Not yet'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Countries visited */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                >
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
                    Countries Visited — {countryCount}
                  </h2>
                  <div className="space-y-0.5">
                    {topCountries.map(({ code, name, count, lastDate }, i) => (
                      <motion.div
                        key={code}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.03 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="text-xl leading-none w-8 text-center">{flagEmoji(code)}</span>
                        <span className="text-sm text-white/80 flex-1">{name}</span>
                        {lastDate && (
                          <span className="text-[11px] text-white/25 hidden sm:block">{fmtDate(lastDate)}</span>
                        )}
                        <span className="text-xs text-white/30 w-16 text-right">
                          {count} trip{count > 1 ? 's' : ''}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

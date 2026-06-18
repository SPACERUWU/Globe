import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Globe2, Trash2, ChevronRight, X, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trip, WishlistEntry } from '../types'
import { MemoryPin } from '../components/app/GlobeMap'
import { COUNTRIES, Country, flagEmoji, fmtDate } from '../lib/countries'
import { AppLayout } from '../components/app/AppLayout'
import { GlobeMap } from '../components/app/GlobeMap'
import { AddTripModal } from '../components/app/AddTripModal'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [sharedTrips, setSharedTrips] = useState<Trip[]>([])
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([])
  const [memoryPins, setMemoryPins] = useState<MemoryPin[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [mapClickedGeo, setMapClickedGeo] = useState<string | undefined>()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    const [{ data: t }, { data: w }, { data: pins }, { data: memberships }] = await Promise.all([
      supabase.from('trips').select('*, memories(count)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('wishlist').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('memories').select('latitude, longitude, caption, location_name').eq('user_id', user.id).not('latitude', 'is', null),
      supabase.from('trip_members').select('trip_id').eq('user_id', user.id),
    ])
    setTrips((t as Trip[]) ?? [])
    setWishlist((w as WishlistEntry[]) ?? [])

    // Fetch trips shared with this user
    const sharedIds = (memberships ?? []).map((m: { trip_id: string }) => m.trip_id)
    if (sharedIds.length > 0) {
      const { data: shared } = await supabase
        .from('trips').select('*, memories(count)').in('id', sharedIds)
      setSharedTrips((shared as Trip[]) ?? [])
    }
    setMemoryPins(
      ((pins ?? []) as { latitude: number; longitude: number; caption: string | null; location_name: string | null }[])
        .filter(p => p.latitude && p.longitude)
        .map(p => ({ lat: p.latitude, lng: p.longitude, label: p.caption || p.location_name || 'Memory' }))
    )
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const handleMapClick = (geoName: string) => {
    const country = COUNTRIES.find(c => c.geoName === geoName)
    setSelectedCountry(country ?? { name: geoName, geoName, code: '', continent: 'Asia' })
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('trips').delete().eq('id', id)
    setTrips(prev => prev.filter(t => t.id !== id))
    setDeleting(null)
  }

  const toggleWishlist = async (country: Country) => {
    if (!user) return
    const existing = wishlist.find(w => w.country_geo === country.geoName)
    if (existing) {
      await supabase.from('wishlist').delete().eq('id', existing.id)
      setWishlist(prev => prev.filter(w => w.id !== existing.id))
    } else {
      const { data } = await supabase.from('wishlist').insert({
        user_id: user.id,
        country_name: country.name,
        country_code: country.code,
        country_geo: country.geoName,
      }).select().single()
      if (data) setWishlist(prev => [data as WishlistEntry, ...prev])
    }
  }

  const visitedGeoNames = [...new Set([...trips, ...sharedTrips].map(t => t.country_geo))]
  const wishlistGeoNames = wishlist.map(w => w.country_geo)
  const uniqueCountries = new Set(trips.map(t => t.country_code)).size
  const totalMemories = trips.reduce((n, t) => n + (t.memories?.[0]?.count ?? 0), 0)

  const todayStr = new Date().toISOString().slice(0, 10)
  const upcomingTrips = trips
    .filter(t => t.start_date && t.start_date > todayStr)
    .sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''))

  const countryTrips = selectedCountry
    ? trips.filter(t => t.country_geo === selectedCountry.geoName)
    : []
  const isWishlisted = selectedCountry
    ? wishlist.some(w => w.country_geo === selectedCountry.geoName)
    : false

  return (
    <AppLayout>
      {/* Page header */}
      <div className="sticky top-0 z-20 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h1 className="text-sm font-semibold text-white">World Map</h1>
            <p className="text-xs text-white/40 mt-0.5">
              {uniqueCountries} countries · {trips.length} trips · {totalMemories} memories
            </p>
          </div>
          <button
            onClick={() => { setMapClickedGeo(undefined); setShowAdd(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Trip
          </button>
        </div>
        {/* World progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1a3f7a] to-[#3D81E3] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(uniqueCountries / 195) * 100}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-[10px] text-white/25 flex-shrink-0 tabular-nums w-20 text-right">
            {uniqueCountries}/195 countries
          </span>
        </div>
      </div>

      {/* World Map */}
      <div className="relative" style={{ height: 'min(55vh, 480px)' }}>
        {/* Legend */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2">
          {[
            { color: 'bg-[#1a3f7a]', label: 'Visited' },
            { color: 'bg-amber-600', label: 'Wishlist' },
            { color: 'bg-[#13202e] border border-white/10', label: 'Not yet' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span className="text-[10px] text-white/50">{label}</span>
            </div>
          ))}
        </div>

        <GlobeMap
          visitedGeoNames={visitedGeoNames}
          wishlistGeoNames={wishlistGeoNames}
          onCountryClick={handleMapClick}
          memoryPins={memoryPins}
        />

        {/* Country click panel */}
        <AnimatePresence>
          {selectedCountry && (
            <motion.div
              key={selectedCountry.geoName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-3 right-3 w-72 z-20"
            >
              <div className="bg-[#111418]/95 backdrop-blur-md border border-white/[0.12] rounded-2xl p-4 shadow-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {selectedCountry.code && (
                      <span className="text-2xl leading-none">{flagEmoji(selectedCountry.code)}</span>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-white leading-tight">{selectedCountry.name}</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {countryTrips.length > 0
                          ? `${countryTrips.length} trip${countryTrips.length > 1 ? 's' : ''} logged`
                          : isWishlisted ? '★ On your wishlist' : 'Not visited yet'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </div>

                {/* Trips in this country */}
                {countryTrips.length > 0 && (
                  <div className="mb-3 space-y-1 max-h-28 overflow-y-auto">
                    {countryTrips.map(t => (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/app/trips/${t.id}`)}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-white/70 truncate">{t.title}</span>
                        <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMapClickedGeo(selectedCountry.geoName)
                      setShowAdd(true)
                      setSelectedCountry(null)
                    }}
                    className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all"
                  >
                    + Add Trip
                  </button>
                  <button
                    onClick={() => toggleWishlist(selectedCountry)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      isWishlisted
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        : 'bg-white/[0.05] border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.08]'
                    }`}
                  >
                    {isWishlisted ? '★ Wishlisted' : '☆ Wishlist'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming trips */}
      {!loading && upcomingTrips.length > 0 && (
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {upcomingTrips.map((trip, i) => {
              const daysUntil = Math.ceil(
                (new Date(trip.start_date! + 'T00:00:00').getTime() - Date.now()) / 86400000
              )
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate(`/app/trips/${trip.id}`)}
                  className="flex-shrink-0 w-44 liquid-glass rounded-2xl p-3.5 cursor-pointer hover:bg-white/[0.06] transition-colors"
                >
                  <div className="text-2xl mb-2">{flagEmoji(trip.country_code)}</div>
                  <p className="text-xs font-medium text-white leading-tight line-clamp-1 mb-0.5">{trip.title}</p>
                  <p className="text-[10px] text-white/35 mb-2.5">{fmtDate(trip.start_date)}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#3D81E3]/15 border border-[#3D81E3]/20 text-[10px] font-semibold text-[#3D81E3]">
                    in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trips section */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Your trips</h2>
          <span className="text-xs text-white/40">{trips.length} total</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.03] h-40 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Globe2 className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm text-white/50 mb-1">No trips yet</p>
            <p className="text-xs text-white/30 mb-6">Click a country on the map or use the button above</p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add your first trip
            </button>
          </motion.div>
        )}

        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer h-40"
                onClick={() => navigate(`/app/trips/${trip.id}`)}
              >
                {/* Background */}
                {trip.cover_photo_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${trip.cover_photo_url})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d2040] to-[#080f1a]" />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0" />
                {/* Border */}
                <div className="absolute inset-0 rounded-2xl border border-white/10" />

                {/* Content */}
                <div className="relative z-10 p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl leading-none">{flagEmoji(trip.country_code)}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-black/50 hover:bg-red-500/30 flex items-center justify-center transition-all"
                      onClick={e => { e.stopPropagation(); handleDelete(trip.id) }}
                      disabled={deleting === trip.id}
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/60 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                  <div className="mt-auto">
                    <p className="text-[11px] text-white/50 mb-0.5 truncate">
                      {[trip.city, trip.country_name].filter(Boolean).join(', ')}
                    </p>
                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-1">{trip.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/40">{fmtDate(trip.start_date) || '—'}</span>
                      <span className="text-[11px] text-white/40">{trip.memories?.[0]?.count ?? 0} memories</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add trip card */}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: trips.length * 0.05 }}
              onClick={() => setShowAdd(true)}
              className="liquid-glass rounded-2xl flex flex-col items-center justify-center gap-2 h-40 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all border border-dashed border-white/10"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">New trip</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Shared with me */}
      {!loading && sharedTrips.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white">Shared with you</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#3D81E3]/15 border border-[#3D81E3]/20 text-[10px] font-semibold text-[#3D81E3]">
              {sharedTrips.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer h-40"
                onClick={() => navigate(`/app/trips/${trip.id}`)}
              >
                {trip.cover_photo_url ? (
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${trip.cover_photo_url})` }} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a0d2e] to-[#0a0a18]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0" />
                <div className="absolute inset-0 rounded-2xl border border-white/10" />
                {/* Shared badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-[#3D81E3]/20 border border-[#3D81E3]/30 text-[9px] font-semibold text-[#3D81E3] flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" /> Shared
                </div>
                <div className="relative z-10 p-4 flex flex-col h-full justify-end">
                  <span className="text-xl leading-none mb-1.5">{flagEmoji(trip.country_code)}</span>
                  <p className="text-xs text-white/50 mb-0.5">{trip.country_name}</p>
                  <p className="text-sm font-semibold text-white leading-tight truncate">{trip.title}</p>
                  <p className="text-[10px] text-white/35 mt-1">{trip.memories?.[0]?.count ?? 0} memories</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist section */}
      {!loading && wishlist.length > 0 && (
        <div className="px-6 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Wishlist</h2>
            <span className="text-xs text-white/40">{wishlist.length} countries</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {wishlist.map(entry => (
              <div
                key={entry.id}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
                onClick={() => {
                  const country = COUNTRIES.find(c => c.geoName === entry.country_geo)
                  if (country) setSelectedCountry(country)
                }}
              >
                <span className="text-lg leading-none">{flagEmoji(entry.country_code)}</span>
                <span className="text-xs text-amber-300/80 whitespace-nowrap">{entry.country_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddTripModal
        open={showAdd}
        prefillGeoName={mapClickedGeo}
        onClose={() => { setShowAdd(false); setMapClickedGeo(undefined) }}
        onCreated={fetchData}
      />
    </AppLayout>
  )
}

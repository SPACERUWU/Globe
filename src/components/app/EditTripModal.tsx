import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { COUNTRIES, flagEmoji, Country } from '../../lib/countries'
import { Trip } from '../../types'

interface Props {
  open: boolean
  trip: Trip
  onClose: () => void
  onSaved: (updated: Trip) => void
}

const INPUT = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors'

export function EditTripModal({ open, trip, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8)

  useEffect(() => {
    if (!open) return
    setTitle(trip.title)
    setCity(trip.city ?? '')
    setStartDate(trip.start_date ?? '')
    setEndDate(trip.end_date ?? '')
    setDescription(trip.description ?? '')
    setError('')
    const found = COUNTRIES.find(c => c.code === trip.country_code)
    if (found) { setSelectedCountry(found); setSearch(found.name) }
  }, [open, trip])

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Please enter a trip title.'); return }
    if (!selectedCountry) { setError('Please select a country.'); return }
    setSaving(true); setError('')

    const { data, error: err } = await supabase
      .from('trips')
      .update({
        title: title.trim(),
        country_name: selectedCountry.name,
        country_code: selectedCountry.code,
        country_geo: selectedCountry.geoName,
        city: city.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        description: description.trim() || null,
      })
      .eq('id', trip.id)
      .select()
      .single()

    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved(data as Trip)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-[#111418] border border-white/10 rounded-3xl p-6 shadow-2xl z-10"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">Edit trip</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-3">
              <input className={INPUT} placeholder="Trip title" value={title} onChange={e => setTitle(e.target.value)} />

              {/* Country picker */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                  <input
                    ref={searchRef}
                    className={`${INPUT} pl-10`}
                    placeholder="Country"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedCountry(null) }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  />
                  {selectedCountry && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                      {flagEmoji(selectedCountry.code)}
                    </span>
                  )}
                </div>
                {showDropdown && filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151a21] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl max-h-52 overflow-y-auto">
                    {filtered.map(c => (
                      <button
                        key={c.code}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors text-left"
                        onMouseDown={() => { setSelectedCountry(c); setSearch(c.name); setShowDropdown(false) }}
                      >
                        <span className="text-base w-6">{flagEmoji(c.code)}</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input className={INPUT} placeholder="City (optional)" value={city} onChange={e => setCity(e.target.value)} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5 block">Start date</label>
                  <input type="date" className={INPUT} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5 block">End date</label>
                  <input type="date" className={INPUT} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <textarea
                className={`${INPUT} resize-none`}
                placeholder="Description (optional)"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.03] transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

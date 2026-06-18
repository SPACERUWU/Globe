import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Upload, Image as ImageIcon, LocateFixed } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

interface Props {
  open: boolean
  tripId: string
  onClose: () => void
  onCreated: () => void
}

type Category = 'place' | 'moment' | 'food' | 'people'

const CATS: { value: Category; label: string; emoji: string }[] = [
  { value: 'place',  label: 'Place',  emoji: '📍' },
  { value: 'moment', label: 'Moment', emoji: '✨' },
  { value: 'food',   label: 'Food',   emoji: '🍜' },
  { value: 'people', label: 'People', emoji: '👥' },
]

const INPUT = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors'

export function AddMemoryModal({ open, tripId, onClose, onCreated }: Props) {
  const { user } = useAuth()
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<Category>('moment')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setCaption(''); setLocation(''); setDate(''); setCategory('moment')
    setFile(null); setPreview(null); setError(''); setSaving(false)
    setLat(null); setLng(null)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocating(false) },
      () => setLocating(false),
    )
  }

  const handleClose = () => { reset(); onClose() }

  const handleFile = (f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!caption.trim() && !file) { setError('Add a caption or a photo.'); return }
    setSaving(true); setError('')

    let photo_url: string | null = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${tripId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('memories')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (upErr) { setError('Upload failed: ' + upErr.message); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('memories').getPublicUrl(path)
      photo_url = urlData.publicUrl
    }

    const { error: insErr } = await supabase.from('memories').insert({
      trip_id: tripId,
      user_id: user.id,
      caption: caption.trim() || null,
      photo_url,
      location_name: location.trim() || null,
      latitude: lat,
      longitude: lng,
      memory_date: date || null,
      category,
    })

    setSaving(false)
    if (insErr) { setError(insErr.message); return }

    // Set trip cover photo from first memory that has a photo
    if (photo_url) {
      await supabase
        .from('trips')
        .update({ cover_photo_url: photo_url })
        .eq('id', tripId)
        .is('cover_photo_url', null)
    }

    reset(); onCreated(); onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-md bg-[#111418] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">Add memory</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Photo upload */}
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer overflow-hidden ${preview ? 'border-transparent' : 'border-white/10 hover:border-white/20'}`}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => !preview && fileRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="preview" className="w-full max-h-52 object-cover rounded-2xl" />
                    <button
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                      onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-white/30">
                    <Upload className="w-6 h-6" />
                    <p className="text-xs">Drop a photo here or click to upload</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

              {/* Caption */}
              <textarea
                className={`${INPUT} resize-none`}
                placeholder="Caption…"
                rows={2}
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />

              {/* Category */}
              <div className="flex gap-2">
                {CATS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      category === value
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.07]'
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>

              {/* Location + Date */}
              <div className="grid grid-cols-2 gap-3">
                <input className={INPUT} placeholder="Location name" value={location} onChange={e => setLocation(e.target.value)} />
                <input type="date" className={INPUT} value={date} onChange={e => setDate(e.target.value)} />
              </div>

              {/* Pin on globe */}
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                  lat !== null
                    ? 'border-[#3D81E3]/40 bg-[#3D81E3]/10 text-[#3D81E3]'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/60 hover:border-white/15'
                } disabled:opacity-50`}
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {locating ? 'Getting location…' : lat !== null ? `📍 Pinned (${lat.toFixed(2)}, ${lng?.toFixed(2)})` : 'Pin on globe'}
                {lat !== null && (
                  <span
                    className="ml-auto text-white/30 hover:text-white/60"
                    onClick={e => { e.stopPropagation(); setLat(null); setLng(null) }}
                  >✕</span>
                )}
              </button>
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={handleClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white/70 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4 animate-pulse" /> Uploading…
                  </span>
                ) : 'Save Memory'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

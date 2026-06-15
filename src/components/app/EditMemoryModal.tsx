import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Upload, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Memory } from '../../types'

interface Props {
  open: boolean
  memory: Memory
  tripId: string
  onClose: () => void
  onSaved: (updated: Memory) => void
}

type Category = 'place' | 'moment' | 'food' | 'people'
const CATS: { value: Category; label: string; emoji: string }[] = [
  { value: 'place',  label: 'Place',  emoji: '📍' },
  { value: 'moment', label: 'Moment', emoji: '✨' },
  { value: 'food',   label: 'Food',   emoji: '🍜' },
  { value: 'people', label: 'People', emoji: '👥' },
]

const INPUT = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors'

export function EditMemoryModal({ open, memory, tripId, onClose, onSaved }: Props) {
  const { user } = useAuth()
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<Category>('moment')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setCaption(memory.caption ?? '')
    setLocation(memory.location_name ?? '')
    setDate(memory.memory_date ?? '')
    setCategory(memory.category)
    setNewFile(null)
    setPreview(null)
    setError('')
  }, [open, memory])

  const handleFile = (f: File) => {
    setNewFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true); setError('')

    let photo_url = memory.photo_url

    if (newFile) {
      const ext = newFile.name.split('.').pop()
      const path = `${user.id}/${tripId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('memories')
        .upload(path, newFile, { contentType: newFile.type, upsert: false })
      if (upErr) { setError('Upload failed: ' + upErr.message); setSaving(false); return }

      const { data: urlData } = supabase.storage.from('memories').getPublicUrl(path)
      photo_url = urlData.publicUrl

      // Remove old photo if it existed
      if (memory.photo_url) {
        const oldPath = memory.photo_url.split('/memories/')[1]
        if (oldPath) await supabase.storage.from('memories').remove([oldPath])
      }
    }

    const { data, error: err } = await supabase
      .from('memories')
      .update({
        caption: caption.trim() || null,
        location_name: location.trim() || null,
        memory_date: date || null,
        category,
        photo_url,
      })
      .eq('id', memory.id)
      .select()
      .single()

    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved(data as Memory)
    onClose()
  }

  const currentPhoto = preview ?? memory.photo_url

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
            className="relative w-full max-w-md bg-[#111418] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">Edit memory</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Photo */}
              {currentPhoto ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={currentPhoto} alt="" className="w-full max-h-52 object-cover" />
                  <button
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-xs text-white/70 hover:text-white hover:bg-black/80 transition-all"
                    onClick={() => fileRef.current?.click()}
                  >
                    <RefreshCw className="w-3 h-3" /> Replace photo
                  </button>
                </div>
              ) : (
                <button
                  className="w-full border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl py-8 flex flex-col items-center gap-2 text-white/30 hover:text-white/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Add a photo</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

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

              <div className="grid grid-cols-2 gap-3">
                <input className={INPUT} placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
                <input type="date" className={INPUT} value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white/70 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
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

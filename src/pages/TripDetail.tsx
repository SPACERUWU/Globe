import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus, Pencil, MapPin, Utensils, Users, Sparkles, Trash2, Image as Img, ImagePlus, Share2, Copy, Check, Download, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trip, Memory, TripMember } from '../types'
import { flagEmoji, fmtDate } from '../lib/countries'
import { AppLayout } from '../components/app/AppLayout'
import { AddMemoryModal } from '../components/app/AddMemoryModal'
import { EditMemoryModal } from '../components/app/EditMemoryModal'
import { EditTripModal } from '../components/app/EditTripModal'
import { PhotoLightbox, LightboxPhoto } from '../components/app/PhotoLightbox'
import { PackingList } from '../components/app/PackingList'

const CATEGORY_META: Record<string, { icon: typeof MapPin; color: string; bg: string }> = {
  place:  { icon: MapPin,   color: '#00d2ff', bg: 'bg-[#00d2ff]/10' },
  moment: { icon: Sparkles, color: '#A4F4FD', bg: 'bg-[#A4F4FD]/10' },
  food:   { icon: Utensils, color: '#f59e0b', bg: 'bg-amber-500/10'  },
  people: { icon: Users,    color: '#a78bfa', bg: 'bg-violet-400/10' },
}

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [settingCover, setSettingCover] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  // Share + Members panel
  const [activePanel, setActivePanel] = useState<'share' | 'members' | null>(null)
  const [copied, setCopied] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)
  // Collaboration
  const [members, setMembers] = useState<TripMember[]>([])
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copyInvite, setCopyInvite] = useState(false)
  const [generatingInvite, setGeneratingInvite] = useState(false)
  // Packing list
  const [showPacking, setShowPacking] = useState(false)
  // Lightbox
  const [lightboxPhotos, setLightboxPhotos] = useState<LightboxPhoto[]>([])
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const fetchData = useCallback(async () => {
    if (!id || !user) return
    const [{ data: t }, { data: m }, { data: mb }] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('memories').select('*').eq('trip_id', id).order('memory_date', { ascending: false }),
      supabase.from('trip_members').select('*').eq('trip_id', id),
    ])
    setTrip(t as Trip)
    setMemories((m as Memory[]) ?? [])
    setMembers((mb as TripMember[]) ?? [])
    setLoading(false)
  }, [id, user])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDeleteMemory = async (memId: string, photoUrl: string | null) => {
    setDeleting(memId)
    if (photoUrl) {
      const path = photoUrl.split('/memories/')[1]
      if (path) await supabase.storage.from('memories').remove([path])
    }
    await supabase.from('memories').delete().eq('id', memId)
    setMemories(prev => prev.filter(m => m.id !== memId))
    setDeleting(null)
  }

  const generateSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const togglePublic = async () => {
    if (!trip || togglingPublic) return
    setTogglingPublic(true)
    if (trip.is_public) {
      await supabase.from('trips').update({ is_public: false }).eq('id', trip.id)
      setTrip(prev => prev ? { ...prev, is_public: false } : prev)
    } else {
      const slug = trip.public_slug ?? generateSlug()
      await supabase.from('trips').update({ is_public: true, public_slug: slug }).eq('id', trip.id)
      setTrip(prev => prev ? { ...prev, is_public: true, public_slug: slug } : prev)
    }
    setTogglingPublic(false)
  }

  const copyShareLink = async () => {
    if (!trip?.public_slug) return
    const base = window.location.href.split('#')[0]
    await navigator.clipboard.writeText(`${base}#/share/${trip.public_slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const memberColor = (uid: string) => {
    const c = ['#3D81E3','#34d399','#f59e0b','#a78bfa','#f472b6','#00d2ff']
    let h = 0
    for (const ch of uid) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff
    return c[Math.abs(h) % c.length]
  }

  const generateInvite = async () => {
    if (!trip || generatingInvite) return
    setGeneratingInvite(true)
    // Reuse existing non-expired invite if available
    const { data: existing } = await supabase
      .from('trip_invites').select('token')
      .eq('trip_id', trip.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle()
    if (existing) { setInviteToken(existing.token); setGeneratingInvite(false); return }
    const { data } = await supabase
      .from('trip_invites').insert({ trip_id: trip.id, created_by: user!.id }).select('token').single()
    if (data) setInviteToken(data.token)
    setGeneratingInvite(false)
  }

  const copyInviteLink = async () => {
    if (!inviteToken) return
    const base = window.location.href.split('#')[0]
    await navigator.clipboard.writeText(`${base}#/join/${inviteToken}`)
    setCopyInvite(true)
    setTimeout(() => setCopyInvite(false), 2000)
  }

  const removeMember = async (memberId: string) => {
    await supabase.from('trip_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  const handleSetCover = async (photoUrl: string) => {
    if (!trip) return
    setSettingCover(photoUrl)
    await supabase.from('trips').update({ cover_photo_url: photoUrl }).eq('id', trip.id)
    setTrip(prev => prev ? { ...prev, cover_photo_url: photoUrl } : prev)
    setSettingCover(null)
  }

  const openLightbox = (mem: Memory) => {
    const photoMems = memories.filter(m => m.photo_url)
    const idx = photoMems.findIndex(m => m.id === mem.id)
    setLightboxPhotos(photoMems.map(m => ({
      url: m.photo_url!,
      caption: m.caption,
      location: m.location_name,
      category: m.category,
    })))
    setLightboxIdx(Math.max(0, idx))
    setShowLightbox(true)
  }

  const exportCard = () => {
    if (!trip) return
    const W = 1080, H = 1080
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0d1f3c')
    bg.addColorStop(1, '#030711')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Blue glow
    const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 420)
    glow.addColorStop(0, 'rgba(61,129,227,0.14)')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // Flag emoji
    ctx.font = '220px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(flagEmoji(trip.country_code), W / 2, H * 0.38)

    // Country
    ctx.font = '500 30px -apple-system, BlinkMacSystemFont, Inter, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText(trip.country_name.toUpperCase(), W / 2, H * 0.48)

    // Title — word wrap
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    const words = trip.title.split(' ')
    let line = '', lines: string[] = []
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > 900) { lines.push(line); line = word } else { line = test }
    }
    lines.push(line)
    const titleY = H * 0.57
    lines.forEach((l, i) => ctx.fillText(l, W / 2, titleY + i * 88))

    const afterTitle = titleY + (lines.length - 1) * 88 + 60

    // Dates
    if (dateLine) {
      ctx.font = '500 32px -apple-system, BlinkMacSystemFont, Inter, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.fillText(dateLine, W / 2, afterTitle)
    }

    // Memory count
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, Inter, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillText(`${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}`, W / 2, afterTitle + 50)

    // App name
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, Inter, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillText('GLOBE', W / 2, H - 50)

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${trip.title.replace(/[^a-z0-9]/gi, '_')}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
      </div>
    </AppLayout>
  )

  if (!trip) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/40">
        <p>Trip not found.</p>
        <button onClick={() => navigate('/app')} className="mt-4 text-sm text-white/60 hover:text-white underline">
          Back to dashboard
        </button>
      </div>
    </AppLayout>
  )

  const todayStr = new Date().toISOString().slice(0, 10)
  const isUpcoming = !!trip.start_date && trip.start_date > todayStr
  const isOwner = trip.user_id === user?.id
  const dateLine = [fmtDate(trip.start_date), fmtDate(trip.end_date)].filter(Boolean).join(' – ')
  const photoMemories = memories.filter(m => m.photo_url)
  const displayMemories = filterCat ? memories.filter(m => m.category === filterCat) : memories

  // Category pill counts
  const catCounts = memories.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {})

  return (
    <AppLayout>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl leading-none flex-shrink-0">{flagEmoji(trip.country_code)}</span>
            <h1 className="text-sm font-semibold text-white truncate">{trip.title}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActivePanel(p => p === 'members' ? null : 'members')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activePanel === 'members' ? 'bg-white/15 text-white' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
              title="Collaborators"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportCard}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Export trip card"
            >
              <Download className="w-3.5 h-3.5 text-white/50" />
            </button>
            <button
              onClick={() => setActivePanel(p => p === 'share' ? null : 'share')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activePanel === 'share' ? 'bg-white/15 text-white' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
              title="Share trip"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Edit trip"
            >
              <Pencil className="w-3.5 h-3.5 text-white/50" />
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Memory</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Panels */}
        <AnimatePresence>
          {activePanel === 'share' && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-4 mt-2 w-72 bg-[#111418] border border-white/[0.12] rounded-2xl p-4 shadow-2xl z-30"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-white">Share trip</p>
                  <p className="text-[11px] text-white/35 mt-0.5">Anyone with the link can view</p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={togglePublic}
                  disabled={togglingPublic}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${trip.is_public ? 'bg-[#3D81E3]' : 'bg-white/10'}`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
                    animate={{ x: trip.is_public ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {trip.is_public && trip.public_slug ? (
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/share/${trip.public_slug}`}
                    className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white/50 font-mono"
                    onFocus={e => e.target.select()}
                  />
                  <button
                    onClick={copyShareLink}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      copied ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/50'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-white/25 text-center py-1">
                  Enable sharing to get a link
                </p>
              )}
            </motion.div>
          )}

          {activePanel === 'members' && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-4 mt-2 w-80 bg-[#111418] border border-white/[0.12] rounded-2xl p-4 shadow-2xl z-30"
            >
              <p className="text-sm font-medium text-white mb-4">Collaborators</p>

              {/* Owner row */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#3D81E3]/20 flex items-center justify-center text-xs font-bold text-[#3D81E3] flex-shrink-0">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate">{user?.email}</p>
                  <p className="text-[10px] text-white/30">Owner</p>
                </div>
              </div>

              {/* Member rows */}
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 mb-2 group">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: memberColor(m.user_id) + '22', color: memberColor(m.user_id) }}
                  >
                    {(m.user_email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{m.user_email ?? 'Unknown'}</p>
                    <p className="text-[10px] text-white/30">Editor</p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <p className="text-[11px] text-white/25 mb-3">No collaborators yet</p>
              )}

              {/* Invite link — owner only */}
              {isOwner && (
                <div className="mt-3 pt-3 border-t border-white/[0.07]">
                  {inviteToken ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={`${window.location.href.split('#')[0]}#/join/${inviteToken}`}
                          className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white/50 font-mono"
                          onFocus={e => e.target.select()}
                        />
                        <button
                          onClick={copyInviteLink}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            copyInvite ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/50'
                          }`}
                        >
                          {copyInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/20 mt-2">Expires in 7 days · editor access</p>
                    </>
                  ) : (
                    <button
                      onClick={generateInvite}
                      disabled={generatingInvite}
                      className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-xs text-white/60 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {generatingInvite ? 'Generating…' : 'Generate invite link'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '220px' }}>
        {trip.cover_photo_url ? (
          <img src={trip.cover_photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0d2040] via-[#0a1520] to-[#060e18]">
            <div className="absolute inset-0 flex items-center justify-center select-none">
              <span className="text-[120px] opacity-[0.07] blur-sm">{flagEmoji(trip.country_code)}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <p className="text-xs text-white/50 mb-1">
            {[trip.city, trip.country_name].filter(Boolean).join(', ')}
            {dateLine ? ` · ${dateLine}` : ''}
          </p>
          {trip.description && (
            <p className="text-xs text-white/40 max-w-lg line-clamp-2">{trip.description}</p>
          )}
        </div>

        {/* Cover photo hint — only shown when there are photos but no cover set */}
        {!trip.cover_photo_url && photoMemories.length > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-white/50 flex items-center gap-1.5">
            <ImagePlus className="w-3 h-3" />
            Hover a memory photo to set cover
          </div>
        )}
      </div>

      {/* Collaborators strip */}
      {members.length > 0 && (
        <div className="px-5 py-2.5 border-b border-white/[0.04] flex items-center gap-3">
          <div className="flex -space-x-1.5">
            <div
              className="w-6 h-6 rounded-full bg-[#3D81E3]/20 border-2 border-[#0c0c0c] flex items-center justify-center text-[9px] font-bold text-[#3D81E3]"
              title={user?.email}
            >
              {user?.email?.[0].toUpperCase()}
            </div>
            {members.slice(0, 5).map(m => (
              <div
                key={m.id}
                className="w-6 h-6 rounded-full border-2 border-[#0c0c0c] flex items-center justify-center text-[9px] font-bold"
                style={{ background: memberColor(m.user_id) + '33', color: memberColor(m.user_id) }}
                title={m.user_email ?? undefined}
              >
                {(m.user_email ?? '?')[0].toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-white/30">
            {members.length} collaborator{members.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Packing list — upcoming trips only */}
      {isUpcoming && (
        <div className="px-4 pt-4">
          <button
            onClick={() => setShowPacking(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-sm text-white/60 hover:text-white/80"
          >
            <span className="flex items-center gap-2 font-medium">
              🧳 Packing List
            </span>
            <span className="text-[11px] text-white/30">{showPacking ? 'hide ▲' : 'show ▼'}</span>
          </button>
          {showPacking && <PackingList tripId={trip.id} />}
        </div>
      )}

      {/* Category filter pills */}
      {memories.length > 0 && (
        <div className="px-6 py-3 border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterCat(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !filterCat
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-white/40 hover:text-white/70 border border-white/[0.07] hover:border-white/15'
            }`}
          >
            All {memories.length}
          </button>
          {Object.entries(catCounts).map(([cat, count]) => {
            const meta = CATEGORY_META[cat]
            const Icon = meta?.icon ?? Sparkles
            const active = filterCat === cat
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(active ? null : cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  active
                    ? 'bg-white/10 text-white border-white/20'
                    : 'text-white/40 hover:text-white/70 border-white/[0.07] hover:border-white/15'
                }`}
              >
                <Icon className="w-3 h-3" style={{ color: active ? meta?.color : undefined }} />
                {cat} {count}
              </button>
            )
          })}
        </div>
      )}

      {/* Memories grid */}
      <div className="px-6 py-8">
        {memories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Img className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm text-white/50 mb-1">No memories yet</p>
            <p className="text-xs text-white/30 mb-6">Add your first memory from this trip</p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add memory
            </button>
          </motion.div>
        ) : displayMemories.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-white/40">No {filterCat} memories yet</p>
            <button onClick={() => setFilterCat(null)} className="mt-3 text-xs text-white/30 hover:text-white/60 underline transition-colors">
              Show all
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayMemories.map((mem, i) => {
              const meta = CATEGORY_META[mem.category] ?? CATEGORY_META.moment
              const Icon = meta.icon
              const isCover = trip.cover_photo_url === mem.photo_url

              return (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative liquid-glass rounded-2xl overflow-hidden"
                >
                  {mem.photo_url ? (
                    <div
                      className="aspect-[4/3] overflow-hidden cursor-pointer"
                      onClick={() => openLightbox(mem)}
                    >
                      <img
                        src={mem.photo_url}
                        alt={mem.caption ?? ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`aspect-[4/3] ${meta.bg} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 opacity-30" style={{ color: meta.color }} />
                    </div>
                  )}

                  {/* Cover badge */}
                  <AnimatePresence>
                    {isCover && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/65 backdrop-blur-sm text-[10px] text-white/80 flex items-center gap-1.5 pointer-events-none"
                      >
                        <ImagePlus className="w-3 h-3" /> Cover
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons (top-right) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      className="w-7 h-7 rounded-lg bg-black/50 hover:bg-white/20 flex items-center justify-center transition-all"
                      onClick={() => setEditingMemory(mem)}
                      title="Edit memory"
                    >
                      <Pencil className="w-3 h-3 text-white/60 hover:text-white transition-colors" />
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg bg-black/50 hover:bg-red-500/30 flex items-center justify-center transition-all"
                      onClick={() => handleDeleteMemory(mem.id, mem.photo_url)}
                      disabled={deleting === mem.id}
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/60 hover:text-red-400 transition-colors" />
                    </button>
                  </div>

                  {/* Set cover button — only for photos that aren't already the cover */}
                  {mem.photo_url && !isCover && (
                    <button
                      className="absolute bottom-[72px] right-2 w-7 h-7 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-white/20 flex items-center justify-center transition-all"
                      onClick={() => handleSetCover(mem.photo_url!)}
                      disabled={settingCover === mem.photo_url}
                      title="Set as cover photo"
                    >
                      {settingCover === mem.photo_url ? (
                        <div className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
                      ) : (
                        <ImagePlus className="w-3.5 h-3.5 text-white/60 hover:text-white transition-colors" />
                      )}
                    </button>
                  )}

                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: meta.color }} />
                      <span className="text-[10px] uppercase tracking-wide" style={{ color: meta.color }}>
                        {mem.category}
                      </span>
                    </div>
                    {mem.caption && (
                      <p className="text-xs text-white/80 leading-relaxed line-clamp-2">{mem.caption}</p>
                    )}
                    <div className="mt-2">
                      <span className="text-[10px] text-white/30">
                        {mem.location_name ?? ''}{mem.location_name && mem.memory_date ? ' · ' : ''}{fmtDate(mem.memory_date)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: memories.length * 0.04 }}
              onClick={() => setShowAdd(true)}
              className="liquid-glass rounded-2xl aspect-[4/3] flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">New memory</span>
            </motion.button>
          </div>
        )}
      </div>

      <AddMemoryModal
        open={showAdd}
        tripId={trip.id}
        onClose={() => setShowAdd(false)}
        onCreated={fetchData}
      />
      {editingMemory && (
        <EditMemoryModal
          open={!!editingMemory}
          memory={editingMemory}
          tripId={trip.id}
          onClose={() => setEditingMemory(null)}
          onSaved={updated => {
            setMemories(prev => prev.map(m => m.id === updated.id ? updated : m))
            setEditingMemory(null)
          }}
        />
      )}
      <EditTripModal
        open={showEdit}
        trip={trip}
        onClose={() => setShowEdit(false)}
        onSaved={updated => setTrip(updated)}
      />
      {showLightbox && (
        <PhotoLightbox
          photos={lightboxPhotos}
          initialIndex={lightboxIdx}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </AppLayout>
  )
}

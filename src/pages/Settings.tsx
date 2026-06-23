import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, EyeOff, AlertTriangle, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/app/AppLayout'

const INPUT = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">{title}</h2>
      <div className="liquid-glass rounded-2xl p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Msg({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
  if (!msg) return null
  return (
    <p className={`text-xs ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
  )
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Avatar
  const avatarRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Display name
  const [displayName, setDisplayName] = useState(
    (user?.user_metadata?.display_name as string | undefined) ?? ''
  )
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Password
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true); setAvatarMsg(null)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/avatar.${ext}`

    const { error: upErr } = await supabase.storage
      .from('memories')
      .upload(path, file, { contentType: file.type, upsert: true })

    if (upErr) { setAvatarMsg({ type: 'err', text: upErr.message }); setAvatarUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(path)
    // Cache-bust so sidebar shows the new image immediately
    const url = `${publicUrl}?t=${Date.now()}`

    const { error: updErr } = await supabase.auth.updateUser({ data: { avatar_url: url } })
    setAvatarUploading(false)
    if (updErr) setAvatarMsg({ type: 'err', text: updErr.message })
    else setAvatarMsg({ type: 'ok', text: 'Profile picture updated!' })
  }

  const saveDisplayName = async () => {
    setNameSaving(true); setNameMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName.trim() || null } })
    setNameSaving(false)
    if (error) setNameMsg({ type: 'err', text: error.message })
    else setNameMsg({ type: 'ok', text: 'Display name updated!' })
  }

  const changePassword = async () => {
    if (newPw.length < 6) { setPwMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return }
    if (newPw !== confirmPw) { setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return }
    setPwSaving(true); setPwMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) setPwMsg({ type: 'err', text: error.message })
    else { setPwMsg({ type: 'ok', text: 'Password updated!' }); setNewPw(''); setConfirmPw('') }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== user?.email) return
    setDeleting(true)
    await Promise.all([
      supabase.from('memories').delete().eq('user_id', user!.id),
      supabase.from('trips').delete().eq('user_id', user!.id),
      supabase.from('wishlist').delete().eq('user_id', user!.id),
    ])
    await signOut()
    navigate('/')
  }

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 bg-[#020202]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <h1 className="text-sm font-semibold text-white">Settings</h1>
        <p className="text-xs text-white/40 mt-0.5">{user?.email}</p>
      </div>

      <div className="px-6 py-8 max-w-lg">
        {/* Avatar */}
        <Section title="Profile Picture">
          <div className="flex items-center gap-5">
            {/* Avatar circle */}
            <button
              className="relative flex-shrink-0 group"
              onClick={() => avatarRef.current?.click()}
              disabled={avatarUploading}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/25 transition-all"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B2D5E5] to-[#0a1a24] flex items-center justify-center text-2xl font-bold ring-2 ring-white/10 group-hover:ring-white/25 transition-all">
                  {avatarUploading ? (
                    <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : initials}
                </div>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarUploading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </button>

            <div>
              <p className="text-sm font-medium text-white/80">
                {(user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-white/40 mt-0.5">{user?.email}</p>
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                className="text-xs text-[#B2D5E5] hover:text-[#c8e5ef] mt-2 transition-colors disabled:opacity-40"
              >
                {avatarUploading ? 'Uploading…' : 'Change photo'}
              </button>
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <Msg msg={avatarMsg} />
        </Section>

        {/* Display name */}
        <Section title="Display Name">
          <input
            className={INPUT}
            placeholder="Your name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
          />
          <Msg msg={nameMsg} />
          <button
            onClick={saveDisplayName}
            disabled={nameSaving}
            className="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {nameSaving ? 'Saving…' : 'Save'}
          </button>
        </Section>

        {/* Password */}
        <Section title="Change Password">
          <div className="space-y-3">
            <div className="relative">
              <input
                className={INPUT}
                type={showPw ? 'text' : 'password'}
                placeholder="New password (min 6 characters)"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                onClick={() => setShowPw(s => !s)}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              className={INPUT}
              type={showPw ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && changePassword()}
            />
          </div>
          <Msg msg={pwMsg} />
          <button
            onClick={changePassword}
            disabled={pwSaving || !newPw || !confirmPw}
            className="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/50 leading-relaxed">
              Deleting your account will permanently remove all your trips, memories, and photos.
              This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-2 block">
              Type <span className="text-white/60 font-mono">{user?.email}</span> to confirm
            </label>
            <input
              className={`${INPUT} border-red-500/20 focus:border-red-500/40`}
              placeholder={user?.email ?? ''}
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
            />
          </div>
          <motion.button
            onClick={handleDelete}
            disabled={deleteConfirm !== user?.email || deleting}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
          >
            {deleting ? 'Deleting…' : 'Delete My Account'}
          </motion.button>
        </Section>
      </div>
    </AppLayout>
  )
}

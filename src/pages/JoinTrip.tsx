import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { LogoMark } from '../components/Primitives'
import { Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Status = 'loading' | 'joining' | 'success' | 'already' | 'error'

export default function JoinTrip() {
  const { token } = useParams<{ token: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [tripTitle, setTripTitle] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Invalid invite link.'); return }
    if (!user) {
      // Save token and redirect to auth; come back after login
      sessionStorage.setItem('pendingJoin', token)
      navigate('/auth', { replace: true })
      return
    }
    join()
  }, [token, user])

  const join = async () => {
    if (!token || !user) return
    setStatus('joining')

    // Fetch invite + trip info in one query
    const { data: invite, error } = await supabase
      .from('trip_invites')
      .select('trip_id, expires_at, trips(id, title, user_id)')
      .eq('token', token)
      .single()

    if (error || !invite) {
      setStatus('error')
      setErrorMsg('Invite link not found or has expired.')
      return
    }

    if (new Date((invite as { expires_at: string }).expires_at) < new Date()) {
      setStatus('error')
      setErrorMsg('This invite link has expired.')
      return
    }

    const trip = (invite as unknown as { trips: { id: string; title: string; user_id: string } }).trips
    setTripTitle(trip.title)

    // Already the owner
    if (trip.user_id === user.id) {
      setStatus('already')
      setTimeout(() => navigate(`/app/trips/${trip.id}`), 1500)
      return
    }

    // Add as member (upsert in case they click again)
    const { error: joinErr } = await supabase
      .from('trip_members')
      .upsert({ trip_id: trip.id, user_id: user.id, role: 'editor', user_email: user.email }, { onConflict: 'trip_id,user_id' })

    if (joinErr) {
      setStatus('error')
      setErrorMsg(joinErr.message)
      return
    }

    setStatus('success')
    setTimeout(() => navigate(`/app/trips/${trip.id}`), 1800)
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-15"
          style={{ background: 'radial-gradient(ellipse, #1a3d52 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <Link to="/" className="inline-block mb-8">
          <LogoMark className="w-10 h-10 mx-auto hover:opacity-70 transition-opacity" />
        </Link>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8">
          {(status === 'loading' || status === 'joining') && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-white/40 animate-spin" />
              </div>
              <p className="text-white/60 text-sm">{status === 'loading' ? 'Checking invite…' : 'Joining trip…'}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">You're in!</p>
                <p className="text-white/40 text-sm mt-1">Joined <span className="text-white/70">"{tripTitle}"</span></p>
              </div>
              <p className="text-xs text-white/25">Redirecting…</p>
            </div>
          )}

          {status === 'already' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#B2D5E5]/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-[#B2D5E5]" />
              </div>
              <div>
                <p className="text-white font-semibold">You own this trip</p>
                <p className="text-white/40 text-sm mt-1">"{tripTitle}"</p>
              </div>
              <p className="text-xs text-white/25">Redirecting…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Can't join</p>
                <p className="text-white/40 text-sm mt-1">{errorMsg}</p>
              </div>
              <Link to="/app" className="mt-2 text-xs text-[#B2D5E5] hover:text-blue-300 transition-colors">
                Go to your dashboard
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

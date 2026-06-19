import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { LogoMark } from '../components/Primitives'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'signin' | 'signup'

const INPUT = 'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all'

export default function Auth() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    const pendingJoin = sessionStorage.getItem('pendingJoin')
    if (pendingJoin) {
      sessionStorage.removeItem('pendingJoin')
      navigate(`/join/${pendingJoin}`, { replace: true })
    } else {
      navigate('/app', { replace: true })
    }
  }, [user, navigate])

  const friendly = (msg: string) => {
    if (msg.includes('Invalid login')) return 'Incorrect email or password.'
    if (msg.includes('already registered')) return 'An account with this email already exists.'
    if (msg.includes('Password should')) return 'Password must be at least 6 characters.'
    if (msg.includes('valid email')) return 'Please enter a valid email address.'
    return msg
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (err) { setError(friendly(err.message)); return }
      setSuccess('Account created! Signing you in…')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (err) { setError(friendly(err.message)); return }
      const pendingJoin = sessionStorage.getItem('pendingJoin')
      if (pendingJoin) {
        sessionStorage.removeItem('pendingJoin')
        navigate(`/join/${pendingJoin}`, { replace: true })
      } else {
        navigate('/app', { replace: true })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background video — same as landing */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-25 pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
        <div className="absolute inset-0 bg-[#0c0c0c]/70" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <LogoMark className="w-10 h-10 mb-4 hover:opacity-70 transition-opacity" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {mode === 'signin' ? 'Sign in to your Globe account' : 'Start collecting your world'}
          </p>
        </div>

        {/* Card */}
        <div className="liquid-glass rounded-3xl p-6">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.05] mb-6">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === m ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              className={INPUT}
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className={`${INPUT} pr-12`}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg"
              >
                {success}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-white/30">
          By continuing you agree to our{' '}
          <span className="text-white/50 hover:text-white cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-white/50 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  )
}

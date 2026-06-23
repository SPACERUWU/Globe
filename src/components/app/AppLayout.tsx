import { ReactNode, useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Globe2, Map, BarChart2, Images, BookOpen, Settings, LogOut, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LogoMark } from '../Primitives'
import { SearchModal } from './SearchModal'

const primaryNav = [
  { to: '/app',          icon: Globe2,    label: 'World'    },
  { to: '/app/feed',     icon: Images,    label: 'Feed'     },
  { to: '/app/trips',    icon: Map,       label: 'Trips'    },
  { to: '/app/stats',    icon: BarChart2, label: 'Stats'    },
]
const secondaryNav = [
  { to: '/app/passport', icon: BookOpen,  label: 'Passport' },
  { to: '/app/settings', icon: Settings,  label: 'Settings' },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(s => !s) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0]

  return (
    // h-screen + overflow-hidden = only <main> scrolls, sidebar stays fixed
    <div className="flex h-screen overflow-hidden bg-[#020202] text-white">

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-white/[0.06] bg-black/30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06] flex-shrink-0">
          <LogoMark className="w-7 h-7" />
          <span className="text-sm font-semibold tracking-tight">Globe</span>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span>Search</span>
            <kbd className="ml-auto text-[10px] text-white/20 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Nav — scrollable if needed */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
          {[...primaryNav, ...secondaryNav].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User — click to go to settings */}
        <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
          <NavLink
            to="/app/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group mb-1"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B2D5E5] to-[#0a1a24] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/70 truncate font-medium leading-tight">{displayName}</p>
              <p className="text-[10px] text-white/30 truncate leading-tight mt-px">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content — this is the scroll container */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-md">
        <div className="flex items-center">
          {primaryNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowSearch(true)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-white/30 hover:text-white/60 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide">Search</span>
          </button>
        </div>
      </nav>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  )
}

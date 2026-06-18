import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/app/ProtectedRoute'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import Stats from './pages/Stats'
import Feed from './pages/Feed'
import Passport from './pages/Passport'
import Settings from './pages/Settings'
import ShareView from './pages/ShareView'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/share/:slug"     element={<ShareView />} />
          <Route path="/"                element={<Landing />} />
          <Route path="/auth"            element={<Auth />} />
          <Route path="/app"             element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/feed"        element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/app/trips"       element={<ProtectedRoute><Trips /></ProtectedRoute>} />
          <Route path="/app/trips/:id"   element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
          <Route path="/app/stats"       element={<ProtectedRoute><Stats /></ProtectedRoute>} />
          <Route path="/app/passport"    element={<ProtectedRoute><Passport /></ProtectedRoute>} />
          <Route path="/app/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

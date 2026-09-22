import { Navigate, Route, Routes } from 'react-router-dom'
import '@/styles/admin.css'
import { isSupabaseConfigured } from '@/lib/supabase'
import { AdminLayout } from './AdminLayout'
import { DashboardPage } from './DashboardPage'
import { GiftsPage } from './GiftsPage'
import { GuestsPage } from './GuestsPage'
import { LoginPage } from './LoginPage'
import { RsvpsPage } from './RsvpsPage'
import { WishesPage } from './WishesPage'

export default function AdminApp() {
  if (!isSupabaseConfigured) {
    return (
      <div className="admin admin--center">
        <div className="a-card a-card--narrow">
          <h1>Supabase is not configured</h1>
          <p>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment, then rebuild. See the README.</p>
        </div>
      </div>
    )
  }
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="guests" element={<GuestsPage />} />
        <Route path="rsvps" element={<RsvpsPage />} />
        <Route path="gifts" element={<GiftsPage />} />
        <Route path="wishes" element={<WishesPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}

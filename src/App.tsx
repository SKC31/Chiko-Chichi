import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GoldDefs } from '@/components/ornaments/Ornaments'
import { Message } from '@/components/Message'
import { defaultWedding } from '@/config/wedding'
import InvitePage from '@/invitation/InvitePage'
import { MusicProvider } from '@/music/MusicProvider'

// The admin area is only downloaded when someone opens /admin — guests never pay for it.
const AdminApp = lazy(() => import('@/admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <GoldDefs />
      <MusicProvider>
        <Routes>
          <Route path="/invite/:code" element={<InvitePage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="admin-loading">Loading…</div>}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Message
                title={`${defaultWedding.groom.split(' ')[0]} & ${defaultWedding.bride.split(' ')[0]}`}
                text="Please open the personal invitation link that was sent to you."
              />
            }
          />
        </Routes>
      </MusicProvider>
    </BrowserRouter>
  )
}

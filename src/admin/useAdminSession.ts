import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { checkIsAdmin, getSession } from '@/services/auth'

interface State {
  loading: boolean
  session: Session | null
  isAdmin: boolean
}

/** Tracks the Supabase session AND whether that user is listed in the `admins` table. */
export function useAdminSession(): State {
  const [state, setState] = useState<State>({ loading: true, session: null, isAdmin: false })

  useEffect(() => {
    let alive = true
    const resolve = async (session: Session | null) => {
      const isAdmin = session ? await checkIsAdmin(session.user.id) : false
      if (alive) setState({ loading: false, session, isAdmin })
    }
    void getSession().then(resolve)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: calling Supabase inside this callback can deadlock the auth lock.
      window.setTimeout(() => void resolve(session), 0)
    })
    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  return state
}

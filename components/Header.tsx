'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

interface Props { user: User | null; onPost: () => void }

export default function Header({ user, onPost }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (!user) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => setProfile(data))
  }, [user])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e8e4dc',
      padding: '0 48px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, color: '#181816', letterSpacing: '0.04em' }}>
          Bookshelf
        </span>
        <span style={{ width: 1, height: 12, background: '#c8c8c4', display: 'inline-block', marginBottom: 1 }} />
        <span style={{ fontSize: 10, color: '#9a9a96', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 400 }}>
          書架
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {user ? (
          <>
            <span onClick={() => profile?.username && router.push(`/profile/${profile.username}`)}
              style={{ fontSize: 11, color: '#9a9a96', cursor: 'pointer', letterSpacing: '0.06em' }}>
              {profile?.username || ''}
            </span>
            <span onClick={signOut}
              style={{ fontSize: 11, color: '#c8c8c4', cursor: 'pointer', letterSpacing: '0.06em' }}>
              Sign out
            </span>
            <button onClick={onPost} style={{
              background: '#181816', color: '#fff', border: 'none',
              padding: '8px 22px', fontSize: 11, fontWeight: 500,
              cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
            }}>
              Share
            </button>
          </>
        ) : (
          <button onClick={() => router.push('/auth')} style={{
            background: '#181816', color: '#fff', border: 'none',
            padding: '8px 22px', fontSize: 11, fontWeight: 500,
            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'Inter', sans-serif",
          }}>
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}

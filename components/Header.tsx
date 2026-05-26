'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

interface Props {
  user: User | null
  onPost: () => void
}

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
      borderBottom: '1px solid #ebebeb',
      padding: '0 40px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontFamily: "'Sacramento', cursive", fontSize: 28, color: '#1c1c1a', lineHeight: 1 }}>bookshelf</span>
        <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, color: '#1c1c1a', fontWeight: 300 }}>.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <button onClick={() => profile?.username && router.push(`/profile/${profile.username}`)}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#888', cursor: 'pointer', fontFamily: "'Quicksand', sans-serif", fontWeight: 500 }}>
              {profile?.username || '我的書架'}
            </button>
            <button onClick={signOut}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#ccc', cursor: 'pointer', fontFamily: "'Quicksand', sans-serif" }}>
              登出
            </button>
            <button onClick={onPost}
              style={{ background: '#1c1c1a', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Quicksand', sans-serif", letterSpacing: '0.02em' }}>
              ＋ 分享
            </button>
          </>
        ) : (
          <button onClick={() => router.push('/auth')}
            style={{ background: '#1c1c1a', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Quicksand', sans-serif" }}>
            登入 / 註冊
          </button>
        )}
      </div>
    </header>
  )
}

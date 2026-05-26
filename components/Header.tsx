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
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => setProfile(data))
  }, [user])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header style={{ background: 'var(--ink)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100 }}>
      <div onClick={() => router.push('/')}
        style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 20, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.05em', cursor: 'pointer' }}>
        書架 <span style={{ color: '#f4f0e6', fontWeight: 400, fontSize: 13, marginLeft: 7, letterSpacing: '0.1em' }}>BOOKSHELF</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <button onClick={() => router.push(`/profile/${profile?.username || ''}`)}
              style={{ background: 'none', border: '0.5px solid #ffffff33', color: '#ccc', padding: '6px 14px', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif", letterSpacing: '0.04em' }}>
              {profile?.username || '我的書架'}
            </button>
            <button onClick={signOut}
              style={{ background: 'none', border: '0.5px solid #ffffff22', color: '#888', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif" }}>
              登出
            </button>
            <button onClick={onPost}
              style={{ background: 'var(--amber)', color: 'white', border: 'none', padding: '7px 18px', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif", letterSpacing: '0.05em' }}>
              ＋ 分享書單
            </button>
          </>
        ) : (
          <button onClick={() => router.push('/auth')}
            style={{ background: 'var(--amber)', color: 'white', border: 'none', padding: '7px 18px', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif", letterSpacing: '0.05em' }}>
            登入 / 註冊
          </button>
        )}
      </div>
    </header>
  )
}

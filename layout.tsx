'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const USER_COLORS = ['#5a8a7a','#c46a50','#7a6aa0','#5a7a9a','#d4a853','#8a7060']

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    if (mode === 'signup') {
      if (!username.trim()) { setError('請輸入用戶名稱'); setLoading(false); return }
      const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
      const { error: e } = await supabase.auth.signUp({
        email, password,
        options: { data: { username: username.trim(), avatar_color: color, initials: username.trim()[0] } }
      })
      if (e) setError(e.message)
      else setDone(true)
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      if (e) setError('信箱或密碼錯誤')
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 32, fontWeight: 700, color: 'var(--amber)' }}>書架</div>
          <div style={{ fontSize: 13, color: 'var(--ink-lighter)', letterSpacing: '0.2em', marginTop: 4 }}>BOOKSHELF</div>
        </div>

        {done ? (
          <div style={{ background: 'white', border: '0.5px solid var(--warm-border)', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
            <div style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 18, marginBottom: 8 }}>驗證信已寄出</div>
            <div style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.7 }}>
              請到 <strong>{email}</strong> 收取驗證信，點擊連結後即可登入。
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', border: '0.5px solid var(--warm-border)', borderRadius: 8, padding: '2rem' }}>
            {/* Toggle */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', border: '0.5px solid var(--warm-border)', borderRadius: 6, overflow: 'hidden' }}>
              {(['login', 'signup'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError('') }}
                  style={{ flex: 1, padding: '8px', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Noto Sans TC', sans-serif", letterSpacing: '0.05em', transition: 'all 0.15s',
                    background: mode === m ? 'var(--ink)' : 'white',
                    color: mode === m ? 'white' : 'var(--ink-light)' }}>
                  {m === 'login' ? '登入' : '註冊'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>用戶名稱</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="你想顯示的名稱" style={inputStyle} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>電子信箱</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>密碼</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? '至少 6 個字元' : '••••••'} style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--coral)', padding: '8px 12px', background: '#faeae4', borderRadius: 4 }}>{error}</div>}

              <button onClick={handleSubmit} disabled={loading}
                style={{ marginTop: 4, padding: '11px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 5, fontSize: 14, fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '0.05em', transition: 'background 0.15s' }}>
                {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '0.5px solid var(--warm-border)', borderRadius: 5,
  fontFamily: "'Noto Sans TC', sans-serif", fontSize: 13,
  color: 'var(--ink)', background: 'var(--cream)', outline: 'none',
  boxSizing: 'border-box',
}

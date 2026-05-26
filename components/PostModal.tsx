'use client'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

const CATS = ['文學小說','心理勵志','商業財經','科學知識','歷史傳記','藝術設計','生活風格']

interface Props {
  onClose: () => void
  onSubmit: (form: any) => Promise<void>
  user: User | null
}

export default function PostModal({ onClose, onSubmit, user }: Props) {
  const [form, setForm] = useState({ title: '', author: '', category: '文學小說', intro: '', review: '', stars: 0 })
  const [hoverStar, setHoverStar] = useState(0)
  const [aiLoading, setAiLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const fetchIntro = async () => {
    if (!form.title) return
    setAiLoading(true)
    const res = await fetch('/api/posts/intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, author: form.author })
    })
    const data = await res.json()
    if (data.intro) set('intro', data.intro)
    setAiLoading(false)
  }

  const handleSubmit = async () => {
    if (!user) return alert('請先登入')
    if (!form.title || !form.author || !form.stars || !form.review) return alert('請填寫書名、作者、評分和心得')
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
    onClose()
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', border: '0.5px solid var(--warm-border)', borderRadius: 5, fontFamily: "'Noto Sans TC', sans-serif", fontSize: 13, color: 'var(--ink)', background: 'var(--cream)', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,42,34,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 8, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.1rem 1.4rem', borderBottom: '0.5px solid var(--warm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 17, fontWeight: 600 }}>📖 分享一本書</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--ink-light)', padding: '4px 8px' }}>✕</button>
        </div>
        <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>書名 *</label>
              <input style={inp} placeholder="請輸入書名" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>作者 *</label>
              <input style={inp} placeholder="請輸入作者" value={form.author} onChange={e => set('author', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>分類</label>
              <select style={{ ...inp }} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>評分 *</label>
              <div style={{ display: 'flex', gap: 5, paddingTop: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i}
                    onMouseEnter={() => setHoverStar(i)} onMouseLeave={() => setHoverStar(0)}
                    onClick={() => set('stars', i)}
                    style={{ fontSize: 22, cursor: 'pointer', color: i <= (hoverStar || form.stars) ? 'var(--amber)' : 'var(--warm-border)', transition: 'color 0.1s' }}>★</span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em' }}>書籍簡介</label>
              <button onClick={fetchIntro} disabled={aiLoading || !form.title}
                style={{ background: 'var(--teal-light, #e0f0ed)', color: 'var(--teal)', border: '0.5px solid #a0ccc4', padding: '5px 11px', borderRadius: 4, fontFamily: "'Noto Sans TC', sans-serif", fontSize: 12, cursor: aiLoading || !form.title ? 'default' : 'pointer', opacity: !form.title ? 0.5 : 1, letterSpacing: '0.04em' }}>
                {aiLoading ? 'AI 生成中...' : '✨ AI 自動生成'}
              </button>
            </div>
            <textarea style={{ ...inp, minHeight: 70, resize: 'vertical', lineHeight: 1.7 }}
              placeholder="簡短介紹這本書，或點右上角讓 AI 幫你填..." rows={3}
              value={form.intro} onChange={e => set('intro', e.target.value)} />
            {aiLoading && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 4 }}>🤖 正在為「{form.title}」生成書介...</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>讀書心得 *</label>
            <textarea style={{ ...inp, minHeight: 100, resize: 'vertical', lineHeight: 1.7 }}
              placeholder="分享你讀完的感受、收穫或印象最深的段落..."
              value={form.review} onChange={e => set('review', e.target.value)} />
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ padding: 11, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 5, fontFamily: "'Noto Sans TC', sans-serif", fontSize: 13, fontWeight: 500, cursor: submitting ? 'default' : 'pointer', letterSpacing: '0.05em', opacity: submitting ? 0.7 : 1, marginTop: 2 }}>
            {submitting ? '發布中...' : '發布書單'}
          </button>
        </div>
      </div>
    </div>
  )
}

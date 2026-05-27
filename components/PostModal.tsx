'use client'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

const CATS = ['文學小說','心理勵志','商業財經','科學知識','歷史傳記','藝術設計','生活風格']

interface Props { onClose: () => void; onSubmit: (form: any) => Promise<void>; user: User | null }

export default function PostModal({ onClose, onSubmit, user }: Props) {
  const [form, setForm] = useState({ title: '', author: '', category: '文學小說', intro: '', review: '', stars: 0, cover_url: '' })
  const [hoverStar, setHoverStar] = useState(0)
  const [aiLoading, setAiLoading] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const fetchCover = async () => {
    if (!form.title) return
    setCoverLoading(true)
    try {
      const q = encodeURIComponent(`${form.title} ${form.author}`)
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`)
      const data = await res.json()
      const img = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
      if (img) {
        const url = img.replace('http:', 'https:').replace('zoom=1', 'zoom=2')
        setCoverPreview(url)
        set('cover_url', url)
      }
    } catch (e) {}
    setCoverLoading(false)
  }

  const fetchIntro = async () => {
    if (!form.title) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/posts/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, author: form.author })
      })
      const data = await res.json()
      if (data.intro) set('intro', data.intro)
    } catch (e) {}
    setAiLoading(false)
  }

  const handleSubmit = async () => {
    if (!user || !form.title || !form.author || !form.stars || !form.review) return
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
    onClose()
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 0',
    border: 'none', borderBottom: '1px solid #e8e4dc',
    background: 'transparent', fontFamily: "'Inter', sans-serif",
    fontSize: 13, color: '#181816', outline: 'none', letterSpacing: '0.02em',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(24,24,22,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8e4dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, letterSpacing: '0.04em' }}>Share a Book</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: '#c8c8c4', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Cover */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 90, background: '#f0ede6', flexShrink: 0, overflow: 'hidden' }}>
              {coverPreview ? <img src={coverPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96', display: 'block', marginBottom: 6 }}>書封</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} placeholder="自訂封面 URL"
                  value={form.cover_url} onChange={e => { set('cover_url', e.target.value); setCoverPreview(e.target.value) }} />
                <button onClick={fetchCover} disabled={coverLoading || !form.title}
                  style={{ background: 'none', border: '1px solid #e8e4dc', padding: '6px 12px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#9a9a96', whiteSpace: 'nowrap' }}>
                  {coverLoading ? '...' : 'Auto'}
                </button>
              </div>
            </div>
          </div>

          {/* Title + Author */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96', display: 'block', marginBottom: 4 }}>書名</label>
              <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96', display: 'block', marginBottom: 4 }}>作者</label>
              <input style={inp} value={form.author} onChange={e => set('author', e.target.value)} />
            </div>
          </div>

          {/* Category + Stars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96', display: 'block', marginBottom: 4 }}>分類</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96', display: 'block', marginBottom: 8 }}>評分</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i}
                    onMouseEnter={() => setHoverStar(i)} onMouseLeave={() => setHoverStar(0)}
                    onClick={() => set('stars', i)}
                    style={{ fontSize: 18, cursor: 'pointer', color: i <= (hoverStar || form.stars) ? '#181816' : '#e0e0dc', transition: 'color 0.1s' }}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Intro */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96' }}>書籍介紹</label>
              <button onClick={fetchIntro} disabled={aiLoading || !form.title}
                style={{ background: 'none', border: '1px solid #e8e4dc', padding: '4px 10px', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#9a9a96' }}>
                {aiLoading ? 'generating...' : 'AI generate'}
              </button>
            </div>
            <textarea style={{ ...inp, minHeight: 64, resize: 'none', lineHeight: 1.7 } as any}
              placeholder="或點右上角 AI 自動生成" value={form.intro} onChange={e => set('intro', e.target.value)} />
          </div>

          {/* Review */}
          <div>
            <label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9a96', display: 'block', marginBottom: 4 }}>讀書心得</label>
            <textarea style={{ ...inp, minHeight: 100, resize: 'none', lineHeight: 1.7 } as any}
              placeholder="分享你讀完的感受..." value={form.review} onChange={e => set('review', e.target.value)} />
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{
            background: '#181816', color: '#fff', border: 'none', padding: '14px',
            fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1, marginTop: 4,
          }}>
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  '文學小說': { bg: '#edf3ee', color: '#3a6a42' },
  '心理勵志': { bg: '#fef5e7', color: '#8a5a10' },
  '商業財經': { bg: '#e8f0fa', color: '#2a4a8a' },
  '科學知識': { bg: '#eef4f8', color: '#2a5a6a' },
  '歷史傳記': { bg: '#f5eeee', color: '#8a3a3a' },
  '藝術設計': { bg: '#f5eef8', color: '#6a3a8a' },
  '生活風格': { bg: '#f0f5ee', color: '#4a6a3a' },
}

interface Props {
  post: any
  liked: boolean
  bookmarked: boolean
  currentUser: User | null
  onLike: () => void
  onBookmark: () => void
  onRefresh: () => void
}

export default function BookCard({ post, liked, bookmarked, currentUser, onLike, onBookmark, onRefresh }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const catColor = CAT_COLORS[post.category] || { bg: '#f0ece4', color: '#6a6050' }

  const loadComments = async () => {
    if (loadingComments) return
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_color, initials)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoadingComments(false)
  }

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(s => !s)
  }

  const sendComment = async () => {
    if (!currentUser) return alert('請先登入')
    if (!commentText.trim()) return
    await supabase.from('comments').insert({ user_id: currentUser.id, post_id: post.id, content: commentText.trim() })
    setCommentText('')
    loadComments()
    onRefresh()
  }

  const s: React.CSSProperties = {
    background: 'white', border: '0.5px solid var(--warm-border)', borderRadius: 8, overflow: 'hidden'
  }

  return (
    <div style={s}>
      <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr' }}>
        {/* Spine */}
        <div style={{ width: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1.1rem', background: 'var(--paper)', borderRight: '0.5px solid var(--warm-border)' }}>
          <div style={{ width: 34, height: 46, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, background: post.spine_color + '22', border: `1.5px solid ${post.spine_color}44` }}>
            {post.emoji}
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.65rem' }}>
            <div onClick={() => router.push(`/profile/${post.username}`)}
              style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: post.avatar_color + '22', color: post.avatar_color }}>
              {post.initials}
            </div>
            <span onClick={() => router.push(`/profile/${post.username}`)}
              style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--ink)' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
              {post.username}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-lighter)', marginLeft: 'auto' }}>
              {new Date(post.created_at).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 17, fontWeight: 600, marginBottom: 2, lineHeight: 1.4 }}>{post.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)', marginBottom: 7 }}>── {post.author}</div>
          <div style={{ display: 'flex', gap: 2, marginBottom: 7 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ fontSize: 14, color: i < post.stars ? 'var(--amber)' : 'var(--warm-border)' }}>★</span>
            ))}
          </div>
          <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 3, fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 8, background: catColor.bg, color: catColor.color }}>
            {post.category}
          </span>
          {post.intro && (
            <div style={{ fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: 9, padding: '7px 10px', background: 'var(--paper)', borderLeft: '3px solid var(--warm-border)', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-lighter)', letterSpacing: '0.1em', marginBottom: 3, fontWeight: 500 }}>書籍介紹</div>
              {post.intro}
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.8 }}>{post.review}</div>
        </div>
      </div>
      {/* Actions */}
      <div style={{ borderTop: '0.5px solid var(--warm-border)', padding: '8px 1.1rem', display: 'flex', gap: 12, background: '#fcfbf8', alignItems: 'center' }}>
        <button onClick={onLike}
          style={{ fontSize: 12, color: liked ? 'var(--coral)' : 'var(--ink-light)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Noto Sans TC', sans-serif" }}>
          {liked ? '❤️' : '🤍'} {post.like_count || 0}
        </button>
        <button onClick={toggleComments}
          style={{ fontSize: 12, color: 'var(--ink-light)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Noto Sans TC', sans-serif" }}>
          💬 {post.comment_count || 0}
        </button>
        <button onClick={onBookmark}
          style={{ fontSize: 12, color: bookmarked ? 'var(--amber)' : 'var(--ink-light)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Noto Sans TC', sans-serif" }}>
          {bookmarked ? '🔖' : '🏷'} 收藏
        </button>
      </div>
      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: '0.5px solid var(--warm-border)', padding: '10px 1.1rem', background: '#fdfcf8' }}>
          {loadingComments && <div style={{ fontSize: 12, color: 'var(--ink-lighter)', textAlign: 'center', padding: 8 }}>載入留言...</div>}
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, flexShrink: 0, marginTop: 2, background: c.profiles.avatar_color + '22', color: c.profiles.avatar_color }}>
                {c.profiles.initials}
              </div>
              <div style={{ background: 'var(--paper)', borderRadius: '0 8px 8px 8px', padding: '6px 10px', flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{c.profiles.username}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.6 }}>{c.content}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendComment()}
              placeholder="留下你的想法..."
              style={{ flex: 1, padding: '6px 10px', border: '0.5px solid var(--warm-border)', borderRadius: 4, fontFamily: "'Noto Sans TC', sans-serif", fontSize: 12, outline: 'none', background: 'white', color: 'var(--ink)' }} />
            <button onClick={sendComment}
              style={{ background: 'var(--ink)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif" }}>
              送出
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

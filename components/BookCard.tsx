'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const CAT_COLORS: Record<string, string> = {
  '文學小說': '#d4e8df', '心理勵志': '#f5e6d0', '商業財經': '#dce4f0',
  '科學知識': '#dceef0', '歷史傳記': '#ecdcdc', '藝術設計': '#ecdcf0', '生活風格': '#dcecd8',
}

function useCoverUrl(title: string, author: string, customCover?: string) {
  const [url, setUrl] = useState<string | null>(customCover || null)
  useEffect(() => {
    if (customCover) { setUrl(customCover); return }
    const q = encodeURIComponent(`${title} ${author}`)
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`)
      .then(r => r.json())
      .then(data => {
        const img = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
        if (img) setUrl(img.replace('http:', 'https:').replace('zoom=1', 'zoom=2'))
      })
      .catch(() => {})
  }, [title, author, customCover])
  return url
}

interface Props {
  post: any; liked: boolean; bookmarked: boolean
  currentUser: User | null; onLike: () => void; onBookmark: () => void; onRefresh: () => void
}

export default function BookCard({ post, liked, bookmarked, currentUser, onLike, onBookmark, onRefresh }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const coverUrl = useCoverUrl(post.title, post.author, post.cover_url)
  const bgColor = CAT_COLORS[post.category] || '#e8e4dc'

  const loadComments = async () => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(username, avatar_color, initials)')
      .eq('post_id', post.id).order('created_at', { ascending: true })
    setComments(data || [])
  }

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(s => !s)
  }

  const sendComment = async () => {
    if (!currentUser || !commentText.trim()) return
    await supabase.from('comments').insert({ user_id: currentUser.id, post_id: post.id, content: commentText.trim() })
    setCommentText('')
    loadComments()
    onRefresh()
  }

  return (
    <article style={{
      background: '#fff',
      border: '1px solid #e8e4dc',
      display: 'grid',
      gridTemplateColumns: '80px 1fr',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#c8c8c4')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e4dc')}>

      <div style={{ width: 80, minHeight: 120, background: bgColor, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {coverUrl
          ? <img src={coverUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
          : <div style={{ width: 80, minHeight: 120, background: bgColor }} />
        }
      </div>

      <div>
        <div style={{ padding: '18px 24px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div onClick={() => router.push(`/profile/${post.username}`)}
              style={{ width: 20, height: 20, borderRadius: '50%', background: post.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
              {post.initials}
            </div>
            <span onClick={() => router.push(`/profile/${post.username}`)}
              style={{ fontSize: 11, color: '#5a5a56', cursor: 'pointer', fontWeight: 500, letterSpacing: '0.04em' }}>
              {post.username}
            </span>
            <span style={{ fontSize: 10, color: '#c8c8c4', marginLeft: 'auto', letterSpacing: '0.04em' }}>
              {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 400, color: '#181816', lineHeight: 1.25, marginBottom: 2 }}>{post.title}</div>
          <div style={{ fontSize: 10, color: '#9a9a96', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{post.author}</div>

          <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ fontSize: 11, color: i < post.stars ? '#181816' : '#e0e0dc' }}>★</span>
            ))}
          </div>

          <span style={{ display: 'inline-block', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9a96', background: '#f0ede6', padding: '3px 10px', marginBottom: 12 }}>
            {post.category}
          </span>

          {post.intro && (
            <div style={{ fontSize: 11, color: '#9a9a96', lineHeight: 1.8, marginBottom: 10, paddingLeft: 12, borderLeft: '1px solid #e8e4dc' }}>
              {post.intro}
            </div>
          )}

          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#3a3a38', lineHeight: 1.85 }}>{post.review}</div>
        </div>

        <div style={{ padding: '8px 24px', display: 'flex', gap: 0, borderTop: '1px solid #f4f2ee', background: '#faf8f4' }}>
          {[
            { label: liked ? '♥' : '♡', count: post.like_count || 0, active: liked, fn: onLike },
            { label: '○', count: post.comment_count || 0, active: showComments, fn: toggleComments },
            { label: bookmarked ? '◆' : '◇', count: null, active: bookmarked, fn: onBookmark },
          ].map((a, i) => (
            <button key={i} onClick={a.fn} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '5px 14px', fontSize: 11,
              color: a.active ? '#181816' : '#c8c8c4',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'color 0.15s',
            }}>
              <span style={{ fontSize: 13 }}>{a.label}</span>
              {a.count !== null && <span>{a.count}</span>}
            </button>
          ))}
        </div>

        {showComments && (
          <div style={{ borderTop: '1px solid #f4f2ee', padding: '14px 24px', background: '#fdfcfa' }}>
            {comments.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: c.profiles.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', flexShrink: 0, marginTop: 2 }}>
                  {c.profiles.initials}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: '#5a5a56', marginBottom: 2, letterSpacing: '0.04em' }}>{c.profiles.username}</div>
                  <div style={{ fontSize: 12, color: '#5a5a56', lineHeight: 1.7 }}>{c.content}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                placeholder="Leave a comment..."
                style={{ flex: 1, border: 'none', borderBottom: '1px solid #e8e4dc', background: 'transparent', padding: '6px 0', fontSize: 12, outline: 'none', fontFamily: "'Inter', sans-serif", color: '#181816' }} />
              <button onClick={sendComment} style={{ background: '#181816', color: '#fff', border: 'none', padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.06em' }}>
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

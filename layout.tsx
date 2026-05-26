'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import BookCard from '@/components/BookCard'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const username = decodeURIComponent(params.username as string)

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [tab, setTab] = useState<'posts' | 'bookmarks'>('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).single()
      setProfile(prof)
      if (prof) {
        const { data: ps } = await supabase.from('posts_with_stats').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
        setPosts(ps || [])
      }
      setLoading(false)
    }
    load()
  }, [username])

  useEffect(() => {
    if (!user) return
    supabase.from('likes').select('post_id').eq('user_id', user.id)
      .then(({ data }) => setLikedIds(new Set(data?.map(l => l.post_id) || [])))
    supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
      .then(({ data }) => setBookmarkedIds(new Set(data?.map(b => b.post_id) || [])))
  }, [user])

  const handleLike = async (postId: number) => {
    if (!user) return
    const liked = likedIds.has(postId)
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
      setLikedIds(s => { const n = new Set(s); n.delete(postId); return n })
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
      setLikedIds(s => new Set([...s, postId]))
    }
    // refresh like counts
    const { data: updated } = await supabase.from('posts_with_stats').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false })
    setPosts(updated || [])
  }

  const handleBookmark = async (postId: number) => {
    if (!user) return
    const bm = bookmarkedIds.has(postId)
    if (bm) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
      setBookmarkedIds(s => { const n = new Set(s); n.delete(postId); return n })
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
      setBookmarkedIds(s => new Set([...s, postId]))
    }
  }

  const totalLikes = posts.reduce((s, p) => s + (p.like_count || 0), 0)
  const totalComments = posts.reduce((s, p) => s + (p.comment_count || 0), 0)
  const isOwn = user && profile && user.id === profile.id

  return (
    <>
      <Header user={user} onPost={() => router.push('/')} />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '1.5rem' }}>
        <button onClick={() => router.push('/')}
          style={{ background: 'none', border: '0.5px solid var(--warm-border)', color: 'var(--ink-light)', padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', marginBottom: '1rem', fontFamily: "'Noto Sans TC', sans-serif" }}>
          ← 返回主頁
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-lighter)' }}>載入中...</div>
        ) : !profile ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-lighter)' }}>找不到此用戶</div>
        ) : (
          <>
            {/* Profile header */}
            <div style={{ background: 'white', border: '0.5px solid var(--warm-border)', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 500, background: profile.avatar_color + '22', color: profile.avatar_color, flexShrink: 0 }}>
                {profile.initials}
              </div>
              <div>
                <div style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{profile.username}</div>
                {isOwn && <div style={{ fontSize: 11, color: 'var(--ink-lighter)', marginBottom: 8 }}>{user?.email}</div>}
                <div style={{ display: 'flex', gap: 20 }}>
                  {[['書單', posts.length], ['獲讚', totalLikes], ['留言', totalComments]].map(([l, n]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 500 }}>{n}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-lighter)', letterSpacing: '0.06em' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '0.5px solid var(--warm-border)' }}>
              {([['posts', '分享的書單'], ...(isOwn ? [['bookmarks', '我的收藏']] : [])] as [string, string][]).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k as any)}
                  style={{ padding: '8px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === k ? 'var(--amber)' : 'transparent'}`, marginBottom: -1, fontSize: 13, cursor: 'pointer', color: tab === k ? 'var(--ink)' : 'var(--ink-light)', fontFamily: "'Noto Sans TC', sans-serif", fontWeight: tab === k ? 500 : 400, letterSpacing: '0.05em' }}>
                  {l}
                </button>
              ))}
            </div>

            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-lighter)' }}>還沒有分享任何書單 📚</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {posts.map(p => (
                  <BookCard key={p.id} post={p}
                    liked={likedIds.has(p.id)} bookmarked={bookmarkedIds.has(p.id)}
                    currentUser={user}
                    onLike={() => handleLike(p.id)}
                    onBookmark={() => handleBookmark(p.id)}
                    onRefresh={() => {}}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

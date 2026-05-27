'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import Toolbar from '@/components/Toolbar'
import BookCard from '@/components/BookCard'
import PostModal from '@/components/PostModal'
import type { User } from '@supabase/supabase-js'

const COVERS = ['📚','🌿','🌊','🌙','🔮','🏔','🌸','🦋','☀️','🌎']
const SPINES = ['#d4a853','#5a8a7a','#c46a50','#7a6aa0','#5a7a9a','#8a7060']

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('posts_with_stats').select('*')
    if (category !== '全部') query = query.eq('category', category)
    if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,username.ilike.%${search}%`)
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'popular') query = query.order('like_count', { ascending: false })
    else if (sort === 'rating') query = query.order('stars', { ascending: false })
    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }, [category, search, sort])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    if (!user) { setLikedIds(new Set()); setBookmarkedIds(new Set()); return }
    supabase.from('likes').select('post_id').eq('user_id', user.id)
      .then(({ data }) => setLikedIds(new Set(Array.from(data?.map(l => l.post_id) || []))))
    supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
      .then(({ data }) => setBookmarkedIds(new Set(Array.from(data?.map(b => b.post_id) || []))))
  }, [user])

  const handleLike = async (postId: number) => {
    if (!user) return alert('請先登入')
    const liked = likedIds.has(postId)
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
      setLikedIds(s => { const n = new Set(Array.from(s)); n.delete(postId); return n })
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
      setLikedIds(s => new Set(Array.from(s).concat(postId)))
    }
    fetchPosts()
  }

  const handleBookmark = async (postId: number) => {
    if (!user) return alert('請先登入')
    const bm = bookmarkedIds.has(postId)
    if (bm) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
      setBookmarkedIds(s => { const n = new Set(Array.from(s)); n.delete(postId); return n })
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
      setBookmarkedIds(s => new Set(Array.from(s).concat(postId)))
    }
  }

  const handlePost = async (form: any) => {
    if (!user) return
    const emoji = COVERS[Math.floor(Math.random() * COVERS.length)]
    const spineColor = SPINES[Math.floor(Math.random() * SPINES.length)]
    await supabase.from('posts').insert({ user_id: user.id, ...form, emoji, spine_color: spineColor })
    fetchPosts()
  }

  return (
    <>
      <Header user={user} onPost={() => setShowModal(true)} />
      <Toolbar search={search} onSearch={setSearch} category={category} onCategory={setCategory} sort={sort} onSort={setSort} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 48px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#c8c8c4', fontSize: 12, letterSpacing: '0.1em' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, color: '#c8c8c4', marginBottom: 8 }}>No books yet</div>
            <div style={{ fontSize: 11, color: '#c8c8c4', letterSpacing: '0.08em' }}>Be the first to share a book</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {posts.map(p => (
              <BookCard key={p.id} post={p}
                liked={likedIds.has(p.id)} bookmarked={bookmarkedIds.has(p.id)}
                currentUser={user}
                onLike={() => handleLike(p.id)}
                onBookmark={() => handleBookmark(p.id)}
                onRefresh={fetchPosts}
              />
            ))}
          </div>
        )}
      </main>
      {showModal && <PostModal onClose={() => setShowModal(false)} onSubmit={handlePost} user={user} />}
    </>
  )
}

'use client'

const CATS = ['All','文學小說','心理勵志','商業財經','科學知識','歷史傳記','藝術設計','生活風格']

interface Props {
  search: string; onSearch: (v: string) => void
  category: string; onCategory: (v: string) => void
  sort: string; onSort: (v: string) => void
}

export default function Toolbar({ search, onSearch, category, onCategory, sort, onSort }: Props) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e8e4dc' }}>
      <div style={{ padding: '0 48px', display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid #f0ede6', overflowX: 'auto' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => onCategory(c === 'All' ? '全部' : c)}
            style={{
              padding: '13px 16px',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${(c === 'All' && category === '全部') || c === category ? '#181816' : 'transparent'}`,
              marginBottom: -1,
              fontSize: 11,
              fontWeight: (c === 'All' && category === '全部') || c === category ? 500 : 400,
              color: (c === 'All' && category === '全部') || c === category ? '#181816' : '#9a9a96',
              cursor: 'pointer', whiteSpace: 'nowrap',
              letterSpacing: '0.06em',
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.15s',
            }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c8c4" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Search books, authors..."
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#181816', outline: 'none', fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }} />
        </div>
        <select value={sort} onChange={e => onSort(e.target.value)}
          style={{ border: 'none', background: 'transparent', fontSize: 11, color: '#9a9a96', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.06em' }}>
          <option value="newest">Latest</option>
          <option value="popular">Most liked</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
    </div>
  )
}

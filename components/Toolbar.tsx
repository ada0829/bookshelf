'use client'

const CATS = ['全部','文學小說','心理勵志','商業財經','科學知識','歷史傳記','藝術設計','生活風格']

interface Props {
  search: string; onSearch: (v: string) => void
  category: string; onCategory: (v: string) => void
  sort: string; onSort: (v: string) => void
}

export default function Toolbar({ search, onSearch, category, onCategory, sort, onSort }: Props) {
  return (
    <div style={{ background: '#eee8dc', borderBottom: '2px solid #d4c8b4', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 48 }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--ink-lighter)' }}>🔍</span>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="搜尋書名、作者..."
          style={{ width: '100%', padding: '7px 12px 7px 30px', border: '0.5px solid var(--warm-border)', borderRadius: 4, fontFamily: "'Noto Sans TC', sans-serif", fontSize: 13, background: 'white', outline: 'none', color: 'var(--ink)' }} />
      </div>
      {/* Category tabs */}
      <div style={{ display: 'flex', overflow: 'auto', flex: 2, minWidth: 0 }}>
        {CATS.map(c => (
          <div key={c} onClick={() => onCategory(c)}
            style={{ padding: '8px 12px', fontSize: 12, color: category === c ? 'var(--ink)' : 'var(--ink-light)', cursor: 'pointer', borderBottom: `2px solid ${category === c ? 'var(--amber)' : 'transparent'}`, marginBottom: -2, whiteSpace: 'nowrap', fontWeight: category === c ? 500 : 400, letterSpacing: '0.05em', transition: 'all 0.15s' }}>
            {c}
          </div>
        ))}
      </div>
      {/* Sort */}
      <span style={{ fontSize: 11, color: 'var(--ink-lighter)', whiteSpace: 'nowrap' }}>排序</span>
      <select value={sort} onChange={e => onSort(e.target.value)}
        style={{ padding: '7px 10px', border: '0.5px solid var(--warm-border)', borderRadius: 4, fontFamily: "'Noto Sans TC', sans-serif", fontSize: 12, background: 'white', color: 'var(--ink)', outline: 'none', cursor: 'pointer' }}>
        <option value="newest">最新</option>
        <option value="popular">最多讚</option>
        <option value="rating">星等高低</option>
      </select>
    </div>
  )
}

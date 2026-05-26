import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { title, author } = await req.json()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: '你是一個書籍介紹助手。用繁體中文，以2-3句話簡潔介紹這本書的核心內容和價值。不要加任何前綴或解釋，直接給介紹文字。',
      messages: [{ role: 'user', content: `請介紹這本書：「${title}」${author ? `，作者：${author}` : ''}` }]
    })
  })

  const data = await res.json()
  const text = data.content?.find((b: any) => b.type === 'text')?.text || ''
  return NextResponse.json({ intro: text })
}

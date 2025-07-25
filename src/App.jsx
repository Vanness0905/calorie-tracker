// App.jsx
import { useState } from 'react'
import './index.css'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export default function App() {
  const [input, setInput] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  const total = records.reduce(
    (acc, r) => {
      acc.cal += r.calories || 0
      acc.protein += r.protein || 0
      acc.fat += r.fat || 0
      acc.carb += r.carbs || 0
      return acc
    },
    { cal: 0, protein: 0, fat: 0, carb: 0 }
  )

  async function analyzeFood() {
    if (!input.trim()) return
    setLoading(true)

    const prompt = `請幫我估算一份「${input}」的熱量與營養素（熱量、蛋白質、脂肪、碳水），輸出格式為 JSON 物件，像這樣：{ "name": "雞腿便當", "calories": 700, "protein": 35, "fat": 25, "carbs": 80 }`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    })

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    try {
      const json = JSON.parse(content)
      setRecords([...records, json])
      setInput('')
    } catch (e) {
      alert('無法解析回傳結果，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-yellow-50 text-gray-800 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🍱 食物熱量紀錄器</h1>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 p-2 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入今天吃的東西..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={analyzeFood}
            disabled={loading}
          >分析</button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">今日紀錄：</h2>
          {records.map((r, i) => (
            <div key={i} className="border-b py-2">
              <strong>{r.name}</strong><br/>
              熱量：{r.calories} kcal｜蛋白質：{r.protein}g｜脂肪：{r.fat}g｜碳水：{r.carbs}g
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-bold mb-1">📊 總計：</h3>
          熱量：{total.cal} kcal｜蛋白質：{total.protein}g｜脂肪：{total.fat}g｜碳水：{total.carb}g
        </div>
      </div>
    </main>
  )
}

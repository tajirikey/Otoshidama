'use client'

import { useEffect, useState } from 'react'
import './styles.css'

type Account = {
  id: string
  name: string
}

type Transaction = {
  id: string
  accountId: string
  type: 'income' | 'expense'
  date: string
  amount: number
  category: string
  memo: string
  createdAt: string
}

type AppData = {
  version: number
  accounts: Account[]
  activeAccountId: string
  transactions: Transaction[]
}

export default function Home() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/data')
      const { data: serverData } = await res.json()

      if (serverData) {
        setData(serverData)
      } else {
        // 初期データ
        const initialData: AppData = {
          version: 1,
          accounts: [
            { id: 'a', name: 'さや' },
            { id: 'b', name: 'せいや' },
          ],
          activeAccountId: 'a',
          transactions: [],
        }
        setData(initialData)
        await saveData(initialData)
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async (newData: AppData) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData }),
      })
      setData(newData)
    } catch (error) {
      console.error('保存エラー:', error)
    }
  }

  if (loading || !data) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <h2>お年玉管理</h2>
          <div className="spinner"></div>
          <div className="subtitle">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap">
      <header>
        <div className="title">
          <h1>お年玉管理</h1>
          <div className="sub">さやとせいやの共有アカウント</div>
        </div>

        <div className="seg">
          {data.accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className={data.activeAccountId === account.id ? 'active' : ''}
              onClick={() => {
                const newData = { ...data, activeAccountId: account.id }
                saveData(newData)
              }}
            >
              {account.name}
            </button>
          ))}
        </div>
      </header>

      <div className="card">
        <div className="inner">
          <p style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            アプリを実装中です...
            <br />
            <small>既存の機能を移行しています</small>
          </p>
        </div>
      </div>
    </div>
  )
}

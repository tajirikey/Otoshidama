'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const PASSWORD = 'sayasei3367'
const AUTH_KEY = 'otoshidama_auth'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(AUTH_KEY) === PASSWORD) {
      router.replace('/')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, PASSWORD)
      router.replace('/')
    } else {
      setError('パスワードが違います')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #e0f2fe 0%, #f8fafc 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(148,163,184,.25)',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,.08)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '20px', color: '#1e293b' }}>
          お年玉管理
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          夫婦で共有して管理
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
              共有パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              autoFocus
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: '1px solid rgba(148,163,184,.25)',
                background: '#f8fafc',
                color: '#1e293b',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.3)',
              color: '#ef4444',
              padding: '10px 12px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '12px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: '0',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

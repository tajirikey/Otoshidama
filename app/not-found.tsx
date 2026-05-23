export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b' }}>404</h1>
        <p style={{ color: '#64748b' }}>ページが見つかりません</p>
        <a href="/" style={{ color: '#3b82f6', marginTop: '16px', display: 'inline-block' }}>
          トップに戻る
        </a>
      </div>
    </div>
  )
}

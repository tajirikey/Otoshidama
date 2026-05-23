export default function TestPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>テストページ</h1>
      <p>このページが表示されれば、Vercelデプロイは正常に動作しています。</p>
      <p>タイムスタンプ: {new Date().toISOString()}</p>
      <a href="/">トップページへ</a>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PASSWORD = 'sayasei3367'
const AUTH_KEY = 'otoshidama_auth'

type Account = { id: string; name: string }
type TxType = 'income' | 'expense'
type Transaction = {
  id: string
  accountId: string
  type: TxType
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
type Period = 'year' | 'month' | 'all'

const STORAGE_KEY = 'otd_money_v1'
const fmtJPY = new Intl.NumberFormat('ja-JP', {
  style: 'currency', currency: 'JPY', maximumFractionDigits: 0
})

function defaultData(): AppData {
  return {
    version: 1,
    accounts: [
      { id: 'a', name: 'さや' },
      { id: 'b', name: 'せいや' },
    ],
    activeAccountId: 'a',
    transactions: [],
  }
}

function todayISO(){
  const d = new Date()
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`
}

function uid(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function formatRowDate(dateISO: string){
  if(!dateISO) return ''
  const m = Number(dateISO.slice(5,7))
  const d = Number(dateISO.slice(8,10))
  return `${m}/${d}`
}

export default function Home() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewPeriod, setViewPeriod] = useState<Period>('year')
  const [toastMsg, setToastMsg] = useState('')
  const [modal, setModal] = useState<null | {
    type: 'add' | 'list' | 'detail' | 'backup'
    txType?: TxType
    txId?: string
  }>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 認証チェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(AUTH_KEY) !== PASSWORD) {
        router.replace('/login')
        return
      }
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    if (authChecked) {
      loadData()
    }
  }, [authChecked])

  // ポーリングで他端末の更新を取得
  useEffect(() => {
    if(!data) return
    const interval = setInterval(() => {
      refreshFromServer()
    }, 5000)
    return () => clearInterval(interval)
  }, [data])

  async function loadData(){
    try{
      const res = await fetch('/api/data', { cache: 'no-store' })
      if(res.ok){
        const json = await res.json()
        if(json.data){
          setData(normalizeData(json.data))
          setLoading(false)
          return
        }
      }
    }catch(e){
      console.error('API読み込みエラー:', e)
    }

    // ローカルストレージから読み込み
    try{
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if(raw){
        setData(normalizeData(JSON.parse(raw)))
      }else{
        setData(defaultData())
      }
    }catch(e){
      setData(defaultData())
    }
    setLoading(false)
  }

  async function refreshFromServer(){
    try{
      const res = await fetch('/api/data', { cache: 'no-store' })
      if(res.ok){
        const json = await res.json()
        if(json.data){
          const newData = normalizeData(json.data)
          // 自分のデータより新しい場合は更新
          if(JSON.stringify(newData) !== JSON.stringify(data)){
            setData(newData)
          }
        }
      }
    }catch(e){
      // 無視
    }
  }

  function normalizeData(d: any): AppData{
    const defaults = defaultData()
    const result: AppData = {
      version: d.version || 1,
      accounts: Array.isArray(d.accounts) && d.accounts.length >= 2 ? d.accounts : defaults.accounts,
      activeAccountId: d.activeAccountId || 'a',
      transactions: Array.isArray(d.transactions) ? d.transactions : [],
    }
    // 名前を強制更新
    if(result.accounts.length >= 2){
      result.accounts[0].name = 'さや'
      result.accounts[1].name = 'せいや'
    }
    return result
  }

  async function saveData(newData: AppData){
    setData(newData)
    // ローカルストレージにも保存（フォールバック）
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    }catch(e){}
    // サーバーに保存
    try{
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData }),
      })
    }catch(e){
      console.error('保存エラー:', e)
    }
  }

  function toast(msg: string){
    setToastMsg(msg)
    if(toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800)
  }

  function handleLogout(){
    if(!confirm('ログアウトしますか？')) return
    localStorage.removeItem(AUTH_KEY)
    router.replace('/login')
  }

  if(!authChecked || loading || !data){
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

  const activeAccount = data.accounts.find(a => a.id === data.activeAccountId) || data.accounts[0]
  const filteredTx = filterTx(data.transactions, activeAccount.id, viewPeriod)
  const s = sums(filteredTx)
  const totalCount = data.transactions.filter(t => t.accountId === activeAccount.id).length

  const periodLabel = viewPeriod === 'year' ? '今年' : viewPeriod === 'month' ? '今月' : '全部'
  const meterPercent = s.income > 0 ? Math.max(0, Math.min(100, (s.balance / s.income) * 100)) : 0
  const meterClass = meterPercent < 30 ? 'danger' : meterPercent < 60 ? 'warn' : ''

  const recent = sortTxDesc(data.transactions.filter(t => t.accountId === activeAccount.id)).slice(0, 5)

  return (
    <>
      {toastMsg && <div className="toast">{toastMsg}</div>}

      <div className="wrap">
        <header>
          <div className="title">
            <h1>お年玉管理</h1>
            <div className="sub">さやとせいやの共有アカウント</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="seg">
              {data.accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  className={data.activeAccountId === account.id ? 'active' : ''}
                  onClick={() => saveData({ ...data, activeAccountId: account.id })}
                >
                  {account.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="card">
          <div className="inner">
            <div className="balance">
              <div>
                <div className="label">あといくら</div>
                <div className="amount">{fmtJPY.format(s.balance)}</div>
              </div>
              <div className="badge">{periodLabel}</div>
            </div>

            <div className="meter-wrap">
              <div className="meter-label">
                <span>残額メーター</span>
                <span className="ratio">{Math.round(meterPercent)}%</span>
              </div>
              <div className="meter">
                <div className={`meter-bar ${meterClass}`} style={{ width: `${meterPercent}%` }}></div>
              </div>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="k">入金合計</div>
                <div className="v income">{fmtJPY.format(s.income)}</div>
              </div>
              <div className="stat">
                <div className="k">支出合計</div>
                <div className="v expense">{fmtJPY.format(s.expense)}</div>
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={() => setModal({ type: 'add', txType: 'income' })}>入金を追加</button>
              <button className="btn" onClick={() => setModal({ type: 'add', txType: 'expense' })}>支出を追加</button>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="toolbar">
            <h2 style={{ margin: 0 }}>明細</h2>
            <button className="btn small ghost" onClick={() => setModal({ type: 'list' })}>一覧を見る</button>
          </div>

          <div className="card list">
            {recent.length === 0 ? (
              <div className="row" style={{ cursor: 'default' }}>
                <div className="left">
                  <div className="memo" style={{ maxWidth: '100%' }}>まだ記録がありません</div>
                  <div className="date">入金・支出を追加してください</div>
                </div>
                <div className="amt" style={{ color: 'var(--muted)' }}>—</div>
              </div>
            ) : recent.map(t => (
              <div key={t.id} className="row" onClick={() => setModal({ type: 'detail', txId: t.id })}>
                <div className="left">
                  <div className="topline">
                    <span className="date">{formatRowDate(t.date)}</span>
                    <span className="cat">{t.type === 'expense' && t.category ? t.category : (t.type === 'income' ? '入金' : '支出')}</span>
                    <span className="memo">{t.memo && t.memo.trim() ? t.memo : (t.type === 'income' ? '入金' : '支出')}</span>
                  </div>
                </div>
                <div className={`amt ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}{fmtJPY.format(t.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="footerline">
            <div>{activeAccount.name}：{totalCount}件</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn small ghost" onClick={() => setModal({ type: 'backup' })}>バックアップ</button>
              <button className="btn small ghost" onClick={handleLogout}>ログアウト</button>
            </div>
          </div>
        </div>
      </div>

      {modal?.type === 'add' && (
        <AddModal
          type={modal.txType!}
          data={data}
          viewPeriod={viewPeriod}
          onClose={() => setModal(null)}
          onSave={async (tx) => {
            const newData = { ...data, transactions: [...data.transactions, tx] }
            await saveData(newData)
            setModal(null)
            toast('保存しました')
          }}
        />
      )}

      {modal?.type === 'list' && (
        <ListModal
          data={data}
          viewPeriod={viewPeriod}
          onChangePeriod={setViewPeriod}
          onClose={() => setModal(null)}
          onDetail={(txId) => setModal({ type: 'detail', txId })}
          onAdd={(txType) => setModal({ type: 'add', txType })}
        />
      )}

      {modal?.type === 'detail' && modal.txId && (
        <DetailModal
          tx={data.transactions.find(t => t.id === modal.txId)!}
          onClose={() => setModal(null)}
          onDelete={async () => {
            const newData = { ...data, transactions: data.transactions.filter(t => t.id !== modal.txId) }
            await saveData(newData)
            setModal(null)
            toast('削除しました')
          }}
        />
      )}

      {modal?.type === 'backup' && (
        <BackupModal
          data={data}
          onClose={() => setModal(null)}
          onRestore={async (newData) => {
            await saveData(newData)
            setModal(null)
            toast('復元しました')
          }}
          onToast={toast}
        />
      )}
    </>
  )
}

function filterTx(transactions: Transaction[], accountId: string, period: Period){
  const tx = transactions.filter(t => t.accountId === accountId)
  if(period === 'all') return tx
  const now = new Date()
  const nowY = String(now.getFullYear())
  const nowM = String(now.getMonth()+1).padStart(2, '0')
  if(period === 'year') return tx.filter(t => (t.date || '').slice(0,4) === nowY)
  if(period === 'month') return tx.filter(t => (t.date || '').slice(0,7) === `${nowY}-${nowM}`)
  return tx
}

function sortTxDesc(list: Transaction[]){
  return [...list].sort((a, b) => {
    if(a.date !== b.date) return a.date > b.date ? -1 : 1
    return (b.createdAt || '') > (a.createdAt || '') ? 1 : -1
  })
}

function sums(list: Transaction[]){
  let income = 0, expense = 0
  for(const t of list){
    const amt = Number(t.amount) || 0
    if(t.type === 'income') income += amt
    else expense += amt
  }
  return { income, expense, balance: income - expense }
}

// 入金・支出追加モーダル
function AddModal({ type, data, viewPeriod, onClose, onSave }: {
  type: TxType
  data: AppData
  viewPeriod: Period
  onClose: () => void
  onSave: (tx: Transaction) => void
}){
  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('おもちゃ')
  const [memo, setMemo] = useState('')
  const isIncome = type === 'income'

  const inputAmt = Number(amount) || 0
  const showPreview = !isIncome && inputAmt > 0
  let previewBalance = 0
  let previewPercent = 0
  if(showPreview){
    const filteredTx = filterTx(data.transactions, data.activeAccountId, viewPeriod)
    const s = sums(filteredTx)
    previewBalance = s.balance - inputAmt
    previewPercent = s.income > 0 ? Math.max(0, Math.min(100, (previewBalance / s.income) * 100)) : 0
  }
  const previewClass = previewPercent < 30 ? 'danger' : previewPercent < 60 ? 'warn' : ''

  function handleSave(){
    const amt = Number(amount)
    if(!Number.isFinite(amt) || amt <= 0){
      alert('金額を入力してください')
      return
    }
    const tx: Transaction = {
      id: uid(),
      accountId: data.activeAccountId,
      type,
      date: date || todayISO(),
      amount: Math.floor(amt),
      category: isIncome ? '' : category,
      memo,
      createdAt: new Date().toISOString(),
    }
    onSave(tx)
  }

  return (
    <div className="overlay show" onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-header">
          <div className="h">{isIncome ? '入金を追加' : '支出を追加'}</div>
          <button className="x" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <div className="body">
          <div className="grid">
            <div className="field">
              <label>日付</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label>金額（円）</label>
              <input type="number" inputMode="numeric" min="0"
                placeholder="例：3000" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus />
            </div>
          </div>

          {!isIncome && (
            <div className="field full">
              <label>カテゴリ</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {['おもちゃ','本','ゲーム','おかし','外出','貯金','その他'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field full">
            <label>メモ（任意）</label>
            <textarea
              placeholder={isIncome ? "メモ（例：じいじ、ばあば など）" : "メモ（例：レゴ、絵本 など）"}
              value={memo}
              onChange={(e) => setMemo(e.target.value)} />
          </div>

          {showPreview && (
            <div className="preview-meter">
              <div className="title">使ったらあといくら？</div>
              <div className={`value ${previewBalance >= 0 ? 'positive' : 'negative'}`}>
                {fmtJPY.format(previewBalance)}
              </div>
              <div className="meter">
                <div className={`meter-bar ${previewClass}`} style={{ width: `${previewPercent}%` }}></div>
              </div>
            </div>
          )}

          <div className="hint">保存すると、残高と明細に反映されます。</div>
        </div>
        <div className="actionsRow">
          <button className="btn" onClick={onClose}>キャンセル</button>
          <button className="btn primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}

// 明細一覧モーダル
function ListModal({ data, viewPeriod, onChangePeriod, onClose, onDetail, onAdd }: {
  data: AppData
  viewPeriod: Period
  onChangePeriod: (p: Period) => void
  onClose: () => void
  onDetail: (txId: string) => void
  onAdd: (type: TxType) => void
}){
  const activeAccount = data.accounts.find(a => a.id === data.activeAccountId) || data.accounts[0]
  const list = sortTxDesc(filterTx(data.transactions, activeAccount.id, viewPeriod))
  const periodLabel = viewPeriod === 'year' ? '今年' : viewPeriod === 'month' ? '今月' : '全部'

  return (
    <div className="overlay show" onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-header">
          <div className="h">{activeAccount.name}の明細（{periodLabel}）</div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div className="toolbar" style={{ marginBottom: 8 }}>
            <div className="chips">
              {(['year','month','all'] as Period[]).map(p => (
                <button key={p} type="button"
                  className={`chip ${viewPeriod === p ? 'active' : ''}`}
                  onClick={() => onChangePeriod(p)}>
                  {p === 'year' ? '今年' : p === 'month' ? '今月' : '全部'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn small primary" onClick={() => onAdd('income')}>入金</button>
              <button className="btn small" onClick={() => onAdd('expense')}>支出</button>
            </div>
          </div>

          <div className="card list">
            {list.length === 0 ? (
              <div className="row" style={{ cursor: 'default' }}>
                <div className="left">
                  <div className="memo" style={{ maxWidth: '100%' }}>この期間の記録がありません</div>
                  <div className="date">期間を切り替えるか、追加してください</div>
                </div>
                <div className="amt" style={{ color: 'var(--muted)' }}>—</div>
              </div>
            ) : list.map(t => (
              <div key={t.id} className="row" onClick={() => onDetail(t.id)}>
                <div className="left">
                  <div className="topline">
                    <span className="date">{formatRowDate(t.date)}</span>
                    <span className="cat">{t.type === 'expense' && t.category ? t.category : (t.type === 'income' ? '入金' : '支出')}</span>
                    <span className="memo">{t.memo && t.memo.trim() ? t.memo : (t.type === 'income' ? '入金' : '支出')}</span>
                  </div>
                </div>
                <div className={`amt ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}{fmtJPY.format(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="actionsRow">
          <button className="btn" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}

// 詳細モーダル
function DetailModal({ tx, onClose, onDelete }: {
  tx: Transaction
  onClose: () => void
  onDelete: () => void
}){
  const cat = tx.type === 'expense' && tx.category ? tx.category : (tx.type === 'income' ? '入金' : '支出')
  const memo = tx.memo && tx.memo.trim() ? tx.memo : '—'

  return (
    <div className="overlay show" onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-header">
          <div className="h">明細の詳細</div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div className="card" style={{ boxShadow: 'none', background: 'var(--card2)' }}>
            <div className="inner" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 900 }}>
                    {tx.date} / {cat}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>
                    {memo}
                  </div>
                </div>
                <div className={`amt ${tx.type}`} style={{ fontSize: 16 }}>
                  {tx.type === 'income' ? '+' : '-'}{fmtJPY.format(tx.amount)}
                </div>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="hint">※削除すると元に戻せません。</div>
        </div>
        <div className="actionsRow">
          <button className="btn" onClick={onClose}>閉じる</button>
          <button className="btn danger" onClick={onDelete}>削除</button>
        </div>
      </div>
    </div>
  )
}

// バックアップモーダル
function BackupModal({ data, onClose, onRestore, onToast }: {
  data: AppData
  onClose: () => void
  onRestore: (data: AppData) => void
  onToast: (msg: string) => void
}){
  const [text, setText] = useState(JSON.stringify(data))

  async function handleCopy(){
    try{
      await navigator.clipboard.writeText(text)
      onToast('コピーしました')
    }catch(e){
      onToast('コピーできませんでした')
    }
  }

  function handleRestore(){
    try{
      const parsed = JSON.parse(text)
      if(!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)){
        throw new Error('shape')
      }
      onRestore(parsed)
    }catch(e){
      onToast('復元できません（形式を確認してください）')
    }
  }

  return (
    <div className="overlay show" onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-header">
          <div className="h">バックアップ</div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div className="hint">念のため、データをコピーしてメモ等に保存できます。復元もできます。</div>
          <div className="field full">
            <label>データ（JSON）</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </div>
        <div className="actionsRow">
          <button className="btn" onClick={onClose}>閉じる</button>
          <button className="btn primary" onClick={handleCopy}>コピー</button>
          <button className="btn" onClick={handleRestore}>復元</button>
        </div>
      </div>
    </div>
  )
}

# お年玉管理アプリ

2つのアカウント（さや・せいや）でお年玉の入金・支出を管理できるWebアプリです。

## 特徴

- **ログイン機能**: メール/パスワードでログインして複数端末でデータを共有
- **2アカウント対応**: 複数の子どものお年玉を別々に管理できます
- **期間フィルター**: 今年・今月・全期間での集計が可能です
- **残額メーター**: 視覚的に残額を確認できます
- **リアルタイム同期**: Firestoreでデータを自動同期
- **PWA対応**: iPhoneのSafariで「ホーム画面に追加」するとアプリのように使えます

## Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication を有効化（メール/パスワード認証を有効に）
3. Firestore Database を作成（テストモードで開始）
4. プロジェクト設定から Firebase SDK の設定値を取得
5. `index.html` の Firebase 設定部分を自分のプロジェクト情報に更新

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## デプロイ方法

### Vercelへのデプロイ

1. このリポジトリをGitHubにプッシュ
2. [Vercel](https://vercel.com)にアクセスしてログイン
3. 「New Project」をクリック
4. GitHubリポジトリを選択
5. プロジェクト設定はデフォルトのまま「Deploy」をクリック

デプロイが完了すると、VercelからURLが発行されます。

### ローカルでの使用

`index.html` をブラウザで直接開くだけで使用できます。

## 使い方

1. **アカウント切り替え**: 画面上部の「子どもA」「子どもB」ボタンでアカウントを切り替え
2. **入金追加**: 「入金を追加」ボタンから、お年玉の入金を記録
3. **支出追加**: 「支出を追加」ボタンから、使ったお金を記録
4. **明細確認**: 「一覧を見る」で全ての取引を確認
5. **バックアップ**: 「バックアップ」ボタンからデータをコピー・復元

## 技術スタック

- HTML5
- CSS3 (カスタムプロパティ、グリッドレイアウト)
- JavaScript (ES6+)
- LocalStorage API

## ライセンス

MIT

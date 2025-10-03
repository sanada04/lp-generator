# デプロイメントガイド

このLPジェネレーターを公開するための手順を説明します。

## 1. Vercel（推奨）での公開

### 事前準備
1. GitHubアカウントを作成
2. このプロジェクトをGitHubリポジトリにプッシュ

### 手順
1. [vercel.com](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ
3. "New Project" をクリック
4. このリポジトリを選択
5. 設定を確認して "Deploy" をクリック
6. 数分でデプロイ完了！

### メリット
- 無料で使用可能
- 自動デプロイ（GitHubにプッシュするたびに自動更新）
- 高速なCDN
- カスタムドメイン設定可能

## 2. Netlifyでの公開

### 手順
1. [netlify.com](https://netlify.com) にアクセス
2. GitHubアカウントでサインアップ
3. "New site from Git" をクリック
4. このリポジトリを選択
5. ビルド設定：
   - Build command: `npm install`
   - Publish directory: `public`
6. "Deploy site" をクリック

## 3. Herokuでの公開

### 手順
1. [heroku.com](https://heroku.com) にアクセス
2. アカウントを作成
3. Heroku CLIをインストール
4. 以下のコマンドを実行：

```bash
# Herokuにログイン
heroku login

# アプリを作成
heroku create your-app-name

# 環境変数を設定（必要に応じて）
heroku config:set NODE_ENV=production

# デプロイ
git push heroku main
```

## 4. レンタルサーバーでの公開

### さくらインターネット
1. レンタルサーバーを契約
2. Node.jsが利用可能なプランを選択
3. ファイルをアップロード
4. ドメインを設定

### ロリポップ
1. レンタルサーバーを契約
2. Node.js対応プランを選択
3. ファイルをアップロード
4. ドメインを設定

## 5. カスタムドメインの設定

### Vercel
1. Vercelダッシュボードでプロジェクトを選択
2. "Settings" → "Domains" をクリック
3. ドメインを追加
4. DNS設定を更新

### Netlify
1. Netlifyダッシュボードでサイトを選択
2. "Domain settings" をクリック
3. カスタムドメインを追加
4. DNS設定を更新

## 6. 環境変数の設定

本番環境で使用する環境変数を設定：

```bash
# Vercel
vercel env add NODE_ENV production

# Heroku
heroku config:set NODE_ENV=production
```

## 7. セキュリティの考慮事項

- 本番環境ではHTTPSを使用
- 環境変数で機密情報を管理
- 定期的なセキュリティアップデート
- アクセスログの監視

## 8. パフォーマンスの最適化

- 画像の最適化
- CDNの活用
- キャッシュの設定
- 圧縮の有効化

## トラブルシューティング

### よくある問題
1. **ポートエラー**: 環境変数PORTを設定
2. **依存関係エラー**: package.jsonを確認
3. **ファイルパスエラー**: 相対パスを確認

### ログの確認
```bash
# Vercel
vercel logs

# Heroku
heroku logs --tail
```

## サポート

問題が発生した場合は、以下の情報を含めてお問い合わせください：
- 使用しているデプロイメントサービス
- エラーメッセージ
- ログファイル
- 環境情報

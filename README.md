# soudan-shien-tools スターターキット（パターンB版）

「四国回線シミュレーター」と同じ構成（CF DNS → Custom Domain → CF Worker直結）です。
ロリポップ・.htaccess・index.phpは一切不要です。

## フォルダの中身

```
soudan-shien-starter/
├── .github/workflows/deploy.yml   ← GH Actions（手動デプロイ）
├── build.py                        ← distフォルダ生成スクリプト
├── wrangler.json                   ← CF Worker設定
└── index.html                      ← 疎通確認用の仮ページ（noindex付き）
```

## 進め方チェックリスト

### 1. GitHubリポジトリを作る
- [ ] 新規リポジトリを作成（例：`soudan-shien-tools`）
- [ ] このフォルダの中身一式をpush

### 2. wrangler.json の name を決める
- [ ] `"name"` を、実際に使いたいCF Worker名に書き換える
      （仮に `soudan-shien-tools` としています。既存プロジェクト名と重複しないよう注意）

### 3. GitHub Secrets を設定
- [ ] リポジトリの Settings → Secrets and variables → Actions
- [ ] `CLOUDFLARE_API_TOKEN` を登録（既存プロジェクトで使っているものと同じでOK）

### 4. 手動デプロイを実行
- [ ] GitHub の Actions タブ → 「Deploy One Step to Cloudflare Workers」→ Run workflow
- [ ] 緑チェックがついたら成功

### 5. カスタムドメインを追加（つまづきメモのパターンBの手順そのまま）
- [ ] CFダッシュボード → Workers & Pages → 該当Worker
- [ ] 「ドメイン」タブ → 「+ ドメインを追加」
- [ ] サブドメインを入力（例：`soudan-shien.pray-power-is-god-and-cocoro.com`）
- [ ] 「ドメインを追加」をクリック → CFが自動でDNSレコードを作成
- [ ] 既存の `for-welfare` 等、他のサブドメインには一切影響なし

### 6. 表示確認
- [ ] 追加したカスタムドメインのURLにアクセスし、index.htmlの仮ページが表示されるか確認
- [ ] 表示されない場合は、CFの「ドメイン」タブでステータス（アクティブ化されているか）を確認

### 7. ここまで確認できたら
- [ ] `index.html` を実際の中身（モニタリング期限管理の記事＋ツール）に差し替えていく
- [ ] 完成するまでは `noindex, nofollow` を維持
- [ ] 公開準備が整ったら `noindex, nofollow` を削除

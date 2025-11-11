# コミット内容まとめ

## 今回の変更概要

Gatsby.jsブログからAstro v5への移行環境を構築しました。

## コミットすべきファイル

### 1. 設定ファイル
- ✅ `src/config.ts` - サイト設定（author, timezone, 言語を日本語に）
- ✅ `package.json` - 依存パッケージ追加（gray-matter, glob, fs-extra）

### 2. ルーティング変更
- ✅ `src/pages/[...slug]/index.astro` - `/posts/*` → `/*` に変更
- ✅ `src/pages/page/[...page].astro` - ページング
- ✅ `src/utils/getPath.ts` - `/posts` プレフィックス削除
- ✅ `src/components/Header.astro` - リンク修正
- ✅ `src/pages/index.astro` - リンク修正

### 3. 移行スクリプト
- ✅ `scripts/migrate-from-gatsby.cjs` - Gatsby→Astro変換スクリプト

### 4. ドキュメント
- ✅ `.claude/CLAUDE.md` - プロジェクト固有ルール
- ✅ `.workspace/migration-plan.md` - 移行プラン
- ✅ `.workspace/immediate-migration-plan.md` - 即時移行プラン
- ✅ `.workspace/routing-changes.md` - ルーティング変更
- ✅ `.workspace/embed-analysis.md` - 埋め込み分析
- ✅ `.workspace/embed-without-integration.md` - 埋め込み対応方針

## コミットから除外すべきもの

### 1. コンテンツファイル
- ❌ `src/data/blog/2014/` ~ `src/data/blog/2024/` - 全記事
- ❌ `public/assets/images/blog/` - 全画像

### 2. ビルド成果物
- ❌ `dist/`
- ❌ `logs/`

### 3. サンプル記事（削除済み）
- ❌ `src/data/blog/_examples/`
- ❌ `src/data/blog/_releases/`
- ❌ `src/data/blog/examples/`

## .gitignore に追加すべき項目

```gitignore
# コンテンツディレクトリ（別リポジトリで管理）
src/data/blog/20*/
public/assets/images/blog/

# 移行ログ
logs/

# リソースディレクトリ（一時的な移行元）
res/
```

## ワークフロー想定

1. **コンテンツリポジトリ**でブログ記事を管理・コミット
2. **GitHub Actions等**でこのリポジトリをチェックアウト
3. **移行スクリプト実行**: `node scripts/migrate-from-gatsby.cjs`
4. **ビルド**: `npm run build`
5. **デプロイ**: `dist/` を公開

## 推奨 .gitignore 追加内容

コンテンツとビルド成果物を除外するため、以下を追加：

```gitignore
# Blog content (managed in separate repository)
src/data/blog/201*/
src/data/blog/202*/
public/assets/images/blog/

# Migration logs
logs/

# Source content (temporary migration source)
res/
```

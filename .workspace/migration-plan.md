# Gatsby.js → Astro コンテンツインポートプラン

## プロジェクト概要

Gatsby.jsで構築された既存ブログ（`res/blog.yucchiy.com/`）のコンテンツをAstro v5ブログにインポートする。

## 現状分析

### ソースコンテンツ
- **場所**: `res/blog.yucchiy.com/articles/`
- **総数**: 375件のMarkdownファイル
- **構造**: `YYYY/MM/article-slug/index.{md,markdown}` + 画像ファイル
- **年代**: 2014年〜2024年
- **特殊ディレクトリ**:
  - `profile/` - プロフィールページ
  - `project/` - プロジェクト紹介（unity-weekly含む）
  - `styleguide/` - スタイルガイド

### ターゲット構造
- **場所**: `src/data/blog/`
- **構造**: フラット構造の単一MDファイル
- **Content Collection**: `blog` (src/content.config.ts で定義)

## 主要な差異

### Frontmatter

| 項目 | Gatsby (現在) | Astro (移行先) | 変換方法 |
|------|--------------|----------------|----------|
| 日付 | `date: "2020-12-16T05:00:00+09:00"` | `pubDatetime: 2020-12-16T05:00:00+09:00` | フィールド名変更 |
| タイトル | `title: "記事タイトル"` | `title: "記事タイトル"` | そのまま |
| タグ | `tags: ["Tag1", "Tag2"]` | `tags: ["tag1", "tag2"]` | 小文字に正規化 |
| 下書き | `draft: false` | `draft: false` | そのまま（デフォルトはfalse） |
| 説明文 | なし | `description: "..."` (必須) | 記事の最初の段落から自動生成 |
| 著者 | なし | `author: "向井 祐一郎"` | デフォルト値を追加 |
| 種別 | `type: "page"` (一部) | featured等のフラグ | 変換・判定 |

### ファイル構造

**Before (Gatsby)**:
```
res/blog.yucchiy.com/articles/
└── 2020/
    └── 12/
        └── airpods-pro/
            ├── index.markdown
            ├── airpods.jpg
            └── shortcuts.jpeg
```

**After (Astro)**:
```
src/data/blog/
└── 2020-12-airpods-pro.md

public/assets/images/blog/
└── 2020/
    └── 12/
        └── airpods-pro/
            ├── airpods.jpg
            └── shortcuts.jpeg
```

### 画像パス

**Before**: `![AirPods Max](./airpods.jpg)`
**After**: `![AirPods Max](/assets/images/blog/2020/12/airpods-pro/airpods.jpg)`

## 実装タスク

### Phase 1: 環境準備とスクリプト開発

#### Task 1-1: 移行スクリプトの作成
- [ ] `scripts/migrate-from-gatsby.js` を作成
- [ ] 必要な依存関係のインストール（gray-matter, glob等）
- [ ] ドライラン機能の実装

#### Task 1-2: Frontmatter変換ロジック
- [ ] `date` → `pubDatetime` 変換
- [ ] タイムゾーン情報の保持（+09:00）
- [ ] `description` の自動生成（最初の段落または本文の最初の100-150文字）
- [ ] `author` のデフォルト値設定
- [ ] タグの正規化（小文字変換）
- [ ] `slug` の生成（元のディレクトリパスから）

#### Task 1-3: ファイル名変換ロジック
- [ ] `YYYY/MM/article-slug/index.{md,markdown}` → `YYYY-MM-article-slug.md`
- [ ] 拡張子の統一（`.md`）
- [ ] ファイル名の衝突チェック

#### Task 1-4: 画像処理ロジック
- [ ] 画像ファイルの検出
- [ ] `public/assets/images/blog/YYYY/MM/slug/` への移動
- [ ] Markdown内の相対パスを絶対パスに変換
- [ ] 画像ファイルの存在確認

### Phase 2: テスト移行

#### Task 2-1: サンプル記事での検証
- [ ] 既存サンプル記事を `src/data/blog/_examples/` に移動
- [ ] 2-3記事を選定してテスト移行
  - 画像あり記事
  - 画像なし記事
  - コードブロック含む記事
- [ ] dev環境での表示確認
- [ ] Astroスキーマバリデーション実行

#### Task 2-2: 問題点の洗い出しと修正
- [ ] エラーログの確認
- [ ] レイアウト崩れのチェック
- [ ] リンク切れの確認
- [ ] スクリプトの修正

### Phase 3: 本番移行

#### Task 3-1: 全記事の移行
- [ ] 全375記事の変換実行
- [ ] ログファイルの保存
- [ ] エラー記事のリスト化

#### Task 3-2: 特殊コンテンツの処理
- [ ] `profile/index.markdown` → 静的ページまたはAboutページとして作成
- [ ] `project/` 配下の処理方針決定
  - `unity-weekly/` は別途検討（約240記事）
  - その他のプロジェクト紹介
- [ ] `styleguide/` の必要性判断

#### Task 3-3: バリデーションとクリーンアップ
- [ ] 全記事のビルド確認（`npm run build`）
- [ ] リンク切れチェック
- [ ] 画像の表示確認（ランダムサンプリング）
- [ ] タグ一覧の確認と整理
- [ ] 不要なサンプル記事の削除

### Phase 4: 最適化と調整

#### Task 4-1: SEO対策
- [ ] OGP画像の設定
- [ ] description の品質確認
- [ ] canonical URL の設定（必要に応じて）

#### Task 4-2: パフォーマンス最適化
- [ ] 画像の最適化（サイズ、フォーマット）
- [ ] Astro Image統合の検討

#### Task 4-3: 最終確認
- [ ] 本番ビルドの実行
- [ ] デプロイテスト
- [ ] 主要記事の表示確認

## 技術仕様

### 移行スクリプト仕様

```javascript
// scripts/migrate-from-gatsby.js の基本構造

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

const SOURCE_DIR = 'res/blog.yucchiy.com/articles';
const TARGET_BLOG_DIR = 'src/data/blog';
const TARGET_IMAGE_DIR = 'public/assets/images/blog';
const DEFAULT_AUTHOR = '向井 祐一郎';

async function migrateArticles(dryRun = true) {
  // 1. 記事ファイルの検出
  // 2. Frontmatter変換
  // 3. 画像処理
  // 4. ファイル出力
  // 5. ログ出力
}
```

### Frontmatter変換例

**Before**:
```yaml
---
date: "2020-12-16T05:00:00+09:00"
draft: false
title: "AirPods Proを購入した"
tags: ["Gadget"]
---
```

**After**:
```yaml
---
author: 向井 祐一郎
pubDatetime: 2020-12-16T05:00:00+09:00
title: "AirPods Proを購入した"
slug: 2020-12-airpods-pro
draft: false
tags:
  - gadget
description: タイトル通りだが、AirPods Proが欲しくなったので購入した。クレジットカードのポイントが結構溜まってたので経由で購入した。
---
```

## 注意事項

### 必須確認事項
- タイムゾーン情報（+09:00）の保持
- 日本語文字コード（UTF-8）の維持
- コードブロックのシンタックスハイライト言語指定の保持
- 内部リンクの整合性

### リスク管理
- 大量ファイル操作のため、必ずバックアップを取る
- ドライランで事前確認を徹底
- エラーログを詳細に記録
- 段階的な移行で問題の早期発見

### 移行対象外
- gitコミット履歴（新ブログで新規開始）
- コメント機能（別途実装検討）
- アクセス解析データ

## 進捗管理

- [ ] Phase 1: 環境準備とスクリプト開発
- [ ] Phase 2: テスト移行
- [ ] Phase 3: 本番移行
- [ ] Phase 4: 最適化と調整

## 備考

- このプランは `.workspace/migration-plan.md` で管理
- 進捗や問題点は随時このドキュメントに追記
- スクリプトは `scripts/` ディレクトリで管理

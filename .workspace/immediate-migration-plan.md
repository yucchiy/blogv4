# コンテンツ即時移行プラン

## 調査結果サマリ

### Gatsby側（ソース）
- **記事数**: 375件のMarkdownファイル
- **画像数**: 472ファイル
- **拡張子**: `.md` と `.markdown` が混在
- **構造**: `YYYY/MM/article-slug/index.{md,markdown}` + 同ディレクトリ内に画像

### Gatsby Frontmatter パターン

#### パターン1: シンプル（画像なし）
```yaml
---
date: "2019-12-27T07:00:00+09:00"
draft: false
title: "Unityでファイルパスを扱う上での注意点"
tags: ["Tips", "C#", "Unity"]
---
```

#### パターン2: type + description + eyecatch（画像あり）
```yaml
---
type: "diary"
title: "椅子を新調した"
description: "新卒入社に、東京に引っ越した直後に買った安い椅子が..."
tags: ["作業環境"]
date: "2022-05-30T06:00:00"
eyecatch: "./776A7D4A90055A4321C59C5753BEADD1.jpeg"
---
```

#### パターン3: type + description（アイキャッチなし）
```yaml
---
type: "memo"
title: "Notionインポートテスト"
description: "これはNotionからインポートした記事を..."
tags: ["Notion"]
date: "2022-04-01T00:00:00"
---
```

### Astro側（ターゲット）

#### Content Collection Schema（必須フィールド）
```typescript
{
  author: string (default: SITE.author),
  pubDatetime: Date, // 必須
  modDatetime?: Date | null,
  title: string, // 必須
  featured?: boolean,
  draft?: boolean,
  tags: string[] (default: ["others"]),
  ogImage?: image | string,
  description: string, // 必須
  canonicalURL?: string,
  hideEditPost?: boolean,
  timezone?: string
}
```

#### 重要な設定
- **Blog Path**: `src/data/blog`
- **Pattern**: `**/[^_]*.md` (アンダースコアで始まるファイルは無視)
- **サブディレクトリ対応**: v5.1.0以降はサブディレクトリ可能、URLに反映される
- **Default Author**: "Sat Naing" → "向井 祐一郎" に変更必要
- **Default Timezone**: "Asia/Bangkok" → "Asia/Tokyo" に変更必要

## 移行戦略

### フェーズ1: 環境設定（5分）

1. **SITE設定の更新**
   - `src/config.ts` の `author` を "向井 祐一郎" に変更
   - `timezone` を "Asia/Tokyo" に変更
   - その他のサイト情報を更新

2. **既存サンプル記事の整理**
   - `src/data/blog/` 内の既存記事を `src/data/blog/_examples/` に移動
   - アンダースコアで始まるディレクトリは読み込まれないため

### フェーズ2: 移行スクリプト作成（30-40分）

#### スクリプト仕様

**ファイル名**: `scripts/migrate-from-gatsby.js`

**主要機能**:

1. **記事ファイルの検出と変換**
   - `res/blog.yucchiy.com/articles/` 配下を再帰的に走査
   - `index.md` または `index.markdown` を対象
   - profile/, styleguide/ は除外

2. **Frontmatter変換ロジック**
   ```javascript
   const convertFrontmatter = (gatsbyFm, articlePath, content) => {
     return {
       author: "向井 祐一郎",
       pubDatetime: new Date(gatsbyFm.date),
       title: gatsbyFm.title,
       slug: generateSlug(articlePath), // YYYY-MM-article-slug
       draft: gatsbyFm.draft || false,
       tags: (gatsbyFm.tags || []).map(tag => tag.toLowerCase()),
       description: gatsbyFm.description || extractDescription(content),
       featured: gatsbyFm.type === "featured", // 任意の条件
     };
   };
   ```

3. **description自動生成**
   - 既存の `description` があればそれを使用
   - なければ本文の最初の段落から生成
   - HTML/Markdown記法を除去
   - 100-150文字に制限

4. **slug生成ルール**
   - `2019/12/filepath-in-unity` → `2019-12-filepath-in-unity`
   - 一意性を保証

5. **ファイル出力パス**
   - `src/data/blog/YYYY/MM-article-slug.md`
   - 年ごとにサブディレクトリ作成（URL: `/posts/YYYY/MM-article-slug`）

6. **画像処理**
   - 同ディレクトリ内の画像を検出
   - `public/assets/images/blog/YYYY/MM/article-slug/` にコピー
   - Markdown内の相対パス `./image.jpg` を `/assets/images/blog/YYYY/MM/article-slug/image.jpg` に置換

7. **エラーハンドリング**
   - 各記事の処理を try-catch で囲む
   - エラーが発生しても他の記事の処理を継続
   - エラーログを `logs/migration-error-YYYYMMDD-HHmmss.log` に保存

8. **ドライランモード**
   - `--dry-run` フラグで実際の書き込みなしで動作確認
   - 変換結果をコンソールに出力

9. **テストモード**
   - `--test` フラグで少数の記事のみ処理
   - `--limit N` で処理数を指定（デフォルト: 3）

#### 依存パッケージ

```bash
npm install --save-dev gray-matter glob fs-extra
```

- `gray-matter`: Frontmatterのパース
- `glob`: ファイル検索
- `fs-extra`: ファイル操作

### フェーズ3: テスト移行（10分）

#### テスト対象記事（3記事）

1. **画像なし・シンプル**: `2019/12/filepath-in-unity`
2. **画像あり・description + eyecatch**: `2022/05/new-my-chair`
3. **画像あり・description**: `2022/04/test-page-imported-from-notion`

#### 実行手順

```bash
# ドライランで確認
node scripts/migrate-from-gatsby.js --dry-run --test --limit 3

# 問題なければ実行
node scripts/migrate-from-gatsby.js --test --limit 3

# dev環境で確認
# すでに http://localhost:4321/ で起動中
```

#### 確認項目

- [ ] 記事が http://localhost:4321/posts/YYYY/MM-article-slug で表示される
- [ ] タイトル、日付、タグが正しく表示される
- [ ] 画像が正しく表示される
- [ ] コードブロックのシンタックスハイライトが動作する
- [ ] 日本語が正しく表示される
- [ ] ビルドエラーが発生しない

```bash
npm run build
```

### フェーズ4: 問題修正（10-20分）

テスト移行で発見された問題を修正：
- スクリプトの調整
- スキーマ違反の修正
- 画像パスの調整
- 特殊文字のエスケープ

### フェーズ5: 本番移行（5分 + 検証時間）

#### 準備

```bash
# 既存のテスト記事を削除
rm -rf src/data/blog/2019 src/data/blog/2022

# または全クリア
rm -rf src/data/blog/*
mkdir -p src/data/blog/_examples
mv src/data/blog/*.md src/data/blog/_examples/ 2>/dev/null || true
```

#### 実行

```bash
# 全記事を移行（ドライランで最終確認）
node scripts/migrate-from-gatsby.js --dry-run

# 本番実行
node scripts/migrate-from-gatsby.js

# ログ確認
cat logs/migration-*.log
```

#### 検証

```bash
# ビルドが通るか確認
npm run build

# dev環境で確認
# http://localhost:4321/ でトップページを確認
# 記事一覧が表示されるか
# いくつかの記事をランダムに開いて確認
```

## スクリプト実装の優先順位

### 最小限の実装（まずdev環境で見れるようにする）

1. **Frontmatter変換** (必須)
   - date → pubDatetime
   - title (そのまま)
   - tags (小文字化)
   - description (既存またはダミー"記事の説明")

2. **ファイル出力** (必須)
   - `src/data/blog/YYYY/MM-article-slug.md` に出力

3. **基本的なエラーハンドリング** (必須)

### 後回しでも良い機能

- 画像処理（最初は画像なし記事だけ移行してもOK）
- 高度なdescription生成
- エラーログファイル出力
- 詳細な統計情報

## タイムライン（最短）

| フェーズ | 所要時間 | 累積時間 |
|---------|---------|---------|
| 1. 環境設定 | 5分 | 5分 |
| 2. スクリプト作成（最小実装） | 30分 | 35分 |
| 3. テスト移行（3記事） | 10分 | 45分 |
| 4. 問題修正 | 10-20分 | 55-65分 |
| 5. 本番移行 | 5分 + 検証 | 60-70分 |

**目標**: 1時間以内にdev環境でコンテンツを確認できる状態にする

## 次のステップ

このプランで進めてよろしいですか？
特に以下の点について確認させてください：

1. **URLの構造**: `/posts/YYYY/MM-article-slug` で良いか？
2. **画像処理**: 最初のテストから含めるか、後回しにするか？
3. **profile/ や project/ の扱い**: 今回は除外して後で手動対応で良いか？

承認いただければ、すぐにフェーズ1から実装を開始します。

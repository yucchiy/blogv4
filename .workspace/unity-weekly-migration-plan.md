# Unity Weekly 移行プラン

## UnityWeeklyの現状分析

### ディレクトリ構造
```
res/blog.yucchiy.com/articles/project/unity-weekly/
├── 005/
│   ├── index.markdown
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── 006/
├── ...
└── 247/
```

### 基本情報
- **記事総数**: 240記事
- **配置場所**: `res/blog.yucchiy.com/articles/project/unity-weekly/NNN/`
- **URLパターン**: `/project/unity-weekly/NNN/` (例: `/project/unity-weekly/192/`)
- **記事番号**: 005 ~ 247（連番に欠番あり）
- **画像**: 各記事ディレクトリ内に配置（古い記事には画像多数、新しい記事は画像なしが多い）

### Frontmatterの特徴

#### 新しい記事(#192)の例
```yaml
---
type: "unity-weekly"
title: "Unity Weekly 192"
description: "2024/09/30週のUnity Weeklyです。..."
tags: ["Unity Weekly", "Unity"]
date: "2024-10-01T00:00:01"
---
```

#### 古い記事(#005)の例
```yaml
---
type: "unity-weekly"
title: "Unity Weekly #005"
date: "2021-03-16T15:00:00+09:00"
draft: false
---
```

### 特徴
- `type: "unity-weekly"` という専用フィールドがある
- 古い記事は `description` がない
- 古い記事には大量の画像が含まれる（例: #005には7つのPNG/GIF）
- 新しい記事は画像がほぼない

## 移行方針

### 1. URL構造の維持
Gatsbyと同じURL構造を維持する必要があります：
- **現在のURL**: `https://blog.yucchiy.com/project/unity-weekly/192/`
- **移行後のURL**: `https://blog.yucchiy.com/project/unity-weekly/192/`

これは通常のブログ記事（`/YYYY/MM/slug/`）とは異なるURL構造です。

### 2. Astroでの実装方法

#### オプションA: 別コレクションとして管理（推奨）

**メリット**:
- ブログ記事とUnityWeeklyを明確に分離できる
- タイプごとに異なるスキーマを適用できる
- クエリ・フィルタリングが簡単
- 将来的な拡張性が高い

**実装**:
```typescript
// src/content.config.ts
import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' }),
  schema: z.object({
    // 既存のブログスキーマ
  }),
});

const unityWeekly = defineCollection({
  loader: glob({ pattern: '**/*.{md,markdown}', base: './src/data/unity-weekly' }),
  schema: z.object({
    type: z.literal('unity-weekly'),
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default(['Unity Weekly', 'Unity']),
    pubDatetime: z.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, unityWeekly };
```

**ディレクトリ構造**:
```
src/data/
├── blog/           # 通常のブログ記事
│   ├── 2014/
│   ├── 2015/
│   └── ...
└── unity-weekly/   # UnityWeekly専用
    ├── 192.md
    ├── 005.md
    └── ...
```

**画像配置**:
```
public/assets/images/
├── blog/           # 通常のブログ記事の画像
│   ├── 2014/
│   └── ...
└── unity-weekly/   # UnityWeekly専用画像
    ├── 192/
    ├── 005/
    │   ├── 01.png
    │   ├── 02.png
    │   └── ...
    └── ...
```

**ルーティング**:
```astro
// src/pages/project/unity-weekly/[number]/index.astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const unityWeeklyPosts = await getCollection('unityWeekly');

  return unityWeeklyPosts.map(post => ({
    params: { number: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Layout>
  <article>
    <h1>{post.data.title}</h1>
    <Content />
  </article>
</Layout>
```

#### オプションB: 同一コレクションで管理（シンプル）

**メリット**:
- 実装がシンプル
- 移行スクリプトの変更が少ない

**デメリット**:
- ブログ記事とUnityWeeklyが混在する
- スキーマが複雑になる
- URL構造の違いを吸収するロジックが必要

### 3. 移行スクリプトの拡張

既存の `scripts/migrate-from-gatsby.cjs` を拡張して、UnityWeeklyにも対応します。

#### 新しい設定
```javascript
const SOURCE_DIR = 'res/blog.yucchiy.com/articles';
const TARGET_BLOG_DIR = 'src/data/blog';
const TARGET_UNITY_WEEKLY_DIR = 'src/data/unity-weekly';
const TARGET_IMAGE_DIR = 'public/assets/images/blog';
const TARGET_UNITY_WEEKLY_IMAGE_DIR = 'public/assets/images/unity-weekly';

// 除外するディレクトリを更新（projectは除外しない）
const EXCLUDE_DIRS = ['profile', 'styleguide'];
```

#### UnityWeekly専用の処理
```javascript
function isUnityWeekly(articlePath) {
  return articlePath.includes('/project/unity-weekly/');
}

function extractUnityWeeklyNumber(articlePath) {
  const match = articlePath.match(/unity-weekly\/(\d+)\//);
  return match ? match[1] : null;
}

function convertUnityWeeklyFrontmatter(gatsbyFm, number, content) {
  return {
    type: 'unity-weekly',
    title: gatsbyFm.title || `Unity Weekly ${number}`,
    description: gatsbyFm.description || extractDescription(content),
    tags: gatsbyFm.tags || ['Unity Weekly', 'Unity'],
    pubDatetime: new Date(gatsbyFm.date),
    draft: gatsbyFm.draft || false,
  };
}

function getUnityWeeklyTargetPath(number) {
  return path.join(TARGET_UNITY_WEEKLY_DIR, `${number}.md`);
}
```

#### 画像パス変換
```javascript
function convertUnityWeeklyImagePaths(content, number) {
  // ./01.png → /assets/images/unity-weekly/192/01.png
  return content.replace(
    /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
    (match, alt, imagePath) => {
      return `![${alt}](/assets/images/unity-weekly/${number}/${imagePath})`;
    }
  );
}
```

### 4. .gitignoreの更新

```gitignore
# Blog content (managed in separate repository)
src/data/blog/201*/
src/data/blog/202*/
public/assets/images/blog/

# Unity Weekly content (managed in separate repository)
src/data/unity-weekly/
public/assets/images/unity-weekly/

# Migration logs
logs/

# Source content (temporary migration source)
res/
```

### 5. UnityWeekly一覧ページ

```astro
// src/pages/project/unity-weekly/index.astro
---
import { getCollection } from 'astro:content';
import Layout from '@/layouts/Layout.astro';

const unityWeeklyPosts = await getCollection('unityWeekly');
const sortedPosts = unityWeeklyPosts.sort((a, b) =>
  b.data.pubDatetime.valueOf() - a.data.pubDatetime.valueOf()
);
---

<Layout title="Unity Weekly">
  <h1>Unity Weekly</h1>
  <ul>
    {sortedPosts.map(post => (
      <li>
        <a href={`/project/unity-weekly/${post.slug}/`}>
          {post.data.title}
        </a>
      </li>
    ))}
  </ul>
</Layout>
```

## 実装手順

### フェーズ1: 環境準備
1. ✅ Content Collectionの定義を追加（`src/content.config.ts`）
2. ✅ UnityWeekly用のディレクトリ作成
3. ✅ ルーティングページの作成

### フェーズ2: 移行スクリプト拡張
1. ✅ UnityWeekly判定ロジックの追加
2. ✅ UnityWeekly用のFrontmatter変換関数
3. ✅ 画像パス変換ロジックの実装
4. ✅ 画像コピー処理の追加

### フェーズ3: テスト実行
1. ✅ `--test` モードで少数の記事を移行テスト
2. ✅ ビルドが通ることを確認
3. ✅ URLが正しく生成されることを確認

### フェーズ4: 本番実行
1. ✅ 全記事を移行
2. ✅ ビルド確認
3. ✅ .gitignore更新

## 推奨: オプションA（別コレクション）

UnityWeeklyは通常のブログ記事とは性質が異なる（連載もの、URL構造が異なる）ため、**別コレクションとして管理する方が望ましい**です。

### 理由
1. **明確な分離**: ブログとUnityWeeklyを明確に分けられる
2. **柔軟性**: 将来的に他の連載（directx12-csharp、opentk-opengl-tutorialなど）も同様に追加できる
3. **保守性**: スキーマやクエリがシンプルになる
4. **拡張性**: UnityWeekly専用の機能追加が容易

## 次のステップ

この方針で進める場合：
1. Content Collectionの定義
2. 移行スクリプトの拡張
3. ルーティングページの作成
4. テスト実行

どの方針で進めますか？

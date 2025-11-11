# UnityWeeklyのカテゴライズ方針

## 要件
- URLの構造を維持: `/project/unity-weekly/NNN/`
- ブログとは別に表示したい
- 個人ブログにおける適切な括り方を検討

## 選択肢

### オプション1: 「Series（連載）」として扱う

**概念**: ブログ内の特別な連載コンテンツとして位置づける

**メリット**:
- ブログの一部だが、特別扱いできる
- 他の連載（Unity Weekly、技術チュートリアルシリーズなど）も同じ枠組みで扱える
- 読者にとって「定期連載」として認識しやすい

**サイト構造例**:
```
ブログトップ
├── Posts（通常記事）
├── Series（連載）
│   ├── Unity Weekly
│   ├── DirectX 12 C# Tutorial（将来追加の可能性）
│   └── OpenTK OpenGL Tutorial（将来追加の可能性）
├── Tags
└── About
```

**ヘッダーメニュー案**:
```
[yucchiy's blog] | Posts | Series | Tags | About
```

**実装**:
- Content Collection名: `series`
- 各連載を `type` フィールドで区別
- `/series/unity-weekly/` で一覧
- `/project/unity-weekly/NNN/` で個別記事（後方互換性）

---

### オプション2: 「Projects（プロジェクト）」として扱う

**概念**: 継続的な取り組み・プロジェクトとして位置づける

**メリット**:
- URL構造 `/project/unity-weekly/` と自然に一致
- Unity Weeklyは「週次でUnity情報をまとめるプロジェクト」として説明しやすい
- 他の技術プロジェクト（ライブラリ開発、チュートリアルシリーズなど）も同じ枠組み

**サイト構造例**:
```
ブログトップ
├── Posts（通常記事）
├── Projects（プロジェクト）
│   ├── Unity Weekly - 週次Unity情報まとめ
│   ├── DirectX 12 C# Tutorial - C#でDirectX 12を学ぶ
│   └── OpenTK OpenGL Tutorial - OpenGL入門シリーズ
├── Tags
└── About
```

**ヘッダーメニュー案**:
```
[yucchiy's blog] | Posts | Projects | Tags | About
```

**実装**:
- Content Collection名: `projects`
- 各プロジェクトを `type` フィールドで区別
- `/projects/` で全プロジェクト一覧
- `/project/unity-weekly/` でUnity Weekly一覧（後方互換性のため `/project/` 単数形も維持）
- `/project/unity-weekly/NNN/` で個別記事

---

### オプション3: 「Newsletter（ニュースレター）」として扱う

**概念**: 週次・定期発行のニュースレター形式として位置づける

**メリット**:
- Unity Weeklyの性質（週次の情報まとめ）に最も近い
- 海外の技術ブログでよく見られる形式
- 読者登録やRSS配信との相性が良い

**デメリット**:
- Unity Weekly以外のコンテンツ（DirectX/OpenTKチュートリアル）は「ニュースレター」と呼びにくい
- 他の連載との統一感が取りにくい

**サイト構造例**:
```
ブログトップ
├── Posts（通常記事）
├── Newsletter（ニュースレター）
│   └── Unity Weekly
├── Tags
└── About
```

---

### オプション4: 「Collections（まとめ・コレクション）」として扱う

**概念**: テーマ別のコンテンツコレクションとして位置づける

**メリット**:
- 汎用性が高く、様々なタイプのまとめコンテンツを包含できる
- 技術的な用語（Content Collection）とも整合性がある

**デメリット**:
- やや抽象的で、読者にとってイメージしにくい可能性

---

## 推奨: オプション2「Projects（プロジェクト）」

### 理由

1. **URL構造との一致**
   - 既存のURL `/project/unity-weekly/` と自然に対応
   - リダイレクトやURL変更が不要

2. **Unity Weeklyの性質に合致**
   - Unity Weeklyは「週次でUnity情報をまとめるプロジェクト」として説明が自然
   - 継続的な取り組みというニュアンスが伝わる

3. **拡張性**
   - `res/blog.yucchiy.com/articles/project/` 配下には他にも:
     - `directx12-csharp/` - DirectX 12のC#チュートリアルシリーズ
     - `opentk-opengl-tutorial/` - OpenGLチュートリアルシリーズ
   - これらも同じ「Projects」の枠組みで統一的に扱える

4. **個人ブログとしての自然さ**
   - 「自分が取り組んでいるプロジェクト」として紹介しやすい
   - 技術ブログにありがちな構造

### 実装イメージ

#### Content Collection定義
```typescript
// src/content.config.ts
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,markdown}', base: './src/data/projects' }),
  schema: z.object({
    type: z.enum(['unity-weekly', 'directx12-csharp', 'opentk-opengl']),
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    pubDatetime: z.date(),
    draft: z.boolean().default(false),
  }),
});
```

#### ディレクトリ構造
```
src/data/
├── blog/              # 通常のブログ記事
└── projects/          # プロジェクト系コンテンツ
    ├── unity-weekly/  # Unity Weekly
    │   ├── 192.md
    │   └── 005.md
    ├── directx12-csharp/     # 将来追加
    └── opentk-opengl/        # 将来追加
```

#### ルーティング
```
src/pages/
├── projects/
│   └── index.astro                    # 全プロジェクト一覧
├── project/                           # 後方互換性のため維持
│   └── unity-weekly/
│       ├── index.astro                # Unity Weekly一覧
│       └── [number]/
│           └── index.astro            # 個別記事
```

#### ヘッダーメニュー
```astro
<nav>
  <a href="/page">Posts</a>
  <a href="/projects">Projects</a>
  <a href="/tags">Tags</a>
  <a href="/about">About</a>
</nav>
```

#### Projects一覧ページ（/projects/）
```astro
---
import { getCollection } from 'astro:content';

const projectPosts = await getCollection('projects');

// プロジェクトごとにグループ化
const unityWeekly = projectPosts.filter(p => p.data.type === 'unity-weekly');
const directx12 = projectPosts.filter(p => p.data.type === 'directx12-csharp');
// ...

const projects = [
  {
    name: 'Unity Weekly',
    description: '週次でUnityの最新情報をまとめています',
    url: '/project/unity-weekly/',
    posts: unityWeekly,
    icon: '🎮'
  },
  // 将来追加...
];
---

<Layout>
  <h1>Projects</h1>

  {projects.map(project => (
    <section>
      <h2>{project.icon} {project.name}</h2>
      <p>{project.description}</p>
      <a href={project.url}>View all posts ({project.posts.length})</a>
    </section>
  ))}
</Layout>
```

### URL設計

| ページ | URL | 説明 |
|--------|-----|------|
| プロジェクト一覧 | `/projects/` | 全プロジェクトの概要 |
| Unity Weekly一覧 | `/project/unity-weekly/` | Unity Weekly記事一覧 |
| Unity Weekly個別 | `/project/unity-weekly/192/` | 個別記事 |
| DirectX 12一覧 | `/project/directx12-csharp/` | DirectX 12チュートリアル一覧 |
| DirectX 12個別 | `/project/directx12-csharp/01/` | 個別記事 |

**注意**: `/projects/`（複数形）で一覧、`/project/`（単数形）で個別プロジェクトという使い分け

---

## 代替案: オプション1「Series（連載）」

もし「プロジェクト」という表現がしっくりこない場合、「Series（連載）」も良い選択肢です。

**適している場合**:
- Unity Weeklyを「技術情報の連載」として位置づけたい
- チュートリアルシリーズなどの教育コンテンツが多い
- 「定期更新される読み物」というニュアンスを出したい

**URL変更が必要**:
- `/project/unity-weekly/` → `/series/unity-weekly/` へのリダイレクトが必要

---

## 結論

**「Projects」として扱うことを推奨します**

理由:
1. 既存URL構造と一致（変更不要）
2. Unity Weeklyの性質に合っている
3. 他の連載コンテンツも統一的に扱える
4. 個人ブログとして自然

この方針で実装を進めてよろしいでしょうか？

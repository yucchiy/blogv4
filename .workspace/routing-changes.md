# ルーティング変更プラン

## 目標

Gatsbyブログと同じURL構造を維持：
- **現在のGatsby**: `https://blog.yucchiy.com/2022/05/new-my-chair/`
- **新しいAstro**: `https://blog.yucchiy.com/2022/05/new-my-chair/`

## 変更内容

### 1. ページファイルの移動

#### Before (現在)
```
src/pages/posts/[...slug]/index.astro  → URL: /posts/2022/05/new-my-chair
src/pages/posts/[...page].astro        → URL: /posts/1, /posts/2, ...
```

#### After (変更後)
```
src/pages/[...slug]/index.astro        → URL: /2022/05/new-my-chair
src/pages/page/[...page].astro         → URL: /page/1, /page/2, ...
```

### 2. getPath関数の修正

**ファイル**: `src/utils/getPath.ts`

```typescript
// Before
const basePath = includeBase ? "/posts" : "";

// After
const basePath = includeBase ? "" : "";
```

または、より明示的に：
```typescript
const basePath = ""; // 常に空文字列
```

### 3. リンクの修正

全プロジェクト内で `/posts/` へのリンクを確認・修正：
- ナビゲーションメニュー
- 内部リンク
- リダイレクト設定

### 4. ファイル配置

```
src/data/blog/
├── 2014/
│   └── 10/
│       └── install-opencv3-with-contrib.md
├── 2022/
│   ├── 04/
│   │   └── test-page-imported-from-notion.md
│   └── 05/
│       └── new-my-chair.md
└── ...
```

各ファイルのslugは不要（ディレクトリ構造からURLが決まる）

## 実装順序

1. ✅ ルーティングファイルの移動
2. ✅ getPath関数の修正
3. ✅ 内部リンクの修正
4. ✅ dev環境で動作確認
5. ✅ コンテンツ移行スクリプトの実装

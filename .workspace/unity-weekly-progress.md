# Unity Weekly移行作業の進捗状況

## 作業日
2025-11-11

## 現在のステータス
✅ **テスト移行完了・ビルド成功**

Unity Weeklyを「Projects」として実装する作業の基本部分が完成しました。4記事のテスト移行が成功し、ビルドも正常に完了しています。

## 完了した作業

### 1. Content Collectionの定義 ✅
- `src/content.config.ts` に `projects` コレクションを追加
- Unity Weekly、DirectX 12、OpenTKの3種類のプロジェクトタイプをサポート

### 2. ルーティングページの作成 ✅
- `/project/unity-weekly/[number]/index.astro` - 個別記事ページ
- `/project/unity-weekly/index.astro` - Unity Weekly一覧ページ
- `src/layouts/ProjectPostDetails.astro` - Projects専用レイアウト

### 3. 移行スクリプトの拡張 ✅
`scripts/migrate-from-gatsby.cjs`を修正:
- Unity Weekly判定関数を追加
- Unity Weekly用のFrontmatter変換関数を追加
- Unity Weekly用の画像パス変換・コピー関数を追加
- `migrateArticle`関数でUnityWeeklyとブログ記事を分岐処理

### 4. ユーティリティ関数の更新 ✅
- `src/utils/getSortedPosts.ts` を更新
  - `blog`と`projects`の両方をサポート
  - 関数オーバーロードで型安全性を確保

### 5. テスト移行の実行 ✅
```bash
node scripts/migrate-from-gatsby.cjs --test --limit 5
```
- Unity Weekly #244, #245, #246, #247 の4記事を正常に移行
- Frontmatterが正しく変換されることを確認

## 解決した問題

### ビルドエラー（全て解決済み） ✅

#### 1. `Tag`コンポーネントのインターフェース不一致 ✅
**解決**: `tagName`プロパティを追加
```astro
<Tag tag={slugifyStr(tag)} tagName={tag} />
```

#### 2. `Datetime`コンポーネントのプロパティ名不一致 ✅
**解決**: `pubDatetime`と`modDatetime`を正しく渡す
```astro
<Datetime
  pubDatetime={pubDatetime}
  modDatetime={null}
  timezone={SITE.timezone}
  size="lg"
  class="my-2"
/>
```

#### 3. Tailwind `max-w-app` エラー ✅
**解決**: `<style>`ブロックを削除し、インラインクラスで直接指定
```astro
<main class="mx-auto w-full max-w-3xl px-4 pb-12">
```

### ビルド結果 ✅
```
293 page(s) built in 52.48s
Indexed 129 pages (通常ブログ記事 + Unity Weekly)
```

### 生成されたページ ✅
- `/project/unity-weekly/` - Unity Weekly一覧
- `/project/unity-weekly/244/` - Unity Weekly #244
- `/project/unity-weekly/245/` - Unity Weekly #245
- `/project/unity-weekly/246/` - Unity Weekly #246
- `/project/unity-weekly/247/` - Unity Weekly #247

## 残っている軽微な警告

### 未使用変数の警告（ビルドには影響なし）
スクリプト内の未使用変数警告が4件ありますが、ビルドの成功には影響していません。

## ファイル構成（作成済み）

```
src/
├── content.config.ts                     # projectsコレクション定義追加
├── data/
│   └── projects/
│       └── unity-weekly/
│           ├── 244.md                    # テスト移行済み
│           ├── 245.md
│           ├── 246.md
│           └── 247.md
├── layouts/
│   └── ProjectPostDetails.astro          # Projects専用レイアウト（新規作成）
├── pages/
│   └── project/
│       └── unity-weekly/
│           ├── index.astro               # Unity Weekly一覧
│           └── [number]/
│               └── index.astro           # 個別記事
└── utils/
    └── getSortedPosts.ts                 # projects対応に更新

scripts/
└── migrate-from-gatsby.cjs               # UnityWeekly対応に拡張

.claude/
└── CLAUDE.md                             # Projectsコレクションの詳細追加
```

## 次回作業時に実施すべきこと

### 優先度: 高（すぐに実施）

4. **Projects一覧ページの作成**
   - `/projects/` ページを作成
   - 全プロジェクトの概要を表示
   - Unity Weeklyへのリンク

5. **ヘッダーメニューにProjectsを追加**
   - `src/components/Header.astro` にProjectsリンクを追加

6. **全UnityWeekly記事の移行**
   ```bash
   # 240記事全てを移行
   node scripts/migrate-from-gatsby.cjs
   ```

7. **.gitignoreの更新**
   ```gitignore
   # Projects content (managed in separate repository)
   src/data/projects/
   public/assets/images/projects/
   ```

### 優先度: 低（改善）

8. **Card コンポーネントの汎用化**
   - `blog`と`projects`の両方で使えるように
   - 現状は Unity Weekly一覧ページで独自実装を使用中

9. **OG画像のサポート**
   - Projects用のOG画像生成

10. **パンくずリストの追加**
    - `/project/unity-weekly/` → `/project/unity-weekly/247/` の階層表示

## コミット計画

ビルドエラーが解消されたら:

```bash
git add src/content.config.ts \
        src/layouts/ProjectPostDetails.astro \
        src/pages/project/ \
        src/utils/getSortedPosts.ts \
        scripts/migrate-from-gatsby.cjs \
        .claude/CLAUDE.md \
        .workspace/

git commit -m "Unity WeeklyをProjectsとして実装

## 変更内容

### 1. Content Collection
- projectsコレクションを追加（unity-weekly, directx12-csharp, opentk-opengl）

### 2. ルーティング
- /project/unity-weekly/NNN/ で個別記事
- /project/unity-weekly/ で一覧

### 3. 移行スクリプト
- Unity Weekly判定・変換ロジックを追加
- 画像パス: /assets/images/projects/unity-weekly/NNN/
- テスト移行成功: #244-247 (4記事)

### 4. レイアウト・ユーティリティ
- ProjectPostDetails.astro: Projects専用レイアウト
- getSortedPosts: blog/projects両対応

## 今後の作業
- Projects一覧ページ作成
- ヘッダーメニュー追加
- 全240記事の移行
"
```

## 参考情報

- **移行プラン**: `.workspace/unity-weekly-migration-plan.md`
- **カテゴライズ方針**: `.workspace/unity-weekly-categorization.md`
- **プロジェクトルール**: `.claude/CLAUDE.md`
- **移行スクリプト**: `scripts/migrate-from-gatsby.cjs`

## メモ

- Unity Weeklyのスラッグは番号のみ（例: `192`）
- ファイル名: `src/data/projects/unity-weekly/192.md`
- URL: `/project/unity-weekly/192/`
- Frontmatterに`type: "unity-weekly"`を含む
- 古い記事（#005など）は画像が多数、新しい記事は画像なしが多い

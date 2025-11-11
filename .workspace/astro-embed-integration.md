# Astro Embed統合プラン

## 概要

Astroには公式の`@astro-community/astro-embed`パッケージがあり、YouTube、Twitter/X、Vimeoなどの埋め込みを簡単に実現できます。

## サポート対象プラットフォーム

### 現在利用可能
- ✅ **YouTube** - `@astro-community/astro-embed-youtube`
- ✅ **Twitter/X** - `@astro-community/astro-embed-twitter`
- ✅ **Vimeo** - `@astro-community/astro-embed-vimeo`
- ✅ **Bluesky** - `@astro-community/astro-embed-bluesky`
- ✅ **Link Preview** - `@astro-community/astro-embed-link-preview`

### ブログで使用中のプラットフォーム
- ✅ YouTube (~183件) → **対応可能**
- ✅ Twitter/X (~100件) → **対応可能**
- ❌ SpeakerDeck (2件) → **未対応** (手動修正が必要)
- ❌ SlideShare (1件) → **未対応** (手動修正が必要)
- ❌ Instagram (5件) → **未対応** (手動修正が必要)

## 自動変換機能

`@astro-community/astro-embed-integration` を使用すると、Markdown内のURLを自動的に埋め込みコンポーネントに変換できます。

### 変換例

**Before** (Markdown):
```markdown
https://www.youtube.com/watch?v=rvBpUPFN5_I
```

**After** (自動変換):
YouTubeの埋め込みプレーヤーとして表示

## インストール方法

```bash
npm install astro-embed
# または個別に
npm install @astro-community/astro-embed-youtube
npm install @astro-community/astro-embed-twitter
npm install @astro-community/astro-embed-integration
```

## 設定方法

### 1. 統合パッケージ使用（推奨）

**astro.config.mjs**:
```javascript
import { defineConfig } from 'astro/config';
import embeds from 'astro-embed/integration';

export default defineConfig({
  integrations: [embeds()],
});
```

これだけで、Markdown内のYouTube/Twitter URLが自動的に埋め込みに変換されます。

### 2. 手動コンポーネント使用

**記事内で直接使用**:
```astro
---
import { YouTube } from '@astro-community/astro-embed-youtube';
import { Tweet } from '@astro-community/astro-embed-twitter';
---

<YouTube id="rvBpUPFN5_I" />
<Tweet id="1378202750089981956" />
```

## パフォーマンス特性

### YouTube
- 初期表示時はJavaScriptを読み込まない
- ユーザーがクリックして初めてYouTubeのJSを読み込む
- ページロード速度が大幅に向上

### Twitter/X
- クライアントサイドJavaScript不要
- 静的HTMLとしてレンダリング
- パフォーマンス最適化済み

## 移行への適用

### オプション1: 自動変換統合（推奨）

**メリット**:
- 既存のMarkdownをそのまま使える
- URLが自動的に埋め込みに変換される
- 追加の変更不要

**デメリット**:
- 全てのURLが対象になる（意図しない変換の可能性）

**実装**:
1. `astro-embed` をインストール
2. `astro.config.mjs` に統合を追加
3. 完了！

### オプション2: 移行スクリプトで変換

**メリット**:
- 完全なコントロール
- 変換ルールをカスタマイズ可能
- 既存のHTMLブロッククォートも対応可能

**デメリット**:
- スクリプト修正が必要
- テストが必要

**実装例**:
```javascript
// YouTubeリンクを検出して変換
function convertYouTubeLinks(content) {
  // [URL](https://www.youtube.com/watch?v=VIDEO_ID) 形式
  content = content.replace(
    /\[([^\]]*)\]\(https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)\)/g,
    '<YouTube id="$2" />'
  );

  // 単独URL形式
  content = content.replace(
    /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/gm,
    '<YouTube id="$1" />'
  );

  return content;
}

// Twitter埋め込みはそのまま（既にHTML形式）
// 追加処理不要
```

## 推奨アプローチ

### フェーズ1: 現在の移行（即時）
1. **そのまま移行** - 埋め込みの変換はしない
2. YouTube → リンクとして表示
3. Twitter → 既存のHTMLブロッククォートで動作

### フェーズ2: 埋め込み統合（移行後）
1. `astro-embed` 統合をインストール
2. `astro.config.mjs` に追加
3. YouTubeが自動的に埋め込みに変換される
4. Twitterは既存のHTMLが引き続き動作

### フェーズ3: 最適化（オプション）
1. Twitter埋め込みをAstro Embedコンポーネントに変換
2. SpeakerDeck/SlideShare/Instagramを手動修正
3. カスタム埋め込みコンポーネントの作成

## 次のステップ

移行後に`astro-embed`を試してみる価値があります。特にYouTubeは自動変換で簡単に対応できます。

**今すぐやること**:
1. まず全記事を現状のまま移行
2. 動作確認
3. その後、`astro-embed`統合を試す

どうですか？

# 埋め込み対応方針（astro-embed不使用）

## 基本方針

**AstroはMarkdown内のHTMLをそのまま表示できる** ため、特別なライブラリなしで埋め込みが動作します。

## 現在の状況と対応

### ✅ Twitter/X埋め込み（~100件）

**現在の形式**:
```html
<blockquote class="twitter-tweet">
  <p lang="ja" dir="ltr">ツイート本文...</p>
  &mdash; ユーザー名 (@handle)
  <a href="https://twitter.com/.../status/123...">日付</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

**対応**: ✅ **そのまま動作する**
- HTMLとして認識される
- Twitter公式スクリプトが埋め込みを表示
- 追加の変更不要

### ⚠️ YouTube（~183件）

**現在の形式**:
```markdown
[https://www.youtube.com/watch?v=rvBpUPFN5_I](https://www.youtube.com/watch?v=rvBpUPFN5_I)
```

**対応**: ⚠️ **リンクとして表示される**
- 埋め込みプレーヤーにはならない
- クリック可能なリンクとして機能
- 動作に問題はないが、見栄えが変わる

**改善方法（オプション）**:

#### 方法1: YouTubeの公式埋め込みコードを使う

移行スクリプトでYouTubeリンクをiframe埋め込みに変換:

```javascript
function convertYouTubeToEmbed(content) {
  // [URL](https://www.youtube.com/watch?v=VIDEO_ID) 形式を検出
  content = content.replace(
    /\[https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)\]\(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=\1\)/g,
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  );

  // 単独URL形式も対応
  content = content.replace(
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/gm,
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  );

  return content;
}
```

**結果**:
```html
<iframe width="560" height="315"
  src="https://www.youtube.com/embed/rvBpUPFN5_I"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>
```

#### 方法2: そのまま（リンクとして）

- 追加の処理なし
- ユーザーはリンクをクリックしてYouTubeで視聴
- シンプルで軽量

### ❌ Gatsbyショートコード（8件）

**形式**:
```
{{< speakerdeck ID >}}
{{< slideshare ID >}}
{{< instagram ID >}}
```

**対応**: ❌ **動作しない**
- Astroはこの構文をサポートしていない
- 該当記事（8件）を手動修正が必要

**修正例**:

#### SpeakerDeck
```html
<!-- Before -->
{{< speakerdeck dd195b300fbd0132c8492abbbf00bf60 >}}

<!-- After -->
<script async class="speakerdeck-embed"
  data-id="dd195b300fbd0132c8492abbbf00bf60"
  data-ratio="1.77777777777778"
  src="//speakerdeck.com/assets/embed.js">
</script>
```

#### SlideShare
```html
<!-- Before -->
{{< slideshare 38432268 >}}

<!-- After -->
<iframe src="//www.slideshare.net/slideshow/embed_code/key/38432268"
  width="595" height="485" frameborder="0" marginwidth="0" marginheight="0"
  scrolling="no" allowfullscreen>
</iframe>
```

#### Instagram
```html
<!-- Before -->
{{< instagram xqu0O5jAu_ >}}

<!-- After -->
<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/xqu0O5jAu_/">
  <a href="https://www.instagram.com/p/xqu0O5jAu_/">View on Instagram</a>
</blockquote>
<script async src="//www.instagram.com/embed.js"></script>
```

## 推奨実装プラン

### オプションA: 最小限（推奨）

1. **そのまま移行**
   - Twitter: ✅ 自動的に動作
   - YouTube: ⚠️ リンクとして表示
   - Gatsbyショートコード: ❌ 移行後に手動修正（8件のみ）

**メリット**:
- 即座に移行完了
- 追加の開発不要
- ほとんどのコンテンツが正しく表示される

**デメリット**:
- YouTubeが埋め込みにならない（リンクのみ）

### オプションB: YouTube埋め込み変換

1. 移行スクリプトにYouTube変換ロジックを追加
2. YouTubeリンクをiframe埋め込みに自動変換
3. その他はそのまま

**メリット**:
- YouTubeが埋め込みプレーヤーとして表示
- 自動変換なので手動修正不要

**デメリット**:
- スクリプト修正が必要
- テストが必要

## 結論

**推奨**: オプションA（最小限）

理由:
- Twitter埋め込みは既に動作する
- YouTubeはリンクで十分機能的
- Gatsbyショートコードは8件のみで手動修正可能
- 追加開発なしで即座に移行完了

**YouTube埋め込みが重要な場合**: オプションBを選択

どちらの方針で進めますか？

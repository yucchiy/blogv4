# 埋め込みコンテンツ分析結果

## 検出された埋め込みタイプ

### 1. Twitter/X埋め込み
- **件数**: 約100件
- **形式**: `<blockquote class="twitter-tweet">` + `<script async src="https://platform.twitter.com/widgets.js">`
- **対応状況**: ✅ HTMLそのままで動作するはず（Astroは生HTMLをサポート）

**サンプル**:
```html
<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">へぇ、Unity 2021.1から、ObjectPoolって標準で実装されるのね。 <a href="https://t.co/MTG08LitSY">https://t.co/MTG08LitSY</a></p>&mdash; ゆっち〜 (Yuichiro MUKAI) (@yucchiy_) <a href="https://twitter.com/yucchiy_/status/1378202750089981956?ref_src=twsrc%5Etfw">April 3, 2021</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

### 2. YouTube埋め込み
- **件数**: 約183件
- **形式**: 主にMarkdownリンク `[タイトル](https://www.youtube.com/watch?v=...)`
- **対応状況**: ⚠️ リンクのまま（埋め込み表示にはならない）
- **改善方法**: Astroコンポーネントまたはremarkプラグインで変換

**サンプル**:
```markdown
[https://www.youtube.com/watch?v=rvBpUPFN5_I](https://www.youtube.com/watch?v=rvBpUPFN5_I)
```

### 3. Gatsbyショートコード
- **speakerdeck**: `{{< speakerdeck [ID] >}}`
- **slideshare**: `{{< slideshare [ID] >}}`
- **対応状況**: ❌ Astroでは動作しない
- **該当記事**: 古い記事（2014年）に数件
- **改善方法**: 手動で埋め込みコードに置換、またはAstroコンポーネント作成

**サンプル**:
```
{{< speakerdeck dd195b300fbd0132c8492abbbf00bf60 >}}
{{< slideshare 38432268 >}}
```

## 推奨対応方針

### 即時対応（移行時）

1. **Twitter/X埋め込み**:
   - ✅ そのまま移行（動作する）
   - scriptタグは各記事に含まれているので、そのまま動作するはず

2. **YouTubeリンク**:
   - ⚠️ リンクとして表示される（埋め込みではない）
   - 動作に問題はないが、見栄えが変わる可能性あり

3. **Gatsbyショートコード**:
   - ❌ 該当記事は少数（数件）
   - 移行後に手動で修正

### 将来的な改善（オプション）

1. **YouTubeの自動埋め込み化**
   - remarkプラグインを作成してYouTubeリンクを埋め込みに変換
   - またはAstroコンポーネント `<YouTube id="..." />` を作成

2. **統一的な埋め込みコンポーネント**
   - SpeakerDeck, SlideShareコンポーネントを作成
   - 必要に応じて該当記事を手動修正

## 移行スクリプトへの影響

**現状のスクリプトで問題なし**:
- Twitter/X埋め込みはHTMLとしてそのまま保持される
- YouTubeリンクはMarkdownリンクとしてそのまま保持される
- Gatsbyショートコードもそのまま保持される（表示されないだけ）

**追加対応は不要** - 移行後に必要に応じて個別対応でOK

## 統計サマリ

| 埋め込みタイプ | 件数 | Astro対応 | アクション |
|--------------|------|-----------|-----------|
| Twitter/X | ~100 | ✅ 動作する | なし |
| YouTube | ~183 | ⚠️ リンクのみ | 後で改善検討 |
| SpeakerDeck | 数件 | ❌ 動作しない | 手動修正 |
| SlideShare | 数件 | ❌ 動作しない | 手動修正 |
| iframe | 0 | N/A | なし |

## 結論

**移行を妨げる要素はなし**。ほとんどの埋め込みはそのまま動作するか、最悪リンクとして表示されます。

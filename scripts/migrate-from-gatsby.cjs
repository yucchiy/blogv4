#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// 設定
const SOURCE_DIR = 'res/blog.yucchiy.com/articles';
const TARGET_BLOG_DIR = 'src/data/blog';
const TARGET_PROJECTS_DIR = 'src/data/projects';
const TARGET_PAGES_DIR = 'src/pages';
const TARGET_IMAGE_DIR = 'public/assets/images/blog';
const TARGET_PROJECTS_IMAGE_DIR = 'public/assets/images/projects';
const TARGET_PAGES_IMAGE_DIR = 'public/assets/images/pages';
const DEFAULT_AUTHOR = '向井 祐一郎';

// 除外するディレクトリ
const EXCLUDE_DIRS = ['styleguide'];

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isTest = args.includes('--test');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : 3;

console.log('='.repeat(60));
console.log('Gatsby → Astro コンテンツ移行スクリプト');
console.log('='.repeat(60));
console.log(`モード: ${isDryRun ? 'ドライラン（実際の書き込みなし）' : '本番実行'}`);
if (isTest) {
  console.log(`テストモード: 最大${limit}記事のみ処理`);
}
console.log('='.repeat(60));
console.log('');

// descriptionを本文から抽出
function extractDescription(content) {
  // Frontmatterを除去
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // 見出しやコードブロックを除去
  let text = withoutFrontmatter
    .replace(/```[\s\S]*?```/g, '') // コードブロック
    .replace(/`[^`]+`/g, '') // インラインコード
    .replace(/^#{1,6}\s+.+$/gm, '') // 見出し
    .replace(/!\[.*?\]\(.*?\)/g, '') // 画像
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // リンク
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 太字
    .replace(/\*([^*]+)\*/g, '$1') // イタリック
    .trim();

  // 最初の段落を取得（改行2つまで）
  const firstParagraph = text.split('\n\n')[0];

  // 100-150文字に制限
  if (firstParagraph.length > 150) {
    return firstParagraph.substring(0, 147) + '...';
  }

  return firstParagraph || '記事の説明';
}

// ページタイプ判定
function isPage(frontmatter) {
  return frontmatter.type === 'page';
}

// Unity Weekly判定
function isUnityWeekly(articlePath) {
  return articlePath.includes('/project/unity-weekly/');
}

// UnityWeekly番号を抽出
function extractUnityWeeklyNumber(articlePath) {
  const match = articlePath.match(/unity-weekly\/(\d+)\//);
  return match ? match[1] : null;
}

// ページディレクトリ名を抽出（profile, aboutなど）
function extractPageName(articlePath) {
  const relativePath = articlePath.replace(SOURCE_DIR + '/', '');
  const match = relativePath.match(/^([^/]+)\//);
  return match ? match[1] : null;
}

// slugを生成（YYYY/MM/article-slug → YYYY-MM-article-slug）
function generateSlug(articlePath) {
  // articlesディレクトリ以降のパスを取得
  const relativePath = articlePath
    .replace(SOURCE_DIR + '/', '')
    .replace(/\/index\.(md|markdown)$/, '');

  return relativePath;
}

// Frontmatterを変換（Unity Weekly用）
function convertUnityWeeklyFrontmatter(gatsbyFm, number, content) {
  // dateをDate型に変換
  let pubDatetime;
  try {
    pubDatetime = new Date(gatsbyFm.date);
    if (isNaN(pubDatetime.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (e) {
    console.warn(`  ⚠️  日付の解析に失敗: ${gatsbyFm.date}, 現在時刻を使用`);
    pubDatetime = new Date();
  }

  return {
    type: 'unity-weekly',
    title: gatsbyFm.title || `Unity Weekly ${number}`,
    description: gatsbyFm.description || extractDescription(content),
    tags: gatsbyFm.tags || ['Unity Weekly', 'Unity'],
    pubDatetime: pubDatetime,
    draft: gatsbyFm.draft || false,
  };
}

// Frontmatterを変換（ページ用）
function convertPageFrontmatter(gatsbyFm) {
  return {
    title: gatsbyFm.title || 'タイトルなし',
    layout: '../../layouts/MarkdownPage.astro',
  };
}

// Frontmatterを変換（通常のブログ記事用）
function convertFrontmatter(gatsbyFm, articlePath, content) {
  const slug = generateSlug(articlePath);

  // dateをDate型に変換
  let pubDatetime;
  try {
    pubDatetime = new Date(gatsbyFm.date);
    if (isNaN(pubDatetime.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (e) {
    console.warn(`  ⚠️  日付の解析に失敗: ${gatsbyFm.date}, 現在時刻を使用`);
    pubDatetime = new Date();
  }

  const astroFm = {
    author: DEFAULT_AUTHOR,
    pubDatetime: pubDatetime,
    title: gatsbyFm.title || 'タイトルなし',
    slug: slug,
    draft: gatsbyFm.draft || false,
    tags: (gatsbyFm.tags || []).map(tag => tag.toLowerCase()),
    description: gatsbyFm.description || extractDescription(content),
  };

  // オプショナルフィールド
  if (gatsbyFm.featured) {
    astroFm.featured = gatsbyFm.featured;
  }

  return astroFm;
}

// 画像パスを変換（Unity Weekly用）
function convertUnityWeeklyImagePaths(content, number) {
  // 相対パスの画像を検出（./image.jpg や image.jpg）
  const imageRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;

  let converted = content.replace(imageRegex, (match, alt, imagePath) => {
    const newPath = `/assets/images/projects/unity-weekly/${number}/${imagePath}`;
    return `![${alt}](${newPath})`;
  });

  // ./ なしの相対パスも対応
  const imageRegex2 = /!\[([^\]]*)\]\((?!http|\/|#)([^)]+)\)/g;
  converted = converted.replace(imageRegex2, (match, alt, imagePath) => {
    if (imagePath.startsWith('./')) return match; // すでに処理済み
    const newPath = `/assets/images/projects/unity-weekly/${number}/${imagePath}`;
    return `![${alt}](${newPath})`;
  });

  return converted;
}

// 画像パスを変換（ブログ記事用）
function convertImagePaths(content, sourceDir, slug) {
  // 相対パスの画像を検出（./image.jpg や image.jpg）
  const imageRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;

  let converted = content.replace(imageRegex, (match, alt, imagePath) => {
    const newPath = `/assets/images/blog/${slug}/${imagePath}`;
    return `![${alt}](${newPath})`;
  });

  // ./ なしの相対パスも対応
  const imageRegex2 = /!\[([^\]]*)\]\((?!http|\/|#)([^)]+)\)/g;
  converted = converted.replace(imageRegex2, (match, alt, imagePath) => {
    if (imagePath.startsWith('./')) return match; // すでに処理済み
    const newPath = `/assets/images/blog/${slug}/${imagePath}`;
    return `![${alt}](${newPath})`;
  });

  return converted;
}

// 画像ファイルをコピー（Unity Weekly用）
async function copyUnityWeeklyImages(sourceDir, number, dryRun) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(file =>
    imageExtensions.includes(path.extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    return [];
  }

  const targetDir = path.join(TARGET_PROJECTS_IMAGE_DIR, 'unity-weekly', number);

  if (!dryRun) {
    await fs.ensureDir(targetDir);
  }

  const copiedFiles = [];
  for (const imageFile of imageFiles) {
    const sourcePath = path.join(sourceDir, imageFile);
    const targetPath = path.join(targetDir, imageFile);

    if (!dryRun) {
      await fs.copy(sourcePath, targetPath);
    }

    copiedFiles.push(imageFile);
  }

  return copiedFiles;
}

// 画像パスを変換（ページ用）
function convertPageImagePaths(content, pageName) {
  // 相対パスの画像を検出（./image.jpg や image.jpg）
  const imageRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;

  let converted = content.replace(imageRegex, (match, alt, imagePath) => {
    const newPath = `/assets/images/pages/${pageName}/${imagePath}`;
    return `![${alt}](${newPath})`;
  });

  // ./ なしの相対パスも対応
  const imageRegex2 = /!\[([^\]]*)\]\((?!http|\/|#)([^)]+)\)/g;
  converted = converted.replace(imageRegex2, (match, alt, imagePath) => {
    if (imagePath.startsWith('./')) return match; // すでに処理済み
    const newPath = `/assets/images/pages/${pageName}/${imagePath}`;
    return `![${alt}](${newPath})`;
  });

  return converted;
}

// 画像ファイルをコピー（ページ用）
async function copyPageImages(sourceDir, pageName, dryRun) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(file =>
    imageExtensions.includes(path.extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    return [];
  }

  const targetDir = path.join(TARGET_PAGES_IMAGE_DIR, pageName);

  if (!dryRun) {
    await fs.ensureDir(targetDir);
  }

  const copiedFiles = [];
  for (const imageFile of imageFiles) {
    const sourcePath = path.join(sourceDir, imageFile);
    const targetPath = path.join(targetDir, imageFile);

    if (!dryRun) {
      await fs.copy(sourcePath, targetPath);
    }

    copiedFiles.push(imageFile);
  }

  return copiedFiles;
}

// 画像ファイルをコピー（ブログ記事用）
async function copyImages(sourceDir, slug, dryRun) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(file =>
    imageExtensions.includes(path.extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    return [];
  }

  const targetDir = path.join(TARGET_IMAGE_DIR, slug);

  if (!dryRun) {
    await fs.ensureDir(targetDir);
  }

  const copiedFiles = [];
  for (const imageFile of imageFiles) {
    const sourcePath = path.join(sourceDir, imageFile);
    const targetPath = path.join(targetDir, imageFile);

    if (!dryRun) {
      await fs.copy(sourcePath, targetPath);
    }

    copiedFiles.push(imageFile);
  }

  return copiedFiles;
}

// 記事を移行
async function migrateArticle(articlePath, dryRun) {
  try {
    // ファイルを読み込み
    const fileContent = await fs.readFile(articlePath, 'utf-8');

    // BOMを除去
    const cleanContent = fileContent.replace(/^\uFEFF/, '');

    // Frontmatterをパース
    const { data: frontmatter, content } = matter(cleanContent);

    // ページタイプかどうかを判定
    const isPageType = isPage(frontmatter);

    // Unity Weeklyかどうかを判定
    const isUW = isUnityWeekly(articlePath);

    let astroFrontmatter, convertedContent, copiedImages, targetFilePath, slug;

    if (isPageType) {
      // ページ用の処理（profile, aboutなど）
      const pageName = extractPageName(articlePath);

      // Frontmatterを変換
      astroFrontmatter = convertPageFrontmatter(frontmatter);

      // 画像パスを変換
      convertedContent = convertPageImagePaths(content, pageName);

      // 画像をコピー
      copiedImages = await copyPageImages(path.dirname(articlePath), pageName, dryRun);

      // 出力ファイルパスを決定（src/pages/profile/index.md）
      targetFilePath = path.join(TARGET_PAGES_DIR, pageName, 'index.md');

      slug = pageName;
    } else if (isUW) {
      // Unity Weekly用の処理
      const number = extractUnityWeeklyNumber(articlePath);

      // Frontmatterを変換
      astroFrontmatter = convertUnityWeeklyFrontmatter(frontmatter, number, content);

      // 画像パスを変換
      convertedContent = convertUnityWeeklyImagePaths(content, number);

      // 画像をコピー
      copiedImages = await copyUnityWeeklyImages(path.dirname(articlePath), number, dryRun);

      // 出力ファイルパスを決定
      targetFilePath = path.join(TARGET_PROJECTS_DIR, 'unity-weekly', `${number}.md`);

      slug = `unity-weekly/${number}`;
    } else {
      // 通常のブログ記事用の処理
      slug = generateSlug(articlePath);

      // Frontmatterを変換
      astroFrontmatter = convertFrontmatter(frontmatter, articlePath, content);

      // 画像パスを変換
      convertedContent = convertImagePaths(content, path.dirname(articlePath), slug);

      // 画像をコピー
      copiedImages = await copyImages(path.dirname(articlePath), slug, dryRun);

      // 出力ファイルパスを決定
      targetFilePath = path.join(TARGET_BLOG_DIR, `${slug}.md`);
    }

    // Frontmatterを手動で生成（DateオブジェクトをクォートなしのISO文字列に）
    let frontmatterStr = '---\n';
    for (const [key, value] of Object.entries(astroFrontmatter)) {
      if (value instanceof Date) {
        frontmatterStr += `${key}: ${value.toISOString()}\n`;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          // 空配列の場合はデフォルト値を設定
          frontmatterStr += `${key}:\n  - others\n`;
        } else {
          frontmatterStr += `${key}:\n`;
          value.forEach(item => {
            frontmatterStr += `  - ${item}\n`;
          });
        }
      } else if (typeof value === 'string') {
        // 文字列はクォートで囲む（改行やコロンが含まれる場合）
        if (value.includes('\n') || value.includes(':') || value.includes('#')) {
          frontmatterStr += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
        } else {
          frontmatterStr += `${key}: ${value}\n`;
        }
      } else {
        frontmatterStr += `${key}: ${value}\n`;
      }
    }
    frontmatterStr += '---\n\n';

    const newMarkdown = frontmatterStr + convertedContent;

    // ファイルを書き込み
    if (!dryRun) {
      await fs.ensureDir(path.dirname(targetFilePath));
      await fs.writeFile(targetFilePath, newMarkdown, 'utf-8');
    }

    console.log(`✅ ${slug}`);
    if (copiedImages.length > 0) {
      console.log(`   📷 画像 ${copiedImages.length}件: ${copiedImages.join(', ')}`);
    }

    return {
      success: true,
      slug,
      sourceFile: articlePath,
      targetFile: targetFilePath,
      imagesCount: copiedImages.length,
    };
  } catch (error) {
    console.error(`❌ ${articlePath}`);
    console.error(`   エラー: ${error.message}`);
    return {
      success: false,
      sourceFile: articlePath,
      error: error.message,
    };
  }
}

// メイン処理
async function main() {
  try {
    // 記事ファイルを検索
    const pattern = path.join(SOURCE_DIR, '**/index.@(md|markdown)');
    let articleFiles = glob.sync(pattern);

    // 除外ディレクトリをフィルタ
    articleFiles = articleFiles.filter(file => {
      const relativePath = path.relative(SOURCE_DIR, file);
      return !EXCLUDE_DIRS.some(excludeDir => relativePath.startsWith(excludeDir));
    });

    console.log(`📝 検出された記事: ${articleFiles.length}件\n`);

    if (isTest) {
      articleFiles = articleFiles.slice(0, limit);
      console.log(`🧪 テストモード: ${articleFiles.length}件を処理\n`);
    }

    // 移行処理
    const results = [];
    for (const articleFile of articleFiles) {
      const result = await migrateArticle(articleFile, isDryRun);
      results.push(result);
    }

    // 結果サマリ
    console.log('\n' + '='.repeat(60));
    console.log('移行結果サマリ');
    console.log('='.repeat(60));

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const totalImages = results.reduce((sum, r) => sum + (r.imagesCount || 0), 0);

    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failureCount}件`);
    console.log(`📷 画像: ${totalImages}件`);

    if (failureCount > 0) {
      console.log('\n失敗した記事:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.sourceFile}`);
        console.log(`    理由: ${r.error}`);
      });
    }

    if (isDryRun) {
      console.log('\n⚠️  ドライランモードのため、実際のファイル書き込みは行われていません');
    } else {
      console.log('\n✨ 移行が完了しました！');
    }

  } catch (error) {
    console.error('Fatal Error:', error);
    process.exit(1);
  }
}

// 実行
main();

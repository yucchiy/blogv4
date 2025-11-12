import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import projectOgImage from "./og-templates/project";
import siteOgImage from "./og-templates/site";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CACHE_DIR = join(process.cwd(), "node_modules", ".og_image_cache");

// キャッシュディレクトリが存在しない場合は作成
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

// コンテンツのハッシュを生成（タイトルと公開日から）
function generateContentHash(
  post: CollectionEntry<"blog"> | CollectionEntry<"projects">
): string {
  const content = `${post.data.title}|${post.data.pubDatetime?.toISOString() || ""}`;
  return createHash("sha256").update(content).digest("hex").substring(0, 16);
}

export async function generateOgImageForPost(
  post: CollectionEntry<"blog"> | CollectionEntry<"projects">
) {
  // キャッシュキーを生成
  const cacheKey = generateContentHash(post);
  const cachePath = join(CACHE_DIR, `${cacheKey}.png`);

  // キャッシュが存在する場合は再利用
  if (existsSync(cachePath)) {
    console.log(`[OG Cache] Using cached image for: ${post.data.title}`);
    return readFileSync(cachePath);
  }

  // キャッシュがない場合は生成
  console.log(`[OG Cache] Generating new image for: ${post.data.title}`);
  const template = "data" in post && "type" in post.data && post.data.type === "unity-weekly"
    ? projectOgImage
    : postOgImage;
  const svg = await template(post);
  const buffer = svgBufferToPngBuffer(svg);

  // キャッシュに保存
  try {
    writeFileSync(cachePath, buffer);
  } catch (error) {
    console.warn(`[OG Cache] Failed to write cache for: ${post.data.title}`, error);
  }

  return buffer;
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}

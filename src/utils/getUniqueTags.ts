import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
  count: number;
}

// オーバーロード定義
function getUniqueTags(posts: CollectionEntry<"blog">[]): Tag[];
function getUniqueTags(posts: CollectionEntry<"projects">[]): Tag[];
function getUniqueTags(posts: (CollectionEntry<"blog"> | CollectionEntry<"projects">)[]): Tag[];

// 実装
function getUniqueTags(posts: (CollectionEntry<"blog"> | CollectionEntry<"projects">)[]): Tag[] {
  const filteredPosts = posts.filter(post => {
    if (post.collection === "blog") {
      return postFilter(post as CollectionEntry<"blog">);
    }
    return !post.data.draft;
  });

  const countMap = new Map<string, { tagName: string; count: number }>();
  for (const post of filteredPosts) {
    for (const tagName of post.data.tags) {
      const slug = slugifyStr(tagName);
      const existing = countMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(slug, { tagName, count: 1 });
      }
    }
  }

  const tags: Tag[] = Array.from(countMap.entries())
    .map(([tag, { tagName, count }]) => ({ tag, tagName, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
  return tags;
}

export default getUniqueTags;

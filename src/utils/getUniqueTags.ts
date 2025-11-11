import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
}

// オーバーロード定義
function getUniqueTags(posts: CollectionEntry<"blog">[]): Tag[];
function getUniqueTags(posts: CollectionEntry<"projects">[]): Tag[];
function getUniqueTags(posts: (CollectionEntry<"blog"> | CollectionEntry<"projects">)[]): Tag[];

// 実装
function getUniqueTags(posts: (CollectionEntry<"blog"> | CollectionEntry<"projects">)[]): Tag[] {
  const tags: Tag[] = posts
    .filter(post => {
      if (post.collection === "blog") {
        return postFilter(post as CollectionEntry<"blog">);
      }
      // projects の場合は draft でなければ表示
      return !post.data.draft;
    })
    .flatMap(post => post.data.tags)
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
}

export default getUniqueTags;

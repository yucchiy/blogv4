import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";

// オーバーロード定義
function getPostsByTag(posts: CollectionEntry<"blog">[], tag: string): CollectionEntry<"blog">[];
function getPostsByTag(posts: CollectionEntry<"projects">[], tag: string): CollectionEntry<"projects">[];
function getPostsByTag(posts: (CollectionEntry<"blog"> | CollectionEntry<"projects">)[], tag: string): (CollectionEntry<"blog"> | CollectionEntry<"projects">)[];

// 実装
function getPostsByTag(
  posts: (CollectionEntry<"blog"> | CollectionEntry<"projects">)[],
  tag: string
): (CollectionEntry<"blog"> | CollectionEntry<"projects">)[] {
  const filteredPosts = posts.filter(post => slugifyAll(post.data.tags).includes(tag));

  // blog と projects を分けてソート
  const blogPosts = filteredPosts.filter(p => p.collection === "blog") as CollectionEntry<"blog">[];
  const projectPosts = filteredPosts.filter(p => p.collection === "projects") as CollectionEntry<"projects">[];

  const sortedBlogPosts = blogPosts.length > 0 ? getSortedPosts(blogPosts) : [];
  const sortedProjectPosts = projectPosts.length > 0 ? getSortedPosts(projectPosts) : [];

  // 日付順にマージ
  return [...sortedBlogPosts, ...sortedProjectPosts].sort((a, b) => {
    const dateA = a.data.pubDatetime;
    const dateB = b.data.pubDatetime;
    return Math.floor(new Date(dateB).getTime() / 1000) - Math.floor(new Date(dateA).getTime() / 1000);
  });
}

export default getPostsByTag;

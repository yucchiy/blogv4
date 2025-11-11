import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

function getSortedPosts(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[];
function getSortedPosts(posts: CollectionEntry<"projects">[]): CollectionEntry<"projects">[];
function getSortedPosts(posts: CollectionEntry<"blog">[] | CollectionEntry<"projects">[]): CollectionEntry<"blog">[] | CollectionEntry<"projects">[] {
  if (posts.length === 0) return posts;

  const isBlog = posts[0].collection === "blog";

  if (isBlog) {
    return (posts as CollectionEntry<"blog">[])
      .filter(postFilter)
      .sort(
        (a, b) =>
          Math.floor(
            new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
          ) -
          Math.floor(
            new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
          )
      );
  } else {
    return (posts as CollectionEntry<"projects">[])
      .filter(post => !post.data.draft)
      .sort(
        (a, b) =>
          Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
          Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
      );
  }
}

export default getSortedPosts;

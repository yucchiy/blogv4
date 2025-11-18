import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

export async function GET() {
  const posts = await getCollection("blog");
  const projects = await getCollection("projects");
  const sortedPosts = getSortedPosts(posts);
  const sortedProjects = getSortedPosts(projects);

  // blogとprojectsを結合してpubDatetimeでソート
  const allItems = [
    ...sortedPosts.map(({ data, id, filePath }) => ({
      link: getPath(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
    ...sortedProjects.map(({ data, id, filePath }) => ({
      link: getPath(id, filePath),
      title: data.title,
      description: data.description ?? "",
      pubDate: new Date(data.pubDatetime),
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: allItems,
    trailingSlash: false,
  });
}

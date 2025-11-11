import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { SITE } from "@/config";

export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const projects = await getCollection("projects").then(p =>
    p.filter(({ data }) => data.type === "unity-weekly" && !data.draft && !data.ogImage)
  );

  return projects.map(post => ({
    params: { number: post.id.replace("unity-weekly/", "") },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const buffer = await generateOgImageForPost(props as CollectionEntry<"projects">);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};

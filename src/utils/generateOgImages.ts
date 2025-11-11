import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import projectOgImage from "./og-templates/project";
import siteOgImage from "./og-templates/site";

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(
  post: CollectionEntry<"blog"> | CollectionEntry<"projects">
) {
  // projectsコレクションの場合はprojectテンプレートを使用
  const template = "data" in post && "type" in post.data && post.data.type === "unity-weekly"
    ? projectOgImage
    : postOgImage;
  const svg = await template(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}

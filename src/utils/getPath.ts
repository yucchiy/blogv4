import { BLOG_PATH, PROJECTS_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * Get full path of a blog post or project
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true
) {
  // Check if this is a project
  const isProject = filePath?.includes(PROJECTS_PATH);

  // Remove the base path (either BLOG_PATH or PROJECTS_PATH)
  const normalizedPath = filePath
    ?.replace(BLOG_PATH, "")
    .replace(PROJECTS_PATH, "");

  const pathSegments = normalizedPath
    ?.split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -2) // remove the last two segments: directory name and file name
    .map(segment => slugifyStr(segment)); // slugify each segment path

  const basePath = includeBase ? "" : "";

  // Making sure `id` does not contain the directory
  const blogId = id.split("/");
  const slug = blogId.length > 0 ? blogId[blogId.length - 1] : id;

  // For projects, add /project/ prefix
  const projectPrefix = isProject ? "project" : "";

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    if (projectPrefix) {
      return basePath ? [basePath, projectPrefix, slug, ""].join("/") : ["", projectPrefix, slug, ""].join("/");
    }
    return basePath ? [basePath, slug, ""].join("/") : `/${slug}/`;
  }

  if (projectPrefix) {
    return basePath ? [basePath, projectPrefix, ...pathSegments, slug, ""].join("/") : ["", projectPrefix, ...pathSegments, slug, ""].join("/");
  }
  return basePath ? [basePath, ...pathSegments, slug, ""].join("/") : ["", ...pathSegments, slug, ""].join("/");
}

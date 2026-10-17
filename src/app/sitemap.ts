import type { MetadataRoute } from "next";
import { pageIds } from "@/lib/seo";
import { absoluteUrl } from "@/lib/urls";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return pageIds.map(id => ({ url: absoluteUrl(id === "index" ? "/" : `/${id}.html`) }));
}

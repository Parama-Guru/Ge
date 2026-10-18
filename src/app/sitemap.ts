import type { MetadataRoute } from "next";
import { canonicalPath, pageIds } from "@/lib/pages";
import { absoluteUrl } from "@/lib/urls";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return pageIds.map(id => ({
    url: absoluteUrl(canonicalPath(id)),
    changeFrequency: "yearly",
    priority: id === "index" ? 1 : .7,
  }));
}

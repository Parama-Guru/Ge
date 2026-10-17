import type { MetadataRoute } from "next";
import { absoluteUrl, indexable } from "@/lib/urls";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

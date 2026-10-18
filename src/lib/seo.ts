import type { Metadata } from "next";
import { canonicalPath, page, pageHref } from "./pages";
import { absoluteUrl, indexable } from "./urls";

export function pageMetadata(id: string): Metadata {
  const { title, description } = page(id);
  const url = absoluteUrl(canonicalPath(id));
  const image = absoluteUrl("/media/slide3.webp");
  return {
    title: id === "index" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: "website", siteName: "Ganesh Electricals", locale: "en_IN", title, description, url,
      images: [{ url: image, width: 1600, height: 600, alt: "Electrical substation" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function breadcrumbJsonLd(id: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: page(id).title, item: absoluteUrl(pageHref(id)) },
    ],
  }).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ganesh Electricals",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/media/wganesh3.webp"),
    foundingDate: "1997",
    telephone: "+91-44-4284-0227",
    email: "ganeshvar@yahoo.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No.1 New Street, Sakthi Nagar, Porur",
      addressLocality: "Chennai",
      postalCode: "600116",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
  }).replace(/</g, "\\u003c");
}

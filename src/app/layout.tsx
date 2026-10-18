import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource/barlow-condensed/latin-400.css";
import "./globals.css";
import { CinemaShell } from "@/components/cinema-shell";
import { absoluteUrl, assetPath, siteUrl } from "@/lib/urls";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata("index"),
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: "Ganesh Electricals", template: "%s | Ganesh Electricals" },
  icons: { icon: assetPath("/icon.svg") },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body id="top">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "Organization",
      name: "Ganesh Electricals", url: absoluteUrl("/"), logo: absoluteUrl("/media/wganesh3.webp"),
      foundingDate: "1997", telephone: "+91-44-4284-0227", email: "ganeshvar@yahoo.com",
      address: { "@type": "PostalAddress", streetAddress: "No.1 New Street, Sakthi Nagar, Porur", addressLocality: "Chennai", postalCode: "600116", addressRegion: "Tamil Nadu", addressCountry: "IN" },
    }).replace(/</g, "\\u003c") }} />
    <a href="#main" className="skip-link">Skip to content</a>
    <CinemaShell>{children}</CinemaShell>
  </body></html>;
}

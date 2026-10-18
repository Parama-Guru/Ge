import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource/barlow-condensed/latin-400.css";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import { assetPath, siteUrl } from "@/lib/urls";

export const metadata: Metadata = {
  ...pageMetadata("index"),
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: "Ganesh Electricals", template: "%s | Ganesh Electricals" },
  applicationName: "Ganesh Electricals",
  icons: { icon: assetPath("/icon.svg") },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#081924",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd() }} />
    <a href="#main" className="skip-link">Skip to content</a>
    <SiteShell>{children}</SiteShell>
  </body></html>;
}

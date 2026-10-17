import { Arrow, PageIntro, SiteLink as Link } from "@/components/ui";

export default function NotFound() {
  return <div className="not-found"><PageIntro eyebrow="404" title="Page not found" description="The requested page is not available." /><div className="container"><Link href="/index.html" className="button button-blue">Home<Arrow /></Link></div></div>;
}

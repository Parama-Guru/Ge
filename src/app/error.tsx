"use client";

import { useEffect } from "react";
import { SiteLink as Link } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[Ganesh Electricals page]", error); }, [error]);
  return <section className="not-found"><p className="eyebrow">The page could not load</p><h1>Let&apos;s reconnect.</h1><p className="lead">Something prevented this page from loading. Please retry, or return to the homepage.</p><div className="actions"><button className="button" onClick={reset}>Try again</button><Link className="text-link" href="/index.html">Back to home</Link></div></section>;
}

import type { ComponentProps } from "react";
import { assetPath } from "@/lib/urls";

export function SiteLink({ href, ...props }: ComponentProps<"a">) {
  let target = href;
  if (target?.startsWith("/")) {
    if (process.env.NODE_ENV === "development") {
      target = target.replace(/^\/index\.html(?=#|$)/, "/").replace(/\.html(?=#|$)/, "");
    }
    target = assetPath(target);
  }
  return <a {...props} href={target} />;
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

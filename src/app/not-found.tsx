import { menuNavigation, navigationLabels, page, pageHref } from "@/lib/pages";
import { Arrow, SiteLink as Link } from "@/components/ui";

export default function NotFound() {
  return <section className="not-found">
    <p className="eyebrow"><span />404</p>
    <h1>Page not found</h1>
    <p className="lead">The requested page is not available. Choose a page below.</p>
    <nav className="link-row" aria-label="Website pages">
      {menuNavigation.map(id => <Link key={id} className="text-link" href={pageHref(id)}>{navigationLabels[id] ?? page(id).label}<Arrow diagonal /></Link>)}
    </nav>
  </section>;
}

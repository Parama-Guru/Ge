"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import type { WorldMotion } from "@/lib/world";
import { assetPath, withoutBasePath } from "@/lib/urls";
import { Arrow, SiteLink as Link } from "./ui";
import { PageMotion } from "./page-motion";

const ElectricalScene = dynamic(() => import("./electrical-scene").then(module => module.ElectricalScene), { ssr: false });
const navigation = [
  ["/index.html", "Home"], ["/index.html#about", "About"], ["/index.html#why-us", "Features"],
  ["/index.html#clients", "Clients"], ["/founder.html", "Leadership"], ["/team.html", "Org Chart"],
  ["/project1.html", "Projects"], ["/ehs.html", "Quality & Safety"],
  ["/downloads.html", "Downloads"], ["/index.html#contact", "Contact"],
];

class WorldBoundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[3D background]", error, info.componentStack);
    this.props.onError("The 3D background is unavailable. All website content remains accessible.");
  }
  render() { return this.state.failed ? null : this.props.children; }
}

export function CinemaShell({ children }: { children: ReactNode }) {
  const pathname = withoutBasePath(usePathname());
  const route = pathname === "/" || pathname.endsWith(".html") ? pathname : `${pathname}.html`;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const motion = useRef<WorldMotion>({
    paused: false, reduced: false, hidden: false, menuOpen: false, scroll: 0,
  });
  const markReady = useCallback(() => setReady(true), []);
  const fail = useCallback((message: string) => {
    console.error("[3D background]", message);
    setError(message);
  }, []);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) setEnabled(false);
    };
    const visibility = () => setHidden(document.visibilityState === "hidden");
    update();
    const timer = setTimeout(() => {
      const connection = "connection" in navigator ? navigator.connection : null;
      const saveData = connection && typeof connection === "object" && "saveData" in connection && connection.saveData === true;
      if (!preference.matches && !saveData) setEnabled(true);
    }, 1500);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearTimeout(timer);
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    Object.assign(motion.current, { paused, reduced, hidden: hidden || !inView, menuOpen });
    window.dispatchEvent(new Event("world-control"));
  }, [paused, reduced, hidden, menuOpen, inView]);
  useEffect(() => {
    const scroll = () => {
      setScrolled(window.scrollY > 30);
      setInView(window.scrollY < window.innerHeight * 1.25);
      motion.current.scroll = Math.min(1, window.scrollY / window.innerHeight);
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    if (!enabled || ready || error) return;
    const timer = setTimeout(() => fail("The 3D background could not finish loading. The website content is still available."), 25000);
    return () => clearTimeout(timer);
  }, [enabled, ready, error, fail]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);
  const close = () => { dialog.current?.close(); setMenuOpen(false); };

  return <div className={`cinema-shell ${route === "/" || route === "/index.html" ? "is-site-home" : "is-reading"}`} data-world={error ? "fallback" : !enabled ? "static" : ready ? "ready" : "loading"}>
    <PageMotion disabled={paused || reduced} />
    <div className="world-stage" aria-hidden="true">
      <picture className="world-poster">
        <source media="(max-width: 900px)" srcSet={assetPath("/media/cable-mobile.webp")} />
        <img src={assetPath("/media/cable-desktop.webp")} alt="" width="1440" height="940" fetchPriority="high" />
      </picture>
      {enabled && !error && <WorldBoundary onError={fail}>
        <ElectricalScene motion={motion} route={route}
          motionEnabled={!paused && !reduced && !hidden && !menuOpen && inView}
          onReady={markReady} onError={fail} />
      </WorldBoundary>}
    </div>
    <div className="cinema-shade" aria-hidden="true" />
    <header className="cinema-header" data-scrolled={scrolled}>
      <Link href="/" className="cinema-brand brand-mark" aria-label="Ganesh Electricals home"><img src={assetPath("/media/wganesh3.webp")} width="280" height="36" alt="Ganesh Electricals" /></Link>
      <nav className="standard-navigation" aria-label="Main navigation">
        {[["/index.html#about", "About"], ["/index.html#why-us","Features"], ["/project1.html", "Projects"], ["/ehs.html", "Quality & Safety"]].map(([href, label]) => <Link href={href} key={href} aria-current={route === href ? "page" : undefined}>{label}</Link>)}
      </nav>
      <Link className="header-contact" href="/index.html#contact">Contact<Arrow diagonal /></Link>
      <button className="index-trigger" type="button" ref={trigger} aria-haspopup="dialog" aria-expanded={menuOpen}
        onClick={() => { setMenuOpen(true); dialog.current?.showModal(); }}>Menu<span><i /><i /></span></button>
    </header>
    {error && <p className="world-status" role="status">{error}</p>}
    <noscript><style>{".world-stage,.index-trigger,.project-filters,.enquiry-form{display:none!important}.cinema-header{position:relative!important}.reading-main{padding-top:20px!important}"}</style>
      <nav className="noscript-links" aria-label="All website pages">{navigation.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    </noscript>
    <main id="main" className="reading-main">{children}</main>
    <footer className="reading-footer">
      <div className="company-footer-copy"><strong>GANESH ELECTRICALS</strong><p>Ganesh Electricals, established in 1997, is a renowned firm providing EHV and MV/LV installations for several industries.</p><address>No.1 New Street<br />Sakthi Nagar, Porur<br />Chennai - 600 116</address><a href="tel:+914442840227">+91-44 4284 0227</a><a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com</a></div>
      <div className="company-footer-links"><Link href="/index.html">Home</Link><Link href="/founder.html">Leadership</Link><Link href="/project1.html">Projects</Link><Link href="/downloads.html">Downloads</Link><Link href="/index.html#contact">Contact</Link></div>
      <div className="company-newsletter"><strong>OUR NEWSLETTER</strong><p>To obtain detailed information, please subscribe to our mailing list below.</p><a href="mailto:ganeshvar@yahoo.com?subject=Newsletter%20subscription">Subscribe by email<Arrow diagonal /></a></div>
      <small className="company-copyright">© 2019 Copyright Ganesh Electricals. All Rights Reserved</small>
    </footer>
    <dialog ref={dialog} className="world-index" aria-label="Website menu" onClose={() => { setMenuOpen(false); trigger.current?.focus(); }}>
      <div className="index-header"><img src={assetPath("/media/wganesh3.webp")} width="280" height="36" alt="Ganesh Electricals" /><button type="button" onClick={close} aria-label="Close menu">Close <span>×</span></button></div>
      <nav className="standard-menu" aria-label="All website pages">{navigation.map(([href, label]) => <Link href={href} key={href} onClick={close}>{label}<Arrow diagonal /></Link>)}</nav>
      <label className="background-preference"><input type="checkbox" checked={paused || reduced} disabled={reduced} onChange={event => setPaused(event.target.checked)} />Pause decorative motion</label>
      {!reduced && <label className="background-preference"><input type="checkbox" checked={enabled} onChange={event => {
        setReady(false);
        setError("");
        setEnabled(event.target.checked);
      }} />Show 3D background</label>}
      <div className="index-footer"><a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com</a><a href="tel:+914442840227">044-4284 0227</a></div>
    </dialog>
  </div>;
}

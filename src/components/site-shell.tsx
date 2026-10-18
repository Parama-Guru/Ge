"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { headerNavigation, menuNavigation, navigationLabels, page, pageHref, type SceneKey } from "@/lib/pages";
import { assetPath, withoutBasePath } from "@/lib/urls";
import { createWorldState, type Placement } from "@/lib/world";
import { PageMotion } from "./page-motion";
import { Arrow, SiteLink as Link } from "./ui";

const WorldCanvas = dynamic(() => import("./world/world-canvas").then(module => module.WorldCanvas), { ssr: false });

class WorldBoundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[3D]", error, info.componentStack);
    this.props.onError("The 3D illustrations are unavailable. All website content remains accessible.");
  }
  render() { return this.state.failed ? null : this.props.children; }
}

function prefersLightLoading() {
  const connection = "connection" in navigator ? navigator.connection : null;
  return Boolean(connection && typeof connection === "object" && "saveData" in connection && connection.saveData === true);
}

function routeId(pathname: string) {
  const path = withoutBasePath(pathname);
  if (path === "/" || path === "/index.html") return "index";
  return path.replace(/^\//, "").replace(/\.html$/, "");
}

function label(id: string) {
  return navigationLabels[id] ?? page(id).label;
}

function requestedPoster() {
  return (window as Window & { __gePoster?: SceneKey }).__gePoster ?? null;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const current = routeId(usePathname());
  const world = useRef(createWorldState());
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [scenes, setScenes] = useState<SceneKey[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [poster, setPoster] = useState<SceneKey | null>(null);

  const markReady = useCallback(() => setReady(true), []);
  const fail = useCallback((message: string) => {
    console.error("[3D]", message);
    setError(message);
  }, []);

  useEffect(() => {
    const requested = requestedPoster();
    if (requested) {
      setPoster(requested);
      Object.assign(world.current, { scene: requested, backdrop: false, progress: .5, anchor: { x: .5, y: .5, width: 1, height: 1 } });
      setEnabled(true);
      return;
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) setEnabled(false);
    };
    const visibility = () => setHidden(document.visibilityState === "hidden");
    update();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const start = () => { if (!preference.matches && !prefersLightLoading()) setEnabled(true); };
    const supportsIdle = typeof window.requestIdleCallback === "function";
    const idle = supportsIdle ? window.requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200);
    return () => {
      if (supportsIdle) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle);
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (requestedPoster()) return;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    setScenes([...new Set(sections.map(section => section.dataset.scene as SceneKey))]);
    const posed = document.querySelector<HTMLElement>("[data-pose], [data-mirror]");
    world.current.pose = Number(posed?.dataset.pose ?? 0);
    world.current.mirror = posed?.dataset.mirror === "true";
    let frame = 0;
    let first = true;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 30);
      if (!sections.length) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const center = height * .5;
      let active = sections[0];
      let closest = Infinity;
      const placements: Partial<Record<SceneKey, Placement>> = {};
      const nearest: Partial<Record<SceneKey, number>> = {};
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const distance = rect.top <= center && rect.bottom >= center ? 0 : Math.min(Math.abs(rect.top - center), Math.abs(rect.bottom - center));
        if (distance < closest) { closest = distance; active = section; }
        const key = section.dataset.scene as SceneKey;
        if ((nearest[key] ?? Infinity) <= distance) continue;
        nearest[key] = distance;
        const box = section.dataset.backdrop === "true" ? null : section.querySelector<HTMLElement>(".scene-window")?.getBoundingClientRect();
        if (box) {
          const shown = Math.max(0, Math.min(box.bottom, height) - Math.max(box.top, 0)) / Math.max(box.height, 1);
          placements[key] = { x: (box.left + box.width / 2) / width, y: (box.top + box.height / 2) / height, width: box.width / width, height: box.height / height, backdrop: false, visible: shown > .35 };
        } else {
          const span = Math.min(rect.height, height);
          const low = rect.top + span / 2;
          const middle = Math.min(Math.max(center, low), Math.max(low, rect.bottom - span / 2));
          placements[key] = { x: .72, y: middle / height, width: .7, height: span / height * .9, backdrop: true, visible: false };
        }
      }
      const rect = active.getBoundingClientRect();
      const state = world.current;
      const scene = active.dataset.scene as SceneKey;
      const placement = placements[scene];
      if (state.scene !== scene && !first && stage.current) {
        stage.current.dataset.focus = stage.current.dataset.focus === "a" ? "b" : "a";
      }
      first = false;
      state.scene = scene;
      state.placements = placements;
      state.backdrop = Boolean(placement?.backdrop);
      state.progress = Math.min(1, Math.max(0, (center - rect.top) / Math.max(rect.height, 1)));
      state.anchor = placement
        ? { x: placement.x, y: placement.y, width: placement.width, height: placement.height }
        : { x: .5, y: .5, width: 1, height: 1 };
      state.dirty = true;
      if (stage.current) {
        stage.current.dataset.scene = scene;
        stage.current.dataset.backdrop = String(state.backdrop);
      }
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [current]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  useEffect(() => {
    if (!enabled || ready || error) return;
    const timer = setTimeout(() => fail("The 3D illustrations could not finish loading. The website content is still available."), 25000);
    return () => clearTimeout(timer);
  }, [enabled, ready, error, fail]);

  const close = () => { dialog.current?.close(); setMenuOpen(false); };
  const motionEnabled = !paused && !reduced && !hidden && !menuOpen;
  const worldState = error ? "fallback" : !enabled ? "static" : ready ? "ready" : "loading";

  return <div className="site-shell" data-world={worldState} data-poster={poster ?? undefined}>
    <PageMotion disabled={paused || reduced || Boolean(poster)} />
    <div className="world-stage" ref={stage} aria-hidden="true">
      {enabled && !error && <WorldBoundary onError={fail}>
        <WorldCanvas world={world} scenes={scenes} motionEnabled={motionEnabled} poster={poster} onReady={markReady} onError={fail} />
      </WorldBoundary>}
    </div>
    <header className="site-header" data-scrolled={scrolled}>
      <Link href="/index.html" className="brand" aria-label="Ganesh Electricals home"><img src={assetPath("/media/wganesh3.webp")} width="280" height="36" alt="Ganesh Electricals" /></Link>
      <nav className="header-navigation" aria-label="Main navigation">
        {headerNavigation.map(id => <Link key={id} href={pageHref(id)} aria-current={current === id || (id === "project1" && current.startsWith("project")) ? "page" : undefined}>{label(id)}</Link>)}
      </nav>
      <Link className="header-contact" href="/contact.html" aria-current={current === "contact" ? "page" : undefined}>Contact<Arrow diagonal /></Link>
      <button className="menu-trigger" type="button" ref={trigger} aria-haspopup="dialog" aria-expanded={menuOpen}
        onClick={() => { setMenuOpen(true); dialog.current?.showModal(); }}>Menu<span><i /><i /></span></button>
    </header>
    {error && <p className="world-status" role="status">{error}</p>}
    <noscript>
      <style>{".world-stage,.menu-trigger,.enquiry-form{display:none!important}.site-header{position:relative!important}"}</style>
      <nav className="noscript-links" aria-label="All website pages">{menuNavigation.map(id => <a key={id} href={assetPath(pageHref(id))}>{label(id)}</a>)}</nav>
    </noscript>
    <main id="main">{children}</main>
    <footer className="site-footer">
      <div className="footer-brand">
        <strong>GANESH ELECTRICALS</strong>
        <p>Ganesh Electricals, established in 1997, is a renowned firm providing EHV and MV/LV installations for several industries.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        {menuNavigation.map(id => <Link key={id} href={pageHref(id)}>{label(id)}</Link>)}
      </nav>
      <div className="footer-contact">
        <strong>CONTACT US</strong>
        <address>No.1 New Street<br />Sakthi Nagar, Porur<br />Chennai - 600 116</address>
        <a href="tel:+914442840227">+91-44 4284 0227</a>
        <a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com</a>
      </div>
      <div className="footer-newsletter">
        <strong>OUR NEWSLETTER</strong>
        <p>To obtain detailed information, please subscribe to our mailing list below.</p>
        <a href="mailto:ganeshvar@yahoo.com?subject=Newsletter%20subscription">Subscribe by email<Arrow diagonal /></a>
      </div>
      <small className="footer-copyright">© 2019 Copyright Ganesh Electricals. All Rights Reserved</small>
    </footer>
    <dialog ref={dialog} className="site-menu" aria-label="Website menu" onClose={() => { setMenuOpen(false); trigger.current?.focus(); }}>
      <div className="menu-header">
        <img src={assetPath("/media/wganesh3.webp")} width="280" height="36" alt="Ganesh Electricals" />
        <button type="button" onClick={close} aria-label="Close menu">Close <span>×</span></button>
      </div>
      <nav className="menu-links" aria-label="All website pages">
        {menuNavigation.map(id => <Link key={id} href={pageHref(id)} onClick={close} aria-current={current === id ? "page" : undefined}>{label(id)}<Arrow diagonal /></Link>)}
      </nav>
      <div className="menu-preferences">
        <label><input type="checkbox" checked={paused || reduced} disabled={reduced} onChange={event => setPaused(event.target.checked)} />Pause motion</label>
        {!reduced && <label><input type="checkbox" checked={enabled && !error} onChange={event => {
          setReady(false);
          setError("");
          setEnabled(event.target.checked);
        }} />Show 3D illustrations</label>}
      </div>
      <div className="menu-footer"><a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com</a><a href="tel:+914442840227">044-4284 0227</a></div>
    </dialog>
  </div>;
}

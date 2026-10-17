"use client";

import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/urls";

type Slide = { name: string; label: string };

export function ImageCarousel({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const container = useRef<HTMLElement>(null);
  const running = !paused && !reduced && visible && !hidden && !hovered && !focused;

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(preference.matches);
    const visibility = () => setHidden(document.visibilityState === "hidden");
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: .2 });
    motion();
    visibility();
    const connection = "connection" in navigator ? navigator.connection : null;
    if (connection && typeof connection === "object" && "saveData" in connection && connection.saveData === true) setPaused(true);
    if (container.current) observer.observe(container.current);
    preference.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (!running || pending !== null) return;
    const timer = setTimeout(() => setPending((active + 1) % slides.length), 5000);
    return () => clearTimeout(timer);
  }, [running, pending, active, slides.length]);
  useEffect(() => {
    if (previous === null) return;
    const timer = setTimeout(() => setPrevious(null), 900);
    return () => clearTimeout(timer);
  }, [previous]);
  useEffect(() => {
    if (pending === null) return;
    const timer = setTimeout(() => {
      console.error("Banner image timed out:", slides[pending].name);
      setError("The next image could not load. Please try another image.");
      setPending(null);
      setPaused(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [pending, slides]);

  const select = (direction: number) => {
    setPaused(true);
    setError("");
    setPending((active + direction + slides.length) % slides.length);
  };
  const rendered = [...new Set([previous, active, pending])].filter((index): index is number => index !== null);

  return <section className="image-carousel" ref={container} aria-label="Electrical installation images"
    data-active={active} data-rotating={running}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    }}>
    <div className="carousel-stage">
      {rendered.map(index => <img key={index}
        src={assetPath(`/media/${slides[index].name}.webp`)}
        srcSet={[480, 960, 1600].map(width => `${assetPath(`/media/${slides[index].name}${width === 1600 ? "" : `-${width}`}.webp`)} ${width}w`).join(", ")}
        sizes="(max-width: 800px) 90vw, 45vw"
        width="1600" height="600"
        alt={index === active ? slides[index].label : ""}
        aria-hidden={index !== active}
        className={index === active ? "carousel-image is-active" : "carousel-image"}
        fetchPriority={index === 0 ? "high" : "auto"}
        onLoad={() => {
          if (index === pending) {
            setPrevious(active);
            setActive(index);
            setPending(null);
          }
        }}
        onError={() => {
          console.error("Banner image failed:", slides[index].name);
          setError("An image is unavailable. Please try another image.");
          setPending(null);
          setPaused(true);
        }}
      />)}
    </div>
    <div className="carousel-footer">
      <p aria-live={paused ? "polite" : "off"}>{slides[active].label}</p>
      <div className="carousel-controls">
        <button type="button" aria-label="Previous image" disabled={pending !== null} onClick={() => select(-1)}>←</button>
        <button type="button" aria-label={paused || reduced ? "Resume image rotation" : "Pause image rotation"}
          aria-pressed={paused || reduced} disabled={reduced}
          title={reduced ? "Automatic rotation is disabled by your reduced-motion preference" : undefined}
          onClick={() => setPaused(value => !value)}>{paused || reduced ? "▷" : "Ⅱ"}</button>
        <button type="button" aria-label="Next image" disabled={pending !== null} onClick={() => select(1)}>→</button>
      </div>
    </div>
    {error && <p className="carousel-error" role="status">{error}</p>}
  </section>;
}

"use client";

import { useEffect } from "react";

export function PageMotion({ disabled }: { disabled: boolean }) {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = "connection" in navigator ? navigator.connection : null;
    if (disabled || preference.matches ||
        (connection && typeof connection === "object" && "saveData" in connection && connection.saveData === true)) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const match = gsap.matchMedia();
      match.add("(prefers-reduced-motion: no-preference)", () => {
        document.documentElement.dataset.motion = "enabled";
        gsap.from(".brand-mark", { opacity: 0, y: -6, duration: .7, clearProps: "all" });
        if (document.querySelector(".hero-title")) gsap.from(".hero-title > span", { opacity: 0, y: 28, stagger: .12, duration: 1, ease: "power3.out", clearProps: "all" });
        for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
          const distance = innerWidth < 800 ? 18 : 35;
          gsap.from(element, {
            y: distance, opacity: 0, duration: .85, ease: "power2.out",
            clearProps: "all",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
          });
        }
        for (const group of document.querySelectorAll<HTMLElement>("[data-stagger]")) {
          gsap.from(group.children, {
            y: 22, opacity: 0, stagger: .075, duration: .65, ease: "power2.out",
            clearProps: "all",
            scrollTrigger: { trigger: group, start: "top 94%", once: true },
          });
        }
        for (const line of document.querySelectorAll<HTMLElement>("[data-draw]")) {
          gsap.from(line, {
            scaleX: 0, transformOrigin: "left", ease: "none",
            scrollTrigger: { trigger: line, start: "top 88%", end: "top 38%", scrub: .6 },
          });
        }
        if (innerWidth >= 1000 && document.querySelector(".hero-object-caption")) {
          gsap.to(".hero-object-caption", { y: -22, opacity: .3, ease: "none",
            scrollTrigger: { trigger: ".company-hero", start: "top top", end: "bottom top", scrub: .6 } });
        }
        return () => { delete document.documentElement.dataset.motion; };
      });
      cleanup = () => match.revert();
      requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); });
    }).catch(error => {
      console.error("[Page motion] Animation could not initialize; readable content remains available.", error);
      document.documentElement.dataset.motion = "unavailable";
    });
    return () => {
      disposed = true;
      cleanup?.();
      delete document.documentElement.dataset.motion;
    };
  }, [disabled]);
  return null;
}

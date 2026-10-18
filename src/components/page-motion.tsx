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
        const distance = innerWidth < 800 ? 18 : 35;
        if (document.querySelector(".hero-title")) {
          gsap.from(".hero-title > span", { opacity: 0, y: 28, stagger: .12, duration: 1, ease: "power3.out", clearProps: "all" });
        }
        for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
          gsap.from(element, {
            y: distance, opacity: 0, duration: .85, ease: "power2.out", clearProps: "all",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
          });
        }
        for (const group of document.querySelectorAll<HTMLElement>("[data-stagger]")) {
          gsap.from(group.children, {
            y: 22, opacity: 0, stagger: .075, duration: .65, ease: "power2.out", clearProps: "all",
            scrollTrigger: { trigger: group, start: "top 94%", once: true },
          });
        }
        for (const line of document.querySelectorAll<HTMLElement>("[data-draw]")) {
          gsap.from(line, {
            scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "power2.inOut", clearProps: "transform",
            scrollTrigger: { trigger: line, start: "top 90%", once: true },
          });
        }
        for (const number of document.querySelectorAll<HTMLElement>("[data-count]")) {
          const finalText = number.textContent ?? "";
          const target = Number(number.dataset.count);
          const counter = { value: 0 };
          gsap.to(counter, {
            value: target, duration: 1.4, ease: "power2.out",
            scrollTrigger: { trigger: number, start: "top 92%", once: true },
            onUpdate: () => { number.textContent = Math.round(counter.value).toLocaleString("en-IN"); },
            onComplete: () => { number.textContent = finalText; },
          });
        }
        return () => {
          for (const number of document.querySelectorAll<HTMLElement>("[data-count]")) number.textContent = number.dataset.final ?? number.textContent;
          delete document.documentElement.dataset.motion;
        };
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

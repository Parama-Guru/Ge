import type { RefObject } from "react";

export type Vector = [number, number, number];
export type WorldMotion = {
  paused: boolean;
  reduced: boolean;
  hidden: boolean;
  menuOpen: boolean;
};
export type WorldProps = {
  motion: RefObject<WorldMotion>;
  route: string;
  motionEnabled: boolean;
  onReady: () => void;
  onError: (message: string) => void;
};

export function cameraView(route: string): { position: Vector; target: Vector } {
  if (route.startsWith("/project")) return { position: [20, 10, 14], target: [7, 3, -5] };
  if (route === "/ehs.html") return { position: [-10, 5, 13], target: [-5, 2, 0] };
  if (["/founder.html", "/team.html", "/org.html"].includes(route)) return { position: [24, 18, -24], target: [3, 2, -3] };
  return { position: [32, 16, 34], target: [0, 3, -2] };
}

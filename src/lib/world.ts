import type { RefObject } from "react";

export type WorldMotion = {
  paused: boolean;
  reduced: boolean;
  hidden: boolean;
  menuOpen: boolean;
  scroll: number;
};
export type WorldProps = {
  motion: RefObject<WorldMotion>;
  route: string;
  motionEnabled: boolean;
  onReady: () => void;
  onError: (message: string) => void;
};

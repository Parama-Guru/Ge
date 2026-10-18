import type { RefObject } from "react";
import type { SceneKey } from "./pages";

export type Anchor = { x: number; y: number; width: number; height: number };

export type Placement = Anchor & { backdrop: boolean; visible: boolean };

export type WorldState = {
  scene: SceneKey | null;
  backdrop: boolean;
  progress: number;
  anchor: Anchor;
  placements: Partial<Record<SceneKey, Placement>>;
  pose: number;
  mirror: boolean;
  dirty: boolean;
  settling: boolean;
  time: number;
};

export type WorldProps = {
  world: RefObject<WorldState>;
  scenes: SceneKey[];
  motionEnabled: boolean;
  poster: SceneKey | null;
  onReady: () => void;
  onError: (message: string) => void;
};

export function createWorldState(): WorldState {
  return {
    scene: null,
    backdrop: false,
    progress: 0.5,
    anchor: { x: 0.5, y: 0.5, width: 0.5, height: 0.6 },
    placements: {},
    pose: 0,
    mirror: false,
    dirty: true,
    settling: true,
    time: 0,
  };
}

import registry from "@/data/pages.json";

export const sceneKeys = ["cable", "busbar", "insulator", "switchgear", "breaker", "network", "coil"] as const;
export type SceneKey = (typeof sceneKeys)[number];

export type PageEntry = {
  id: string;
  label: string;
  scene: SceneKey;
  pose?: number;
  mirror?: boolean;
  title: string;
  description: string;
};

export const pages = registry as PageEntry[];
export const pageIds = pages.map(page => page.id);

export function page(id: string) {
  const entry = pages.find(item => item.id === id);
  if (!entry) throw new Error(`Unknown page: ${id}`);
  return entry;
}

export function pageHref(id: string) {
  return `/${id}.html`;
}

export function canonicalPath(id: string) {
  return id === "index" ? "/" : pageHref(id);
}

export const headerNavigation = ["about", "features", "project1", "clients", "ehs"];
export const menuNavigation = ["index", "about", "features", "clients", "founder", "team", "project1", "ehs", "downloads", "contact"];
export const navigationLabels: Record<string, string> = { project1: "Projects" };

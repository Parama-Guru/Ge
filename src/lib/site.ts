import "server-only";
import data from "@/data/site.json";

export const site = data;
export function pageContent(id: string) {
  const page = site.pages.find(p => p.id === id);
  if (!page) throw new Error(`Missing company page: ${id}`);
  return page;
}
export type TeamNode = { label: string; children: TeamNode[] };

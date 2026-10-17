export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://parama-guru.github.io/Ge").replace(/\/$/, "");
export const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export function assetPath(path: string) {
  return `${basePath}${path}`;
}

export function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}

export function withoutBasePath(path: string) {
  return basePath && (path === basePath || path.startsWith(`${basePath}/`))
    ? path.slice(basePath.length) || "/"
    : path;
}

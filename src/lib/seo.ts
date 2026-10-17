import type { Metadata } from "next";
import { absoluteUrl, indexable } from "./urls";

export const pageIds = ["index", "founder", "team", "org", "project1", "project2", "project3", "project4", "ehs", "downloads"];
const descriptions: Record<string, [string, string]> = {
  index: ["Ganesh Electricals", "Ganesh Electricals, established in 1997 in Chennai, provides EHV and MV/LV electrical installations for industrial projects."],
  founder: ["Leadership", "The founding story of Ganesh Electricals and Mr. B. Kumareson, with the company's mission for quality, safety and industrial electrification."],
  team: ["Organisation Chart", "The organisation structure of Ganesh Electricals, covering leadership, technical design, projects, quality and supporting teams."],
  org: ["Organisation Chart — Alternate", "The alternate published organisation chart of Ganesh Electricals, preserving its technical, projects, quality and supporting roles."],
  project1: ["Projects 2013–2014", "Ganesh Electricals' published projects for 2013–2014, including switchyard works, electrical installations, client names and localities."],
  project2: ["Projects 2014–2016", "Ganesh Electricals' published projects for 2014–2015 and 2015–2016, including HT/LT electrical installations and cable laying."],
  project3: ["Projects 2016–2017", "Ganesh Electricals' published projects for 2016–2017, with original electrical installation scopes, client names and localities."],
  project4: ["Projects 2017–2018", "Ganesh Electricals' published projects for 2017–2018, including expansion, HT/LT installation and LT panel supply."],
  ehs: ["Quality & Safety", "Read Ganesh Electricals' quality policy, quality standards and environmental, health and safety commitments."],
  downloads: ["Downloads", "Company profile, news and outreach document information for Ganesh Electricals. Contact the office to request currently unavailable brochures."],
};

export function pageMetadata(id: string): Metadata {
  const entry = descriptions[id];
  if (!entry) throw new Error(`Missing metadata for ${id}`);
  const [title, description] = entry;
  const url = absoluteUrl(id === "index" ? "/" : `/${id}.html`);
  const image = absoluteUrl("/media/slide3.webp");
  return {
    title: id === "index" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: "website", siteName: "Ganesh Electricals", title, description, url,
      images: [{ url: image, width: 1600, height: 600, alt: "Electrical substation" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

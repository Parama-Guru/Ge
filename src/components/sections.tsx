import type { ReactNode } from "react";
import { page, type SceneKey } from "@/lib/pages";
import { breadcrumbJsonLd } from "@/lib/seo";
import { assetPath } from "@/lib/urls";
import { SiteLink as Link } from "./ui";

function ScenePoster({ scene, eager }: { scene: SceneKey; eager?: boolean }) {
  return <img className="scene-poster" src={assetPath(`/media/scene-${scene}.webp`)} width={720} height={720} alt=""
    loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} />;
}

export function SceneSection({ scene, side = "right", id, className = "", eager, pose, mirror, children }: {
  scene: SceneKey; side?: "left" | "right"; id?: string; className?: string; eager?: boolean; pose?: number; mirror?: boolean; children: ReactNode;
}) {
  return <section id={id} className={`scene-section ${className}`} data-scene={scene} data-side={side}
    data-pose={pose || undefined} data-mirror={mirror || undefined}>
    <div className="scene-panel" data-reveal>{children}</div>
    <div className="scene-window" aria-hidden="true"><ScenePoster scene={scene} eager={eager} /></div>
  </section>;
}

export function GlassSection({ scene, id, className = "", children }: { scene: SceneKey; id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={`glass-section ${className}`} data-scene={scene} data-backdrop="true">
    <div className="glass">{children}</div>
  </section>;
}

export function PageHero({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: ReactNode; children?: ReactNode }) {
  const entry = page(id);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd(id) }} />
    <SceneSection scene={entry.scene} pose={entry.pose} mirror={entry.mirror} eager className="page-hero">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol><li><Link href="/index.html">Home</Link></li><li aria-current="page">{entry.title}</li></ol>
      </nav>
      <p className="eyebrow"><span />{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </SceneSection>
  </>;
}

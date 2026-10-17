import { assetPath } from "@/lib/urls";
import { pageContent, site, type TeamNode } from "@/lib/site";
import { EnquiryForm } from "./enquiry-form";
import { ImageCarousel } from "./image-carousel";
import { Arrow, PageIntro, SiteLink as Link } from "./ui";

export function CompanyHome() {
  const home = pageContent("home");
  const p = home.paragraphs;
  return <>
    <section className="company-hero container">
      <p className="eyebrow">E.H.V · M.V / L.V</p>
      <h1>GANESH<br /><span>ELECTRICALS</span></h1>
      <div className="company-hero-bottom"><p>{p[5]}</p><Link className="button button-blue" href="/project1.html">Projects<Arrow diagonal /></Link></div>
      <ImageCarousel slides={["slide3","hd2","hd3","hd4","hd5"].map((name,index)=>({name,label:p[index]}))} />
      <div className="company-scopes">{p.slice(0, 5).map(label => <span key={label}>{label}</span>)}</div>
    </section>
    <section className="company-section container" id="about"><p className="eyebrow">About</p><h2>Ganesh Electricals</h2><p className="company-lead">{p[28]}</p><Link className="text-link" href="/founder.html">Leadership<Arrow diagonal /></Link></section>
    <section className="company-section container" id="why-us"><p className="eyebrow">Features</p><h2>Why Choose Us?</h2><p className="company-lead">{p[6]}</p><div className="principles">{["Customer-Centric", "Quality & Safety", "Cost-Effective"].map((heading, i) => <article key={heading}><h3>{heading}</h3><p>{p[7 + i]}</p></article>)}</div><div className="company-statistics">{[["274",p[10]],["421",p[11]],["40,000",p[12]],["18",p[13]]].map(([n,label]) => <div key={label}><strong>{n}</strong><span>{label}</span></div>)}</div></section>
    <section className="company-section container"><p className="eyebrow">Testimonials</p><h2>Testimonials</h2><div className="testimonials">{[0, 1, 2].map((n) => <figure key={n}><img src={assetPath(`/media/${["test-1","test2","test3"][n]}.webp`)} width="90" height="90" alt={p[15+n*2]} loading="lazy" /><blockquote>{p[14+n*2]}</blockquote><figcaption>{p[15+n*2]}</figcaption></figure>)}</div></section>
    <section className="company-section container"><p className="eyebrow">Timeline</p><h2>Timeline</h2><div className="company-timeline">{[
      ["2019","New milestone","345 clients, 200000 hours of safety record"],
      ["2007","Awards","Safety award by Cortico"],
      ["2001","New location","First MNC client.."],
      ["1997","Ganesh Electricals started","Founder Kumerason and team"],
    ].map(([year,title,text]) => <article key={year}><strong>{year}</strong><h3>{title}</h3><p>{text}</p><time>11/09/2014</time></article>)}</div></section>
    <section className="company-section container" id="clients"><p className="eyebrow">Clients</p><h2>Our Clients</h2><p className="company-lead">{p[24]}</p><div className="company-clients">{site.images.filter(image => image.name.startsWith("client-")).map(image => <div key={image.name}><img src={assetPath(image.file)} width={image.width} height={image.height} alt={image.label.replace("Client logo / ","")} loading="lazy" /></div>)}</div></section>
    <section className="company-section container" id="contact"><p className="eyebrow">Contact</p><h2>Contact Us</h2><div className="company-contact"><div><p>{p[25]}</p><a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com</a><a href="mailto:kumareson@ganeshvar.com">kumareson@ganeshvar.com</a><a href="tel:+914442840227">{p[27]}</a></div><EnquiryForm initialScope="" /></div></section>
  </>;
}

function TeamTree({ nodes }: { nodes: TeamNode[] }) {
  return <ul className="team-tree">{nodes.map((node,index) => <li key={`${node.label}-${index}`}><span>{node.label}</span>{node.children.length > 0 && <TeamTree nodes={node.children} />}</li>)}</ul>;
}

export function CompanyPage({ id }: { id: string }) {
  const page = pageContent(id);
  if (id === "founder") return <><PageIntro eyebrow="Team" title="Leadership" description="" /><section className="container company-leadership"><img src={assetPath("/media/founder.webp")} width="814" height="297" alt="Mr. B. Kumareson and industrial equipment" /><div>{page.paragraphs.slice(0,2).map(text => <p key={text}>{text}</p>)}</div></section></>;
  if (id === "team" || id === "org") return <><PageIntro eyebrow="Team" title="Organization Chart" description="" /><section className="container organisation-page" aria-label="Organisation hierarchy"><TeamTree nodes={site.trees[id]} /></section></>;
  if (id.startsWith("project")) {
    const headings = page.headings.filter(h => /Projects/.test(h.text));
    return <><PageIntro eyebrow="Projects" title="Projects" description="" /><section className="container company-projects">
      {page.tables.map((rows,index) => <section key={index}><h2>{headings[index]?.text}</h2><p className="company-table-hint">Scroll horizontally to view all columns <span aria-hidden="true">↔</span></p><div className="table-scroll" role="region" aria-label={headings[index]?.text || "Projects"} tabIndex={0}><table><thead><tr>{rows[0].map((cell,i) => <th key={i} scope="col">{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row,i) => <tr key={i}>{row.map((cell,j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>)}
      <nav className="project-pagination" aria-label="Project years">{[["project1","2013–2014"],["project2","2014–2016"],["project3","2016–2017"],["project4","2017–2018"]].map(([slug,label]) => <Link href={`/${slug}.html`} key={slug} aria-current={id===slug?"page":undefined}>{label}</Link>)}</nav>
    </section></>;
  }
  if (id === "ehs") return <><PageIntro eyebrow="Quality & Safety" title="Quality & Safety" description="" /><article className="container company-policy">
    <section><h2>Quality Policy</h2>{page.paragraphs.slice(0,2).map(text => <p key={text}>{text}</p>)}</section>
    <section><h2>Quality Standards</h2>{page.paragraphs.slice(2,4).map(text => <p key={text}>{text}</p>)}</section>
    <section><h2>EHS Policy</h2><p>{page.paragraphs[4]}</p><h3>{page.paragraphs[5]}</h3><ul>{site.commitments.map(text => <li key={text}>{text}</li>)}</ul><p>{page.paragraphs[6]}</p></section>
  </article></>;
  if (id === "downloads") return <><PageIntro eyebrow="Downloads" title="Downloads" description={page.paragraphs[0]} /><section className="container company-downloads">{["Overview and detailed profile","News and Events","Outreach"].map(title => <article key={title}><h2>{title}</h2><p>PDF currently unavailable.</p><a href={`mailto:ganeshvar@yahoo.com?subject=${encodeURIComponent(title)}`} className="text-link">Request by email<Arrow diagonal /></a></article>)}</section></>;
  throw new Error(`Unsupported company page: ${id}`);
}

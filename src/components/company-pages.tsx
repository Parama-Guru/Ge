import { assetPath } from "@/lib/urls";
import { pageContent, site, type TeamNode } from "@/lib/site";
import { EnquiryForm } from "./enquiry-form";
import { ImageCarousel } from "./image-carousel";
import { Arrow, PageIntro, SiteLink as Link } from "./ui";

function CircuitIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d={[
      "M8 42h12V20h24v22h12M20 32h24M26 12v8m12-8v8M26 42v10m12-10v10",
      "M32 7 52 16v16c0 12-20 24-20 24S12 44 12 32V16L32 7Zm-9 24 6 6 13-13",
      "M10 47V31h11v16m6 0V22h11v25m6 0V10h11v37M7 54h51",
    ][index]} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    {index === 0 && <><circle cx="8" cy="42" r="3" fill="currentColor" /><circle cx="56" cy="42" r="3" fill="currentColor" /></>}
  </svg>;
}

export function CompanyHome() {
  const p = pageContent("home").paragraphs;
  return <>
    <section className="company-hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow"><span />E.H.V · M.V / L.V</p>
          <h1 className="hero-title"><span>GANESH</span><span>ELECTRICALS<span className="hero-period">.</span></span></h1>
          <p className="hero-summary">{p[28]}</p>
          <div className="hero-actions flex flex-wrap items-center gap-5">
            <Link className="button button-copper" href="/project1.html">Explore projects<Arrow diagonal /></Link>
            <Link className="hero-secondary" href="/index.html#about">About Ganesh Electricals<Arrow /></Link>
          </div>
          <div className="hero-location"><span />Chennai, Tamil Nadu <i />Established in 1997</div>
        </div>
        <div className="hero-object-caption"><span className="object-cross">+</span><span>Industrial electrification<br /><small>Conceptual 3D illustration</small></span><span className="object-line" /></div>
      </div>
      <div className="container hero-bottom-bar"><div className="company-scopes">{p.slice(0,5).map(label => <span key={label}>{label}</span>)}</div><a href="#about" aria-label="Scroll to about Ganesh Electricals"><Arrow /></a></div>
    </section>

    <section className="section-paper" id="about">
      <div className="container company-section about-composition">
        <div data-reveal><p className="eyebrow"><span />About us</p><h2>Ganesh<br /><span className="text-muted">Electricals.</span></h2><Link className="text-link" href="/founder.html">Our leadership<Arrow diagonal /></Link></div>
        <div className="about-description" data-reveal><p className="company-lead">{p[5]}</p><div className="about-baseline" data-draw /><div className="about-tags"><span>E.H.V</span><span>M.V / L.V</span><span>1997</span></div></div>
      </div>
    </section>

    <section className="section-mist" id="why-us">
      <div className="container company-section">
        <div className="section-heading" data-reveal><div><p className="eyebrow"><span />Our approach</p><h2>Why choose us?</h2></div><p>{p[6]}</p></div>
        <div className="principles grid gap-0 md:grid-cols-3" data-stagger>
          {["Customer-Centric","Quality & Safety","Cost-Effective"].map((title,index) => <article key={title}>
            <div className="principle-top"><CircuitIcon index={index} /><span>0{index+1}</span></div>
            <h3>{title}</h3><p>{p[7+index]}</p>
            <div className="principle-rule" />
          </article>)}
        </div>
        <div className="company-statistics grid grid-cols-2 gap-6 lg:grid-cols-4" data-stagger>
          {[["274",p[10]],["421",p[11]],["40,000",p[12]],["18",p[13]]].map(([number,label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}
        </div>
      </div>
    </section>

    <section className="section-ink">
      <div className="container company-section work-composition">
        <div className="work-heading" data-reveal><p className="eyebrow"><span />Projects</p><h2>Industrial<br /><span>electrification.</span></h2><div className="work-categories">{p.slice(0,5).map(label => <span key={label}>{label}</span>)}</div><Link className="text-link text-link-light" href="/project1.html">View projects<Arrow diagonal /></Link></div>
        <div data-reveal><ImageCarousel slides={["slide3","hd2","hd3","hd4","hd5"].map((name,index)=>({name,label:p[index]}))} /></div>
      </div>
    </section>

    <section className="section-paper" id="clients">
      <div className="container company-section">
        <div className="section-heading" data-reveal><div><p className="eyebrow"><span />Our clients</p><h2>Our clients.</h2></div><p>{p[24]}</p></div>
        <div className="company-clients grid grid-cols-3 lg:grid-cols-6" data-stagger>{site.images.filter(image=>image.name.startsWith("client-")).map(image=><div key={image.name}><img src={assetPath(image.file)} width={image.width} height={image.height} alt={image.label.replace("Client logo / ","")} loading="lazy" /></div>)}</div>
      </div>
    </section>

    <section className="section-mist">
      <div className="container company-section">
        <div data-reveal><p className="eyebrow"><span />Testimonials</p><h2>Testimonials.</h2></div>
        <div className="testimonials grid gap-8 lg:grid-cols-3" data-stagger>{[0,1,2].map(index=><figure key={index}><span className="quote-mark" aria-hidden="true">“</span><blockquote>{p[14+index*2]}</blockquote><figcaption><img src={assetPath(`/media/${["test-1","test2","test3"][index]}.webp`)} width="64" height="64" alt="" loading="lazy" /><span>{p[15+index*2]}</span></figcaption></figure>)}</div>
      </div>
    </section>

    <section className="section-paper">
      <div className="container company-section">
        <div data-reveal><p className="eyebrow"><span />Since 1997</p><h2>Timeline.</h2></div>
        <div className="timeline-rule" data-draw />
        <div className="company-timeline grid grid-cols-2 gap-8 lg:grid-cols-4" data-stagger>{[
          ["2019","New milestone","345 clients, 200000 hours of safety record"],
          ["2007","Awards","Safety award by Cortico"],
          ["2001","New location","First MNC client.."],
          ["1997","Ganesh Electricals started","Founder Kumerason and team"],
        ].map(([year,title,text])=><article key={year}><span className="timeline-dot" /><strong>{year}</strong><h3>{title}</h3><p>{text}</p><time>11/09/2014</time></article>)}</div>
        <p className="history-note">Historical company timeline. Published dates and names are retained as provided.</p>
      </div>
    </section>

    <section className="section-ink contact-section" id="contact">
      <div className="container company-section">
        <div className="section-heading" data-reveal><div><p className="eyebrow"><span />Contact</p><h2>Contact us.</h2></div><span className="contact-title-arrow" aria-hidden="true"><Arrow diagonal /></span></div>
        <div className="company-contact grid gap-12 lg:grid-cols-2">
          <div className="contact-directory" data-reveal><div><span className="contact-label">Visit us</span><p>{p[25]}</p></div><div><span className="contact-label">Email</span><a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com<Arrow diagonal /></a><a href="mailto:kumareson@ganeshvar.com">kumareson@ganeshvar.com<Arrow diagonal /></a></div><div><span className="contact-label">Telephone</span><a href="tel:+914442840227">{p[27]}<Arrow diagonal /></a></div></div>
          <div data-reveal><EnquiryForm initialScope="" /></div>
        </div>
      </div>
    </section>
  </>;
}

function TeamTree({ nodes }: { nodes: TeamNode[] }) {
  return <ul className="team-tree">{nodes.map((node,index)=><li key={`${node.label}-${index}`}><span>{node.label}</span>{node.children.length>0&&<TeamTree nodes={node.children}/>}</li>)}</ul>;
}

export function CompanyPage({ id }: { id: string }) {
  const page=pageContent(id);
  if(id==="founder") return <>
    <PageIntro eyebrow="Team" title="Leadership." description="" />
    <section className="section-paper"><div className="container company-leadership">
      <div className="leadership-photo" data-reveal><img src={assetPath("/media/founder.webp")} width="814" height="297" alt="Mr. B. Kumareson and industrial equipment" /><span>Ganesh Electricals</span></div>
      <div data-reveal><p className="eyebrow"><span />Established in 1997</p><h2>Mr. B. Kumareson</h2>{page.paragraphs.slice(0,2).map(text=><p key={text}>{text}</p>)}<Link className="text-link" href="/team.html">Organization chart<Arrow diagonal /></Link></div>
    </div></section>
  </>;
  if(id==="team"||id==="org") return <>
    <PageIntro eyebrow="Team" title="Organization chart." description="" />
    <section className="section-paper"><div className="container organisation-page" aria-label="Organisation hierarchy"><TeamTree nodes={site.trees[id]} /></div></section>
  </>;
  if(id.startsWith("project")) {
    const headings=page.headings.filter(h=>/Projects/.test(h.text));
    return <><PageIntro eyebrow="Projects" title="Our projects." description="" />
      <section className="section-paper"><div className="container company-projects">
        <nav className="project-pagination" aria-label="Project years">{[["project1","2013–2014"],["project2","2014–2016"],["project3","2016–2017"],["project4","2017–2018"]].map(([slug,label])=><Link href={`/${slug}.html`} key={slug} aria-current={id===slug?"page":undefined}>{label}<Arrow diagonal /></Link>)}</nav>
        {page.tables.map((rows,index)=><section key={index} data-reveal><h2>{headings[index]?.text}</h2><p className="company-table-hint">Scroll horizontally to view all columns <span aria-hidden="true">↔</span></p><div className="table-scroll" role="region" aria-label={headings[index]?.text||"Projects"} tabIndex={0}><table><thead><tr>{rows[0].map((cell,i)=><th key={i} scope="col">{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>)}
      </div></section>
    </>;
  }
  if(id==="ehs") return <><PageIntro eyebrow="Quality & Safety" title={<>Quality.<br />Safety. Responsibility.</>} description="" /><section className="section-paper"><article className="container company-policy">
    <section data-reveal><div><span className="policy-number">01</span><h2>Quality Policy</h2></div><div>{page.paragraphs.slice(0,2).map(text=><p key={text}>{text}</p>)}</div></section>
    <section data-reveal><div><span className="policy-number">02</span><h2>Quality Standards</h2></div><div>{page.paragraphs.slice(2,4).map(text=><p key={text}>{text}</p>)}</div></section>
    <section data-reveal><div><span className="policy-number">03</span><h2>EHS Policy</h2></div><div><p>{page.paragraphs[4]}</p><h3>{page.paragraphs[5]}</h3><ul>{site.commitments.map(text=><li key={text}>{text}</li>)}</ul><p>{page.paragraphs[6]}</p></div></section>
  </article></section></>;
  if(id==="downloads") return <><PageIntro eyebrow="Downloads" title="Company resources." description={page.paragraphs[0]} /><section className="section-paper"><div className="container company-downloads">
    {["Overview and detailed profile","News and Events","Outreach"].map((title,index)=><article key={title} data-reveal><span className="document-icon" aria-hidden="true"><svg viewBox="0 0 48 56" fill="none"><path d="M7 2h23l11 11v40H7V2Zm23 0v12h11M15 27h18M15 34h18M15 41h11" stroke="currentColor" strokeWidth="1.3"/></svg></span><div><span className="document-label">PDF / 0{index+1}</span><h2>{title}</h2><p>PDF currently unavailable.</p></div><a href={`mailto:ganeshvar@yahoo.com?subject=${encodeURIComponent(title)}`} className="text-link">Request by email<Arrow diagonal /></a></article>)}
  </div></section></>;
  throw new Error(`Unsupported company page: ${id}`);
}

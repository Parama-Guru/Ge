import { pageContent, site, type TeamNode } from "@/lib/site";
import { assetPath } from "@/lib/urls";
import { EnquiryForm } from "./enquiry-form";
import { ImageCarousel } from "./image-carousel";
import { GlassSection, PageHero, SceneSection } from "./sections";
import { Arrow, SiteLink as Link } from "./ui";

const home = () => pageContent("home").paragraphs;
const principles = ["Customer-Centric", "Quality & Safety", "Cost-Effective"];
const statistics = [["274", 10], ["421", 11], ["40,000", 12], ["18", 13]] as const;
const timeline = [
  ["2019", "New milestone", "345 clients, 200000 hours of safety record"],
  ["2007", "Awards", "Safety award by Cortico"],
  ["2001", "New location", "First MNC client.."],
  ["1997", "Ganesh Electricals started", "Founder Kumerason and team"],
];
const projectYears = [["project1", "2013–2014"], ["project2", "2014–2016"], ["project3", "2016–2017"], ["project4", "2017–2018"]];
const clientLogos = () => site.images.filter(image => image.name.startsWith("client-"));

function CircuitIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d={[
      "M8 42h12V20h24v22h12M20 32h24M26 12v8m12-8v8M26 42v10m12-10v10",
      "M32 7 52 16v16c0 12-20 24-20 24S12 44 12 32V16L32 7Zm-9 24 6 6 13-13",
      "M10 47V31h11v16m6 0V22h11v25m6 0V10h11v37M7 54h51",
    ][index]} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>;
}

function Statistics() {
  const p = home();
  return <div className="statistics" data-stagger>
    {statistics.map(([number, index]) => <div key={index}>
      <strong data-count={number.replace(/,/g, "")} data-final={number}>{number}</strong>
      <span>{p[index]}</span>
    </div>)}
  </div>;
}

function LogoGrid({ limit }: { limit?: number }) {
  return <div className="logo-grid" data-stagger>
    {clientLogos().slice(0, limit).map(image => <div key={image.name}>
      <img src={assetPath(image.file)} width={image.width} height={image.height} alt={image.label.replace("Client logo / ", "")} loading="lazy" decoding="async" />
    </div>)}
  </div>;
}

function ContactDirectory() {
  const p = home();
  return <div className="contact-directory">
    <div><span className="label">Visit us</span><p>{p[25]}</p></div>
    <div><span className="label">Email</span>
      <a href="mailto:ganeshvar@yahoo.com">ganeshvar@yahoo.com<Arrow diagonal /></a>
      <a href="mailto:kumareson@ganeshvar.com">kumareson@ganeshvar.com<Arrow diagonal /></a>
    </div>
    <div><span className="label">Telephone</span><a href="tel:+914442840227">{p[27]}<Arrow diagonal /></a></div>
  </div>;
}

export function HomePage() {
  const p = home();
  return <>
    <SceneSection scene="cable" eager className="home-hero">
      <p className="eyebrow"><span />E.H.V · M.V / L.V</p>
      <h1 className="hero-title"><span>GANESH</span><span>ELECTRICALS<span className="hero-period">.</span></span></h1>
      <p className="lead">{p[28]}</p>
      <div className="actions">
        <Link className="button" href="/project1.html">Explore projects<Arrow diagonal /></Link>
        <Link className="text-link" href="/about.html">About Ganesh Electricals<Arrow /></Link>
      </div>
      <ul className="scope-list">{p.slice(0, 5).map(item => <li key={item}>{item}</li>)}</ul>
    </SceneSection>

    <SceneSection id="about" scene="insulator" side="left">
      <p className="eyebrow"><span />About</p>
      <h2>Ganesh Electricals</h2>
      <p className="lead">{p[5]}</p>
      <Link className="text-link" href="/about.html">About us<Arrow diagonal /></Link>
    </SceneSection>

    <SceneSection id="why-us" scene="busbar">
      <p className="eyebrow"><span />Features</p>
      <h2>Why Choose Us?</h2>
      <p className="lead">{p[6]}</p>
      <ul className="tag-list">{principles.map(item => <li key={item}>{item}</li>)}</ul>
      <Statistics />
      <Link className="text-link" href="/features.html">Why choose us<Arrow diagonal /></Link>
    </SceneSection>

    <GlassSection id="projects" scene="switchgear" className="projects-preview">
      <div className="split">
        <div data-reveal>
          <p className="eyebrow"><span />Projects</p>
          <h2>Industrial electrification.</h2>
          <ul className="tag-list">{p.slice(0, 5).map(item => <li key={item}>{item}</li>)}</ul>
          <Link className="text-link" href="/project1.html">View projects<Arrow diagonal /></Link>
        </div>
        <div data-reveal><ImageCarousel slides={["slide3", "hd2", "hd3", "hd4", "hd5"].map((name, index) => ({ name, label: p[index] }))} /></div>
      </div>
    </GlassSection>

    <SceneSection id="clients" scene="network" side="left">
      <p className="eyebrow"><span />Clients</p>
      <h2>Our Clients</h2>
      <p className="lead">{p[24]}</p>
      <LogoGrid limit={6} />
      <Link className="text-link" href="/clients.html">All clients and testimonials<Arrow diagonal /></Link>
    </SceneSection>

    <SceneSection id="contact" scene="coil">
      <p className="eyebrow"><span />Contact</p>
      <h2>Contact Us</h2>
      <ContactDirectory />
      <Link className="button" href="/contact.html">Send an enquiry<Arrow diagonal /></Link>
    </SceneSection>
  </>;
}

function AboutPage() {
  const p = home();
  return <>
    <PageHero id="about" eyebrow="About" title="Ganesh Electricals">
      <p className="lead">{p[5]}</p>
      <Link className="text-link" href="/founder.html">Leadership<Arrow diagonal /></Link>
    </PageHero>
    <GlassSection scene="insulator">
      <p className="eyebrow"><span />Since 1997</p>
      <h2>Timeline</h2>
      <div className="timeline-rule" data-draw />
      <div className="timeline" data-stagger>
        {timeline.map(([year, title, text]) => <article key={year}>
          <span className="timeline-dot" />
          <strong>{year}</strong>
          <h3>{title}</h3>
          <p>{text}</p>
          <time>11/09/2014</time>
        </article>)}
      </div>
    </GlassSection>
    <GlassSection scene="insulator">
      <p className="eyebrow"><span />Ganesh Electricals</p>
      <p className="lead">{p[28]}</p>
      <div className="link-row">
        <Link className="text-link" href="/features.html">Why choose us<Arrow diagonal /></Link>
        <Link className="text-link" href="/team.html">Organization chart<Arrow diagonal /></Link>
        <Link className="text-link" href="/project1.html">Projects<Arrow diagonal /></Link>
      </div>
    </GlassSection>
  </>;
}

function FeaturesPage() {
  const p = home();
  return <>
    <PageHero id="features" eyebrow="Features" title="Why Choose Us?">
      <p className="lead">{p[6]}</p>
    </PageHero>
    <GlassSection scene="busbar">
      <div className="principles" data-stagger>
        {principles.map((title, index) => <article key={title}>
          <div className="principle-top"><CircuitIcon index={index} /><span>0{index + 1}</span></div>
          <h2>{title}</h2>
          <p>{p[7 + index]}</p>
        </article>)}
      </div>
    </GlassSection>
    <GlassSection scene="busbar">
      <Statistics />
    </GlassSection>
  </>;
}

function ClientsPage() {
  const p = home();
  return <>
    <PageHero id="clients" eyebrow="Clients" title="Our Clients">
      <p className="lead">{p[24]}</p>
    </PageHero>
    <GlassSection scene="network">
      <h2 className="visually-hidden">Client logos</h2>
      <LogoGrid />
    </GlassSection>
    <GlassSection scene="network">
      <p className="eyebrow"><span />Testimonials</p>
      <h2>Testimonials</h2>
      <div className="testimonials" data-stagger>
        {[0, 1, 2].map(index => <figure key={index}>
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>{p[14 + index * 2]}</blockquote>
          <figcaption>
            <img src={assetPath(`/media/${["test-1", "test2", "test3"][index]}.webp`)} width={64} height={64} alt="" loading="lazy" decoding="async" />
            <span>{p[15 + index * 2]}</span>
          </figcaption>
        </figure>)}
      </div>
    </GlassSection>
  </>;
}

function ContactPage() {
  return <>
    <PageHero id="contact" eyebrow="Contact" title="Contact Us">
      <ContactDirectory />
    </PageHero>
    <GlassSection scene="coil">
      <EnquiryForm initialScope="" />
    </GlassSection>
  </>;
}

function TeamTree({ nodes }: { nodes: TeamNode[] }) {
  return <ul className="team-tree">{nodes.map((node, index) => <li key={`${node.label}-${index}`}>
    <span>{node.label}</span>
    {node.children.length > 0 && <TeamTree nodes={node.children} />}
  </li>)}</ul>;
}

function LeadershipPage() {
  const paragraphs = pageContent("founder").paragraphs;
  return <>
    <PageHero id="founder" eyebrow="Team" title="Leadership">
      <p className="lead">Mr. B. Kumareson</p>
    </PageHero>
    <GlassSection scene="cable">
      <div className="split">
        <div className="photo" data-reveal>
          <img src={assetPath("/media/founder.webp")} width={814} height={297} alt="Mr. B. Kumareson and industrial equipment" loading="lazy" decoding="async" />
        </div>
        <div data-reveal>
          <p className="eyebrow"><span />Established in 1997</p>
          {paragraphs.slice(0, 2).map(text => <p key={text} className="body-text">{text}</p>)}
          <Link className="text-link" href="/team.html">Organization chart<Arrow diagonal /></Link>
        </div>
      </div>
    </GlassSection>
  </>;
}

function OrganisationPage({ id }: { id: "team" | "org" }) {
  const other = id === "team" ? "org" : "team";
  return <>
    <PageHero id={id} eyebrow="Team" title="Organization Chart">
      <Link className="text-link" href={`/${other}.html`}>{id === "team" ? "Alternate published chart" : "Main organization chart"}<Arrow diagonal /></Link>
    </PageHero>
    <GlassSection scene="network">
      <div className="organisation" role="region" aria-label="Organisation hierarchy" tabIndex={0}><TeamTree nodes={site.trees[id]} /></div>
    </GlassSection>
  </>;
}

function ProjectsPage({ id }: { id: string }) {
  const content = pageContent(id);
  const headings = content.headings.filter(heading => /Projects/.test(heading.text));
  return <>
    <PageHero id={id} eyebrow="Projects" title="Projects">
      <p className="lead">{projectYears.find(([slug]) => slug === id)?.[1]}</p>
      <nav className="year-nav" aria-label="Project years">
        {projectYears.map(([slug, years]) => <Link key={slug} href={`/${slug}.html`} aria-current={id === slug ? "page" : undefined}>{years}</Link>)}
      </nav>
    </PageHero>
    {content.tables.map((rows, index) => <GlassSection key={index} scene="switchgear">
      <h2>{headings[index]?.text}</h2>
      <p className="table-hint">Scroll horizontally to view all columns <span aria-hidden="true">↔</span></p>
      <div className="table-scroll" role="region" aria-label={headings[index]?.text || "Projects"} tabIndex={0}>
        <table>
          <thead><tr>{rows[0].map((cell, cellIndex) => <th key={cellIndex} scope="col">{cell}</th>)}</tr></thead>
          <tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} data-label={rows[0][cellIndex]}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </GlassSection>)}
  </>;
}

function QualityPage() {
  const paragraphs = pageContent("ehs").paragraphs;
  const sections = [
    ["01", "Quality Policy", paragraphs.slice(0, 2)],
    ["02", "Quality Standards", paragraphs.slice(2, 4)],
  ] as const;
  return <>
    <PageHero id="ehs" eyebrow="Quality & Safety" title="Quality & Safety">
      <p className="lead">Quality Policy · Quality Standards · EHS Policy</p>
    </PageHero>
    {sections.map(([number, title, texts]) => <GlassSection key={title} scene="breaker" className="policy">
      <div className="policy-heading"><span>{number}</span><h2>{title}</h2></div>
      <div>{texts.map(text => <p key={text} className="body-text">{text}</p>)}</div>
    </GlassSection>)}
    <GlassSection scene="breaker" className="policy">
      <div className="policy-heading"><span>03</span><h2>EHS Policy</h2></div>
      <div>
        <p className="body-text">{paragraphs[4]}</p>
        <h3>{paragraphs[5]}</h3>
        <ul className="commitments" data-stagger>{site.commitments.map(text => <li key={text}>{text}</li>)}</ul>
        <p className="body-text">{paragraphs[6]}</p>
      </div>
    </GlassSection>
  </>;
}

function DownloadsPage() {
  const paragraphs = pageContent("downloads").paragraphs;
  return <>
    <PageHero id="downloads" eyebrow="Downloads" title="Downloads">
      <p className="lead">{paragraphs[0]}</p>
    </PageHero>
    <GlassSection scene="coil">
      <div className="documents" data-stagger>
        {["Overview and detailed profile", "News and Events", "Outreach"].map((title, index) => <article key={title}>
          <span className="document-icon" aria-hidden="true">
            <svg viewBox="0 0 48 56" fill="none"><path d="M7 2h23l11 11v40H7V2Zm23 0v12h11M15 27h18M15 34h18M15 41h11" stroke="currentColor" strokeWidth="1.3" /></svg>
          </span>
          <div><span className="label">PDF / 0{index + 1}</span><h2>{title}</h2><p>Available on request by email.</p></div>
          <a href={`mailto:ganeshvar@yahoo.com?subject=${encodeURIComponent(title)}`} className="text-link">Request by email<Arrow diagonal /></a>
        </article>)}
      </div>
    </GlassSection>
  </>;
}

export function CompanyPage({ id }: { id: string }) {
  if (id === "about") return <AboutPage />;
  if (id === "features") return <FeaturesPage />;
  if (id === "clients") return <ClientsPage />;
  if (id === "contact") return <ContactPage />;
  if (id === "founder") return <LeadershipPage />;
  if (id === "team" || id === "org") return <OrganisationPage id={id} />;
  if (id.startsWith("project")) return <ProjectsPage id={id} />;
  if (id === "ehs") return <QualityPage />;
  if (id === "downloads") return <DownloadsPage />;
  throw new Error(`Unsupported page: ${id}`);
}

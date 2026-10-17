import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyPage } from "@/components/company-pages";
import { pageIds, pageMetadata } from "@/lib/seo";

const pages = pageIds.filter(id => id !== "index");
export const dynamicParams = false;
export function generateStaticParams() { return pages.map(page => ({ page })); }
export async function generateMetadata({ params }: { params: Promise<{page:string}> }): Promise<Metadata> {
  const {page} = await params;
  const id=page;
  if (!pages.includes(id)) notFound();
  return pageMetadata(id);
}
export default async function OriginalPage({ params }: {params:Promise<{page:string}>}) {
  const {page}=await params;
  if (!pages.includes(page)) notFound();
  return <CompanyPage id={page} />;
}

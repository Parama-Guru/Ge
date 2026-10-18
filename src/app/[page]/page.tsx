import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyPage } from "@/components/company-pages";
import { pageIds } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";

const routes = pageIds.filter(id => id !== "index");

export const dynamicParams = false;

export function generateStaticParams() {
  return routes.map(page => ({ page }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  if (!routes.includes(page)) notFound();
  return pageMetadata(page);
}

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!routes.includes(page)) notFound();
  return <CompanyPage id={page} />;
}

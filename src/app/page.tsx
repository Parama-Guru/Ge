import { HomePage } from "@/components/company-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("index");

export default function Home() {
  return <HomePage />;
}

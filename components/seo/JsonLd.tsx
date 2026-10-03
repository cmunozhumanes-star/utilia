import { safeJsonLd } from "@/lib/seo/schema";

export function JsonLd({ data }: { data: unknown }) {
  // Único uso de dangerouslySetInnerHTML: JSON-LD serializado y escapado con safeJsonLd.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

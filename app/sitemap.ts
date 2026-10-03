import type { MetadataRoute } from "next";
import { legalPages } from "@/data/legal";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/seo/metadata";
import { categoryPath, getAllGuides, getAllTools, getVisibleCategories, guidePath, toolPath } from "@/lib/tools/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getAllTools();
  const latest = tools.map((t) => t.updatedAt).sort().at(-1);
  const entry = (path: string, lastModified?: string) => ({ url: absoluteUrl(path), ...(lastModified ? { lastModified } : {}) });

  return [
    entry("/", latest),
    entry("/herramientas/", latest),
    ...getVisibleCategories().map((c) =>
      entry(categoryPath(c.slug), tools.filter((t) => t.category === c.slug).map((t) => t.updatedAt).sort().at(-1)),
    ),
    ...tools.map((t) => entry(toolPath(t), t.updatedAt)),
    entry("/guias/", getAllGuides().map((g) => g.updatedAt).sort().at(-1)),
    ...getAllGuides().map((g) => entry(guidePath(g.slug), g.updatedAt)),
    // Las páginas con placeholders están en noindex: no deben estar en el sitemap.
    ...(site.legalCompleted ? legalPages.map((p) => entry(`/${p.slug}/`)) : []),
  ];
}

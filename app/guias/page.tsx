import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAllGuides, guidePath } from "@/lib/tools/registry";

export const metadata: Metadata = buildMetadata({
  title: "Guías prácticas para calcular y resolver tareas",
  description: "Guías claras con ejemplos resueltos para calcular, convertir y resolver tareas cotidianas, enlazadas a las herramientas que las automatizan.",
  path: "/guias/",
});

export default function GuidesHub() {
  const guides = getAllGuides();
  return (
    <div className="wrap py-8">
      <Breadcrumbs items={[{ name: "Guías", path: "/guias/" }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Guías</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Explicaciones paso a paso con ejemplos, para entender el cálculo y no solo obtener el resultado.</p>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={guidePath(g.slug)} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent">
            <span className="block text-lg font-medium">{g.title}</span>
            <span className="mt-2 block text-sm text-muted">{g.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";
import { ToolCard } from "@/components/ui/ToolCard";
import { getFeaturedTools } from "@/lib/tools/registry";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: true } };

export default function NotFound() {
  const tools = getFeaturedTools(4);
  return (
    <div className="wrap py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">No encontramos esa página</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Puede que el enlace haya cambiado. Busca lo que necesitas o elige una herramienta.</p>
      <div className="mt-8 max-w-xl">
        <SearchBox variant="hero" />
      </div>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
      <p className="mt-8">
        <Link href="/herramientas/" className="text-accent underline underline-offset-4">
          Ver todas las herramientas
        </Link>
      </p>
    </div>
  );
}

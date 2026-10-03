import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchIcon } from "@/components/ui/icons";

const NAV = [
  { href: "/herramientas/#categorias", label: "Categorías" },
  { href: "/guias/", label: "Guías" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="wrap flex h-16 items-center gap-4">
        <Logo />
        <nav aria-label="Principal" className="ml-4 hidden items-center gap-6 text-[0.9375rem] md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted transition-colors hover:text-text">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <HeaderSearch />
          <Link href="/herramientas/" className="btn btn-primary hidden md:inline-flex">
            Herramientas
          </Link>
          <Link href="/buscar/" aria-label="Buscar" className="flex size-11 items-center justify-center rounded-lg md:hidden">
            <SearchIcon className="size-5" />
          </Link>
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}

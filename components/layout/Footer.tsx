import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ManageCookiesButton } from "@/components/consent/ConsentManager";
import { site } from "@/data/site";
import { getAllGuides, getVisibleCategories, categoryPath, guidePath } from "@/lib/tools/registry";

const LEGAL = [
  { href: "/aviso-legal/", label: "Aviso legal" },
  { href: "/privacidad/", label: "Política de privacidad" },
  { href: "/cookies/", label: "Política de cookies" },
  { href: "/terminos/", label: "Términos y condiciones" },
];

const col = "space-y-2 text-sm";
const link = "text-muted transition-colors hover:text-text";
const heading = "mb-3 text-sm font-semibold";

export function Footer() {
  const cats = getVisibleCategories();
  const guides = getAllGuides().slice(0, 5);
  return (
    <footer className="mt-20 border-t border-border">
      <div className="wrap grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">{site.slogan}</p>
        </div>
        <nav aria-label="Herramientas">
          <h2 className={heading}>Herramientas</h2>
          <ul className={col}>
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={categoryPath(c.slug)} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/herramientas/" className={link}>
                Ver todas
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Guías">
          <h2 className={heading}>Guías</h2>
          <ul className={col}>
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={guidePath(g.slug)} className={link}>
                  {g.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/guias/" className={link}>
                Todas las guías
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Información">
          <h2 className={heading}>{site.name}</h2>
          <ul className={col}>
            <li>
              <Link href="/sobre-nosotros/" className={link}>
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto/" className={link}>
                Contacto
              </Link>
            </li>
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <ManageCookiesButton className={link} />
            </li>
            <li>
              <a href="/sitemap.xml" className={link}>
                Mapa del sitio
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="wrap py-5 text-sm text-muted">© {new Date().getFullYear()} {site.name}. Herramientas gratuitas, sin registro.</p>
      </div>
    </footer>
  );
}

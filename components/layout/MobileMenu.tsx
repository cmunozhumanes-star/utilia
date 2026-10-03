"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/ui/icons";

type NavItem = { href: string; label: string };

/**
 * Menú móvil. La cabecera vive en el layout y persiste entre páginas, así que el menú se cierra
 * explícitamente al cambiar de ruta, al pulsar Escape o al hacer clic fuera.
 */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  // Cierra al navegar (patrón "ajustar estado durante el render", sin useEffect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative md:hidden">
      <button
        type="button"
        aria-label="Menú"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 items-center justify-center rounded-lg"
      >
        <MenuIcon className="size-5" />
      </button>
      {open && (
        <nav id={panelId} aria-label="Menú móvil" className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-sm">
          <Link href="/herramientas/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-soft">
            Herramientas
          </Link>
          {items.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 hover:bg-soft">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

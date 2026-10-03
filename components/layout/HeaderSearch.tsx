"use client";

import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/search/SearchBox";

/** En la home el buscador ya está en el hero, así que no se duplica en la cabecera. */
export function HeaderSearch() {
  if (usePathname() === "/") return null;
  return (
    <div className="hidden w-64 md:block lg:w-72">
      <SearchBox variant="compact" />
    </div>
  );
}

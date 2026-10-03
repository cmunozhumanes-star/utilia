import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Mapa slug -> componente interactivo. Cada herramienta es un chunk independiente (code splitting),
 * pero se renderiza en el HTML estático, así que el formulario aparece sin esperar a JavaScript.
 * `npm run validate` comprueba que cada herramienta registrada tiene su archivo en esta carpeta.
 */
export const toolComponents: Record<string, ComponentType> = {
  porcentaje: dynamic(() => import("./porcentaje")),
  iva: dynamic(() => import("./iva")),
  descuento: dynamic(() => import("./descuento")),
  "regla-de-tres": dynamic(() => import("./regla-de-tres")),
  "dias-entre-fechas": dynamic(() => import("./dias-entre-fechas")),
  edad: dynamic(() => import("./edad")),
  imc: dynamic(() => import("./imc")),
  longitud: dynamic(() => import("./longitud")),
  peso: dynamic(() => import("./peso")),
  temperatura: dynamic(() => import("./temperatura")),
  "contador-de-palabras": dynamic(() => import("./contador-de-palabras")),
  "mayusculas-y-minusculas": dynamic(() => import("./mayusculas-y-minusculas")),
};

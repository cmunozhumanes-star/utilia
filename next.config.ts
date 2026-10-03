import type { NextConfig } from "next";

// Sitio 100 % estático para Cloudflare Pages. Si en el futuro se añaden rutas dinámicas (IA, cotizaciones),
// irán en /functions (Pages Functions), fuera de Next. Hoy esa carpeta no existe.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;

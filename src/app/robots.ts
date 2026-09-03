import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/signup"],
        disallow: [
          "/dashboard",
          "/properties",
          "/screening",
          "/maintenance",
          "/rent-ledger",
          "/api",
        ],
      },
    ],
    sitemap: "https://property-pulse-lime-two.vercel.app/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";

const BASE_URL = "https://property-pulse-lime-two.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/login`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/signup`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

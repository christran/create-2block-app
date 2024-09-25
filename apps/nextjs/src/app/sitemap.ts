import { type MetadataRoute } from "next";

import { absoluteUrl } from "@2block/shared/utils";
import { Paths } from "@2block/shared/shared-constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [Paths.Home, Paths.Login, Paths.Signup, Paths.Dashboard, Paths.Billing].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString(),
  }));

  return [...routes];
}

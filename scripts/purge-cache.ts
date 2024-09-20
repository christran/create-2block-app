/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
  This script purges the cache for all routes in the Next.js app.
  It uses the Cloudflare API to purge the cache.
  It is used to clear the cache when the app is deployed.
*/

import { config } from "dotenv"
import { routes } from "next-routes-list"
import axios from "axios";
import fs from "fs";
import path from "path";

config()

// Cloudflare API rate limits
const BATCH_SIZE = 30
const MAX_CALLS_PER_DAY = 30000

const staticDirs: string[] = [
  // "./.next/static/css",
  // "./.next/static/media",
  // "./public"
];

function collectUrls(dir: string, baseUrl: string, isPublic: boolean): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const urls: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    let relativePath = path.relative(process.cwd(), filePath);
    
    if (isPublic) {
      relativePath = relativePath.replace(/^public[\\/]?/, "");
    } else if (relativePath.startsWith(".next")) {
      relativePath = relativePath.replace(/^\.next[\\/]?/, "_next/");
    }
    
    if (file.isDirectory()) {
      urls.push(...collectUrls(filePath, baseUrl, isPublic));
    } else {
      urls.push(`${baseUrl}/${relativePath.replace(/\\/g, "/")}`);
    }
  }

  return urls;
}

async function purgeCache(): Promise<void> {
  const urls = routes
    .filter((route) => !route.includes("/["))
    .map((route) => `${process.env.NEXT_PUBLIC_APP_URL}${route}`);

  if (staticDirs.length > 0) {
    staticDirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      urls.push(...collectUrls(fullPath, process.env.NEXT_PUBLIC_APP_URL ?? "https://2block.co", dir === "./public"));
    });
  }

  console.log(urls)
  console.log(`Total URLs to purge: ${urls.length}`)

  if (process.env.NEXT_PUBLIC_APP_URL === "http://localhost:3000") {
    console.log("Skipping cache purge on local environment");
    return;
  }

  const batches = []
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE))
  }

  console.log(`Number of batches: ${batches.length}`)

  if (batches.length > MAX_CALLS_PER_DAY) {
    console.warn(`Warning: The number of batches (${batches.length}) exceeds the daily API call limit (${MAX_CALLS_PER_DAY}).`)
    console.warn("Consider reducing the number of routes or implementing a multi-day purge strategy.")
  }

  for (const [index, batch] of batches.entries()) {
    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        { files: batch },
        {
          headers: {
            "Authorization": `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
            "Content-Type": "application/json",
            "X-Auth-Key": process.env.CLOUDFLARE_AUTH_KEY,
            "X-Auth-Email": process.env.CLOUDFLARE_AUTH_EMAIL,
          },
        }
      )

      console.log(`Batch ${index + 1}/${batches.length} purged:`, response.data.success)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Error purging batch ${index + 1}:`, error.response.data)
      } else {
        console.error(`Error purging batch ${index + 1}:`, error)
      }
    }

    // Add a delay between batches to avoid rate limiting
    if (index < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

await purgeCache();

export {};
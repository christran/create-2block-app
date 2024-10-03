import { fileURLToPath } from "url";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const config = {
    transpilePackages: [
        "@2block/api",
        "@2block/auth",
        "@2block/db",
        "@2block/shared",
        // "@2block/ui",
        "@2block/validators",
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
 
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "2block.94b3308d853c120b7b7d21af8dc272e6.r2.cloudflarestorage.com",
          },
          {
            protocol: "https",
            hostname: "media.2block.co",
          },
        ],
        unoptimized: true, // TODO: false if using cloudflare images
    },

    experimental: {
        swrDelta: 31536000
    },
    
    async headers() {
        if (process.env.NODE_ENV !== 'production') {
            return [];
        }
    
        // https://focusreactive.com/configure-cdn-caching-for-self-hosted-next-js-websites/
        return [
            {
                source: '/:all*(css|js|gif|svg|jpg|jpeg|png|woff|woff2)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000',
                    }
                ],
            },
            // {
            //     source: '/api/test',
            //     headers: [
            //         {
            //             key: 'Cache-Control',
            //             value: 'public, no-cache, no-store, max-age=0',
            //         }
            //     ],
            // }
        ];
    },

    // Docker Builds
    // output: 'standalone',

	// webpack: (config) => {
	// 	config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
	// 	return config;
	// },

    // Add the async rewrites function
    async rewrites() {
        return [
            {
                source: '/census.js',
                destination: 'https://analytics.2block.co/census.js',
            },
            // {
            //     source: '/api/send',
            //     destination: 'https://analytics.2block.co/api/send',
            // }
        ];
    },
};

export default config;

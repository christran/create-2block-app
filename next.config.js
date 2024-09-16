await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
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
        ],
        unoptimized: true,
    },

    async headers() {
        if (process.env.NODE_ENV !== 'production') {
            return [];
        }
    
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
            }
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
            {
                source: '/api/send',
                destination: 'https://analytics.2block.co/api/send',
            }
        ];
    },
};

export default config;

await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

	webpack: (config) => {
		config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
		return config;
	},

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

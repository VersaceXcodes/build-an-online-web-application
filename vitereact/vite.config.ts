import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// webcontainers stuff
		{
			name: "isolation",
			configureServer(server) {
				server.middlewares.use((_req, res, next) => {
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
					next();
				});
			},
			configurePreviewServer(server) {
				server.middlewares.use((_req, res, next) => {
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
					next();
				});
			},
		},
	],
	server: {
		host: true,
		allowedHosts: true,
	},
	preview: {
		host: true,
		port: 4173,
		strictPort: false,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@schema": path.resolve(__dirname, "../backend/schema.ts"),
		},
	},
	build: {
		outDir: "dist",
		sourcemap: false,
		minify: false,
		chunkSizeWarningLimit: 2000,
	},
	logLevel: 'info',
});

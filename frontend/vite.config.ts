import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // <--- Added PWA Import
import path from 'path';
import fs from 'fs';

// Helper to find canister IDs
const networkName = process.env.DFX_NETWORK || "local";

let canisterIds: Record<string, string> = {};

try {
  // Read local canister IDs
  const localCanisterIdsPath = path.resolve(__dirname, "../.dfx/local/canister_ids.json");
  if (fs.existsSync(localCanisterIdsPath)) {
      const localCanisterIds = JSON.parse(fs.readFileSync(localCanisterIdsPath, "utf8"));
      Object.entries(localCanisterIds).forEach(([key, val]: [string, any]) => {
        canisterIds[`CANISTER_ID_${key.toUpperCase()}`] = val[networkName];
      });
  } else {
      console.warn("⚠️ Local canister_ids.json not found. Ensure you have run `dfx deploy` or `dfx canister create`.");
  }
} catch (e) {
  console.warn("Error reading local canister_ids.json", e);
}

// Setup environment variables for the build
const envVars = {
    "process.env.DFX_NETWORK": JSON.stringify(networkName),
    ...Object.keys(canisterIds).reduce((acc, key) => {
        acc[`process.env.${key}`] = JSON.stringify(canisterIds[key]);
        return acc;
    }, {} as Record<string, string>)
};

export default defineConfig({
  root: '',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/], // Ensure CommonJS modules are transpiled
    },
  },
  optimizeDeps: {
    // CRITICAL: Force Vite to re-bundle these specific dependencies from the ROOT
    include: [
      "react",
      "react-dom",
      "@dfinity/auth-client",
      "@dfinity/agent",
      "@dfinity/identity"
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    // <--- PWA CONFIGURATION ADDED HERE
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'GATE Petroleum 2026',
        short_name: 'GATE PE',
        description: 'Complete preparation platform for GATE Petroleum Engineering',
        theme_color: '#0f766e',
        background_color: '#ecfdf5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png', // Ensure you add these images to your public folder!
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  define: envVars,
  resolve: {
    // CRITICAL: This prevents Vite from following symlinks to the wrong location
    preserveSymlinks: true,
    // CRITICAL: This forces Vite to use a single copy of React
    dedupe: ['react', 'react-dom'],
    alias: {
      // 1. Point "@" to the local source folder
      "@": path.resolve(__dirname, "./src"),

      // 2. HARD LINK React to the ROOT node_modules
      "react": path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),

      // 3. HARD LINK Dfinity packages to the ROOT node_modules
      "@dfinity/identity": path.resolve(__dirname, "../node_modules/@dfinity/identity"),
      "@dfinity/auth-client": path.resolve(__dirname, "../node_modules/@dfinity/auth-client"),
      "@dfinity/agent": path.resolve(__dirname, "../node_modules/@dfinity/agent"),
      "@dfinity/candid": path.resolve(__dirname, "../node_modules/@dfinity/candid"),
      "@dfinity/principal": path.resolve(__dirname, "../node_modules/@dfinity/principal"),
    },
  },
});
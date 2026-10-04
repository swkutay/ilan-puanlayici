import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Geliştirme sırasında /api isteklerini backend'e (3000) yönlendirir.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});

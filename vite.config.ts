import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Relative paths, so the build works at any address:
  // username.github.io/any-repo-name/ or a custom domain.
  base: "./",
  plugins: [react(), tailwindcss()],
  // GitHub Actions sets GITHUB_REPOSITORY ("owner/repo"); the page uses it for its GitHub links.
  define: { __REPO__: JSON.stringify(process.env.GITHUB_REPOSITORY ?? "") },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
})

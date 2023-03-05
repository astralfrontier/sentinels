import Markdown from '@pity/vite-plugin-react-markdown'
import react from '@vitejs/plugin-react-swc'
import markdownItAnchor from "markdown-it-anchor"
import markdownItToc from "markdown-it-table-of-contents"
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Markdown({
      markdownItSetup(md) {
        md.use(markdownItAnchor)
        md.use(markdownItToc)
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
})

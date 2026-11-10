import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tsvue-todo-app/' : '/',
  plugins: [vue(), {
    name: 'github-pages-history-fallback',
    generateBundle() {
      // Pages cannot rewrite SPA routes. Return through index.html, then
      // restore the original path before Vue Router starts.
      this.emitFile({ type: 'asset', fileName: '404.html', source: `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Opening Todo App</title>
<script>location.replace('/tsvue-todo-app/?__route=' + encodeURIComponent(location.pathname + location.search + location.hash));</script>
<p>Opening Todo App… <a href="/tsvue-todo-app/">Back to notes</a></p></html>` })
    }
  }],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts']
  }
}))

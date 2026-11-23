import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

const config = defineConfig(() => {
  const isVitest = process.env.VITEST === 'true'

  return {
    cacheDir: isVitest ? 'node_modules/.vite-test' : 'node_modules/.vite',
    resolve: { tsconfigPaths: true },
    ssr: { noExternal: ['fumadocs-core', 'fumadocs-ui', 'fumadocs-twoslash'] },
    test: {
      exclude: [...configDefaults.exclude, '.docs-cache/**', '.docs-content/**'],
    },
    plugins: [
      devtools(),
      ...(!isVitest ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      tailwindcss(),
      tanstackStart({ router: { generatedRouteTree: 'route-tree.gen.ts' } }),
      viteReact(),
    ],
  }
})

export default config

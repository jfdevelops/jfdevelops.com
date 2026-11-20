import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fumadocsMdx } from 'fumadocs-mdx/vite'
import { configDefaults, defineConfig } from 'vitest/config'

const config = defineConfig(() => {
  const isVitest = process.env.VITEST === 'true'

  return {
    cacheDir: isVitest ? 'node_modules/.vite-test' : 'node_modules/.vite',
    resolve: { tsconfigPaths: true },
    environments: {
      ssr: {
        optimizeDeps: {
          // The MDX macro injects this import after Vite's initial dependency scan.
          // Prebundle it before rendering to avoid replacing React during an SSR request.
          include: ['fumadocs-mdx/runtime/macro'],
        },
      },
    },
    test: {
      exclude: [...configDefaults.exclude, '.docs-cache/**', '.docs-content/**'],
    },
    plugins: [
      devtools(),
      ...(!isVitest ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      tailwindcss(),
      fumadocsMdx(),
      tanstackStart({ router: { generatedRouteTree: 'route-tree.gen.ts' } }),
      viteReact(),
    ],
  }
})

export default config

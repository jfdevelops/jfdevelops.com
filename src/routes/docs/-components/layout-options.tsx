import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { BookOpen } from 'lucide-react'
import ThemeToggle from '@/components/theme-toggle'
import { getLibraries } from '@/docs/registry'

export function docsLayoutOptions() {
  return {
    nav: {
      url: '/docs',
      title: (
        <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
          <BookOpen aria-hidden="true" className="size-5 text-fd-primary" />
          <span className="font-semibold">JF Develops</span>
        </span>
      ),
    },
    links: [
      {
        type: 'menu',
        text: 'Documentation',
        on: 'nav',
        items: getLibraries().map((pkg) => ({
          text: pkg.name,
          description: pkg.description,
          url: `/docs/${pkg.slug}`,
        })),
      },
      { text: 'Main site', url: '/', on: 'nav' },
    ],
    searchToggle: { enabled: false },
    themeSwitch: { enabled: true, component: <ThemeToggle /> },
  } satisfies BaseLayoutProps
}

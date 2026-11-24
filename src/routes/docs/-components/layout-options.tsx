import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { BookOpen } from 'lucide-react'
import ThemeToggle from '@/components/theme-toggle'
import { libraryGroups } from '@/routes/docs/-utils/libraries'

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
        items: libraryGroups.flatMap((group) => [
          {
            type: 'custom' as const,
            children: (
              <p className="col-span-full px-2 pt-3 pb-1 text-xs font-semibold text-fd-muted-foreground">
                {group.title}
              </p>
            ),
          },
          ...group.libraries.map((library) => ({
            text: library.title,
            description: library.description,
            url: library.url,
          })),
        ]),
      },
      { text: 'Main site', url: '/', on: 'nav' },
    ],
    searchToggle: { enabled: false },
    themeSwitch: { enabled: true, component: <ThemeToggle /> },
  } satisfies BaseLayoutProps
}

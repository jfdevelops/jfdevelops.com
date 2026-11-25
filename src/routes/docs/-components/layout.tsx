import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { BookOpenIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { createComponent } from '@/lib/create-component'
import { libraryGroups } from '../-utils/libraries'

function Title() {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <BookOpenIcon aria-hidden="true" className="size-5 text-fd-primary" />
      <span className="font-semibold">JF Develops</span>
    </span>
  )
}

export const DocsHome = createComponent(HomeLayout)({
  // Fumadocs reads its layout width from this variable.
  className: '[--fd-layout-width:72rem]',
  nav: {
    url: '/docs',
    title: <Title />,
  },
  links: [
    {
      type: 'menu',
      text: 'Documentation',
      on: 'nav',
      items: libraryGroups.flatMap((group) => [
        {
          type: 'custom',
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
  searchToggle: {
    enabled: false,
  },
  themeSwitch: {
    enabled: true,
  },
  slots: {
    themeSwitch: ThemeToggle,
  },
})
export const docsLayoutOptions = DocsHome.defaults

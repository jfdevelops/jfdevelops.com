import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { createComponent } from '@/lib/create-component'

export const DocsHome = createComponent(HomeLayout)({
  // Fumadocs reads its layout width from this variable.
  className: '[--fd-layout-width:72rem]',
  // The site header is the only header; Fumadocs' own navbar stays off.
  nav: {
    enabled: false,
  },
  searchToggle: {
    enabled: false,
  },
  themeSwitch: {
    enabled: false,
  },
})

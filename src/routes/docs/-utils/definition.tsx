import { createDefinedResourceLayout } from '@jfdevelops/react-layout'

export type DocsPackageId = ReturnType<typeof resources.parse>

export const { defineResourceLayout, resources } = createDefinedResourceLayout({
  resources: ['react-layout', 'multi-step-form', 'create-error', 'cli', 'skills'],
})

export const { createResourceConfig, createResourceLayout, createResourceLinks } =
  defineResourceLayout({
    render: function ResourceLayout({ children }) {
      return <>{children}</>
    },
  })

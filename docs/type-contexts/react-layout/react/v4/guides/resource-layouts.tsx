import { defineResourceLayout } from '@jfdevelops/react-layout'
import { z } from 'zod'

// Shared setup for the fragments on the resources/layouts guide. This is
// compiled against the actual public API and hidden from the displayed block.
export const { createResourceLayout, useResource } = defineResourceLayout({
  resources: [
    'dashboard',
    {
      value: 'users',
      subResources: ['admins', { value: 'managers', subResources: ['female', 'male'] }],
    },
  ],
  options: { title: z.string() },
  layout: {
    props: { include: { title: 'optional' } },
    render: () => <main />,
  },
})

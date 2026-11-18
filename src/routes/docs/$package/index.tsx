import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { getDocsContext } from '@/docs/queries'

export const Route = createFileRoute('/docs/$package/')({
  loader: async ({ params }) => {
    const docs = await getDocsContext({ data: { package: params.package } })
    if (!docs) {
      throw notFound()
    }
    const { pkg } = docs

    throw redirect({
      to: '/docs/$package/$',
      params: { package: pkg.id, _splat: pkg.defaultVersion },
      search: {},
    })
  },
})

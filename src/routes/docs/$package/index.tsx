import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { getPackageDocs } from '@/docs/registry'

export const Route = createFileRoute('/docs/$package/')({
  loader: ({ params }) => {
    const pkg = getPackageDocs(params.package)
    if (!pkg) {
      throw notFound()
    }
    throw redirect({
      to: '/docs/$package/$',
      params: { package: pkg.id, _splat: pkg.defaultVersion },
      search: {},
    })
  },
})

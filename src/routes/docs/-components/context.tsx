import { createContext, useContext } from 'react'
import type { DocPage, PackageDocs } from '@/docs/registry'

const DocsContext = createContext<{ pkg: PackageDocs; page: DocPage } | null>(null)

export const DocsProvider = DocsContext.Provider

export function useDocs() {
  const docs = useContext(DocsContext)

  if (!docs) {
    throw new Error('Docs components must be inside DocsProvider')
  }

  const version = docs.pkg.versions.find((version) => version.id === docs.page.version)

  if (!version) {
    throw new Error(`Missing generated version: ${docs.page.version}`)
  }

  return { ...docs, version }
}

import { z } from 'zod'
import {
  getDocsLibraries as fetchLibraries,
  getDocLibrary as fetchLibrary,
  getDocContent as fetchPage,
} from './queries'
import { librarySchema, manifestSchema, pageSchema, pointerSchema } from './snapshot'

const revision = pointerSchema.shape.revision
const libraryResponse = manifestSchema.extend({ revision }).nullable()
const pageResponse = z.object({ pkg: librarySchema, page: pageSchema, revision }).nullable()

export async function getDocsLibraries() {
  return z.array(librarySchema).parse(JSON.parse(await fetchLibraries()))
}

export async function getDocLibrary(input: Parameters<typeof fetchLibrary>[0]) {
  return libraryResponse.parse(JSON.parse(await fetchLibrary(input)))
}

export async function getDocContent(input: Parameters<typeof fetchPage>[0]) {
  return pageResponse.parse(JSON.parse(await fetchPage(input)))
}

import { z } from 'zod'
import * as queries from './queries'
import { librarySchema, manifestSchema, pageSchema, pointerSchema } from './snapshot'

const revision = pointerSchema.shape.revision
const libraryResponse = manifestSchema.extend({ revision }).nullable()
const pageResponse = z.object({ pkg: librarySchema, page: pageSchema, revision }).nullable()
const libraryVersions = z.record(z.string(), z.string().nullable())

export async function getDocsLibraryVersions() {
  return libraryVersions.parse(JSON.parse(await queries.getDocsLibraryVersions()))
}

export async function getDocLibrary(input: Parameters<typeof queries.getDocLibrary>[0]) {
  return libraryResponse.parse(JSON.parse(await queries.getDocLibrary(input)))
}

export async function getDocContent(input: Parameters<typeof queries.getDocContent>[0]) {
  return pageResponse.parse(JSON.parse(await queries.getDocContent(input)))
}

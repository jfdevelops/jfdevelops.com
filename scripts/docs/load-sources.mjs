import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { register } from 'tsx/esm/api'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const unregister = register()

export async function loadDocsSources() {
  try {
    const module = await import(
      pathToFileURL(path.join(projectRoot, 'src/routes/docs/-utils/libraries.ts')).href
    )

    return module.docsSources
  } finally {
    unregister()
  }
}

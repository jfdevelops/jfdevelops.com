import { transformerTwoslash } from '@shikijs/twoslash'
import { createHighlighter } from 'shiki'

const LANGUAGES = ['ts', 'tsx', 'js', 'jsx', 'json', 'sh', 'bash', 'text', 'css', 'diff', 'yaml']

export async function createCodeRenderer() {
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: LANGUAGES,
  })

  return {
    render(code, language, twoslasher) {
      const lang = LANGUAGES.includes(language) ? language : 'text'
      const transformer = transformerTwoslash({
        twoslasher,
        explicitTrigger: false,
        renderer: {
          nodeStaticInfo(info, node) {
            return {
              type: 'element',
              tagName: 'span',
              properties: { class: 'docs-type' },
              children: [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { class: 'docs-type-fallback' },
                  children: [node],
                },
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {
                    class: 'docs-type-mount',
                    'data-type': info.text,
                    'data-docs': info.docs ?? '',
                  },
                  children: [],
                },
              ],
            }
          },
        },
      })

      return highlighter.codeToHtml(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
        transformers: twoslasher && ['ts', 'tsx', 'js', 'jsx'].includes(lang) ? [transformer] : [],
      })
    },
    dispose() {
      highlighter.dispose()
    },
  }
}

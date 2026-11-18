import ts from 'typescript'

function declarationNames(node) {
  if (ts.isIdentifier(node)) {
    return [node.text]
  }

  if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node)) {
    return node.elements.flatMap((element) =>
      ts.isBindingElement(element) ? declarationNames(element.name) : [],
    )
  }

  return []
}

function declarations(code, extension) {
  const source = ts.createSourceFile(`snippet.${extension}`, code, ts.ScriptTarget.Latest, true)

  if (source.parseDiagnostics.length) {
    return []
  }

  return source.statements.flatMap((statement) => {
    let names = []

    if (ts.isImportDeclaration(statement) && statement.importClause) {
      const clause = statement.importClause
      names = clause.name ? [clause.name.text] : []

      if (clause.namedBindings) {
        names.push(
          ...(ts.isNamespaceImport(clause.namedBindings)
            ? [clause.namedBindings.name.text]
            : clause.namedBindings.elements.map((element) => element.name.text)),
        )
      }
    } else if (ts.isVariableStatement(statement)) {
      names = statement.declarationList.declarations.flatMap((declaration) =>
        declarationNames(declaration.name),
      )
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name
    ) {
      names = [statement.name.text]
    }

    return names.length ? [{ names, code: statement.getText(source) }] : []
  })
}

/** Earlier complete declarations provide hidden context for subsequent examples. */
export function createPageCodeRenderer(renderer, twoslasher) {
  const contexts = { tsx: [], jsx: [] }

  return (code, language) => {
    if (!['ts', 'tsx', 'js', 'jsx'].includes(language)) {
      return renderer.render(code, language)
    }

    const extension = ['ts', 'tsx'].includes(language) ? 'tsx' : 'jsx'
    const current = declarations(code, extension)
    const names = new Set(current.flatMap((declaration) => declaration.names))
    const context = contexts[extension].filter(
      (declaration) => !declaration.names.some((name) => names.has(name)),
    )
    const prefix = context.map((declaration) => declaration.code).join('\n')
    const run = (snippet, _language, options) =>
      twoslasher(prefix ? `${prefix}\n// ---cut---\n${snippet}` : snippet, extension, options)
    const html = renderer.render(code, language, run)
    contexts[extension] = [...context, ...current]

    return html
  }
}

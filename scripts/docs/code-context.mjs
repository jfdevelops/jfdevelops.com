import ts from 'typescript'

function sourceFile(code) {
  return ts.createSourceFile('example.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}

function declarations(statement) {
  const names = []
  function binding(node) {
    if (ts.isIdentifier(node)) names.push(node.text)
    else if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node))
      for (const element of node.elements) if (ts.isBindingElement(element)) binding(element.name)
  }
  if (ts.isVariableStatement(statement))
    for (const declaration of statement.declarationList.declarations) binding(declaration.name)
  else if (ts.isImportDeclaration(statement)) {
    if (statement.importClause?.name) binding(statement.importClause.name)
    const imports = statement.importClause?.namedBindings
    if (imports && ts.isNamespaceImport(imports)) binding(imports.name)
    else if (imports) for (const element of imports.elements) binding(element.name)
  } else if ('name' in statement && statement.name) binding(statement.name)
  return names
}

// Use TypeScript's binder so parameters, nested locals and property names are not
// mistaken for missing imports. Each visible fragment remains its own module.
export function missingIdentifiers(code) {
  const file = sourceFile(code)
  const host = ts.createCompilerHost({ noLib: true, noResolve: true })
  host.getSourceFile = (name) => (name === file.fileName ? file : undefined)
  const program = ts.createProgram([file.fileName], { noLib: true, noResolve: true }, host)
  const checker = program.getTypeChecker()
  const names = new Set()
  function visit(node) {
    if (ts.isIdentifier(node) && !checker.getSymbolAtLocation(node)) names.add(node.text)
    ts.forEachChild(node, visit)
  }
  visit(file)
  return names
}

export function completeCodeBlocks(markdown, { imports = {}, prelude = '' } = {}) {
  markdown = markdown.replace(/\r\n/g, '\n')
  const fences = []
  const opener = /^ {0,3}(`{3,}|~{3,})([^\n]*)\n/gm
  for (let match = opener.exec(markdown); match; match = opener.exec(markdown)) {
    const closing = new RegExp(`^ {0,3}${match[1][0]}{${match[1].length},}[^\\S\\n]*$`, 'gm')
    closing.lastIndex = opener.lastIndex
    const end = closing.exec(markdown)
    if (!end) break
    const language = /^(ts|tsx|typescript|js|jsx|javascript)(?=\s|$)(.*)$/.exec(match[2])
    if (language) {
      const fence = [
        markdown.slice(match.index, closing.lastIndex),
        match[1],
        language[1],
        language[2],
        markdown.slice(opener.lastIndex, end.index),
      ]
      fence.index = match.index
      fences.push(fence)
    }
    opener.lastIndex = closing.lastIndex
  }
  // Authored prose query markers are comments, not executable Twoslash requests.
  for (const fence of fences) {
    if (!/\btwoslash\b/.test(fence[3]))
      fence[4] = fence[4].replace(/^(\s*\/\/\s*)\^\?/gm, '$1Type:')
  }
  const statements = fences.flatMap((fence, index) =>
    [...sourceFile(fence[4]).statements].map((statement) => ({
      code: statement.getFullText(),
      names: declarations(statement),
      index,
    })),
  )
  const setup = [...sourceFile(prelude).statements].map((statement) => ({
    code: statement.getFullText(),
    names: declarations(statement),
    index: -1,
  }))
  for (let index = fences.length - 1; index >= 0; index--) {
    const fence = fences[index]
    const code = fence[4]
    if (code.includes('// ---cut---') || code.includes('// @filename:')) continue
    const ownNames = new Set([...sourceFile(code).statements].flatMap(declarations))
    const selected = new Set()
    const candidates = [
      ...setup,
      ...statements.filter((statement) => statement.index < index).reverse(),
      ...statements.filter((statement) => statement.index > index),
      ...Object.entries(imports).map(([name, module]) => ({
        names: [name],
        code: `import { ${name} } from ${JSON.stringify(module)};`,
        index: -1,
      })),
    ]
    function resolve(fragment) {
      for (const name of missingIdentifiers(fragment)) {
        if (ownNames.has(name) || [...selected].some((statement) => statement.names.includes(name)))
          continue
        const statement = candidates.find(
          (statement) =>
            statement.names.includes(name) && !statement.names.some((name) => ownNames.has(name)),
        )
        if (!statement) continue
        selected.add(statement)
        resolve(statement.code)
      }
    }
    resolve(code)
    if (!selected.size) {
      const completed = `${fence[1]}${fence[2]}${fence[3]}\n${code}${fence[1]}`
      markdown =
        markdown.slice(0, fence.index) + completed + markdown.slice(fence.index + fence[0].length)
      continue
    }
    const context = [...selected]
      .reverse()
      .map((statement) => statement.code)
      .join('\n')
    const completed = `${fence[1]}${fence[2]}${fence[3]}\n${context}\n// ---cut---\n${code}${fence[1]}`
    markdown =
      markdown.slice(0, fence.index) + completed + markdown.slice(fence.index + fence[0].length)
  }
  return markdown
}

export function publicImports(context) {
  if (!context.packageName) return {}
  const options = ts.convertCompilerOptionsFromJson(context.compilerOptions, context.cwd).options
  const filename = `${context.cwd.replaceAll('\\', '/')}/__docs_imports__.tsx`
  const content = `import * as Library from ${JSON.stringify(context.packageName)}`
  const host = ts.createCompilerHost(options)
  const original = host.getSourceFile.bind(host)
  host.getSourceFile = (name, languageVersion, ...rest) =>
    name === filename
      ? ts.createSourceFile(filename, content, languageVersion, true)
      : original(name, languageVersion, ...rest)
  const program = ts.createProgram([filename], options, host)
  const checker = program.getTypeChecker()
  const file = program.getSourceFile(filename)
  const symbol = checker.getSymbolAtLocation(file.statements[0].moduleSpecifier)
  return symbol
    ? Object.fromEntries(
        checker
          .getExportsOfModule(symbol)
          .filter((symbol) => symbol.name !== 'default')
          .map((symbol) => [symbol.name, context.packageName]),
      )
    : {}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname } from 'node:path';

const catalogPath = resolve(dirname(fileURLToPath(import.meta.url)), '../lib/catalog.ts');

const visitedFiles = new Set<string>();
const exportedNames = new Set<string>();

function collectExportsFrom(filePath: string) {
  const normalizedPath = resolve(filePath);
  if (visitedFiles.has(normalizedPath)) return;
  visitedFiles.add(normalizedPath);

  if (!existsSync(normalizedPath)) return;

  const source = readFileSync(normalizedPath, 'utf8');
  const sourceFile = ts.createSourceFile(normalizedPath, source, ts.ScriptTarget.ESNext, true);

  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
      statement.name
    ) {
      exportedNames.add(statement.name.text);
      continue;
    }

    if (
      ts.isVariableStatement(statement) &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exportedNames.add(declaration.name.text);
        }
      }
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const specifier of statement.exportClause.elements) {
          if (!specifier.isTypeOnly) {
            exportedNames.add(specifier.name.text);
          }
        }
      } else if (!statement.exportClause && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
        const specifierSrc = statement.moduleSpecifier.text;
        if (specifierSrc.startsWith('.') || specifierSrc.startsWith('/')) {
          const resolved = resolveRelativeModule(normalizedPath, specifierSrc);
          if (resolved) {
            collectExportsFrom(resolved);
          }
        }
      }
    }
  }
}

function resolveRelativeModule(importer: string, specifier: string): string | null {
  const baseDir = dirname(importer);
  const candidate = resolve(baseDir, specifier);
  const candidates = [candidate];
  if (!extname(candidate)) {
    candidates.push(`${candidate}.ts`, `${candidate}.js`, `${candidate}/index.ts`, `${candidate}/index.js`);
  }

  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

collectExportsFrom(catalogPath);

const expectedFunctions = [
  'getCatalogBeans',
  'getCatalogBeansPage',
  'countCatalogBeans',
  'getBeanById',
  'getCatalogBeansByIds',
  'searchCatalogBeans',
  'countSearchCatalogBeans',
  'getRoasterPage',
  'getRoasters',
  'countRoasters',
  'getRoasterById',
  'getRoastersByIds',
];

test('catalog.ts keeps the public catalog API exports', () => {
  const missing = expectedFunctions.filter((name) => !exportedNames.has(name));
  assert.deepEqual(missing, [], 'catalog.ts should export all public catalog helpers');
});

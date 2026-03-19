import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

function hasExportModifier(node: ts.Node): boolean {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function collectExportedNames(moduleUrl: URL, seen = new Set<string>()): Set<string> {
  if (seen.has(moduleUrl.href)) {
    return new Set();
  }
  seen.add(moduleUrl.href);

  const source = readFileSync(moduleUrl, 'utf8');
  const sourceFile = ts.createSourceFile(moduleUrl.pathname, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const exportedNames = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement)) {
      exportedNames.add(statement.name.text);
      continue;
    }

    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exportedNames.add(declaration.name.text);
        }
      }
      continue;
    }

    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) {
      continue;
    }
    if (statement.isTypeOnly || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }

    if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) {
          exportedNames.add(element.name.text);
        }
      }
      continue;
    }

    if (!statement.exportClause && statement.moduleSpecifier.text.startsWith('.')) {
      const nestedNames = collectExportedNames(new URL(statement.moduleSpecifier.text, moduleUrl), seen);
      for (const name of nestedNames) {
        exportedNames.add(name);
      }
    }
  }

  return exportedNames;
}

test('public-api keeps beans compatibility exports stable', () => {
  const exportedNames = collectExportedNames(new URL('../lib/server/public-api.ts', import.meta.url));

  assert.ok(exportedNames.has('listBeansV1'));
  assert.ok(exportedNames.has('getBeanDetailV1'));
  assert.ok(exportedNames.has('getBeanDiscoverV1'));
});

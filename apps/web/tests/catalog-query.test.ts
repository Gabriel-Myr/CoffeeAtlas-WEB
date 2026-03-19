import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCatalogIlikePattern,
  normalizeCatalogSearchTerm,
  sanitizeCatalogSearchTerm,
} from '../lib/catalog-query.ts';

test('normalizeCatalogSearchTerm keeps search meaning while trimming whitespace', () => {
  assert.equal(normalizeCatalogSearchTerm("  Peet's coffee  "), "Peet's coffee");
});

test('sanitizeCatalogSearchTerm normalizes blank input to undefined', () => {
  assert.equal(sanitizeCatalogSearchTerm(undefined), undefined);
  assert.equal(sanitizeCatalogSearchTerm('   '), undefined);
  assert.equal(sanitizeCatalogSearchTerm(' ,%() '), undefined);
});

test('sanitizeCatalogSearchTerm strips only syntax-unsafe filter characters', () => {
  assert.equal(sanitizeCatalogSearchTerm("peet's, coffee%(light)"), "peet's coffee light");
});

test('buildCatalogIlikePattern wraps syntax-safe values for ilike/or', () => {
  assert.equal(buildCatalogIlikePattern(" peet's, coffee%(light) "), "%peet's coffee light%");
  assert.equal(buildCatalogIlikePattern(''), undefined);
});

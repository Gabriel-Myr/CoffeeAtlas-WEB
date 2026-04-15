import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { BeanDiscoverContinent } from '@coffee-atlas/shared-types';

export interface LightQuestionCopyConfig {
  miniprogram: {
    guidedCard: {
      label: string;
      collapsed: Record<'default' | 'guided' | 'direct', { title: string; description: string }>;
      steps: Record<'process_base' | 'process_style' | 'continent' | 'country' | 'variety' | 'done', { title: string; description: string }>;
      processChoices: Array<{ id: string; title: string; description: string }>;
      processStyleChoices: Array<{ id: string; title: string; description: string }>;
      continentChoices: Array<{ id: string; title: string; description: string }>;
      ui: Record<string, string>;
    };
    discoverEditorial: {
      templates: {
        default: { title: string; subtitle: string };
        processBase: { titleTemplate: string; subtitle: string };
        continent: { titleTemplate: string; subtitleTemplate: string };
        country: { titleTemplate: string; subtitle: string };
        variety: { titleTemplate: string; subtitle: string };
      };
      reasons: Record<string, string>;
    };
  };
  api: {
    editorialConfigs: Array<{
      id: string;
      match: {
        process?: string;
        continent?: BeanDiscoverContinent;
        country?: string;
      };
      title: string;
      subtitle: string;
    }>;
    editorialReasons: Record<string, string>;
  };
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiCopyPath = path.resolve(currentDir, '../../data/light-question-copy.json');
const miniprogramCopyPath = path.resolve(currentDir, '../../../miniprogram/src/pages/all-beans/light-question-copy.json');
const miniprogramGeneratedCopyPath = path.resolve(
  currentDir,
  '../../../miniprogram/src/pages/all-beans/light-question-copy.generated.ts'
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string`);
  }
}

function validateChoiceArray(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array`);
  }

  value.forEach((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${field}[${index}] must be an object`);
    }
    assertString(item.id, `${field}[${index}].id`);
    assertString(item.title, `${field}[${index}].title`);
    assertString(item.description, `${field}[${index}].description`);
  });
}

function validateConfig(value: unknown): asserts value is LightQuestionCopyConfig {
  if (!isRecord(value)) throw new Error('config must be an object');
  if (!isRecord(value.miniprogram)) throw new Error('miniprogram config is required');
  if (!isRecord(value.api)) throw new Error('api config is required');

  const guidedCard = value.miniprogram.guidedCard;
  const discoverEditorial = value.miniprogram.discoverEditorial;
  if (!isRecord(guidedCard)) throw new Error('guidedCard is required');
  if (!isRecord(discoverEditorial)) throw new Error('discoverEditorial is required');

  assertString(guidedCard.label, 'guidedCard.label');
  if (!isRecord(guidedCard.collapsed)) throw new Error('guidedCard.collapsed is required');
  if (!isRecord(guidedCard.steps)) throw new Error('guidedCard.steps is required');
  validateChoiceArray(guidedCard.processChoices, 'guidedCard.processChoices');
  validateChoiceArray(guidedCard.processStyleChoices, 'guidedCard.processStyleChoices');
  validateChoiceArray(guidedCard.continentChoices, 'guidedCard.continentChoices');
  if (!isRecord(guidedCard.ui)) throw new Error('guidedCard.ui is required');

  if (!isRecord(discoverEditorial.templates)) throw new Error('discoverEditorial.templates is required');
  if (!isRecord(discoverEditorial.reasons)) throw new Error('discoverEditorial.reasons is required');

  if (!Array.isArray(value.api.editorialConfigs)) throw new Error('api.editorialConfigs must be an array');
  if (!isRecord(value.api.editorialReasons)) throw new Error('api.editorialReasons is required');

  value.api.editorialConfigs.forEach((item, index) => {
    if (!isRecord(item)) throw new Error(`api.editorialConfigs[${index}] must be an object`);
    assertString(item.id, `api.editorialConfigs[${index}].id`);
    assertString(item.title, `api.editorialConfigs[${index}].title`);
    assertString(item.subtitle, `api.editorialConfigs[${index}].subtitle`);
    if (!isRecord(item.match)) throw new Error(`api.editorialConfigs[${index}].match must be an object`);
  });
}

export function formatLightQuestionTemplate(
  template: string,
  variables: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = variables[key];
    return value === null || value === undefined ? '' : String(value);
  });
}

function renderGeneratedMiniprogramCopy(config: LightQuestionCopyConfig): string {
  return `export const GENERATED_LIGHT_QUESTION_COPY = ${JSON.stringify(config, null, 2)} as const;\n`;
}

export async function readLightQuestionCopyConfig(): Promise<LightQuestionCopyConfig> {
  const text = await fs.readFile(apiCopyPath, 'utf8');
  const parsed = JSON.parse(text) as unknown;
  validateConfig(parsed);
  return parsed;
}

export async function writeLightQuestionCopyConfig(config: unknown): Promise<LightQuestionCopyConfig> {
  validateConfig(config);
  const serialized = `${JSON.stringify(config, null, 2)}\n`;
  await Promise.all([
    fs.writeFile(apiCopyPath, serialized, 'utf8'),
    fs.writeFile(miniprogramCopyPath, serialized, 'utf8'),
    fs.writeFile(miniprogramGeneratedCopyPath, renderGeneratedMiniprogramCopy(config), 'utf8'),
  ]);
  return config;
}

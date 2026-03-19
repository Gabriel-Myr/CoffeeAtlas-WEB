import nextPlugin from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.tsbuildinfo',
    ],
  },
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    settings: {
      next: {
        rootDir: 'apps/web/',
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-undef': 'off',
    },
  },
  {
    files: [
      'apps/miniprogram/**/*.{ts,tsx,js,jsx}',
      'packages/**/*.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
];

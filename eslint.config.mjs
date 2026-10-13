import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import comments from '@eslint-community/eslint-plugin-eslint-comments';
import stylistic from '@stylistic/eslint-plugin';
import imports from 'eslint-plugin-import-x';
import { emitLint } from '@kekkai/blueprint';
import blueprint from './blueprint.config.mjs';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  { files: ['**/*.{ts,tsx}'], extends: [...tseslint.configs.recommended] },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,cjs,mjs}'],
    languageOptions: { globals: globals.vitest },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules, 'react-hooks/exhaustive-deps': 'error' },
  },
  ...emitLint(blueprint, { typescript: tseslint.plugin, stylistic, imports }),
  {
    plugins: { '@eslint-community/eslint-comments': comments },
    rules: {
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },
);

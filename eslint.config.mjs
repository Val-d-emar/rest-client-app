import prettierConfig from 'eslint-config-prettier';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const strictConfig = tseslint.config({
  files: ['**/*.{ts,tsx}'],
  extends: [...tseslint.configs.strict],
  plugins: {
    'react-hooks': reactHooks,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    eqeqeq: 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
});

const isStrictMode = process.env.ESLINT_STRICT_MODE === 'true';

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**'],
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  ...(isStrictMode ? strictConfig : []),
  prettierConfig,
];

export default eslintConfig;

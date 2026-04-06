import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'indent': ['error', 2],
      'max-len': ['error', { code: 100, ignoreComments: true, ignoreStrings: true }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'space-before-function-paren': ['error', 'never'],
      'space-infix-ops': 'error',
      'keyword-spacing': ['error', { before: true, after: true }],
      'semi': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
    {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: ['dist', 'node_modules', '**/*.config.js', '**/*.config.ts'],
  },
);
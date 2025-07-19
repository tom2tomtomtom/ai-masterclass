import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**'
    ]
  }
];

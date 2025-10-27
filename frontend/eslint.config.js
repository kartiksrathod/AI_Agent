const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');
module.exports = {
  ignorePatterns: ['build/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

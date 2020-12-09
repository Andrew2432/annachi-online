module.exports = {
  env: {
    browser: true,
    es2021: true,
  },

  extends: ['airbnb-base', 'prettier'],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint', 'prettier'],

  rules: {
    'prettier/prettier': 'error',
    'no-underscore-dangle': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'class-methods-use-this': 'off',
    'max-classes-per-file': 'off',
  },
};

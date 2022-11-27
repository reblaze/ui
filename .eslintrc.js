/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  'root': true,
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript',
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'parser': '@typescript-eslint/parser',
    'sourceType': 'module',
  },
  'plugins': [
    'vue',
    '@typescript-eslint',
  ],
  'ignorePatterns': ['public/*', 'dist/*', 'coverage/*', '**/*.js', 'vue-shims.d.ts'],
  'rules': {
    'semi': ['error', 'never'],
    'max-len': ['warn', {
      'code': 120,
      'comments': 140,
      'ignoreTrailingComments': true,
      'ignoreUrls': true,
    }],
    'require-jsdoc': 'off',
    'indent': ['error', 2, {
      'FunctionDeclaration': {
        'parameters': 'first',
      },
      'FunctionExpression': {
        'parameters': 'first',
      },
      'CallExpression': {
        'arguments': 'off',
      },
      'SwitchCase': 1,
    }],
    'space-in-parens': [2, 'never'],
    'array-bracket-spacing': [2, 'never'],
    'computed-property-spacing': [2, 'never'],
    'no-undef': 'off',
    'vue/no-v-for-template-key': 'off',
    'vue/html-self-closing': 'off',
    'vue/first-attribute-linebreak': 'off',
  },
}

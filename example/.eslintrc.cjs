module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react-refresh',
    'react-hooks',
  ],
  rules: {
    'no-restricted-exports': 0,
    'import/no-absolute-path': 0,
    'react/display-name': 0,
    'import/prefer-default-export': 0,
    'arrow-parens': ['error', 'as-needed'],
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react-refresh/only-export-components': 'warn',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: true },
    ],
    'react/jsx-props-no-spreading': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        '': 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
  },
};

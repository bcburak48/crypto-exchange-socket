import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      prettier
    },
    rules: {
      'prettier/prettier': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single']
    }
  }
];

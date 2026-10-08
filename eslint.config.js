import globals from 'globals';

import eslintConfig from '@brybrant/eslint-config';

export default eslintConfig({
  files: ['./test/bundles/**/*.ts'],
  languageOptions: {
    globals: globals.browser,
  },
});

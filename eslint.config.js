import { globalIgnores } from 'eslint/config';

import globals from 'globals';

import eslintConfig from '@brybrant/eslint-config';

export default eslintConfig(globalIgnores(['./test/three/**/*']), {
  files: ['./test/**/*.js'],
  languageOptions: {
    globals: globals.browser,
  },
});

import next from 'prefer-code-style/eslint/next'
import normal from 'prefer-code-style/eslint/preset/normal'
import typescriptStrict from 'prefer-code-style/eslint/typescript-strict'

export default [
  ...normal,
  ...typescriptStrict,
  ...next,

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 0,
    },
  },

  {
    ignores: ['plugins/*.js'],
  },
]

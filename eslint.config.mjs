import nextPreset from 'prefer-code-style/eslint/preset/next'

export default [
  ...nextPreset,

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

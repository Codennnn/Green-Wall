import nextPreset from 'prefer-code-style/eslint/preset/next'

export default [
  ...nextPreset,

  {
    ignores: ['plugins/*.js'],
  },
]

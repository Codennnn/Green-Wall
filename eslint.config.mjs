import next from 'prefer-code-style/eslint/next'
import normal from 'prefer-code-style/eslint/preset/normal'
import typescriptStrict from 'prefer-code-style/eslint/typescript-strict'

export default [
  ...normal,
  ...typescriptStrict,
  ...next,

  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 0,
    },
  },

  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/no-misused-promises': 0,
    },
  },

  {
    ignores: ['plugins/*.js'],
  },
]

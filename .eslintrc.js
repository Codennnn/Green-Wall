module.exports = {
  root: true,
  extends: [require.resolve('prefer-code-style/lib/eslint')],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
  },
  ignorePatterns: [
    'public',
    'es',
    'dist*',
    'yarn*',
    '.cache',
    '.next',
    '!.eslintrc.js',
    '!.prettierrc.js',
    '!.stylelintrc.js',
  ],
}

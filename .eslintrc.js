module.exports = {
  root: true,
  extends: [require.resolve('prefer-code-style/lib/eslint')],
  ignorePatterns: [
    'public',
    'yarn*',
    '.next',
    '!.eslintrc.js',
    '!.prettierrc.js',
    '!.stylelintrc.js',
  ],
}

module.exports = {
  root: true,
  extends: [require.resolve('prefer-code-style/lib/eslint'), 'plugin:@next/next/recommended'],
  ignorePatterns: ['public', '.next', '!.eslintrc.js', '!.prettierrc.js', '!.stylelintrc.js'],
}

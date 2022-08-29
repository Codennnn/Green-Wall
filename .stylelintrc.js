module.exports = {
  extends: [require.resolve('prefer-code-style/lib/stylelint')],
  rules: {
    'color-function-notation': 'modern',
    'selector-id-pattern': null,
  },
  ignoreFiles: ['public'],
}

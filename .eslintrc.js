module.exports = {
  root: true,
  extends: [require.resolve('prefer-code-style/lib/eslint'), 'plugin:@next/next/recommended'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^\\~/'] }],
  },
  ignorePatterns: [
    'public',
    'next-env.d.ts',
    '.next',
    '!.eslintrc.js',
    '!.prettierrc.js',
    '!.stylelintrc.js',
  ],
}

import stylelintPreset from 'prefer-code-style/stylelint'

export default {
  extends: [stylelintPreset],

  rules: {
    'at-rule-no-unknown': null,
    // @apply 的 prelude 是 Tailwind 工具类，不在标准 CSS 语法表里
    'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['apply'] }],
  },

  ignoreFiles: ['public'],
}

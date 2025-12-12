import stylelintPreset from 'prefer-code-style/stylelint'

export default {
  extends: [stylelintPreset],

  rules: {
    'at-rule-no-unknown': null,
  },

  ignoreFiles: ['public'],
}

module.exports = {
  extends: [
    'stylelint-config-recommended',
    './node_modules/prettier-stylelint/config.js',
  ],
  rules: {
    'no-descending-specificity': null,
  },
};

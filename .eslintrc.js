// @ts-check
const { extendConfig } = require("@aet/eslint-rules");

module.exports = extendConfig({
  auto: true,
  middlewares: [],
  rules: {
    "jsdoc/require-returns": "off",
    "jsdoc/require-param": "off",
    "jsdoc/check-param-names": "off",
    "jsdoc/require-jsdoc": "off",
  },
});

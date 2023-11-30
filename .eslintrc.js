// @ts-check
const { extendConfig } = require("@aet/eslint-rules");

module.exports = extendConfig({
  plugins: ["react", "unicorn", "jsdoc"],
  rules: {
    "jsdoc/require-returns": "off",
    "jsdoc/require-param": "off",
    "jsdoc/check-param-names": "off",
    "jsdoc/require-jsdoc": "off",
  },
});

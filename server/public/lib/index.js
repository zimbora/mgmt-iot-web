// super simple module for the most common nodejs use case.
const { marked } = require("marked");
exports.markdown = { toHTML: (text) => marked.parse(text) };
exports.parse = exports.markdown.toHTML;

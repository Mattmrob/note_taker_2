// template from UC Berkely Full Stack Development
// Generates a (mostly) random id
module.exports = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

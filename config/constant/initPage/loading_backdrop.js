const ID = "loadingBackdrop";
const targetSelector = `input, a, button, *[tabindex]:not(#${ID})`;
const blockClassName = "noClick";

module.exports = {
  ID,
  targetSelector,
  blockClassName,
};

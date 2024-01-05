const ID = "loadingBackdrop";
const targetSelector = `input, a, button, *[tabindex]:not(#${ID})`;
const blockClassName = "noClick";

export default {
  ID,
  targetSelector,
  blockClassName,
};

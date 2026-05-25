export function createElementWithStyles(
  tag: string,
  styles: Record<string, string>,
): HTMLElement {
  const el = document.createElement(tag);
  Object.assign(el.style, styles);
  return el;
}

export function removeElement(el: HTMLElement | null) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

export function removeAllListeners(el: HTMLElement) {
  const newEl = el.cloneNode(true);
  if (el.parentNode) {
    el.parentNode.replaceChild(newEl, el);
  }
  return newEl;
}

export function injectCSS(id: string, css: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

export function removeCSS(id: string) {
  const style = document.getElementById(id);
  if (style) removeElement(style as HTMLElement);
}

export default {
  createElementWithStyles,
  removeElement,
  removeAllListeners,
  injectCSS,
  removeCSS,
};

const ease = 'cubic-bezier(.22, 1, .36, 1)';
const selectors = '.identity-text, .identity-controls, .carousel, .biography, .globe-link, .project-identity, .project-controls, .project-close, .project-detail, .travel-view, .not-found';

export function pageElements(keepIdentity: boolean) {
  const elements = [...document.querySelectorAll<HTMLElement>(selectors)]
    .filter(element => !(keepIdentity && element.matches('.identity-text')));
  return elements.filter(element => {
    const box = element.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight &&
      !elements.some(parent => parent !== element && parent.contains(element));
  });
}

/** Animate real content, including viewport portals; no click-intercepting overlay. */
export function leavePage(elements: HTMLElement[], reduced: boolean) {
  if (reduced) return [];
  return elements.map(element => element.animate([
    { opacity: getComputedStyle(element).opacity },
    { opacity: 0 },
  ], { duration: 130, easing: 'ease-out', fill: 'forwards' }));
}

export function enterPage(elements: HTMLElement[], reduced: boolean) {
  if (reduced) return [];
  return elements.map(element => {
    // Keep navigation hit areas stationary throughout the transition.
    const controls = element.matches('.identity-controls, .project-controls, .project-close, .project-identity');
    return element.animate([
      { opacity: 0, translate: controls ? '0 0' : '0 10px' },
      { opacity: 1, translate: '0 0' },
    ], { duration: controls ? 280 : 520, easing: ease, fill: 'backwards' });
  });
}

export const settled = (animations: Animation[]) => Promise.allSettled(animations.map(animation => animation.finished));

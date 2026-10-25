const ease = 'cubic-bezier(.22, 1, .36, 1)';
const selectors = '.identity-text, .carousel, .biography, .project-identity, .project-detail, .not-found';

export function pageElements(keepIdentity: boolean, sharedCover = false, returning = false) {
  const selection = sharedCover ? (returning ? '.identity-text' : '.project-identity, .project-video-slide, .project-description, .project-stills') : selectors;
  const elements = [...document.querySelectorAll<HTMLElement>(selection)]
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

export function enterPage(elements: HTMLElement[], reduced: boolean, sharedCover = false) {
  if (reduced) return [];
  return elements.map(element => {
    // Keep navigation hit areas stationary throughout the transition.
    const controls = element.matches('.identity-controls, .project-identity');
    const player = sharedCover && element.matches('.project-video-slide');
    return element.animate([
      { opacity: 0, translate: controls || player ? '0 0' : '0 10px' },
      { opacity: 1, translate: '0 0' },
    ], { duration: player ? 240 : controls ? 280 : 520, delay: player ? 340 : 0, easing: ease, fill: 'backwards' });
  });
}

export const settled = (animations: Animation[]) => Promise.allSettled(animations.map(animation => animation.finished));

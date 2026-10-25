export type ProjectTransition = { play: (target: HTMLElement, reveal: () => void) => void; cancel: () => void };

/** Carry the already-loaded cover into the player without waiting on remote video. */
export function captureProjectCover(card: HTMLElement): ProjectTransition | null {
  const source = card.querySelector('img');
  const from = card.getBoundingClientRect();
  if (!source?.complete || !source.naturalWidth || from.width < 1 || from.height < 1 ||
    from.bottom <= 0 || from.top >= innerHeight) return null;

  const poster = document.createElement('img');
  const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
  poster.src = source.currentSrc || source.src;
  poster.alt = '';
  poster.setAttribute('aria-hidden', 'true');
  poster.draggable = false;
  poster.className = 'project-transition-poster';
  Object.assign(poster.style, {
    position: 'fixed', left: '0', top: '0', zIndex: '80', pointerEvents: 'none',
    width: `${from.width}px`, height: `${from.height}px`, objectFit: 'contain',
    transformOrigin: '0 0', transform: `translate(${from.left}px, ${from.top}px)`,
    borderRadius: `${radius}px`, background: '#111',
  });
  document.body.append(poster);

  let animation: Animation | undefined;
  let target: HTMLElement | undefined;
  let visibility = '';
  let reveal: (() => void) | undefined;
  let done = false;
  const interrupts = ['resize', 'wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'] as const;
  const cancel = () => {
    if (done) return;
    done = true;
    if (target) target.style.visibility = visibility;
    reveal?.();
    animation?.cancel();
    poster.remove();
    interrupts.forEach(event => window.removeEventListener(event, cancel));
  };
  return {
    cancel,
    play(destination, onReveal) {
      if (done) return;
      reveal = onReveal;
      const to = destination.getBoundingClientRect();
      if (to.width < 1 || to.height < 1) { cancel(); return; }
      target = destination;
      visibility = target.style.visibility;
      const scale = from.width / to.width;
      const targetRadius = parseFloat(getComputedStyle(target.closest('.project-video-slide') ?? target).borderTopLeftRadius) || 0;
      poster.style.width = `${to.width}px`;
      poster.style.height = `${to.height}px`;
      target.style.visibility = 'hidden';
      try {
        animation = poster.animate([
          { transform: `translate(${from.left}px, ${from.top}px) scale(${scale}, ${from.height / to.height})`, borderRadius: `${radius / scale}px` },
          { transform: `translate(${to.left}px, ${to.top}px) scale(1)`, borderRadius: `${targetRadius}px ${targetRadius}px 0 0` },
        ], { duration: 620, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
        animation.finished.then(cancel, cancel);
        interrupts.forEach(event => window.addEventListener(event, cancel, { passive: true }));
      } catch { cancel(); }
    },
  };
}

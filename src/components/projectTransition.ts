export type ProjectTransition = { returning: boolean; play: (target: HTMLElement, reveal: () => void) => void; cancel: () => void };

/** Carry the already-loaded cover into the player without waiting on remote video. */
export function captureProjectCover(card: HTMLElement, returning = false): ProjectTransition | null {
  const source = card.querySelector('img');
  const from = card.getBoundingClientRect();
  if (!source?.complete || !source.naturalWidth || from.width < 1 || from.height < 1 ||
    from.bottom <= 0 || from.top >= innerHeight) return null;

  const poster = document.createElement('div');
  const image = document.createElement('img');
  const radius = parseFloat(getComputedStyle(returning ? card.closest('.project-video-slide') ?? card : card).borderTopLeftRadius) || 0;
  image.src = source.currentSrc || source.src;
  image.alt = '';
  image.draggable = false;
  Object.assign(image.style, { width: '100%', height: '100%', objectFit: 'contain', display: 'block' });
  poster.append(image);
  poster.setAttribute('aria-hidden', 'true');
  poster.className = 'project-transition-poster';
  Object.assign(poster.style, {
    position: 'fixed', left: '0', top: '0', zIndex: '80', pointerEvents: 'none',
    width: `${from.width}px`, height: `${from.height}px`, overflow: 'hidden',
    transformOrigin: '0 0', transform: `translate(${from.left}px, ${from.top}px)`,
    borderRadius: returning ? `${radius}px ${radius}px 0 0` : `${radius}px`, background: '#111',
  });
  // Freeze the current video frame, then blend it into the gallery's chosen cover.
  // Drawing is local only: no pixel readback or export is needed for cross-origin video.
  let frame: HTMLCanvasElement | undefined;
  const video = returning ? card.querySelector('video') : null;
  if (video && video.readyState >= 2 && video.currentTime > 0 && video.videoWidth) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'contain', background: '#111' });
        poster.append(canvas); frame = canvas;
      }
    } catch { /* The loaded poster remains a safe fallback. */ }
  }
  video?.pause();
  document.body.append(poster);

  let animation: Animation | undefined;
  let frameAnimation: Animation | undefined;
  let target: HTMLElement | undefined;
  let visibility = '';
  let reveal: (() => void) | undefined;
  let done = false;
  const interrupts = ['resize', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
  let scrollPosition = 0;
  const onScroll = () => { if (window.scrollY !== scrollPosition) cancel(); };
  const cancel = () => {
    if (done) return;
    done = true;
    if (target) { target.removeAttribute('data-transition-target'); target.style.visibility = visibility; }
    reveal?.();
    animation?.cancel();
    frameAnimation?.cancel();
    poster.remove();
    interrupts.forEach(event => window.removeEventListener(event, cancel));
    window.removeEventListener('scroll', onScroll);
  };
  return {
    cancel, returning,
    play(destination, onReveal) {
      if (done) return;
      reveal = onReveal;
      const to = destination.getBoundingClientRect();
      if (to.width < 1 || to.height < 1) { cancel(); return; }
      target = destination;
      visibility = target.style.visibility;
      target.setAttribute('data-transition-target', '');
      const scale = from.width / to.width;
      const targetRadius = parseFloat(getComputedStyle(target.closest('.project-video-slide') ?? target).borderTopLeftRadius) || 0;
      poster.style.width = `${to.width}px`;
      poster.style.height = `${to.height}px`;
      target.style.visibility = 'hidden';
      try {
        animation = poster.animate([
          { transform: `translate(${from.left}px, ${from.top}px) scale(${scale}, ${from.height / to.height})`, borderRadius: returning ? `${radius / scale}px ${radius / scale}px 0 0` : `${radius / scale}px` },
          { transform: `translate(${to.left}px, ${to.top}px) scale(1)`, borderRadius: returning ? `${targetRadius}px` : `${targetRadius}px ${targetRadius}px 0 0` },
        ], { duration: 620, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
        frameAnimation = frame?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, delay: 330, easing: 'ease-in-out', fill: 'both' });
        frameAnimation?.finished.catch(() => {});
        animation.finished.then(cancel, cancel);
        interrupts.forEach(event => window.addEventListener(event, cancel, { passive: true }));
        scrollPosition = window.scrollY;
        window.addEventListener('scroll', onScroll, { passive: true });
      } catch { cancel(); }
    },
  };
}

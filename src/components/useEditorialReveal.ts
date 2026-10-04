import { useLayoutEffect, type RefObject } from 'react';

/** Reveal each editorial block once; the readable DOM is the default and fallback. */
export function useEditorialReveal(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const blocks = [...root.querySelectorAll<HTMLElement>('p, h2, li')];
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    function configure() {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        let delay = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          seen.add(entry.target);
          observer?.unobserve(entry.target);
          const animation = entry.target.animate([
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 650, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          delay += 55;
          animations.add(animation);
          animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
        }
      }, { threshold: .12 });
      blocks.forEach(block => { if (!seen.has(block)) observer!.observe(block); });
    }
    configure();
    reduced.addEventListener('change', configure);
    return () => {
      observer?.disconnect();
      reduced.removeEventListener('change', configure);
      animations.forEach(animation => animation.cancel());
    };
  }, [ref]);
}

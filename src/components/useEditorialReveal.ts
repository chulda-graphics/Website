import { useLayoutEffect, type RefObject } from 'react';

/** Reveal each editorial block once; the readable DOM is the default and fallback. */
export function useEditorialReveal(ref: RefObject<HTMLElement | null>, selector = 'p, h2, h3, li') {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const candidates = [...root.querySelectorAll<HTMLElement>(selector)];
    // A job entry moves as one block, not as both a list item and its children.
    const blocks = candidates.filter(block => !candidates.some(parent => parent !== block && parent.contains(block)));
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    function configure() {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting && !seen.has(entry.target))
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        for (const [index, entry] of visible.entries()) {
          seen.add(entry.target);
          observer?.unobserve(entry.target);
          const animation = entry.target.animate([
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 520, delay: Math.min(index * 45, 240), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
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
  }, [ref, selector]);
}

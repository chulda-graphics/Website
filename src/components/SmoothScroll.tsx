import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/** Fixed UI must live outside ScrollSmoother's transformed content. */
export function ViewportLayer({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

/** One scroll owner across routes; viewport-only scenes retain their own gestures. */
export function SmoothScroll({ route, children }: { route: string; children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let smoother: ScrollSmoother | undefined;
    let disposed = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const configure = () => {
      const position = smoother?.scrollTop() ?? window.scrollY;
      smoother?.kill();
      smoother = undefined;
      if (!reduced.matches) {
        smoother = ScrollSmoother.create({
          wrapper: wrapper.current!, content: content.current!,
          smooth: 1.1, smoothTouch: 0.12,
          effects: false, normalizeScroll: false,
          // Route headings and viewport controls already manage their position.
          // Re-centering them on pointer focus can move a button before pointerup.
          onFocusIn: (_self, event) => {
            const target = event.target as HTMLElement;
            if (target.closest('.control, .sound-toggle, .video-action, .video-progress, .video-volume, video') || target.tabIndex === -1) return false;
          },
        });
        smoother.scrollTop(position);
      } else window.scrollTo({ top: position, behavior: 'instant' });
      wrapper.current!.dataset.scrollMode = reduced.matches ? 'native' : 'smooth';
    };
    configure();
    reduced.addEventListener('change', configure);
    // Text metrics may settle after the first route render.
    document.fonts.ready.then(() => { if (!disposed) smoother?.refresh(); });
    return () => {
      disposed = true;
      reduced.removeEventListener('change', configure);
      smoother?.kill();
    };
  }, [route]);
  return <div id="smooth-wrapper" ref={wrapper}><div id="smooth-content" ref={content}>{children}</div></div>;
}

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/** Fixed UI must live outside ScrollSmoother's transformed content. */
export function ViewportLayer({ children, when = 'always' }: {
  children: ReactNode; when?: 'always' | 'mobile' | 'desktop';
}) {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 700px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width: 700px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const fixed = when === 'always' || (when === 'mobile' ? mobile : !mobile);
  return fixed ? createPortal(children, document.body) : children;
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

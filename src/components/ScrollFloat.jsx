// Adapted from the React Bits JavaScript + CSS source supplied by the owner.
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({
  children,
  as: Tag = 'h2',
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
}) {
  const containerRef = useRef(null);
  const text = typeof children === 'string' ? children : null;
  // Keep words together on narrow screens, while animating each character.
  const splitText = useMemo(() => text?.split(/(\s+)/).map((word, index) =>
    /^\s+$/.test(word) ? word : <span className="scroll-float-word" key={index}>
      {Array.from(word).map((char, charIndex) => <span className="char" key={charIndex}>{char}</span>)}
    </span>
  ), [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || text === null) return;
    let disposed = false;
    let animation;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const chars = el.querySelectorAll('.char');
      // Set every character before the staggered timeline starts (including offscreen text).
      gsap.set(chars, {
        opacity: 0, x: 0, y: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7,
        transformOrigin: '50% 0%',
      });
      animation = gsap.to(chars, {
        duration: animationDuration, ease,
        opacity: 1, x: 0, y: 0, yPercent: 0, scaleY: 1, scaleX: 1, stagger,
        scrollTrigger: {
          trigger: el,
          // Inherit ScrollSmoother's proxy by default; only override for a supplied container.
          ...(scrollContainerRef?.current ? { scroller: scrollContainerRef.current } : {}),
          start: scrollStart, end: scrollEnd, scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, el);
    document.fonts.ready.then(() => {
      if (!disposed) animation?.scrollTrigger?.refresh();
    });
    return () => { disposed = true; media.revert(); };
  }, [text, scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return <Tag ref={containerRef} className={`scroll-float ${containerClassName}`}>
    {text === null ? children : <>
      <span className="sr-only">{text}</span>
      <span className={`scroll-float-text ${textClassName}`} aria-hidden="true">{splitText}</span>
    </>}
  </Tag>;
}

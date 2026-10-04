import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { profile } from '../content';
import { Icon } from './Icon';
import SlideCommit from './SlideCommit';

const sessionKey = 'chulda:entered:v1';
export function hasEntered() {
  try { return sessionStorage.getItem(sessionKey) === 'yes'; }
  catch { return false; }
}
export function rememberEntry() {
  try { sessionStorage.setItem(sessionKey, 'yes'); }
  catch { /* Navigation still preserves the mounted app when storage is unavailable. */ }
}

export function EntryScreen({ onEnter }: { onEnter: () => void }) {
  const host = useRef<HTMLElement>(null);
  const ready = useRef<Promise<unknown>>(Promise.resolve());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [width, setWidth] = useState(Math.min(264, innerWidth - 48));
  const reduced = useReducedMotion();
  useEffect(() => {
    document.title = `${profile.name} — Welcome`;
    document.body.dataset.page = 'entry';
    const resize = () => setWidth(Math.min(264, innerWidth - 48));
    addEventListener('resize', resize);
    host.current?.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true });
    // Warm the 3D module and brand font while the visitor approaches the handle.
    ready.current = Promise.allSettled([import('./Model'), document.fonts.ready]);
    return () => { removeEventListener('resize', resize); timers.current.forEach(clearTimeout); };
  }, []);
  function finish() {
    timers.current.push(setTimeout(onEnter, reduced ? 0 : 220));
  }
  async function prepare() {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([ready.current, new Promise(resolve => { timeout = setTimeout(resolve, 4000); })]);
    } finally { clearTimeout(timeout); }
  }
  return <motion.main ref={host} className="entry-screen" aria-label="Welcome"
    initial={false} exit={{ opacity: 0 }} transition={{ duration: reduced ? .1 : .85, ease: [.22, 1, .36, 1] }}>
    <div className="entry-identity"><h1>{profile.name}</h1><p>{profile.title}</p></div>
    <div className="entry-action">
      <SlideCommit label="Slide to start" doneLabel="Welcome aboard" width={width} height={52} radius={26}
        trackColor="#292929" handleColor="#f6f6f6" successColor="#f6f6f6" holdMs={0}
        icon={<Icon name="plane" size={23} weight="fill"/>} onConfirm={prepare} onDone={finish}/>
    </div>
  </motion.main>;
}

import { useEffect, useRef, useState } from 'react';
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
  const [width, setWidth] = useState(Math.min(320, innerWidth - 48));
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    document.title = `${profile.name} — Welcome`;
    document.body.dataset.page = 'entry';
    const resize = () => setWidth(Math.min(320, innerWidth - 48));
    addEventListener('resize', resize);
    host.current?.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true });
    // Warm the 3D module and brand font while the visitor approaches the handle.
    ready.current = Promise.allSettled([import('./Model'), document.fonts.ready]);
    return () => { removeEventListener('resize', resize); timers.current.forEach(clearTimeout); };
  }, []);
  function finish() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    timers.current.push(setTimeout(() => setLeaving(true), reduced ? 0 : 550));
    timers.current.push(setTimeout(onEnter, reduced ? 50 : 950));
  }
  async function prepare() {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([ready.current, new Promise(resolve => { timeout = setTimeout(resolve, 4000); })]);
    } finally { clearTimeout(timeout); }
  }
  return <main ref={host} className={`entry-screen${leaving ? ' entry-screen--leaving' : ''}`} aria-label="Welcome">
    <div className="entry-identity"><h1>{profile.name}</h1><p>{profile.title}</p></div>
    <div className="entry-action">
      <SlideCommit label="Slide to start" doneLabel="Welcome aboard" width={width} height={64} radius={32}
        trackColor="#292929" handleColor="#f6f6f6" successColor="#f6f6f6" holdMs={0}
        icon={<Icon name="plane" size={26}/>} onConfirm={prepare} onDone={finish}/>
      <p className="entry-keyboard-hint">Drag right or press Enter</p>
    </div>
  </main>;
}

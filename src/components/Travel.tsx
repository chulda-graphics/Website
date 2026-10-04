import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { assets, projects } from '../content';
import { ProjectArtwork } from './ProjectArtwork';

const Model = lazy(() => import('./Model').then(module => ({ default: module.Model })));
const codes = ['BKK','TPE','DPS','GMP'];
const positions = [[-330, 60], [235,-90], [-100,-200], [160,140], [330,-40]];
const frames = Array.from({ length: 20 }, (_, index) => index);

export function Travel({ navigate }: { navigate: (route: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const aircraft = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState(0);
  useEffect(() => {
    const mount = host.current!;
    const pictures = [...mount.querySelectorAll<HTMLDivElement>('.flight-picture')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let progress = 0, destination = 0, previous = 0, frame = 0, pointerX = 0, pointerY = 0, lastPlace = 0;
    let dragging = false, lastY = 0;
    let width = mount.clientWidth;
    const resize = new ResizeObserver(() => { width = mount.clientWidth; }); resize.observe(mount);
    function wheel(event: WheelEvent) { if (event.ctrlKey) return; event.preventDefault(); destination += event.deltaY * (event.deltaMode === 1 ? 12 : 1) * 1.5; }
    function key(event: KeyboardEvent) { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); destination += event.key === 'ArrowDown' ? 400 : -400; } }
    function down(event: PointerEvent) { dragging = true; lastY = event.clientY; }
    function move(event: PointerEvent) {
      pointerX = (event.clientX / innerWidth - .5) * 2;
      pointerY = (event.clientY / innerHeight - .5) * 2;
      if (dragging) { destination += (lastY - event.clientY) * 3; lastY = event.clientY; }
    }
    function up() { dragging = false; }
    function draw(now: number) {
      const dt = Math.min((now - (previous || now)) / 1000, .04); previous = now;
      const speed = destination - progress;
      progress += reduced.matches ? speed : speed * (1 - Math.exp(-5 * dt));
      const nextPlace = ((Math.floor((progress + 700) / 2100) % codes.length) + codes.length) % codes.length;
      if (nextPlace !== lastPlace) { lastPlace = nextPlace; setPlace(nextPlace); }
      const factor = width < 700 ? .47 : width / 1440;
      for (let index = 0; index < pictures.length; index++) {
        const z = ((index * 420 - progress + 700) % 8400 + 8400) % 8400 - 700;
        const location = positions[index % positions.length];
        pictures[index].style.transform = `translate(-50%, -50%) translate3d(${(location[0] + pointerX * 22) * factor}px, ${(location[1] + pointerY * 10) * factor}px, ${-z}px)`;
        pictures[index].style.opacity = String(z > 2700 ? 0 : z > 1700 ? 1 - (z - 1700) / 1000 : z < -500 ? 1 - (-z - 500) / 200 : 1);
        pictures[index].style.visibility = z > 2700 || z < -695 ? 'hidden' : 'visible';
      }
      if (aircraft.current) aircraft.current.style.transform = `translate(${pointerX * 18}px, ${pointerY * 8}px) rotate(${Math.max(-12,Math.min(12,speed * .025)) + pointerX * 5}deg)`;
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
    mount.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('wheel',wheel); removeEventListener('keydown',key); mount.removeEventListener('pointerdown',down); removeEventListener('pointermove',move); removeEventListener('pointerup',up); };
  }, []);
  return <main className="travel-view" aria-label="Travel gallery">
    <div className="travel-scene" ref={host} aria-hidden="true">
      {frames.map(index => <div key={index} className="flight-picture"><ProjectArtwork project={projects[index % projects.length]} index={index}/></div>)}
    </div>
    <div className="aircraft" ref={aircraft}><Suspense fallback={null}><Model src={assets.aircraft} kind="aircraft"/></Suspense></div>
    <button className="travel-return" aria-label="Return to the about page" onClick={() => navigate('/about')}>
      <span className="departure-code" aria-hidden="true">{[...codes[place]].map((letter,index) => <i key={index}><span key={`${place}-${letter}`}>{letter}</span></i>)}</span>
      <span>Click to return</span>
    </button>
    <span className="travel-drag-hint">Scroll or drag to explore</span>
    <span className="sr-only" aria-live="polite">{codes[place]} gallery</span>
  </main>;
}

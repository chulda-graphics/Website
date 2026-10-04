import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { assets, projects } from '../content';
import { ProjectArtwork } from './ProjectArtwork';
import { accelerateFlight, advanceFlight, createFlight } from './flight';

const Model = lazy(() => import('./Model').then(module => ({ default: module.Model })));
const codes = ['BKK','TPE','DPS','GMP'];
const positions = [[-330, 60], [235,-90], [-100,-200], [160,140], [330,-40]];
const frames = Array.from({ length: 20 }, (_, index) => index);

export function Travel({ navigate }: { navigate: (route: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const aircraft = useRef<HTMLDivElement>(null);
  const flight = useRef(createFlight());
  const [place, setPlace] = useState(0);
  useEffect(() => {
    const mount = host.current!;
    const pictures = [...mount.querySelectorAll<HTMLDivElement>('.flight-picture')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = flight.current = createFlight();
    let previous = 0, frame = 0, pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, lastPlace = 0, elapsed = 0;
    let dragging = false, lastY = 0;
    let width = mount.clientWidth;
    const resize = new ResizeObserver(() => { width = mount.clientWidth; }); resize.observe(mount);
    function wheel(event: WheelEvent) { if (event.ctrlKey) return; event.preventDefault(); accelerateFlight(motion, event.deltaY * (event.deltaMode === 1 ? 12 : event.deltaMode === 2 ? innerHeight : 1), reduced.matches); }
    function key(event: KeyboardEvent) { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); accelerateFlight(motion, 400, reduced.matches); } }
    function down(event: PointerEvent) { dragging = true; lastY = event.clientY; }
    function move(event: PointerEvent) {
      pointerX = (event.clientX / innerWidth - .5) * 2;
      pointerY = (event.clientY / innerHeight - .5) * 2;
      if (dragging) { accelerateFlight(motion, (lastY - event.clientY) * 2, reduced.matches); lastY = event.clientY; }
    }
    function up() { dragging = false; }
    function draw(now: number) {
      const dt = Math.min((now - (previous || now)) / 1000, .04); previous = now;
      if (document.hidden) { frame = requestAnimationFrame(draw); return; }
      advanceFlight(motion, dt, reduced.matches);
      const progress = motion.distance;
      elapsed += reduced.matches ? 0 : dt;
      const ease = reduced.matches ? 1 : 1 - Math.exp(-4 * dt);
      smoothX += (pointerX - smoothX) * ease;
      smoothY += (pointerY - smoothY) * ease;
      motion.bank = reduced.matches ? 0 : -smoothX * .12 - (pointerX - smoothX) * .2 + Math.sin(elapsed * .8) * .025;
      motion.pitch = reduced.matches ? 0 : smoothY * .05 + Math.min(1, (motion.speed - 95) / 1000) * .035;
      mount.dataset.flightDistance = progress.toFixed(2);
      mount.dataset.flightSpeed = motion.speed.toFixed(2);
      const nextPlace = ((Math.floor((progress + 700) / 2100) % codes.length) + codes.length) % codes.length;
      if (nextPlace !== lastPlace) { lastPlace = nextPlace; setPlace(nextPlace); }
      const factor = width < 700 ? .47 : width / 1440;
      for (let index = 0; index < pictures.length; index++) {
        const z = ((index * 420 - progress + 700) % 8400 + 8400) % 8400 - 700;
        const location = positions[index % positions.length];
        pictures[index].style.transform = `translate(-50%, -50%) translate3d(${(location[0] + smoothX * 22) * factor}px, ${(location[1] + smoothY * 10) * factor}px, ${-z * factor}px)`;
        pictures[index].style.opacity = String(z > 2700 ? 0 : z > 1700 ? 1 - (z - 1700) / 1000 : z < -500 ? 1 - (-z - 500) / 200 : 1);
        pictures[index].style.visibility = z > 2700 || z < -695 ? 'hidden' : 'visible';
      }
      if (aircraft.current) aircraft.current.style.transform = `translate(${(smoothX * 95 + Math.sin(elapsed * .65) * 3) * factor}px, ${(smoothY * 32 + Math.sin(elapsed * 1.1) * 2) * factor}px)`;
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
    <div className="aircraft" ref={aircraft}><Suspense fallback={null}><Model src={assets.aircraft} kind="aircraft" flight={flight}/></Suspense></div>
    <button className="travel-return" aria-label="Return to the about page" onClick={() => navigate('/about')}>
      <span className="departure-code" aria-hidden="true">{[...codes[place]].map((letter,index) => <i key={index}><span key={`${place}-${letter}`}>{letter}</span></i>)}</span>
      <span>Click to return</span>
    </button>
    <span className="travel-drag-hint">Scroll or drag to explore</span>
    <span className="sr-only" aria-live="polite">{codes[place]} gallery</span>
  </main>;
}

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { travelPhotos } from '../travelPhotos';
import { accelerateFlight, advanceFlight, createFlight } from './flight';

const positions = [[-330,100], [260,0], [-30,-150], [-175,-155], [150,-220], [400,100], [-420,-100]];
const spacing = 560;
const wrap = (value: number, total: number) => (value % total + total) % total;

export function Travel({ navigate }: { navigate: (route: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, moved: false });
  const flight = useRef(createFlight());
  const [place, setPlace] = useState(0);
  useEffect(() => {
    const mount = host.current!;
    const interaction = mount.parentElement!;
    const pictures = [...mount.querySelectorAll<HTMLDivElement>('.flight-picture')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = flight.current = createFlight();
    let previous = 0, frame = 0, pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, lastPlace = 0;
    let dragging = false, lastY = 0;
    let width = mount.clientWidth;
    const measure = () => { width = mount.clientWidth; };
    const resize = new ResizeObserver(measure); resize.observe(mount); measure();
    function wheel(event: WheelEvent) { if (event.ctrlKey) return; event.preventDefault(); accelerateFlight(motion, event.deltaY * (event.deltaMode === 1 ? 12 : event.deltaMode === 2 ? innerHeight : 1), reduced.matches); }
    function key(event: KeyboardEvent) { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); accelerateFlight(motion, 400, reduced.matches); } }
    function down(event: PointerEvent) { if (event.button !== 0) return; dragging = true; lastY = event.clientY; }
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
      const ease = reduced.matches ? 1 : 1 - Math.exp(-4 * dt);
      smoothX += (pointerX - smoothX) * ease;
      smoothY += (pointerY - smoothY) * ease;
      mount.dataset.flightDistance = progress.toFixed(2);
      mount.dataset.flightSpeed = motion.speed.toFixed(2);
      const nextPlace = wrap(Math.floor((progress + spacing / 2) / spacing), travelPhotos.length);
      if (nextPlace !== lastPlace) { lastPlace = nextPlace; setPlace(nextPlace); }
      const factor = width < 700 ? .47 : width / 1440;
      for (let index = 0; index < pictures.length; index++) {
        const z = wrap(index * spacing - progress + 510, travelPhotos.length * spacing) - 510;
        const location = positions[index % positions.length];
        pictures[index].style.transform = `translate(-50%, -50%) translate3d(${(location[0] + smoothX * 22) * factor}px, ${(location[1] + smoothY * 10) * factor}px, ${-z * factor}px)`;
        pictures[index].style.opacity = String(Math.max(0, z > 1800 ? 1 - (z - 1800) / 1100 : z < -80 ? 1 - (-z - 80) / 430 : 1));
        pictures[index].style.visibility = z > 2900 || z < -505 ? 'hidden' : 'visible';
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
    interaction.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('wheel',wheel); removeEventListener('keydown',key); interaction.removeEventListener('pointerdown',down); removeEventListener('pointermove',move); removeEventListener('pointerup',up); removeEventListener('pointercancel',up); };
  }, []);
  return <main className="travel-view" aria-label="Travel gallery"
    onPointerDown={event => { gesture.current = { x: event.clientX, y: event.clientY, moved: false }; }}
    onPointerMove={event => { if (Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8) gesture.current.moved = true; }}
    onPointerCancel={() => { gesture.current.moved = true; }}
    onClick={event => { if (gesture.current.moved && event.detail !== 0) { event.preventDefault(); return; } navigate('/about'); }}>
    <h1 className="sr-only">Travel gallery</h1>
    <div className="travel-scene" ref={host} aria-hidden="true">
      {travelPhotos.map((photo, index) => <div key={photo.src} className="flight-picture" style={{ '--photo-width': photo.width > photo.height ? 340 : 225, aspectRatio: `${photo.width} / ${photo.height}` } as CSSProperties}>
        <img src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async" draggable={false} fetchPriority={index < 5 ? 'high' : 'low'}/>
      </div>)}
    </div>
    <button className="travel-return" aria-label="Click anywhere to return to the about page">
      <span>Click anywhere to return</span>
    </button>
    <span className="sr-only" aria-live="polite">{travelPhotos[place].city} gallery</span>
  </main>;
}

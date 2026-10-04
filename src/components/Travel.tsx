import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { workFrames } from '../workFrames';
import { createPlacement, flightDepth, shuffleFrames } from './flightLayout';
import { createFrameLoop } from './frameLoop';
import { accelerateFlight, advanceFlight, createFlight } from './flight';

const spacing = 560;

export function Travel({ navigate }: { navigate: (route: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, moved: false });
  const flight = useRef(createFlight());
  const [photos] = useState(() => shuffleFrames(workFrames));
  useEffect(() => {
    const mount = host.current!;
    const interaction = mount.parentElement!;
    const pictures = [...mount.querySelectorAll<HTMLDivElement>('.flight-picture')];
    const placements = photos.map((_, index) => ({ ...createPlacement(index), depth: index * spacing + (Math.random() - .5) * 180, cycle: null as number | null }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = flight.current = createFlight();
    let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
    let pointerId: number | null = null;
    let lastY = 0;
    let width = mount.clientWidth;
    const measure = () => { width = mount.clientWidth; loop.invalidate(); };
    function wheel(event: WheelEvent) { if (event.ctrlKey) return; event.preventDefault(); accelerateFlight(motion, event.deltaY * (event.deltaMode === 1 ? 12 : event.deltaMode === 2 ? innerHeight : 1), reduced.matches); loop.invalidate(); }
    function key(event: KeyboardEvent) { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); accelerateFlight(motion, 400, reduced.matches); loop.invalidate(); } }
    function down(event: PointerEvent) { if (event.button !== 0 || !event.isPrimary || pointerId !== null) return; pointerId = event.pointerId; lastY = event.clientY; }
    function move(event: PointerEvent) {
      if (!event.isPrimary) return;
      if (!reduced.matches) {
        pointerX = (event.clientX / innerWidth - .5) * 2;
        pointerY = (event.clientY / innerHeight - .5) * 2;
      }
      if (pointerId === event.pointerId) { accelerateFlight(motion, (lastY - event.clientY) * 2, reduced.matches); lastY = event.clientY; loop.invalidate(); }
    }
    function up(event: PointerEvent) { if (pointerId === event.pointerId) pointerId = null; }
    function cancel() { pointerId = null; gesture.current.moved = true; }
    function draw(dt: number) {
      advanceFlight(motion, dt, reduced.matches);
      const progress = motion.distance;
      const ease = reduced.matches ? 1 : 1 - Math.exp(-4 * dt);
      smoothX += (pointerX - smoothX) * ease;
      smoothY += (pointerY - smoothY) * ease;
      mount.dataset.flightDistance = progress.toFixed(2);
      mount.dataset.flightSpeed = motion.speed.toFixed(2);
      const factor = width < 700 ? .47 : width / 1440;
      for (let index = 0; index < pictures.length; index++) {
        const placement = placements[index];
        const { z, cycle } = flightDepth(placement.depth, progress, photos.length * spacing);
        if (placement.cycle !== cycle) {
          // Reposition only after the frame has passed the viewer and wrapped offscreen.
          // Keeping a placement for the whole pass avoids jitter during flight.
          if (placement.cycle !== null) Object.assign(placement, createPlacement(Math.floor(Math.random() * 4)));
          placement.cycle = cycle;
          pictures[index].style.setProperty('--photo-width', String(placement.width));
          pictures[index].dataset.cycle = String(cycle);
        }
        pictures[index].style.transform = `translate(-50%, -50%) translate3d(${(placement.x + smoothX * 22) * factor}px, ${(placement.y + smoothY * 10) * factor}px, ${-z * factor}px)`;
        pictures[index].style.opacity = String(Math.max(0, z > 1800 ? 1 - (z - 1800) / 1100 : z < -80 ? 1 - (-z - 80) / 430 : 1));
        pictures[index].style.visibility = z > 2900 || z < -505 ? 'hidden' : 'visible';
      }
      return !reduced.matches;
    }
    const loop = createFrameLoop(draw);
    const resize = new ResizeObserver(measure); resize.observe(mount); measure();
    function visibility() { if (document.hidden) cancel(); loop.setActive(!document.hidden); }
    function preference() { pointerX = pointerY = smoothX = smoothY = 0; loop.invalidate(); }
    visibility();
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);
    addEventListener('blur', cancel);
    addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
    interaction.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    return () => { loop.destroy(); resize.disconnect(); document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', preference); removeEventListener('blur', cancel); removeEventListener('wheel',wheel); removeEventListener('keydown',key); interaction.removeEventListener('pointerdown',down); removeEventListener('pointermove',move); removeEventListener('pointerup',up); removeEventListener('pointercancel',up); };
  }, [photos]);
  return <main className="travel-view" aria-label="My world"
    onPointerDown={event => { gesture.current = { x: event.clientX, y: event.clientY, moved: false }; }}
    onPointerMove={event => { if (Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8) gesture.current.moved = true; }}
    onPointerCancel={() => { gesture.current.moved = true; }}
    onClick={event => { if (gesture.current.moved && event.detail !== 0) { event.preventDefault(); return; } navigate('/about'); }}>
    <h1 className="sr-only">My world</h1>
    <div className="travel-scene" ref={host} aria-hidden="true">
      {photos.map((photo, index) => <div key={photo.src} className="flight-picture" style={{ '--photo-width': photo.width > photo.height ? 340 : 225, aspectRatio: `${photo.width} / ${photo.height}` } as CSSProperties}>
        <img src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async" draggable={false} fetchPriority={index < 5 ? 'high' : 'low'} onLoad={event => event.currentTarget.classList.add('is-loaded')}/>
      </div>)}
    </div>
    <button className="travel-return" aria-label="Click anywhere to return to the about page">
      <span>Click anywhere to return</span>
    </button>
    <p className="sr-only">A flying gallery of screenshots from my video and design work.</p>
  </main>;
}

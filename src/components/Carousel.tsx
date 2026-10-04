import { useEffect, useRef } from 'react';
import { projects } from '../content';
import { ProjectArtwork } from './ProjectArtwork';

const count = projects.length;
const copies = Array.from({ length: count * 3 }, (_, index) => index);
const wrap = (value: number) => ((value % count) + count) % count;

export function Carousel({ navigate, selected, setSelected }: { navigate: (path: string) => void; selected: number; setSelected: (index: number) => void }) {
  const host = useRef<HTMLElement>(null);
  const controls = useRef<{ select: (index: number) => void }>({ select: () => {} });
  useEffect(() => {
    const container = host.current!;
    const cards = [...container.querySelectorAll<HTMLAnchorElement>('.stack-card')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let position = count + selected;
    let target = position;
    let velocity = 0;
    let lastTime = 0;
    let frame = 0;
    let cardWidth = cards[0].offsetWidth;
    let wheelTotal = 0;
    let lastWheel = 0;
    let lastStep = -1000;
    let pointerX = 0;
    let dragging = false;
    let pointerId: number | null = null;
    let dragged = false;
    let startTarget = target;
    let selectedIndex = selected;
    function paint() {
      for (let i = 0; i < cards.length; i++) {
        const distance = ((i - position + count * 4.5) % (count * 3)) - count * 1.5;
        const amount = Math.abs(distance);
        const visible = amount < 1;
        const x = distance * cardWidth * .6;
        const scale = 1 - Math.min(amount, 1) * .04;
        cards[i].style.visibility = visible ? 'visible' : 'hidden';
        cards[i].style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
        cards[i].style.zIndex = String(10 - Math.round(amount));
        cards[i].style.opacity = String(Math.max(0, 1 - amount));
        const active = i === wrap(selectedIndex) + count;
        // Only the selected project is visible at rest; neighbours enter during movement.
        cards[i].tabIndex = active ? 0 : -1;
        cards[i].setAttribute('aria-hidden', String(!active));
        cards[i].style.pointerEvents = active && amount < .5 ? 'auto' : 'none';
        cards[i].style.viewTransitionName = active ? 'project-media' : 'none';
      }
    }
    function tick(time: number) {
      const dt = Math.min((time - (lastTime || time)) / 1000, .032);
      lastTime = time;
      if (reduce.matches) { position = target; velocity = 0; }
      else {
        velocity += ((target - position) * 155 - velocity * 25) * dt;
        position += velocity * dt;
      }
      paint();
      if (Math.abs(position - target) > .0001 || Math.abs(velocity) > .001) frame = requestAnimationFrame(tick);
      else { position = target; paint(); frame = 0; }
    }
    function animate() { if (!frame) { lastTime = 0; frame = requestAnimationFrame(tick); } }
    function select(index: number, direction?: number) {
      const focusCard = document.activeElement?.classList.contains('stack-card');
      selectedIndex = wrap(index);
      let delta = selectedIndex - wrap(Math.round(target));
      if (direction) delta = direction;
      else if (Math.abs(delta) > count / 2) delta -= Math.sign(delta) * count;
      target += delta;
      // Rebase all copies together without changing their apparent positions.
      if (target < count || target >= count * 2) {
        const shift = target < count ? count : -count;
        target += shift; position += shift;
      }
      setSelected(selectedIndex); paint();
      if (focusCard) cards[selectedIndex + count].focus({ preventScroll: true });
      animate();
    }
    controls.current.select = index => select(index);
    function step(direction: number) { select(selectedIndex + direction, direction); }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 140) wheelTotal = 0;
      lastWheel = now;
      wheelTotal += (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : 1);
      if (Math.abs(wheelTotal) > 35 && now - lastStep > 600) { step(Math.sign(wheelTotal)); wheelTotal = 0; lastStep = now; }
    }
    function key(event: KeyboardEvent) {
      if (event.repeat || !['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','PageDown','PageUp'].includes(event.key)) return;
      event.preventDefault(); step(['ArrowDown','ArrowRight','PageDown'].includes(event.key) ? 1 : -1);
    }
    function down(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary || dragging || (event.target as Element).closest('.pagination')) return;
      pointerId = event.pointerId;
      pointerX = event.clientX; startTarget = target; dragging = true; dragged = false;
    }
    function move(event: PointerEvent) {
      if (!dragging || event.pointerId !== pointerId) return;
      const dy = pointerX - event.clientX;
      if (Math.abs(dy) > 7) {
        dragged = true;
        if (!container.hasPointerCapture(event.pointerId)) container.setPointerCapture(event.pointerId);
      }
      target = startTarget + dy / (cardWidth + 28); animate();
    }
    function release() {
      if (pointerId !== null && container.hasPointerCapture(pointerId)) container.releasePointerCapture(pointerId);
      pointerId = null; dragging = false;
    }
    function cancel() {
      if (!dragging) return;
      release(); dragged = false; target = startTarget; animate();
    }
    function up(event: PointerEvent) {
      if (!dragging || event.pointerId !== pointerId) return;
      release();
      const direction = Math.sign(target - startTarget);
      target = startTarget;
      if (dragged && direction) step(direction); else animate();
    }
    function preventDragClick(event: MouseEvent) { if (dragged) { event.preventDefault(); event.stopPropagation(); dragged = false; } }
    const resize = new ResizeObserver(() => { cardWidth = cards[0].offsetWidth; paint(); });
    resize.observe(container); paint();
    addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
    container.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel); addEventListener('blur', cancel);
    container.addEventListener('click', preventDragClick, true);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect();
      removeEventListener('wheel', wheel); removeEventListener('keydown', key);
      container.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel); removeEventListener('blur', cancel);
      container.removeEventListener('click', preventDragClick, true);
    };
  }, []);
  return <main className="carousel carousel-depth" aria-label="Selected projects" ref={host}>
    {copies.map(index => {
      const project = projects[index % count];
      return <a key={index} className="stack-card" href={`/project/${project.slug}`} aria-label={`Open ${project.title}`} onDragStart={event => event.preventDefault()} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); if (index % count !== selected) controls.current.select(index % count); else navigate(`/project/${project.slug}`); }}>
        <ProjectArtwork project={project} index={index % count}/>
      </a>;
    })}
    <div className="pagination" aria-label="Select project">{projects.map((project,index) => <button key={project.slug} className={index === selected ? 'selected' : ''} aria-label={`Show ${project.title}`} aria-current={index === selected ? 'true' : undefined} onClick={() => controls.current.select(index)}><span/></button>)}</div>
    <span className="sr-only" aria-live="polite">{projects[selected].title}, {selected + 1} of {count}</span>
  </main>;
}

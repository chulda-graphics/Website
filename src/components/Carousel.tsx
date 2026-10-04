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
    const shades = [...container.querySelectorAll<HTMLDivElement>('.stack-shade')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let position = count + selected;
    let target = position;
    let velocity = 0;
    let lastTime = 0;
    let frame = 0;
    let height = container.clientHeight;
    let unit = container.clientWidth <= 700 ? 1 : container.clientWidth / 1440;
    let wheelTotal = 0;
    let lastWheel = 0;
    let lastStep = -1000;
    let pointerY = 0;
    let dragging = false;
    let pointerId: number | null = null;
    let dragged = false;
    let startTarget = target;
    let selectedIndex = selected;
    function paint() {
      for (let i = 0; i < cards.length; i++) {
        let distance = ((i - position + 18) % 12) - 6;
        const amount = Math.abs(distance);
        const near = Math.min(amount, 1);
        const y = Math.sign(distance) * (near * height * .4 + Math.max(0, amount - 1) * 35 * unit);
        const rotation = Math.sign(distance) * near * 98;
        const scale = 1 - .2 * near;
        const visible = amount < 3.6;
        cards[i].style.visibility = visible ? 'visible' : 'hidden';
        cards[i].style.transform = `translate(-50%, -50%) translateY(${y}px) scale(${scale}) rotateX(${rotation}deg)`;
        cards[i].style.zIndex = String(10 - Math.round(amount));
        cards[i].style.opacity = String(amount > 3 ? 1 - (amount - 3) / .6 : 1);
        shades[i].style.opacity = String(Math.min(1, Math.max(0, (amount - .12) / .7)));
        const active = i === wrap(selectedIndex) + count;
        // Repeated copies render only the surrounding stack; one copy is interactive.
        cards[i].tabIndex = active ? 0 : -1;
        cards[i].setAttribute('aria-hidden', String(!active));
        cards[i].style.pointerEvents = active ? 'auto' : 'none';
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
      wheelTotal += event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if (Math.abs(wheelTotal) > 35 && now - lastStep > 600) { step(Math.sign(wheelTotal)); wheelTotal = 0; lastStep = now; }
    }
    function key(event: KeyboardEvent) {
      if (event.repeat || !['ArrowDown','ArrowUp','PageDown','PageUp'].includes(event.key)) return;
      event.preventDefault(); step(['ArrowDown','PageDown'].includes(event.key) ? 1 : -1);
    }
    function down(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary || dragging || (event.target as Element).closest('.pagination')) return;
      pointerId = event.pointerId;
      pointerY = event.clientY; startTarget = target; dragging = true; dragged = false;
    }
    function move(event: PointerEvent) {
      if (!dragging || event.pointerId !== pointerId) return;
      const dy = pointerY - event.clientY;
      if (Math.abs(dy) > 7) {
        dragged = true;
        if (!container.hasPointerCapture(event.pointerId)) container.setPointerCapture(event.pointerId);
      }
      target = startTarget + dy / (height * .45); animate();
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
    const resize = new ResizeObserver(() => { height = container.clientHeight; unit = container.clientWidth <= 700 ? 1 : container.clientWidth / 1440; paint(); });
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
    <div className="stack-edge stack-edge-top"/><div className="stack-edge stack-edge-bottom"/>
    {copies.map(index => {
      const project = projects[index % count];
      return <a key={index} className="stack-card" href={`/project/${project.slug}`} aria-label={`Open ${project.title}`} onDragStart={event => event.preventDefault()} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); navigate(`/project/${project.slug}`); }}>
        <ProjectArtwork project={project} index={index % count}/><div className="stack-shade"/>
      </a>;
    })}
    <div className="pagination" aria-label="Select project">{projects.map((project,index) => <button key={project.slug} className={index === selected ? 'selected' : ''} aria-label={`Show ${project.title}`} aria-current={index === selected ? 'true' : undefined} onClick={() => controls.current.select(index)}><span/></button>)}</div>
    <span className="sr-only" aria-live="polite">{projects[selected].title}, {selected + 1} of {count}</span>
  </main>;
}

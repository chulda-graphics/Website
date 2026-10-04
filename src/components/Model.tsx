import { useEffect, useRef, useState, type RefObject } from 'react';
import type { FlightState } from './flight';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { addTerrainRelief } from './terrain';

export function Model({ src, kind = 'globe', flight }: { src: string; kind?: 'globe' | 'cursor'; flight?: RefObject<FlightState> }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const mount = host.current;
    setFailed(false);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.opacity = '0';
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, kind === 'cursor' ? 1.3 : 0, kind === 'globe' ? 6.6 : 4.4);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-3, 4, 5); scene.add(key);
    let model: THREE.Group | undefined;
    const cursorFrame = new THREE.Group(); scene.add(cursorFrame);
    let pointer = 0;
    let disposed = false;
    let frame = 0, previous = performance.now(), inView = true, dirty = true, contextLost = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function schedule() {
      if (!disposed && !frame && inView && !document.hidden && !contextLost) frame = requestAnimationFrame(draw);
    }
    function invalidate() { dirty = true; schedule(); }
    function suspend() { cancelAnimationFrame(frame); frame = 0; previous = performance.now(); }
    function visibility() { if (document.hidden) suspend(); else invalidate(); }
    function motionPreference() { previous = performance.now(); invalidate(); }
    function loseContext(event: Event) { event.preventDefault(); contextLost = true; suspend(); setFailed(true); }
    function restoreContext() { contextLost = false; setFailed(false); invalidate(); }
    function disposeObject(object: THREE.Object3D) {
      object.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => material.dispose());
        }
      });
    }
    const draco = new DRACOLoader().setDecoderPath('/assets/draco/').setDecoderConfig({ type: 'wasm' });
    const loader = new GLTFLoader().setDRACOLoader(draco);
    loader.load(src, gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      model = gltf.scene;
      if (kind === 'globe') model.traverse(child => {
        if (child instanceof THREE.Mesh && child.name.includes('ContinentalRelief') && child.material instanceof THREE.MeshStandardMaterial) {
          child.material = child.material.clone();
          addTerrainRelief(child.material);
        }
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const group = new THREE.Group(); group.add(model);
      group.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
      cursorFrame.add(group);
      if (kind === 'cursor') {
        group.rotation.x = -Math.PI / 2;
        cursorFrame.rotation.y = -.12;
      }
      invalidate();
    }, undefined, () => { if (!disposed) setFailed(true); });
    const move = (event: PointerEvent) => {
      const box = mount.getBoundingClientRect();
      pointer = ((event.clientX - box.left) / box.width - .5) * 2;
    };
    const leave = () => { pointer = 0; };
    mount.addEventListener('pointermove', move);
    mount.addEventListener('pointerleave', leave);
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); invalidate();
    };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    const intersection = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) { previous = performance.now(); invalidate(); } else suspend();
    });
    intersection.observe(mount);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', motionPreference);
    renderer.domElement.addEventListener('webglcontextlost', loseContext);
    renderer.domElement.addEventListener('webglcontextrestored', restoreContext);
    function draw(now: number) {
      frame = 0;
      if (disposed || !inView || document.hidden || contextLost) return;
      const moving = !!model && !reduced.matches;
      if (moving && model) {
        const delta = Math.min((now - previous) / 1000, .05);
        if (kind === 'globe') {
          model.rotation.y += delta * (.045 + pointer * .15);
        } else {
          const state = flight?.current;
          cursorFrame.rotation.z = state?.bank ?? Math.sin(now / 1600) * .04;
          cursorFrame.rotation.x = state?.pitch ?? 0;
        }
      }
      previous = now;
      if (dirty || moving) {
        renderer.render(scene, camera);
        if (model) renderer.domElement.style.opacity = '1';
        dirty = false;
      }
      if (moving) schedule();
    }
    invalidate();
    return () => {
      disposed = true; suspend(); observer.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', motionPreference);
      renderer.domElement.removeEventListener('webglcontextlost', loseContext);
      renderer.domElement.removeEventListener('webglcontextrestored', restoreContext);
      if (model) disposeObject(model);
      mount.removeEventListener('pointermove', move); mount.removeEventListener('pointerleave', leave);
      draco.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [src, kind, flight]);
  return <div className={`model model-${kind}`} ref={host} aria-hidden="true">{failed && <span className="model-fallback">{kind === 'globe' ? 'Explore' : 'Travel'}</span>}</div>;
}

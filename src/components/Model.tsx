import { useEffect, useRef, useState, type RefObject } from 'react';
import type { FlightState } from './flight';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { addTerrainRelief } from './terrain';

export function Model({ src, kind = 'globe', flight }: { src: string; kind?: 'globe' | 'aircraft'; flight?: RefObject<FlightState> }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const mount = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, kind === 'aircraft' ? 1.3 : 0, kind === 'globe' ? 6.6 : 4.4);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-3, 4, 5); scene.add(key);
    let model: THREE.Group | undefined;
    const airframe = new THREE.Group(); scene.add(airframe);
    let orbitAircraft: THREE.Group | undefined;
    let orbitAngle = 0;
    let pointer = 0;
    let disposed = false;
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
      airframe.add(group);
    }, undefined, () => { if (!disposed) setFailed(true); });
    if (kind === 'globe') new GLTFLoader().load('/assets/models/aircraft.glb', gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      orbitAircraft = gltf.scene;
      orbitAircraft.scale.setScalar(.055);
      scene.add(orbitAircraft);
    });
    const move = (event: PointerEvent) => {
      const box = mount.getBoundingClientRect();
      pointer = ((event.clientX - box.left) / box.width - .5) * 2;
    };
    const leave = () => { pointer = 0; };
    mount.addEventListener('pointermove', move);
    mount.addEventListener('pointerleave', leave);
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0; let previous = performance.now();
    const draw = (now: number) => {
      if (model && !reduced.matches && !document.hidden) {
        const delta = Math.min((now - previous) / 1000, .05);
        if (kind === 'globe') {
          model.rotation.y += delta * (.045 + pointer * .15);
          orbitAngle += delta * .55;
          if (orbitAircraft) {
            orbitAircraft.position.set(Math.sin(orbitAngle) * 1.2, Math.cos(orbitAngle) * .13, Math.cos(orbitAngle) * 1.2);
            orbitAircraft.rotation.set(.2, Math.PI * 1.5 + orbitAngle, -.15);
          }
        }
        else {
          const state = flight?.current;
          airframe.rotation.z = state?.bank ?? Math.sin(now / 1600) * .04;
          airframe.rotation.x = state?.pitch ?? 0;

        }
      }
      previous = now; renderer.render(scene, camera); frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      if (model) disposeObject(model);
      if (orbitAircraft) disposeObject(orbitAircraft);
      mount.removeEventListener('pointermove', move); mount.removeEventListener('pointerleave', leave);
      draco.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [src, kind, flight]);
  return <div className={`model model-${kind}`} ref={host} aria-hidden="true">{failed && <span className="model-fallback">{kind === 'globe' ? 'Explore' : 'Travel'}</span>}</div>;
}

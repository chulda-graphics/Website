import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function Model({ src, kind = 'globe' }: { src: string; kind?: 'globe' | 'aircraft' }) {
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
    camera.position.set(0, kind === 'aircraft' ? 1.3 : 0, 5.2);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(-3, 4, 5); scene.add(key);
    let model: THREE.Group | undefined;
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
    new GLTFLoader().load(src, gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const group = new THREE.Group(); group.add(model);
      group.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
      scene.add(group);
    }, undefined, () => { if (!disposed) setFailed(true); });
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
        if (kind === 'globe') model.rotation.y += delta * .08;
        else model.rotation.z = Math.sin(now / 1600) * .04;
      }
      previous = now; renderer.render(scene, camera); frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      if (model) disposeObject(model);
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [src, kind]);
  return <div className={`model model-${kind}`} ref={host} aria-hidden="true">{failed && <span className="model-fallback">{kind === 'globe' ? 'Explore' : 'Travel'}</span>}</div>;
}

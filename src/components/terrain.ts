import type { MeshStandardMaterial } from 'three';

/** Fine, world-anchored relief on the locally modeled land; oceans stay smooth. */
export function addTerrainRelief(material: MeshStandardMaterial) {
  material.roughness = .95;
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vTerrainPosition;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrainPosition = position;');
    shader.fragmentShader = `
      varying vec3 vTerrainPosition;
      float terrainHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float terrainNoise(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(terrainHash(i), terrainHash(i + vec3(1,0,0)), f.x),
                       mix(terrainHash(i + vec3(0,1,0)), terrainHash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(terrainHash(i + vec3(0,0,1)), terrainHash(i + vec3(1,0,1)), f.x),
                       mix(terrainHash(i + vec3(0,1,1)), terrainHash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
      #include <normal_fragment_maps>
      float relief = terrainNoise(vTerrainPosition * 85.0) * .0017 + terrainNoise(vTerrainPosition * 210.0) * .0006;
      vec3 surfaceX = dFdx(-vViewPosition), surfaceY = dFdy(-vViewPosition);
      vec3 r1 = cross(surfaceY, normal), r2 = cross(normal, surfaceX);
      float determinant = dot(surfaceX, r1);
      vec3 gradient = sign(determinant) * (dFdx(relief) * r1 + dFdy(relief) * r2);
      normal = normalize(abs(determinant) * normal - gradient);
    `);
  };
  material.customProgramCacheKey = () => 'geographic-terrain-relief-v1';
}

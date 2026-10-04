/** Local-only MCP asset pipeline. No Higgsfield cloud or generation endpoints. */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = process.env.HIGGSFIELD_BLENDER_SERVER;
const blender = process.env.BLENDER_EXECUTABLE;
const kind = process.argv[2];
if (!server || !blender || !/^(globe|aircraft|cursor|globe-relief(?:-v[0-9]+)?)$/.test(kind)) {
  throw new Error('Set HIGGSFIELD_BLENDER_SERVER and BLENDER_EXECUTABLE, then run: node scripts/blender-local.mjs globe|aircraft');
}
const child = spawn(process.execPath, [server], { env: { ...process.env, BLENDER_EXECUTABLE: blender }, stdio: ['pipe','pipe','inherit'] });
let nextId = 1;
const pending = new Map();
createInterface({ input: child.stdout }).on('line', line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
  else handler.resolve(message.result);
});
child.on('exit', code => {
  for (const handler of pending.values()) handler.reject(new Error(`MCP process exited: ${code}`));
  pending.clear();
});
function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}
async function call(name, args = {}) {
  const response = await request('tools/call', { name, arguments: args });
  if (response.isError) throw new Error(JSON.stringify(response.content));
  const result = response.structuredContent;
  if (result?.state === 'running' || result?.ok === false) throw new Error(`Unsettled Blender job: ${JSON.stringify(result)}. Inspect job before repeating.`);
  console.log(name, result ? JSON.stringify(result.result ?? result).slice(0, 3000) : 'OK');
  return response;
}
try {
  await mkdir(resolve(root, 'assets/blender'), { recursive: true });
  await mkdir(resolve(root, 'public/assets/models'), { recursive: true });
  await mkdir(resolve(root, 'work/previews'), { recursive: true });
  await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'portfolio-local-asset-build', version: '1.0.0' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  await call('bl_get_skill', { name: 'blender-scene' });
  await call('bl_health');
  await call('bl_get_scene_summary');
  // A new MCP connection owns an independent factory scene. Existing desktop files are untouched.
  await call('bl_delete_object', { name: 'Cube' });
  if (kind.startsWith('globe')) {
    await call('bl_add_primitive', { kind: 'uv_sphere', name: 'Globe_Ocean', location: [0,0,0] });
    await call('bl_set_material', { object: 'Globe_Ocean', material_name: 'Porcelain', color: [.82,.81,.77,1], roughness: .9 });
  }
  const source = await readFile(resolve(root, `scripts/${kind.startsWith('globe-relief') ? 'globe-relief' : kind}.py`), 'utf8');
  await call('bl_execute', { code: `ASSET_ROOT = ${JSON.stringify(root)}\n` + source });
  await call('bl_execute', { code: `
import bpy
from mathutils import Vector
scene = bpy.context.scene
camera = scene.camera
camera.name = 'CAM_asset_review'
camera.location = (0, -5.2, ${kind.startsWith('globe') ? '.2' : '1.1'})
camera.rotation_euler = (Vector((0,0,0)) - camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = ${kind.startsWith('globe') ? '3' : '3.8'}
key = bpy.data.objects.get('Light')
key.name = 'LGT_key'
key.data.type = 'AREA'
key.data.energy = 400
key.data.shape = 'DISK'
key.data.size = 4
key.location = (-3,-4,5)
key.rotation_euler = (Vector((0,0,0)) - key.location).to_track_quat('-Z','Y').to_euler()
scene.world.use_nodes = True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value = (1,1,1,1)
scene.world.node_tree.nodes.get('Background').inputs[1].default_value = .35
scene.render.film_transparent = True
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.view_settings.view_transform = 'AgX'
scene.unit_settings.system = 'METRIC'
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
result = {'camera':camera.name,'objects':[o.name for o in scene.objects]}
` });
  await call('bl_get_scene_summary');
  const modelPath = resolve(root, `public/assets/models/${kind}.glb`);
  await call('bl_execute', { code: `
import bpy, os
target = ${JSON.stringify(modelPath)}
if os.path.exists(target):
    raise RuntimeError('Asset exists; inspect it and explicitly choose a new revision before rebuilding.')
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH': obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=target, export_format='GLB', use_selection=True, export_apply=True, export_draco_mesh_compression_enable=${kind.startsWith('globe-relief') ? 'True' : 'False'}, export_draco_mesh_compression_level=6)
result = {'path':target,'bytes':os.path.getsize(target)}
` });
  await call('bl_save_project', { path: resolve(root, `assets/blender/${kind}.blend`) });
  const preview = resolve(root, `work/previews/${kind}.png`);
  await call('bl_render', { output_path: preview, resolution: [512,512], engine: 'CYCLES', samples: 16 });
  await writeFile(resolve(root, `assets/blender/${kind}.build.json`), JSON.stringify({ kind, stage: kind.startsWith('globe-relief') ? 'geographic-relief' : 'foundation-blockout', source: 'local Higgsfield use Blender MCP', creditsUsed: 0, preview: `work/previews/${kind}.png` }, null, 2) + '\n');
} finally {
  child.stdin.end();
}

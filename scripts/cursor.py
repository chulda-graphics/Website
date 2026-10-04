"""Beveled, extruded pointer. The material matches Aircraft_Porcelain exactly."""
import bpy

material = bpy.data.materials.new('Cursor_Porcelain')
material.use_nodes = True
shader = material.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = (.72, .72, .69, 1)
shader.inputs['Roughness'].default_value = .6

# Front silhouette lies in X/Z, facing the same review camera as the aircraft.
outline = [(-.72, 1.05), (.88, -.15), (.19, -.27), (.61, -.97), (.24, -1.19), (-.18, -.48), (-.72, -.94)]
depth = .2
vertices = [(x, -depth / 2, z) for x,z in outline] + [(x, depth / 2, z) for x,z in outline]
n = len(outline)
faces = [tuple(reversed(range(n))), tuple(range(n, 2*n))]
faces += [(i, (i+1)%n, (i+1)%n+n, i+n) for i in range(n)]
mesh = bpy.data.meshes.new('Cursor_ExtrudedMesh')
mesh.from_pydata(vertices, [], faces)
mesh.update()
obj = bpy.data.objects.new('Cursor_Extruded', mesh)
bpy.context.scene.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')
mesh.materials.append(material)
bevel = obj.modifiers.new('Soft porcelain edges', 'BEVEL')
bevel.width = .035
bevel.segments = 4
bevel.harden_normals = True
obj.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
obj['material_reference'] = 'Aircraft_Porcelain: base (.72,.72,.69), roughness .6'
result = {'object': obj.name, 'depth_m': depth, 'material': material.name, 'credits_used': 0}

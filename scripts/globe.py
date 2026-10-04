"""Foundation globe. Continental relief is intentionally reserved for the fidelity pass."""
import bpy
globe = bpy.data.objects['Globe_Ocean']
for face in globe.data.polygons:
    face.use_smooth = True
modifier = globe.modifiers.new('Smooth silhouette', 'SUBSURF')
modifier.levels = 2
modifier.render_levels = 2
globe['stage'] = 'foundation-blockout'
globe['remaining'] = 'Continental relief, lighting and rotation match'
result = {'name': globe.name, 'diameter_m': 2.0, 'stage': 'foundation-blockout'}

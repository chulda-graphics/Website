"""Editable low-detail aircraft blockout, facing away along +Y. Metres, Z-up."""
import bpy, math
material = bpy.data.materials.new('Aircraft_Porcelain')
material.use_nodes = True
shader = material.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = (.72,.72,.69,1)
shader.inputs['Roughness'].default_value = .6

def mesh_object(name, vertices, faces, smooth=False):
    mesh = bpy.data.meshes.new(name + '_mesh')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    mesh.materials.append(material)
    for face in mesh.polygons:
        face.use_smooth = smooth
    return obj

# Continuous fuselage cross-section loft, with editable base topology.
stations = [(-.86,.015,.03),(-.7,.07,.055),(-.35,.12,.11),(.2,.14,.14),(.62,.115,.12),(.88,.065,.07),(.96,.01,.015)]
vertices = []
segments = 24
for y, width, height in stations:
    for i in range(segments):
        angle = i * 2 * math.pi / segments
        vertices.append((width * math.cos(angle), y, height * math.sin(angle)))
faces = []
for j in range(len(stations)-1):
    for i in range(segments):
        a = j*segments+i
        b = j*segments+(i+1)%segments
        faces.append((a,b,b+segments,a+segments))
faces.extend([tuple(reversed(range(segments))),tuple((len(stations)-1)*segments+i for i in range(segments))])
body = mesh_object('Aircraft_Fuselage',vertices,faces,True)
sub = body.modifiers.new('Fuselage smoothing','SUBSURF'); sub.levels=1; sub.render_levels=1

def foil(name, outline, thickness):
    n=len(outline)
    vertices=[(x,y,z-thickness/2) for x,y,z in outline]+[(x,y,z+thickness/2) for x,y,z in outline]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    obj=mesh_object(name,vertices,faces)
    bevel=obj.modifiers.new('Edge softness','BEVEL'); bevel.width=.012; bevel.segments=2
    obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return obj

for sign,side in [(-1,'L'),(1,'R')]:
    foil('Aircraft_Wing_'+side,[(sign*.08,.32,-.03),(sign*1.45,-.02,.03),(sign*1.44,-.18,.03),(sign*.09,-.12,-.03)],.035)
    foil('Aircraft_Tailplane_'+side,[(sign*.04,-.54,.045),(sign*.52,-.73,.09),(sign*.5,-.86,.09),(sign*.03,-.77,.045)],.02)
# Vertical stabilizer forms a closed solid.
v=[(-.015,-.79,0),(-.015,-.77,.44),(-.015,-.64,.42),(-.015,-.43,.015),(.015,-.79,0),(.015,-.77,.44),(.015,-.64,.42),(.015,-.43,.015)]
mesh_object('Aircraft_VerticalTail',v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
bpy.context.view_layer.update()
result={'stage':'foundation-blockout','parts':[o.name for o in bpy.context.scene.objects if o.type=='MESH'],'wingspan_m':2.9,'length_m':1.82}

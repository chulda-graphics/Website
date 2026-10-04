"""Geographic relief built locally from Natural Earth public-domain land polygons."""
import bpy, json, math, os
from mathutils import Vector
from mathutils.geometry import tessellate_polygon

globe = bpy.data.objects['Globe_Ocean']
for face in globe.data.polygons:
    face.use_smooth = True
smooth = globe.modifiers.new('Ocean smooth silhouette', 'SUBSURF')
smooth.levels = 2
smooth.render_levels = 2

with open(os.path.join(ASSET_ROOT, 'assets/data/land.geojson')) as source:
    geography = json.load(source)

vertices, faces, lookup = [], [], {}
def vertex(point):
    lon, lat = math.radians(point.x), math.radians(point.y)
    radius = 1.007
    # Europe/Africa initially face the camera after glTF's Y-up conversion.
    coordinate = (radius*math.cos(lat)*math.sin(lon), -radius*math.cos(lat)*math.cos(lon), radius*math.sin(lat))
    key = tuple(round(x, 7) for x in coordinate)
    if key not in lookup:
        lookup[key] = len(vertices)
        vertices.append(coordinate)
    return lookup[key]

def triangle(a, b, c, depth=0):
    lengths=[(a-b).length,(b-c).length,(c-a).length]
    longest=max(lengths)
    if depth < 16 and longest>3:
        edge=lengths.index(longest)
        if edge==0:
            mid=(a+b)/2
            triangle(a,mid,c,depth+1); triangle(mid,b,c,depth+1)
        elif edge==1:
            mid=(b+c)/2
            triangle(a,b,mid,depth+1); triangle(a,mid,c,depth+1)
        else:
            mid=(c+a)/2
            triangle(a,b,mid,depth+1); triangle(mid,b,c,depth+1)
        return
    ids=[vertex(a),vertex(b),vertex(c)]
    if len(set(ids))<3: return
    v=[Vector(vertices[i]) for i in ids]
    if (v[1]-v[0]).cross(v[2]-v[0]).dot(v[0])<0: ids.reverse()
    faces.append(tuple(ids))

for feature in geography['features']:
    geometry=feature['geometry']
    polygons=geometry['coordinates'] if geometry['type']=='MultiPolygon' else [geometry['coordinates']]
    for polygon in polygons:
        ring=[Vector((lon,lat,0)) for lon,lat,*_ in polygon[0][:-1]]
        if len(ring)<3: continue
        for a,b,c in tessellate_polygon([ring]):
            triangle(ring[a],ring[b],ring[c]) if isinstance(a,int) else triangle(a,b,c)

mesh=bpy.data.meshes.new('Earth_land_relief_mesh')
mesh.from_pydata(vertices,[],faces)
mesh.update()
land=bpy.data.objects.new('Globe_ContinentalRelief',mesh)
bpy.context.scene.collection.objects.link(land)
mesh.materials.append(globe.data.materials[0])
for face in mesh.polygons: face.use_smooth=True
decimate=land.modifiers.new('Web mesh reduction','DECIMATE')
decimate.ratio=.1
solid=land.modifiers.new('Coastline raised edge','SOLIDIFY')
solid.thickness=.009
solid.offset=-1
land['source']='Natural Earth 1:110m land, public domain'
land['relief_height_m']=.007
result={'object':land.name,'vertices':len(vertices),'faces':len(faces),'radius_m':1.007,'source':'Natural Earth 1:110m land'}

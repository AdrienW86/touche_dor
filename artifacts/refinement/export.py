import bpy, os, math, json
from mathutils import Vector, Matrix
root=os.path.abspath('artifacts/refinement');destination=os.path.abspath('public/assets/models/refinement');stats={}
def bake(obj):
    matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.data.transform(matrix)
def material(name,color,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value=(*color,1);s.inputs['Metallic'].default_value=metal;s.inputs['Roughness'].default_value=rough
    return m
def export(name):
    bpy.ops.object.select_all(action='SELECT')
    file=os.path.join(destination,name+'.glb');bpy.ops.export_scene.gltf(filepath=file,export_format='GLB',export_animations=False,export_cameras=False,export_lights=False,export_extras=False)
    triangles=0
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH':obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
    stats[name]=dict(fileBytes=os.path.getsize(file),triangles=triangles,meshes=sum(o.type=='MESH' for o in bpy.context.scene.objects))
# Replace the old cabinet with the independently downloaded GEM counter.
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads','gem-inspect.blend'),load_ui=False,use_scripts=False)
led=material('Refined LED opal',(.85,.75,.58),0,.45)
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True);continue
    # Closed drawer internals and tray partitions are invisible and interfere
    # with the three busts. Keep drawer fronts, hardware, feet and actual carcass.
    if any(word in obj.name for word in ['drawer bottom','drawer rear','drawer side','fixed flax liner','flax divider','retaining rail','bronze finger boss']) or obj.name=='Glazing | sliding front glass.001':
        bpy.data.objects.remove(obj,do_unlink=True);continue
    bake(obj)
    if obj.name=='Glazing | sliding front glass':
        # One source pane widened to replace both overlapping sliding leaves.
        for v in obj.data.vertices:
            v.co.x=(v.co.x+.325)*1.312/.662
            v.co.y+=.008
        obj.name='Glazing | single non-overlapping front pane'
    for v in obj.data.vertices:
        v.co.x*=1.38/1.39
        z=v.co.z;v.co.z=z*.74/.684 if z<=.684 else .74+(z-.684)*.66/(1.007-.684)
    obj.data.update()
    if obj.name=='Glazing | top edge rail.001':
        copy=obj.copy();copy.data=obj.data.copy();bpy.context.collection.objects.link(copy);copy.name='LED | recessed opal insert from source profile'
        points=[v.co for v in copy.data.vertices];center=Vector(tuple((min(v[i] for v in points)+max(v[i] for v in points))/2 for i in range(3)))
        for v in copy.data.vertices:
            delta=v.co-center;delta.x*=.94;delta.y*=.4;delta.z*=.12;v.co=center+delta+Vector((0,-.005,-.022))
        copy.data.materials.clear();copy.data.materials.append(led)
        for face in copy.data.polygons:face.material_index=0
# Batch the author's detailed components by material; no proxy shapes are built.
groups={}
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':groups.setdefault(o.data.materials[0].name,[]).append(o)
for name,objects in groups.items():
    if 'Glass' in name or name=='Refined LED opal':continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    objects[0].name='GEM counter | '+name
for image in bpy.data.images:
    if max(image.size)>1024:
        scale=1024/max(image.size);image.scale(round(image.size[0]*scale),round(image.size[1]*scale))
export('gem-counter')
# Contemporary BlenderKit fixture. Preserve actual bevels, mounting plate,
# support rod and cylindrical shade; remove hidden bulb geometry under opal.
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads','modern-sconce.blend'),load_ui=False,use_scripts=False)
for o in list(bpy.context.scene.objects):
    if o.type!='MESH' or o.name in ['emission_body','GlassBulb','Filaments','bulb']:
        bpy.data.objects.remove(o,do_unlink=True)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];deps=bpy.context.evaluated_depsgraph_get();turn=Matrix.Rotation(math.pi/2,4,'X')
for obj in meshes:
    for modifier in obj.modifiers:
        if modifier.type=='SUBSURF':modifier.levels=min(1,modifier.levels);modifier.render_levels=modifier.levels
    obj.select_set(True)
    evaluated=obj.evaluated_get(deps);data=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps)
    matrix=turn@obj.matrix_world;obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.modifiers.clear();obj.data=data;data.transform(matrix)
    for face in data.polygons:face.use_smooth=True
for m in bpy.data.materials:
    m.use_nodes=True;m.node_tree.nodes.clear();out=m.node_tree.nodes.new('ShaderNodeOutputMaterial');shader=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    shader.inputs['Base Color'].default_value=(.5,.38,.22,1);shader.inputs['Metallic'].default_value=1;shader.inputs['Roughness'].default_value=.32
    m.node_tree.links.new(shader.outputs['BSDF'],out.inputs['Surface'])
points=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box];lo=Vector(tuple(map(min,zip(*points))));hi=Vector(tuple(map(max,zip(*points))))
offset=Vector((-(lo.x+hi.x)/2,-hi.y,-(lo.z+hi.z)/2))
for obj in meshes:obj.data.transform(Matrix.Translation(offset))
export('vertical-sconce')
with open(os.path.join(root,'export-report.json'),'w') as f:json.dump(stats,f,indent=2)
print('EXPORTED',stats)

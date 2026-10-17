import bpy, os, math, json
from mathutils import Vector, Matrix
root=os.path.abspath('artifacts/pilot-models')
destination=os.path.abspath('public/assets/models/pilot')
stats={}
def portable(name,color,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.use_nodes=True
    s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=(*color,1);s.inputs['Metallic'].default_value=metal;s.inputs['Roughness'].default_value=rough
    return m
def bake(obj):
    matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.data.transform(matrix)
def export(name):
    bpy.ops.object.select_all(action='SELECT')
    path=os.path.join(destination,name+'.glb')
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=False)
    stats[name]=dict(bytes=os.path.getsize(path),triangles=sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type=='MESH'))
# A downloaded complete cabinet: preserve its mouldings, paneled plinth, glazing,
# UVs and locks. Adapt the two vertical zones to the original tour envelope.
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads','large-case-import.blend'),load_ui=False,use_scripts=False)
wood=portable('Pilot dark walnut',(.035,.024,.016),0,.38)
brass=portable('Pilot champagne trim',(.55,.40,.21),1,.28)
edge=portable('Pilot warm integrated edge',(.55,.40,.21),1,.28)
glass=portable('Pilot clear glass',(.98,.98,.98),0,.06)
glass.diffuse_color=(1,1,1,.04)
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True);continue
    bake(obj)
    isglass='Glass' in obj.data.materials[0].name
    # Preserve the author's mapped surface detail, resized for the browser.
    if not isglass:
        wood=obj.data.materials[0];wood.name='Pilot dark walnut'
        obj.data.materials.append(brass)
        obj.data.materials.append(edge)
        for face in obj.data.polygons:
            z=face.center.z
            zs=[obj.data.vertices[i].co.z for i in face.vertices]
            mid=sum(zs)/len(zs)
            if mid<3 or 57<mid<64 or mid>294:face.material_index=1
            if mid>294:face.material_index=2
    else:obj.data.materials.clear();obj.data.materials.append(glass)
    obj.name='Downloaded cabinet glazing' if isglass else 'Downloaded paneled cabinet and mouldings'
    for v in obj.data.vertices:
        v.co.x=(v.co.x-78.93624)*1.38/157.87247
        v.co.y=(v.co.y+78.99233)*1.18/157.98466
        z=v.co.z
        v.co.z=z*1.09/64 if z<=64 else 1.09+(z-64)*.92/(299.97528-64)
    obj.data.update()
for img in bpy.data.images:
    if img.size[0]>1024 or img.size[1]>1024:
        ratio=1024/max(img.size);img.scale(round(img.size[0]*ratio),round(img.size[1]*ratio))
export('necklace-cabinet')
# The downloaded necklace and bust remain actual meshes, not parametric proxies.
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads','necklace-display-import.blend'),load_ui=False,use_scripts=False)
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True);continue
    bake(obj)
    role=obj.data.materials[0].name
    if role=='stand':
        obj.name='Velvet necklace bust';mat=portable('Pilot black velvet',(.008,.008,.009),0,.96)
        for face in obj.data.polygons:face.use_smooth=True
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.0001);bpy.ops.object.mode_set(mode='OBJECT')
        mod=obj.modifiers.new('Smooth source bust silhouette','SUBSURF');mod.levels=1
        bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
    elif role=='diamond':
        obj.name='Faceted diamond pendant';mat=portable('Pilot faceted gemstone',(.8,.85,.9),.1,.09)
        mod=obj.modifiers.new('Small gemstone reduction','DECIMATE');mod.ratio=.25
        bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
    else:
        obj.name='Linked gold chain' if role=='gold_chain' else 'Pendant setting';mat=portable('Pilot necklace gold',(.70,.48,.19),1,.22)
        # Retain real link topology and prongs; a moderate reduction eliminates
        # invisible tessellation at a maximum 74cm display height.
        mod=obj.modifiers.new('Browser necklace reduction','DECIMATE');mod.ratio=.8 if role=='gold_chain' else .2
        bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
        for face in obj.data.polygons:face.use_smooth=True
    obj.data.materials.clear();obj.data.materials.append(mat)
    for face in obj.data.polygons:face.material_index=0
    for v in obj.data.vertices:
        v.co=(v.co-Vector((.07935357,-.26303476,.42416677)))*(.74/4.77100888)
    obj.data.update()
export('necklace-bust')
with open(os.path.join(root,'pilot-export.json'),'w') as f:json.dump(stats,f,indent=2)
print('PILOT_EXPORT',stats)

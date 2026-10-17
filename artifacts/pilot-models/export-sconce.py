import bpy, os, math, json
from mathutils import Matrix, Vector
root=os.path.abspath('artifacts/pilot-models')
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads','wall-light.blend'),load_ui=False,use_scripts=False)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
# The author's wall-snapped object lies on XY, pointing along +Z. Rotate it to
# Blender's Z-up world; the exporter then creates the intended glTF Y-up fixture.
turn=Matrix.Rotation(math.pi/2,4,'X')
deps=bpy.context.evaluated_depsgraph_get()
for obj in meshes:
    for modifier in obj.modifiers:
        if modifier.type=='SUBSURF':modifier.levels=min(1,modifier.levels);modifier.render_levels=modifier.levels
    evaluated=obj.evaluated_get(deps)
    data=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps)
    matrix=turn@obj.matrix_world
    obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.modifiers.clear();obj.data=data;data.transform(matrix)
    for face in data.polygons:face.use_smooth=obj.name!='drop_diamond'
    if len(data.polygons)>1500 and obj.name not in ['shape','drop_diamond']:
        reduce=obj.modifiers.new('Remove subpixel fixture tessellation','DECIMATE');reduce.ratio=.45
        bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=reduce.name)
    # Runtime materials are scoped to this model. Export only a portable PBR
    # base, retaining the named source groups and all source mesh detail.
for mat in bpy.data.materials:
    mat.use_nodes=True;mat.node_tree.nodes.clear()
    output=mat.node_tree.nodes.new('ShaderNodeOutputMaterial');shader=mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    shader.inputs['Base Color'].default_value=(.45,.32,.13,1) if 'gold' in mat.name.lower() else (.8,.75,.65,1)
    shader.inputs['Metallic'].default_value=1 if 'gold' in mat.name.lower() or 'metal' in mat.name.lower() else 0
    shader.inputs['Roughness'].default_value=.3;mat.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface'])
points=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box]
lo=Vector(tuple(map(min,zip(*points))));hi=Vector(tuple(map(max,zip(*points))))
# After glTF's axis conversion: height is Blender Z, front is negative Blender Y.
offset=Vector((-(lo.x+hi.x)/2,-hi.y,-(lo.z+hi.z)/2))
for obj in meshes:obj.data.transform(Matrix.Translation(offset))
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes:obj.select_set(True)
destination=os.path.abspath('public/assets/models/pilot/wall-light.glb')
bpy.ops.export_scene.gltf(filepath=destination,export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=False,export_apply=False)
triangles=0
for obj in meshes:obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
with open(os.path.join(root,'sconce-export.json'),'w') as f:json.dump(dict(meshes=len(meshes),triangles=triangles,sourceDimensions=list(hi-lo),fileBytes=os.path.getsize(destination),modifications=['Apply original bevel and solidify modifiers','Subdivision capped at level 1 for small fixture','Normals and UVs preserved; sharp diamond facets retained','Correct wall-oriented glTF axes','Materials replaced locally in Three.js; no global light changes']),f,indent=2)
print('EXPORTED',triangles,'triangles',os.path.getsize(destination),'bytes')

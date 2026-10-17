import bpy,os,json
from mathutils import Vector,Matrix
root=os.path.abspath('artifacts/architecture');dest=os.path.abspath('public/assets/models/architecture');report={}
for name in ['ring','earrings','bracelet','jewel-stand','chain','pearls']:
    source=os.path.join(root,'downloads',name+'.glb')
    if name in ['chain','pearls']:source=os.path.abspath('artifacts/pilot-models/downloads/'+('gold-necklace' if name=='chain' else 'pearl-necklace')+'.glb')
    bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=source)
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];records=[]
    for o in meshes:
        matrix=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4);o.data.transform(matrix)
        pts=[v.co for v in o.data.vertices];records.append(dict(name=o.name,materials=[m.name for m in o.data.materials if m],bounds=[list(map(min,zip(*pts))),list(map(max,zip(*pts)))],triangles=len(o.data.polygons)))
    pts=[v.co for o in meshes for v in o.data.vertices];lo=Vector(tuple(map(min,zip(*pts))));hi=Vector(tuple(map(max,zip(*pts))));center=(hi+lo)/2
    scale=1/max(hi-lo)
    for o in meshes:
        for v in o.data.vertices:v.co=(v.co-center)*scale
        o.data.update()
        if name in ['bracelet','earrings']:
            mod=o.modifiers.new('Remove subpixel ornament tessellation','DECIMATE');mod.ratio=.55;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    # Drop only unused non-mesh scene nodes, preserving the licensed mesh detail.
    for o in list(bpy.context.scene.objects):
        if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
    for image in bpy.data.images:
        if max(image.size)>1024:
            s=1024/max(image.size);image.scale(round(image.size[0]*s),round(image.size[1]*s))
    # Runtime reuses the project's velvet and metal PBR palette. Do not embed
    # source textures that will immediately be replaced. Pearls keep theirs.
    if name!='pearls':
        for mat in bpy.data.materials:
            mat.use_nodes=True;mat.node_tree.nodes.clear();out=mat.node_tree.nodes.new('ShaderNodeOutputMaterial');shader=mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
            shader.inputs['Base Color'].default_value=(.5,.4,.25,1);shader.inputs['Metallic'].default_value=0 if 'diamond' in mat.name.lower() else 1;shader.inputs['Roughness'].default_value=.3;mat.node_tree.links.new(shader.outputs['BSDF'],out.inputs['Surface'])
    filepath=os.path.join(dest,name+'.glb');bpy.ops.export_scene.gltf(filepath=filepath,export_format='GLB',export_animations=False,export_lights=False,export_cameras=False,export_extras=False)
    report[name]=dict(originalBounds=[list(lo),list(hi)],objects=records,bytes=os.path.getsize(filepath));print('MODEL',name,json.dumps(report[name]))
# The approved sconce geometry is reused; remove excess tessellation for 16 copies.
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=os.path.abspath('public/assets/models/refinement/vertical-sconce.glb'))
for o in bpy.context.scene.objects:
    if o.type!='MESH':continue
    if len(o.data.polygons)>1500:
        mod=o.modifiers.new('Architectural repeated fixture LOD','DECIMATE');mod.ratio=.45;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    for face in o.data.polygons:face.use_smooth=True
filepath=os.path.join(dest,'vertical-sconce.glb');bpy.ops.export_scene.gltf(filepath=filepath,export_format='GLB',export_animations=False,export_lights=False,export_cameras=False,export_extras=False)
report['sconce']={'bytes':os.path.getsize(filepath)}
json.dump(report,open(os.path.join(root,'model-export.json'),'w'),indent=2)

import bpy,os,json,math,bmesh
from mathutils import Matrix,Vector
dest=os.path.abspath('public/assets/models/showcase-finish');os.makedirs(dest,exist_ok=True);report={}
for name in ['stud','drop','hoops']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=os.path.abspath('artifacts/showcase-finish/downloads/'+name+'.glb'))
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and len(o.data.polygons)]
 for o in list(bpy.context.scene.objects):
  if o not in meshes:bpy.data.objects.remove(o,do_unlink=True)
 for o in meshes:
  matrix=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4);o.data.transform(matrix)
 if name=='hoops':
  # Original pair is photographed obliquely: both hoops lie in YZ planes.
  # Retain the complete right hoop, including its clasp and pave, then turn
  # it as a whole. The runtime places two distinct copies on the card.
  for o in meshes:
   bm=bmesh.new();bm.from_mesh(o.data)
   bmesh.ops.delete(bm,geom=[f for f in bm.faces if sum(v.co.x for v in f.verts)/len(f.verts)<0],context='FACES')
   bm.to_mesh(o.data);bm.free();o.data.update()
  for o in list(meshes):
   if not len(o.data.polygons):meshes.remove(o);bpy.data.objects.remove(o,do_unlink=True)
  # Remove vertices left unused by the removed mate.
  for o in meshes:
   bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(o.data);bm.free()
  for o in meshes:o.data.transform(Matrix.Rotation(-math.pi/2,4,'Z'))
 # Sources are upright in Blender Z and face -Y (runtime +Z).
 points=[v.co for o in meshes for v in o.data.vertices];lo=Vector(tuple(map(min,zip(*points))));hi=Vector(tuple(map(max,zip(*points))));center=(lo+hi)/2;scale=1/(hi.z-lo.z)
 for o in meshes:
  for v in o.data.vertices:v.co=(v.co-center)*scale
  o.data.update()
  # Keep settings and the actual authored jewelry; remove subpixel tessellation.
  if len(o.data.polygons)>1500:
   mod=o.modifiers.new('Web detail LOD','DECIMATE');mod.ratio=.20 if name=='hoops' else .34;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
  material=bpy.data.materials.new('gemstone' if (name=='stud' and o.data.materials[0].name in ['earlace','earlaceb']) or (name=='drop' and '002' in o.name) or (name=='hoops' and o.name=='Object_6') else 'champagne')
  material.use_nodes=True;shader=material.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(.85,.78,.55,1) if material.name.startswith('champagne') else (.88,.91,.95,1);shader.inputs['Metallic'].default_value=1 if material.name.startswith('champagne') else 0;shader.inputs['Roughness'].default_value=.35
  o.data.materials.clear();o.data.materials.append(material)
  for p in o.data.polygons:p.material_index=0
  if name=='drop' and '002' in o.name:
   gold=bpy.data.materials.new('champagne_ball_and_links');gold.use_nodes=True;node=gold.node_tree.nodes.get('Principled BSDF');node.inputs['Metallic'].default_value=1;node.inputs['Roughness'].default_value=.35;o.data.materials.append(gold)
   threshold=(300-center.z)*scale
   for face in o.data.polygons:
    if sum(o.data.vertices[v].co.z for v in face.vertices)/len(face.vertices)<threshold:face.material_index=1
 # Remove orphan images and original materials: runtime uses project PBR finishes.
 bpy.ops.outliner.orphans_purge(do_recursive=True)
 output=os.path.join(dest,name+'.glb');bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',export_animations=False,export_cameras=False,export_lights=False,export_extras=False,export_texcoords=False)
 report[name]={'sourceBounds':[list(lo),list(hi)],'runtimeUp':'Y','front':'+Z','triangles':sum(len(o.data.loop_triangles) for o in meshes),'bytes':os.path.getsize(output),'parts':[o.name for o in meshes]}
json.dump(report,open('artifacts/showcase-finish/export-report.json','w'),indent=2)

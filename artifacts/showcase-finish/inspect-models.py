import bpy,os,json
from mathutils import Matrix
report={}
for name in ['stud','drop','hoops']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=os.path.abspath('artifacts/showcase-finish/downloads/'+name+'.glb'))
 parts=[]
 for o in bpy.context.scene.objects:
  if o.type!='MESH':continue
  pts=[o.matrix_world@v.co for v in o.data.vertices];parts.append(dict(name=o.name,materials=[m.name for m in o.data.materials if m],bounds=[list(map(min,zip(*pts))),list(map(max,zip(*pts)))],polygons=len(o.data.polygons)))
 report[name]=parts
json.dump(report,open('artifacts/showcase-finish/mesh-inspection.json','w'),indent=2)

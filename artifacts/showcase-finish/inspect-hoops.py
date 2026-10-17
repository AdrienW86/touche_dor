import bpy,json,os
from mathutils import Matrix
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=os.path.abspath('artifacts/showcase-finish/downloads/hoops.glb'));out=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH' or not len(o.data.polygons):continue
 n=len(o.data.vertices);parents=list(range(n))
 def find(i):
  while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
  return i
 for e in o.data.edges:
  a,b=map(find,e.vertices);parents[b]=a
 groups={}
 for v in o.data.vertices:groups.setdefault(find(v.index),[]).append(o.matrix_world@v.co)
 for points in groups.values():
  if len(points)<100:continue
  lo=list(map(min,zip(*points)));hi=list(map(max,zip(*points)));out.append({'object':o.name,'count':len(points),'bounds':[lo,hi],'center':[(lo[k]+hi[k])/2 for k in range(3)]})
json.dump(sorted(out,key=lambda x:-x['count']),open('artifacts/showcase-finish/hoop-components.json','w'),indent=2)

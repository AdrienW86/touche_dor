import bpy, os, json
from mathutils import Vector
root=os.path.abspath('artifacts/pilot-models')
report={}
for name in ['large-case','italian-case']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(root,'downloads',name+'.glb'))
    entries=[]
    for obj in bpy.context.scene.objects:
        if obj.type!='MESH':continue
        points=[obj.matrix_world@Vector(p) for p in obj.bound_box]
        entries.append(dict(name=obj.name,vertices=len(obj.data.vertices),faces=len(obj.data.polygons),bounds=[list(map(min,zip(*points))),list(map(max,zip(*points)))],materials=[m.name for m in obj.data.materials if m]))
    report[name]=entries
    print(name,json.dumps(entries))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'downloads',name+'-import.blend'))
with open(os.path.join(root,'glb-inspection.json'),'w') as f:json.dump(report,f,indent=2)

import bpy, os, json
from mathutils import Vector
root=os.path.abspath('artifacts/refinement')
report={}
for name in ['gem','modern-sconce']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if name=='gem':bpy.ops.import_scene.gltf(filepath=os.path.join(root,'downloads',name+'.glb'))
    else:bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads',name+'.blend'),load_ui=False,use_scripts=False)
    records=[]
    for o in bpy.context.scene.objects:
        if o.type!='MESH':continue
        points=[o.matrix_world@Vector(v) for v in o.bound_box]
        records.append(dict(name=o.name,vertices=len(o.data.vertices),faces=len(o.data.polygons),materials=[m.name for m in o.data.materials if m],bounds=[list(map(min,zip(*points))),list(map(max,zip(*points)))],modifiers=[dict(type=m.type,name=m.name) for m in o.modifiers]))
    report[name]=records;print(name,json.dumps(records))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'downloads',name+'-inspect.blend'))
with open(os.path.join(root,'inspection.json'),'w') as f:json.dump(report,f,indent=2)

import bpy, json, os
from mathutils import Vector
root=os.path.abspath('artifacts/pilot-models')
for name in ['torso','wall-light']:
    bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'downloads',name+'.blend'),load_ui=False,use_scripts=False)
    objects=[]
    for o in bpy.data.objects:
        bounds=[o.matrix_world@Vector(v) for v in o.bound_box] if o.type=='MESH' else []
        objects.append(dict(name=o.name,type=o.type,dimensions=list(o.dimensions),location=list(o.location),vertices=len(o.data.vertices) if o.type=='MESH' else 0,materials=[m.name for m in o.data.materials if m] if o.type=='MESH' else [],modifiers=[dict(type=m.type,name=m.name) for m in o.modifiers],bounds=[list(map(min,zip(*bounds))),list(map(max,zip(*bounds)))] if bounds else []))
    with open(os.path.join(root,name+'-inspection.json'),'w',encoding='utf8') as f:json.dump(objects,f,indent=2)
    print(name,[(o['name'],o['type'],o['vertices']) for o in objects])

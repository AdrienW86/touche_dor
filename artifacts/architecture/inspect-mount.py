import bpy,os,json
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath('public/assets/models/refinement/vertical-sconce.glb'))
points=[o.matrix_world@v.co for o in bpy.context.scene.objects if o.type=='MESH' for v in o.data.vertices]
back=max(p.y for p in points);rear=[p for p in points if p.y>back-.0002]
lo=min(p.z for p in rear);hi=max(p.z for p in rear);height=max(p.z for p in points)-min(p.z for p in points)
r=dict(backPlaneGltfZ=-back,backplateCenterGltfY=(lo+hi)/2,localHeight=height,mountRootY=2.5-(lo+hi)/2*.78/height,rotationLeftY=1.5707963267948966,rotationRightY=-1.5707963267948966,surfaceLeftX=-2.54,mountRootLeftX=-2.539)
print('MOUNT',json.dumps(r));json.dump(r,open('artifacts/architecture/mount-analysis.json','w'),indent=2)

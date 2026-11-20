import * as THREE from 'three';
// General adaptive renderer path. Every mesh of the normal model is retained.
export class ModelInstances{
 constructor(template,parent,count){
  template.updateMatrixWorld(true);this.parts=[];this.dummy=new THREE.Object3D();this.matrix=new THREE.Matrix4();
  template.traverse(part=>{if(!part.isMesh)return;const mesh=new THREE.InstancedMesh(part.geometry,part.material,count);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;parent.add(mesh);this.parts.push({mesh,local:part.matrixWorld.clone()});});template.removeFromParent();
 }
 update(entities,transform){for(let i=0;i<entities.length;i++){this.dummy.position.set(0,0,0);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(1);transform(this.dummy,entities[i]);this.dummy.updateMatrix();for(const p of this.parts){this.matrix.multiplyMatrices(this.dummy.matrix,p.local);p.mesh.setMatrixAt(i,this.matrix);}}for(const p of this.parts){p.mesh.count=entities.length;p.mesh.instanceMatrix.needsUpdate=true;}}
 dispose(){for(const {mesh}of this.parts){mesh.geometry.dispose();mesh.material.dispose();mesh.dispose();mesh.removeFromParent();}}
}

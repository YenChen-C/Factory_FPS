/* Damage state is attached to the same volumes used by bullets and movement. */
function makeDestruction(T,F,S,D,api){
 const walls=S.polys.filter(b=>b.wallIndex!==undefined),machines=S.polys.filter(b=>b.machineName);
 const doors=F.doors.map(d=>S.doorPoly(d));
 const cabinets=S.polys.filter(b=>b.cabinetId),exploded=new Set();
 const bodies=[...walls,...machines,...doors,...cabinets],burning=new Set(),tmp=new T.Object3D();let navDirty=false;
 const fire=new T.InstancedMesh(new T.ConeGeometry(1,1,6),new T.MeshBasicMaterial({color:0xff8a29,transparent:true,opacity:.85,depthWrite:false}),150);
 const core=new T.InstancedMesh(new T.ConeGeometry(1,1,6),new T.MeshBasicMaterial({color:0xffe399,transparent:true,opacity:.9,depthWrite:false}),150);
 const smoke=new T.InstancedMesh(new T.SphereGeometry(1,7,5),new T.MeshBasicMaterial({color:0x555c62,transparent:true,opacity:.24,depthWrite:false}),100);
 for(const [m,n]of [[fire,'Machine_fire'],[core,'Machine_fire_core'],[smoke,'Machine_smoke']]){m.name=n;m.count=0;m.frustumCulled=false;api.scene.add(m);}
 function maxHP(b){return b.machineName?CFG.machineHP:b.cabinetId?CFG.cabinetHP:CFG.wallHP;}
 function resetMachines(){for(const b of machines){if(exploded.has(b.machineName)){b.disabled=true;continue;}if(burning.has(b)){b.disabled=false;continue;}b.hp=maxHP(b);b.destroyed=false;}fire.count=core.count=smoke.count=0;}
 function reset(){exploded.clear();burning.clear();for(const b of cabinets){b.hp=maxHP(b);b.disabled=b.destroyed=false;F.setCabinetVisible(b.cabinetId,true);}for(const b of S.polys)if(b.doorFrameId)b.disabled=false;for(const b of doors){b.hp=CFG.wallHP;b.disabled=b.destroyed=false;b.door.destroyed=false;b.door.group.visible=true;b.door.frame.visible=true;b.door.t=b.door.target=0;S.doorPoly(b.door);}for(const b of walls){b.hp=maxHP(b);b.destroyed=false;b.disabled=false;F.wallMeshes[b.wallIndex].visible=true;}resetMachines();navDirty=true;}
 function hit(h,damage){const b=h?.body;if(!b||!bodies.includes(b)||b.disabled||b.destroyed||!Number.isFinite(damage)||damage<=0)return false;
  b.hp=Math.max(0,b.hp-damage);if(b.hp===0){b.destroyed=true;if(b.machineName){burning.add(b);b.burnStart=api.time?.()||0;api.notify(b.machineName+' 已摧毀 · 燃燒中',1.5);}else{b.disabled=true;if(b.door){b.door.destroyed=true;b.door.group.visible=false;b.door.frame.visible=false;for(const f of S.polys)if(f.doorFrameId===b.door.id)f.disabled=true;}else if(b.cabinetId){F.setCabinetVisible(b.cabinetId,false);if(Math.random()<.25)api.dropCabinet?.(b);}else F.wallMeshes[b.wallIndex].visible=false;api.onWallDestroyed?.();navDirty=true;api.notify(b.door?'門與門框已擊破':b.cabinetId?'置物櫃已擊破':'牆面已擊破',1);}}
  return true;
 }
 function blast(pos,radius,damage){
  // Collect hits before applying them: one explosion cannot pass through a wall it just broke.
  for(const d of F.doors)S.doorPoly(d);const impacts=[];for(const b of bodies){if(b.disabled||b.destroyed)continue;let nearest=null,best=Infinity;
   for(const ring of [b.p,...(b.holes||[])])for(let i=0;i<ring.length;i++){const a=ring[i],c=ring[(i+1)%ring.length],dx=c[0]-a[0],dz=c[1]-a[1],u=clamp(((pos.x-a[0])*dx+(pos.z-a[1])*dz)/(dx*dx+dz*dz||1),0,1),p=new T.Vector3(a[0]+u*dx,clamp(pos.y,b.lo+.01,b.hi-.01),a[1]+u*dz),d=pos.distanceTo(p);if(d<best){best=d;nearest=p;}}
   if(best>=radius||best<.002)continue;const dir=nearest.clone().sub(pos).normalize(),h=S.cast(pos,dir,best+.04);if(h?.body===b)impacts.push([h,damage*(1-best/radius)]);
  }for(const [h,n]of impacts)hit(h,n);
 }
 function tick(time){for(const b of [...burning])if(time-b.burnStart>=CFG.machineBurnSeconds){burning.delete(b);exploded.add(b.machineName);b.disabled=true;navDirty=true;api.machineExploded?.(b);}
 if(navDirty){S.rebuild();S.flow(api.player.pos);navDirty=false;}
  let f=0,s=0;for(const b of burning){if(b.disabled)continue;const o=D.objects.find(o=>o.name===b.machineName&&o.kind==='machine');if(!o)continue;
   for(let j=0;j<3;j++){const y=1.75+.14*Math.sin(time*8+j),height=.6+.24*Math.sin(time*11+j*2),x=o.x+Math.cos(j*2.1)*Math.min(o.w*.22,.4),z=o.z+Math.sin(j*2.1)*Math.min(o.d*.22,.4);tmp.position.set(x,y+height/2,z);tmp.scale.set(.18,height,.18);tmp.rotation.set(.12*Math.sin(time*4+j),0,.1*Math.cos(time*5+j));tmp.updateMatrix();fire.setMatrixAt(f,tmp.matrix);tmp.scale.set(.085,height*.75,.085);tmp.updateMatrix();core.setMatrixAt(f++,tmp.matrix);}
   for(let j=0;j<2;j++){const p=(time*.45+j*.5)%1;tmp.position.set(o.x+Math.sin(time+j)*p*.18,2.25+p*1.3,o.z+Math.cos(time+j)*p*.18);tmp.scale.setScalar(.14+p*.30);tmp.rotation.set(0,0,0);tmp.updateMatrix();smoke.setMatrixAt(s++,tmp.matrix);}
  }fire.count=core.count=f;smoke.count=s;for(const m of [fire,core,smoke])m.instanceMatrix.needsUpdate=true;
 }
 function label(h){const b=h?.body;if(!b||!bodies.includes(b)||b.disabled)return '';return (b.machineName||(b.door?'門':b.cabinetId?'置物櫃':'牆面'))+' · '+(b.destroyed?'燃燒中 · '+Math.max(0,Math.ceil(CFG.machineBurnSeconds-((api.time?.()||0)-b.burnStart)))+' 秒後爆炸':Math.ceil(b.hp)+' / '+maxHP(b)+' HP');}
 function nearBurn(pos){for(const b of burning){if(b.disabled||pos.y>2.8)continue;let distance=Infinity;for(let i=0;i<b.p.length;i++){const a=b.p[i],c=b.p[(i+1)%b.p.length],dx=c[0]-a[0],dz=c[1]-a[1],t=clamp(((pos.x-a[0])*dx+(pos.z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);distance=Math.min(distance,Math.hypot(pos.x-a[0]-dx*t,pos.z-a[1]-dz*t));}if(distance<.8||S.inside(pos.x,pos.z,b.p)){const centre=new T.Vector3((b.minX+b.maxX)/2,1.1,(b.minZ+b.maxZ)/2);if(S.clear(centre,pos.clone().add(new T.Vector3(0,.9,0)),true))return centre;}}return null;}
 reset();return {nearBurn,hit,blast,tick,reset,resetMachines,label,walls,machines,doors,cabinets,exploded,burning};
}

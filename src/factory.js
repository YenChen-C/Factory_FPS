/* Authored procedural geometry; coordinates in metres, derived from CAD. */
function makeFactory(THREE, D, options={}) {
 const root=new THREE.Group(), ceiling=new THREE.Group(), labels=[], doorDefs=[], colliders=[];
 root.name='Factory_3F';ceiling.name='Ceiling';root.add(ceiling);
 const colors={wall:0xb6b9b5,trim:0x777d80,floor:0xc9cdcb,blue:0x858fc5,body:0xe0e1e3,screen:0x252832,metal:0xaab8c1,wire:0xb9c8d0,black:0x26323d,glass:0x83b5c6,white:0xe8ebeb,teal:0x387c86,yellow:0xdeb65e,skin:0xe8be9d};
 const mats={};for(const [k,c]of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:k==='metal'||k==='wire'?.3:.7,metalness:k==='metal'||k==='wire'?.8:.05});
 mats.lamp=new THREE.MeshStandardMaterial({color:0xf5fbff,emissive:0xd9ecff,emissiveIntensity:.7});
 const boxGeo=new THREE.BoxGeometry(1,1,1),cylGeo=new THREE.CylinderGeometry(1,1,1,10),sphereGeo=new THREE.SphereGeometry(1,10,6),bucket=new Map(),ceilingBucket=new Map(),tmp=new THREE.Object3D();
 let currentMachine=null;
 function add(type,mat,x,y,z,w,h,d,rx=0,ry=0,rz=0,parent=null){
  if(parent===ceiling){const key=type+':'+mat;if(!ceilingBucket.has(key))ceilingBucket.set(key,[]);ceilingBucket.get(key).push([x,y,z,w,h,d,rx,ry,rz,null]);return;}
  if(parent){let mesh=new THREE.Mesh(type==='box'?boxGeo:type==='cyl'?cylGeo:sphereGeo,mats[mat]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.set(rx,ry,rz);parent.add(mesh);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
  let k=type+':'+mat; if(!bucket.has(k))bucket.set(k,[]);bucket.get(k).push([x,y,z,w,h,d,rx,ry,rz,currentMachine]);
 }
 const box=(mat,x,y,z,w,h,d,ry=0,parent=null)=>add('box',mat,x,y,z,w,h,d,0,ry,0,parent);
 const cyl=(mat,x,y,z,r,h,rx=0,rz=0,parent=null)=>add('cyl',mat,x,y,z,r,h,r,rx,0,rz,parent);
 const sphere=(mat,x,y,z,rx,ry,rz,parent=null)=>add('sphere',mat,x,y,z,rx,ry,rz,0,0,0,parent);
 function rod(mat,a,b,r=.018,parent=null){let dir=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),mid=new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);add('cyl',mat,mid.x,mid.y,mid.z,r,dir.length(),r,e.x,e.y,e.z,parent);}
 function poly(shape,mat,bottom,height,parent=root){let s=new THREE.Shape(shape.outer.map(p=>new THREE.Vector2(p[0],p[1])));for(const h of shape.holes||[])s.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(p[0],p[1]))));let g=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:1});let a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getY(i),y=a.getZ(i)+bottom;a.setXYZ(i,x,y,z);}if(!g.index){for(let i=0;i<a.count;i+=3){let x=a.getX(i+1),y=a.getY(i+1),z=a.getZ(i+1);a.setXYZ(i+1,a.getX(i+2),a.getY(i+2),a.getZ(i+2));a.setXYZ(i+2,x,y,z);}}g.computeVertexNormals();if(mat==='floor'||(mat==='white'&&parent===ceiling)){const uv=g.attributes.uv;for(let i=0;i<a.count;i++)uv.setXY(i,a.getX(i),a.getZ(i));}let mesh=new THREE.Mesh(g,mats[mat]);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}

 if(typeof document!=='undefined'){
 function surfaceTexture(isCeiling){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=isCeiling?'#d5d6d0':'#c9cdcb';ctx.fillRect(0,0,256,256);
 if(!isCeiling){let seed=17;for(let i=0;i<7000;i++){seed=(seed*1664525+1013904223)>>>0;let x=seed%256;seed=(seed*1664525+1013904223)>>>0;let y=seed%256;ctx.fillStyle=i%2?'#c0c4c2':'#d4d7d5';ctx.fillRect(x,y,1,1);}}
 ctx.fillStyle=isCeiling?'#999e9d':'#929a97';ctx.fillRect(0,0,256,isCeiling?4:2);ctx.fillRect(0,0,isCeiling?4:2,256);
 if(!isCeiling){ctx.fillStyle='#89918e';for(let i=0;i<5;i++)ctx.fillRect(120+i*3,124,1,10);}
 const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(isCeiling?1/1.2:1/0.6,isCeiling?1/1.2:1/0.6);t.colorSpace=THREE.SRGBColorSpace;return t;}
 mats.floor.map=surfaceTexture(false);mats.floor.roughness=.65;mats.ceiling=mats.white.clone();mats.ceiling.map=surfaceTexture(true);
 }
 poly({outer:D.floor},'floor',-.18,.18);
 const wallMeshes=[];for(const w of D.walls){const m=poly(w,'wall',0,CFG.floorHeight);m.name='DestructibleWall_'+wallMeshes.length;wallMeshes.push(m);colliders.push({kind:'polygon',outer:w.outer,holes:w.holes||[]});}
 for(const c of D.columns||[]){box('wall',c.x,CFG.floorHeight/2,c.z,c.w,CFG.floorHeight,c.d);box('trim',c.x,.065,c.z,c.w+.025,.13,c.d+.025);colliders.push({kind:'box',x:c.x,z:c.z,w:c.w,d:c.d});}
 // Recessed ceiling and fixtures share a manifest and follow the floor boundary.
 const roof=poly({outer:D.floor},'white',CFG.floorHeight,.15,ceiling);if(mats.ceiling)roof.material=mats.ceiling;
 for(const f of D.fixtures){for(const offset of [-.72,.72]){box('metal',f.x,CFG.floorHeight-.037,f.z+offset,2.35,.075,.12,0,ceiling);box('lamp',f.x,CFG.floorHeight-.082,f.z+offset,2.27,.015,.065,0,ceiling);}}
 for(const f of D.objects){
 currentMachine=f.kind==='machine'?f.name:null;
 const {x,z,w,d,kind}=f;const sy=kind==='cabinet'?CFG.cabinetHeight/1.295:1;const yaw=f.yaw||0,co=Math.cos(yaw),si=Math.sin(yaw);
 function b(m,xx,y,zz,ww,h,dd){box(m,x+xx*co-zz*si,y*sy,z+xx*si+zz*co,ww,h*sy,dd,yaw);}
 function c(m,xx,y,zz,r,h){cyl(m,x+xx*co-zz*si,y,z+xx*si+zz*co,r,h);}
 if(kind==='machine'){
 const machineKey=String(f.name).toUpperCase().replace(/^UF0+(?=\d)/,'UF');
 if(machineKey==='UF580'){
 b('black',0,.07,0,w*.92,.14,d*.92);b('body',0,.65,0,w*.96,1.16,d*.94);b('body',.28*w,1.35,-.1*d,w*.4,.55,d*.7);b('screen',.28*w,1.38,-.46*d,w*.33,.32,.02);b('blue',0,.40,-.477*d,w*.9,.06,.016);b('body',-.25*w,1.38,.20*d,w*.36,.48,d*.28);b('screen',-.25*w,1.42,.048*d,w*.29,.29,.015);b('black',-.25*w,1.08,-.24*d,w*.30,.025,d*.24);
 }else{
  // cabinet, operator console, raised monitor and circular test chamber
  const bw=w*.97,bd=d*.96; b('black',0,.09,0,bw*.93,.16,bd*.93);b('body',-.14*w,.61,0,w*.69,1.05,bd);
  b('blue',-.15*w,1.22,-.03*d,w*.65,.25,d*.84);b('blue',.34*w,.83,0,w*.27,1.5,d*.96);
  b('blue',.31*w,1.48,-.23*d,w*.35,.52,d*.42);b('black',.31*w,1.49,-.451*d,w*.27,.34,.018);b('screen',.31*w,1.50,-.463*d,w*.22,.265,.012);
  b('trim',-.34*w,1.15,-.47*d,w*.31,.13,.15);b('body',-.34*w,1.35,-.46*d,w*.30,.28,.08);b('screen',-.34*w,1.37,-.506*d,w*.245,.20,.015);
  c('trim',-.14*w,1.355,-.015*d,Math.min(w,d)*.19,.022);c('black',-.14*w,1.369,-.015*d,Math.min(w,d)*.145,.014);
  b('metal',-.34*w,1.09,-.53*d,w*.3,.02,.14);b('black',.18*w,.62,-.494*d,.04,.17,.012);
  c('yellow',.25*w,1.09,-.45*d,.034,.03);}
 b('black',.30*w,1.02,-.493*d,w*.18,.18,.015);b('metal',-.26*w,1.19,-.43*d,.045,.35,.045);b('body',-.26*w,1.50,-.43*d,w*.32,.33,.10);b('screen',-.26*w,1.52,-.487*d,w*.26,.23,.018);c('metal',.36*w,1.95,.25*d,.018,.44);c('teal',.36*w,2.13,.25*d,.035,.055);c('yellow',.36*w,2.19,.25*d,.035,.055);
 labels.push({machine:f.name,text:f.name,x,y:1.82,z,color:'#eff6ff',width:1.05});
  colliders.push({kind:'polygon',outer:f.outline,holes:[]});
 }else if(kind==='rack'){
  for(const xx of [-w/2+.025,w/2-.025])for(const zz of [-d/2+.025,d/2-.025]){c('metal',xx,.9,zz,.022,1.8);c('black',xx,.02,zz,.027,.04);}
  for(const h of [.16,.70,1.24,1.78]){
   b('metal',0,h,-d/2,w,.025,.02);b('metal',0,h,d/2,w,.025,.02);b('metal',-w/2,h,0,.02,.025,d);b('metal',w/2,h,0,.02,.025,d);
   for(let xx=-w/2+.055;xx<w/2;xx+=.11)b('wire',xx,h,0,.009,.009,d);
   for(let zz=-d/2+.08;zz<d/2;zz+=.16)b('wire',0,h,zz,w,.009,.009);
  }
  // sparse storage trays leave chrome construction visible
  if(Number(f.id.split('-').pop())%3===0){b('teal',0,.28,0,w*.6,.21,d*.68);b('body',0,.83,0,w*.44,.22,d*.62);}
  colliders.push({kind:'box',x,z,w,d});
 }else if(kind==='table'){
  b('metal',0,.76,0,w,.07,d);for(const xx of [-w/2+.07,w/2-.07])for(const zz of [-d/2+.07,d/2-.07])b('metal',xx,.36,zz,.05,.72,.05);
  if(w>1.1){b('black',0,.88,0,.08,.25,.06);b('screen',0,1.05,.04,.4,.26,.04);b('black',0,.809,-.17,.36,.025,.13);}
  colliders.push({kind:'box',x,z,w,d});
 }else{
  b('metal',0,.065,0,w*.91,.13,d*.91);b('body',0,.67,0,w,1.25,d);b('trim',0,.67,-d/2-.005,.012,1.1,.015);b('black',w*.08,.75,-d/2-.022,.035,.2,.025);colliders.push({kind:'box',x,z,w,d});
 }
 }
 currentMachine=null;
 // Air showers: keep the approved doorway width and existing CAD door leaves.
 for(const a of D.airUnits){const{x,z,w,d,name}=a;for(const s of [-1,1]){box('metal',x+s*(w/2-.1),1.15,z,.18,2.3,d);for(const h of [.5,1.15,1.8])for(const zz of [-d*.29,d*.29])sphere('black',x+s*(w/2-.199),h,z+zz,.025,.05,.05);}
 box('metal',x,2.27,z,w,.1,d);box('metal',x,.025,z,w,.05,d);box('screen',x+w/2-.205,1.4,z-d*.23,.016,.20,.12);labels.push({text:name+' 風淋室',x,y:2.52,z,width:1.4});
 for(const s of [-1,1])colliders.push({kind:'box',x:x+s*(w/2-.1),z,w:.18,d});}
 const turnstiles=[];
 for(const t of D.turnstiles){const{x,z}=t,side=t.side||1;box('metal',x,.5,z,.28,1,.56);box('black',x,1.03,z,.3,.06,.58);let hub=new THREE.Group();hub.position.set(x+side*.2,.85,z);root.add(hub);for(let i=0;i<3;i++){let a=i*Math.PI*2/3;rod('metal',[0,0,0],[side*.15,Math.sin(a)*.38,Math.cos(a)*.38],.023,hub);}turnstiles.push(hub);colliders.push({kind:'box',x,z,w:.28,d:.56});}
 for(const b of D.barriers||[]){box('metal',b.x,b.h/2,b.z,b.w,b.h,b.d);colliders.push({kind:'box',x:b.x,z:b.z,w:b.w,d:b.d});}
 for(const rail of D.rails||[]){for(const end of [rail.a,rail.b])cyl('metal',end[0],rail.h/2,end[1],.023,rail.h);rod('metal',[rail.a[0],rail.h,rail.a[1]],[rail.b[0],rail.h,rail.b[1]],.025);}
 // Source-resolved sanitary fittings and stair treads.
 for(const s of D.sanitary){let{x,z,kind}=s;if(kind==='basin'){box('white',x,.77,z,.52,.14,.4);sphere('metal',x,.841,z,.16,.01,.115);rod('metal',[x,.84,z+.10],[x,.99,z+.10],.018);rod('metal',[x,.99,z+.10],[x,.99,z-.02],.018);}else if(kind==='urinal'){sphere('white',x,.63,z,.18,.4,.2);sphere('trim',x,.69,z-.15,.10,.22,.018);}else{box('white',x,.52,z+.19,.41,.67,.19);sphere('white',x,.27,z-.04,.24,.24,.34);sphere('trim',x,.48,z-.06,.18,.015,.25);sphere('white',x,.49,z-.06,.145,.014,.20);}colliders.push({kind:'box',x,z,w:.5,d:.6});}
 for(const s of D.stairs){for(let i=0;i<s.steps;i++)box('trim',s.x,.07+i*.07,s.z+i*.24,s.w,.14+i*.14,.24);colliders.push({kind:'box',x:s.x,z:s.z+s.steps*.12,w:s.w,d:s.steps*.24});}
 for(const a of D.doors){
  const h=a.hinge,angle=a.angle,w=a.r;const group=new THREE.Group();group.name=a.id;group.position.set(h[0],0,h[1]);group.rotation.y=-angle;root.add(group);
  const H=a.height||2.1;box(a.type==='sliding'?'glass':'teal',w/2,H/2,0,w-.035,H-.035,.05,0,group);box('glass',w/2,H*.67,-.028,w*.68,H*.34,.016,0,group);box('metal',w*.82,H*.48,-.048,.035,.15,.035,0,group);box('metal',w*.82,H*.48,.048,.035,.15,.035,0,group);
  const ux=Math.cos(angle),uz=Math.sin(angle);for(const u of [0,w])box('trim',h[0]+u*ux,H/2,h[1]+u*uz,.055,H,.17,angle);
  box('wall',h[0]+w*.5*ux,(CFG.floorHeight+H)/2,h[1]+w*.5*uz,w+.06,CFG.floorHeight-H,.17,-angle);
  if(a.type==='sliding'){box('metal',h[0]+w/2,2.25,h[1],w*2.1,.12,.22);box('black',h[0]+w/2,2.20,h[1]-.13,.12,.07,.08);labels.push({text:'自動門',x:h[0]+w/2,y:2.5,z:h[1],width:1.2});}
  doorDefs.push({...a,group,open:false,t:0,target:0});
 }
 // CAD floor strokes remain a reference layer, independently toggled.
 const pts=[];for(const ps of D.plan)for(let i=1;i<ps.length;i++)pts.push(ps[i-1][0],.012,ps[i-1][1],ps[i][0],.012,ps[i][1]);
 let lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));let cad=new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({color:0x405869,transparent:true,opacity:.42}));cad.name='CAD_reference';cad.visible=false;root.add(cad);
 // Keep machine instances isolated from furniture, even when their base materials match.
 const machineEntries=[],machineMeshes=[],stateMats=new Map();
 const normalizeMachine=options.normalizeMachine||(v=>String(v).trim().toUpperCase().replace(/^UF0+(?=\d)/,'UF'));
 const machineObjects=D.objects.filter(o=>o.kind==='machine');
 function makeBatch(k,arr,material){const type=k.split(':')[0],mesh=new THREE.InstancedMesh(type==='box'?boxGeo:type==='cyl'?cylGeo:sphereGeo,material,arr.length);mesh.name=k;arr.forEach((a,i)=>{tmp.position.set(a[0],a[1],a[2]);tmp.scale.set(a[3],a[4],a[5]);tmp.rotation.set(a[6],a[7],a[8]);tmp.updateMatrix();mesh.setMatrixAt(i,tmp.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);return mesh;}
 for(const[k,arr]of bucket){const fixed=arr.filter(a=>!a[9]);if(fixed.length)makeBatch(k,fixed,mats[k.split(':')[1]]);for(const a of arr)if(a[9])machineEntries.push({k,a,key:normalizeMachine(a[9])});}
 for(const [k,arr]of ceilingBucket){const mesh=makeBatch(k,arr,mats[k.split(':')[1]]);root.remove(mesh);ceiling.add(mesh);}
 const stateColors={down:0xff3030,abnormal:0xffca16,work:0x24ef75};
 const halo=new THREE.Group();halo.count=0;halo.visible=false;const lightPool=[];
 let activeStates=new Map(),glowing=[],selectedMachines=null;
 function setMachineSelection(names){selectedMachines=new Set(names.map(normalizeMachine));updateMachineStates(new Map(activeStates));}
 function updateMachineStates(input){
  activeStates=new Map();for(const [key,status]of input){const normalized=String(status).trim().toLowerCase();activeStates.set(normalizeMachine(key),normalized==='abnor'?'abnormal':normalized);}
  for(const mesh of machineMeshes){root.remove(mesh);mesh.dispose();}machineMeshes.length=0;
  const groups=new Map();for(const e of machineEntries){if(selectedMachines&&!selectedMachines.has(e.key))continue;let status=activeStates.get(e.key)||'',effect=stateColors[status]?status:'normal',key=e.k+':'+effect;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e.a);}
  for(const [key,arr]of groups){const parts=key.split(':'),matName=parts[1],effect=parts[2];let material=mats[matName];if(effect!=='normal'){let mk=matName+':'+effect;if(!stateMats.has(mk)){let m=material.clone(),c=new THREE.Color(stateColors[effect]);m.color.lerp(c,effect==='work'?.12:.60);m.emissive.copy(c);m.emissiveIntensity=.12;m.name=mk;stateMats.set(mk,m);}material=stateMats.get(mk);}let mesh=makeBatch(key,arr,material);mesh.userData.machineKeys=arr.map(a=>normalizeMachine(a[9]));mesh.userData.machineState=effect;machineMeshes.push(mesh);}
  halo.count=0;
 }
 function updateStatusLights(){}
 updateMachineStates(new Map());
 const avatar=new THREE.Group();avatar.name='Player';root.add(avatar);sphere('white',0,1.51,0,.17,.21,.17,avatar);sphere('skin',0,1.51,-.145,.12,.12,.035,avatar);box('teal',0,.97,0,.37,.64,.23,0,avatar);box('white',0,1.11,-.123,.27,.11,.025,0,avatar);
 const limbs=[];for(const s of [-1,1]){let leg=new THREE.Group();leg.position.set(s*.1,.7,0);avatar.add(leg);box('white',0,-.30,0,.13,.58,.14,0,leg);box('black',0,-.64,-.045,.14,.12,.24,0,leg);limbs.push(leg);let arm=new THREE.Group();arm.position.set(s*.245,1.22,0);avatar.add(arm);box('white',0,-.25,0,.12,.49,.12,0,arm);sphere('white',0,-.51,0,.07,.09,.07,arm);limbs.push(arm);}
 return {wallMeshes,setMachineSelection,root,ceiling,cad,labels,doors:doorDefs,colliders,avatar,limbs,turnstiles,mats,updateMachineStates,updateStatusLights,machineMeshes,statusHalo:halo,getMachineStates:()=>new Map(activeStates)};
}
if(typeof module!=='undefined')module.exports={makeFactory};

/* S1.2 procedural assets. Metres, +Y up, -Z forward. Shared geometries/materials. */
function makeGameModels(T){
 const geo={box:new T.BoxGeometry(1,1,1),ell:new T.SphereGeometry(1,12,8),tube:new T.CylinderGeometry(1,1,1,10)},materials=new Map();
 function part(parent,name,type,c,p,s){let material=materials.get(c);if(!material){material=new T.MeshStandardMaterial({color:c,roughness:.72,metalness:.08,flatShading:true});materials.set(c,material);}const m=new T.Mesh(geo[type],material);m.name=name;m.position.set(...p);m.scale.set(...s);parent.add(m);return m;}
 const box=(g,n,c,x,y,z,w,h,d)=>part(g,n,'box',c,[x,y,z],[w,h,d]);
 const ell=(g,n,c,x,y,z,w,h,d)=>part(g,n,'ell',c,[x,y,z],[w,h,d]);
 function tube(g,n,c,x,y,z,r,l){const m=part(g,n,'tube',c,[x,y,z],[r,l,r]);m.rotation.x=Math.PI/2;return m;}
 function gun(id){if(!GUNS[id])throw Error('Unknown weapon '+id);const g=new T.Group(),dark=0x252d33,steel=0x687780,accent=GUNS[id].color;
 g.name=GUNS[id].name;g.userData.weaponId=id;const length={pistol:.24,rifle:.70,smg:.43,shotgun:.79,sniper:.98}[id];g.userData.length=length;
 box(g,'receiver',dark,0,.015,-.14,.073,.09,.29);
 box(g,'grip',dark,0,-.095,-.005,.061,.18,.073).rotation.x=-.17;
 box(g,'trigger_guard_bottom',steel,0,-.092,-.09,.016,.013,.095);box(g,'trigger_guard_front',steel,0,-.055,-.132,.016,.08,.013);
 box(g,'trigger',dark,0,-.047,-.081,.012,.045,.018).rotation.x=.25;
 tube(g,'barrel',steel,0,.015,-(length+.20)/2,.015,length-.20);
 tube(g,'muzzle',dark,0,.015,-length,.022,.04);
 const magazine=new T.Group();magazine.name='magazine';magazine.position.set(0,-.115,id==='pistol'?-.006:-.145);g.add(magazine);g.userData.magazine=magazine;
 if(id==='pistol'){
  box(g,'slide',steel,0,.055,-.11,.078,.055,.245);box(magazine,'magazine_base',dark,0,-.055,0,.072,.025,.08);
  for(let j=0;j<5;j++)box(g,'slide_serration_'+j,0x303b43,.040,.055,-.02-j*.012,.003,.038,.004);
 }else{
  box(g,'stock_beam',steel,0,.007,.13,.037,.035,.25);box(g,'buttstock',accent,0,-.015,.25,.065,.13,.18);
  box(g,'buttpad',dark,0,-.015,.34,.075,.15,.02);
  if(id==='shotgun'){
   tube(g,'magazine_tube',dark,0,-.045,-.40,.019,.47);
   box(g,'pump_foreend',0x845b40,0,-.025,-.40,.092,.09,.20);
   for(let j=0;j<7;j++)box(g,'pump_rib_'+j,dark,0,-.025,-.32-j*.025,.096,.092,.008);
   box(magazine,'shell_loading_port',0xb39755,0,.044,-.02,.022,.016,.06);
  }else{
   const mag=box(magazine,'detachable_magazine',dark,0,-.035,0,id==='smg'?.033:.052,id==='sniper'?.095:.21,.075);mag.rotation.x=id==='rifle'?-.15:0;
   const end=id==='smg'?.32:id==='sniper'?.54:.49;
   box(g,'handguard',accent,0,.01,-(end+.24)/2,.082,.082,end-.24);
   for(let j=0;j<5;j++)box(g,'handguard_vent_'+j,dark,.043,.023,-.25-j*(end-.25)/5,.004,.022,.015);
  }
  if(id==='sniper'){
   box(g,'scope_mount',dark,0,.095,-.13,.034,.055,.14);tube(g,'scope',dark,0,.14,-.18,.037,.27);tube(g,'scope_objective',steel,0,.14,-.325,.045,.05);tube(g,'scope_lens',0x386777,0,.14,-.352,.037,.003);
   box(g,'bolt_handle',steel,.07,.008,-.08,.095,.018,.018);ell(g,'bolt_knob',dark,.12,.008,-.08,.021,.021,.021);
  }else{box(g,'rear_sight',dark,0,.083,-.015,.055,.036,.024);box(g,'front_sight',dark,0,.082,-length+.065,.016,.07,.019);}
 }
 return g;
 }
 function character(kind='trump'){
 const enemy=kind!=='trump',colors={A1:0xe3e6e1,B1:0x80b4db,C1:0xd5a1b5},cloth=enemy?colors[kind]:0x23334f,skin=0xd8a07f,g=new T.Group(),legs=[],arms=[];
 if(enemy&&!colors[kind])throw Error('Unknown character '+kind);g.name=enemy?'Cleanroom_'+kind:'Trump_lowpoly';g.userData.characterId=kind;
 ell(g,'torso',cloth,0,1.05,0,enemy?.225:.25,.35,.145);box(g,'waist',cloth,0,.80,0,.35,.12,.24);
 const head=ell(g,'head',enemy?cloth:skin,0,1.53,0,.16,.205,.155);
 if(enemy){
  ell(g,'face_opening',0xbfa48d,0,1.54,-.128,.117,.128,.042);
  ell(g,'hood_crown',cloth,0,1.675,-.01,.151,.065,.142);
  ell(g,'mask',0xf1f2ed,0,1.483,-.161,.122,.070,.035);
  for(let i=0;i<3;i++)box(g,'mask_pleat_'+i,0xcbd4d2,0,1.46+i*.019,-.197,.19,.003,.002);
  box(g,'vest',0x939fa5,0,1.10,-.142,.32,.30,.055);
  for(const side of [-1,1]){box(g,'vest_strap',0x89969a,side*.12,1.28,-.10,.045,.14,.04);box(g,'belt_pouch',0x6e797e,side*.15,.86,-.13,.078,.10,.065);}
  box(g,'belt',0x626c72,0,.88,-.005,.38,.045,.265);box(g,'zipper',0xc3c9c6,0,.95,-.16,.008,.1,.012);
 }else{
  box(g,'shirt',0xf1eee3,0,1.23,-.144,.13,.29,.026);
  for(const side of [-1,1]){const lapel=box(g,'lapel',0x344661,side*.085,1.22,-.158,.06,.24,.018);lapel.rotation.z=side*-.32;ell(g,'ear',skin,side*.155,1.54,0,.028,.047,.025);}
  box(g,'tie',0xb52237,0,1.16,-.165,.045,.27,.018);const tip=box(g,'tie_tip',0xb52237,0,1.02,-.164,.034,.034,.018);tip.rotation.z=Math.PI/4;
  ell(g,'tie_knot',0x961e30,0,1.31,-.173,.028,.026,.016);
  ell(g,'nose',skin,0,1.54,-.16,.027,.039,.035);box(g,'mouth',0x9b6554,0,1.46,-.148,.058,.008,.008);
  ell(g,'hair_crown',0xc4ad72,0,1.70,.012,.16,.055,.15);
  for(let i=0;i<5;i++){const h=ell(g,'swept_hair_'+i,0xd7be82,-.09+i*.035,1.703-i*.008,-.078,.078,.035,.075);h.rotation.z=-.25;}
  for(let i=0;i<2;i++)ell(g,'jacket_button',0x101929,.025,.96+i*.1,-.147,.008,.008,.006);
 }
 for(const side of [-1,1]){
  box(g,'eye_white',0xf0ece3,side*.055,1.58,-.158,.038,.017,.008);box(g,'eye',0x405466,side*.055,1.58,-.164,.012,.014,.004);
  box(g,'brow',enemy?0x655849:0xb49b67,side*.055,1.605,-.156,.051,.012,.009);
  const l=new T.Group();l.name=side<0?'leg_left':'leg_right';l.position.set(side*.10,.78,0);g.add(l);legs.push(l);
  ell(l,'trouser_thigh',cloth,0,-.20,0,.093,.24,.11);ell(l,'trouser_shin',cloth,0,-.50,0,.076,.22,.09);
  ell(l,enemy?'boot_cover':'dress_shoe',enemy?cloth:0x192026,0,-.70,-.048,.088,.075,.145);
  box(l,'sole',enemy?0xa6b3b6:0x11161b,0,-.758,-.048,.153,.028,.248);
  const a=new T.Group();a.name=side<0?'arm_left':'arm_right';a.position.set(side*.25,1.29,0);g.add(a);arms.push(a);
  ell(a,'sleeve_upper',cloth,0,-.125,0,.084,.18,.085);ell(a,'sleeve_lower',cloth,0,-.355,-.012,.068,.13,.067);
  box(a,'cuff',enemy?cloth:0xe9e9e1,0,-.45,-.012,.105,.027,.10);ell(a,enemy?'glove':'hand',enemy?0xe6e9e4:skin,0,-.493,-.01,.06,.065,.047);
 }
 const mount=new T.Group();mount.name='weapon_mount';mount.position.set(.12,1.18,-.22);g.add(mount);let weapon=gun('pistol');mount.add(weapon);
 if(!enemy){const pack=new T.Group();pack.name='jetpack';g.add(pack);box(pack,'jetpack_body',0x475766,0,1.07,.20,.24,.31,.13);for(const side of [-1,1]){part(pack,'jet_tank','tube',0x8b979c,[side*.15,1.06,.21],[.055,.35,.055]);part(pack,'jet_nozzle','tube',0x303d47,[side*.15,.86,.21],[.067,.07,.067]);}}
 const gripRig=new T.Group();gripRig.name='Two_hand_grip';g.add(gripRig);const gripHands=[],rigArms=[];
 for(let i=0;i<2;i++){const upper=ell(gripRig,'upper_arm_'+i,cloth,0,0,0,.080,1,.080),lower=ell(gripRig,'forearm_'+i,cloth,0,0,0,.065,1,.065),hand=ell(gripRig,'grip_hand_'+i,enemy?0xe6e9e4:skin,0,0,0,.056,.062,.050);rigArms.push({upper,lower,hand});gripHands.push(hand);}
 function segment(m,a,b,r){m.position.copy(a).add(b).multiplyScalar(.5);const d=b.clone().sub(a);m.scale.set(r,d.length()/2+.025,r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 function poseGun(enabled=true,reloading=false){gripRig.visible=enabled;for(const a of arms)for(const c of a.children)c.visible=!enabled;if(!enabled)return;mount.updateMatrix();const id=weapon.userData.weaponId;
 const right=new T.Vector3(0,-.095,-.005).applyMatrix4(mount.matrix),left=(reloading?weapon.userData.magazine.position.clone().add(new T.Vector3(0,-.05,0)):new T.Vector3(id==='pistol'?-.045:0,id==='pistol'?-.10:-.045,id==='pistol'?-.045:id==='shotgun'?-.30:-.22)).applyMatrix4(mount.matrix);
 for(let i=0;i<2;i++){const shoulder=arms[i].position.clone(),target=i===0?left:right,dir=target.clone().sub(shoulder),d=dir.length(),u=dir.normalize();const axis=new T.Vector3(i===0?-.6:.6,-1,.2);axis.addScaledVector(u,-axis.dot(u)).normalize();const bend=Math.sqrt(Math.max(0,.34*.34-d*d/4)),elbow=shoulder.clone().addScaledVector(u,d/2).addScaledVector(axis,bend);segment(rigArms[i].upper,shoulder,elbow,.080);segment(rigArms[i].lower,elbow,target,.065);rigArms[i].hand.position.copy(target);rigArms[i].hand.quaternion.copy(mount.quaternion);}
 }
 poseGun(true);
 return {poseGun,gripHands,gripRig,group:g,head,legs,arms,mount,weapon,setGun(id){mount.remove(weapon);weapon=gun(id);mount.add(weapon);this.weapon=weapon;poseGun(true);}};
 }
 return {gun,character};
}
if(typeof module!=='undefined')module.exports=makeGameModels;

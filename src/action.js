/* Original industrial action layer, inspired by the reference's interaction vocabulary.
 * All effects use bounded meshes; no external assets, bloom, or paid services. */
function makeArenaActions(T,api){
 const {scene,avatar,player:P,space:S}=api;
 let energy=100,attack=null,chain=0,lastLight=-99,nextAttack=0,dash=null,nextDash=0,nextPulse=0,shake=0;
 const effects=[],numbers=[],blade=new T.Group();blade.name='ArcBlade';avatar.group.add(blade);blade.visible=false;
 const steel=new T.MeshStandardMaterial({color:0xb9cad2,metalness:.72,roughness:.32});
 const dark=new T.MeshStandardMaterial({color:0x293642,metalness:.4,roughness:.6});
 const edge=new T.MeshBasicMaterial({color:0x7ee5e6});const cube=new T.BoxGeometry(1,1,1);
 function part(name,material,x,y,z,w,h,d){const m=new T.Mesh(cube,material);m.name=name;m.position.set(x,y,z);m.scale.set(w,h,d);blade.add(m);}
 part('blade',steel,0,0,-.56,.075,.027,.88);part('cutting_edge',edge,-.042,0,-.57,.012,.029,.88);
 part('spine',dark,.042,0,-.50,.015,.035,.73);part('guard',dark,0,0,-.10,.25,.075,.045);part('grip',dark,0,0,.025,.055,.065,.20);
 for(let i=0;i<5;i++)part('grip_band',steel,0,0,-.05+i*.035,.058,.07,.007);
 const ringGeo=new T.RingGeometry(.88,1,40),numCanvas=()=>document.createElement('canvas');
 function removeEffect(e){scene.remove(e.mesh);e.mesh.material.dispose();if(e.arc)e.mesh.geometry.dispose();}
 function ring(pos,color,scale=1,life=.32,arc=false,yaw=0){
  if(effects.length>=20)removeEffect(effects.shift());
  const mat=new T.MeshBasicMaterial({color,transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false});
  const g=arc?new T.RingGeometry(.72,1,22,1,0,Math.PI*1.1):ringGeo,m=new T.Mesh(g,mat);
  m.position.copy(pos);m.rotation.x=-Math.PI/2;m.rotation.z=yaw;scene.add(m);effects.push({mesh:m,life,total:life,scale,arc});
 }
 function number(pos,value,color='#ffdb9a'){
  if(numbers.length>=16){const n=numbers.shift();scene.remove(n.mesh);n.texture.dispose();n.mesh.material.dispose();}
  const c=numCanvas();c.width=128;c.height=64;const ctx=c.getContext('2d');ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#16222c';ctx.strokeText(String(Math.ceil(value)),64,46);ctx.fillStyle=color;ctx.fillText(String(Math.ceil(value)),64,46);
  const texture=new T.CanvasTexture(c),m=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));m.scale.set(.6,.3,1);m.position.copy(pos).add(new T.Vector3(0,1.85,0));scene.add(m);numbers.push({mesh:m,texture,life:.65});shake=Math.max(shake,.08);
 }
 function allowed(cost){return api.mode()==='combat'&&!api.shop()&&P.hp>0&&energy>=cost;}
 function strike(heavy=false){const t=api.time(),cost=heavy?20:8;if(!allowed(cost)||attack||dash||t<nextAttack)return false;
  energy-=cost;chain=heavy?0:(t-lastLight<1.1?chain%3+1:1);if(!heavy)lastLight=t;
  attack={kind:heavy?'heavy':'light',start:t,duration:heavy?.70:.36,hitAt:t+(heavy?.29:.12),done:false,combo:chain};nextAttack=t+attack.duration;
  api.cancelGun();api.sound(heavy?115:330,heavy?.18:.10,'triangle',.035);return true;
 }
 function strikeHit(a){const origin=P.pos.clone().add(new T.Vector3(0,1.15*api.height(),0)),front=new T.Vector3(-Math.sin(api.yaw()),0,-Math.cos(api.yaw())),range=(a.kind==='heavy'?2.35:1.9)*api.reach(),damage=a.kind==='heavy'?65:[0,24,30,42][a.combo];
  const structure=S.cast(origin,front,range);if(structure)api.structureHit(structure,damage);api.agvMelee(origin,front,range,damage);let hits=0;for(const e of api.enemies())if(e.hp>0){const delta=e.pos.clone().sub(P.pos),d=delta.length();if(d<=range&&Math.abs(delta.y)<1.4&&delta.clone().setY(0).normalize().dot(front)>.05&&S.clear(origin,e.pos.clone().add(new T.Vector3(0,1.15*api.height(),0)))){api.hurt(e,damage);e.flash=Math.max(e.flash,a.kind==='heavy'?.65:.18);hits++;}}
  ring(origin.clone().addScaledVector(front,.45),a.kind==='heavy'?0xffb267:0x76dddd,range,.24,true,api.yaw()+.12);
  if(hits){shake=.16;api.notify(a.kind==='heavy'?'重斬命中':a.combo+' 段連擊',.7);}else api.notify(a.kind==='heavy'?'重斬':'連斬 '+a.combo,.5);
 }
 function pulse(){const t=api.time();if(!allowed(45)||attack||dash||t<nextPulse)return false;energy-=45;nextPulse=t+7;api.cancelGun();
  const origin=P.pos.clone().add(new T.Vector3(0,1.1*api.height(),0));let hits=0;
  for(const e of api.enemies())if(e.hp>0){const d=e.pos.distanceTo(P.pos);if(d<4&&S.clear(origin,e.pos.clone().add(new T.Vector3(0,1.1,0)))){api.hurt(e,Math.round(55*(1-d/8)));e.flash=Math.max(e.flash,1);hits++;}}
  api.structureBlast(origin,4,55);ring(P.pos.clone().add(new T.Vector3(0,.04,0)),0x79dfe8,4,.65);ring(origin,0xd4f4ff,3.7,.45);
  shake=.20;api.sound(65,.28,'sawtooth',.06);api.notify('衝擊波 · 命中 '+hits+' 名',1);return true;
 }
 function dodge(){const t=api.time();if(!allowed(20)||dash||attack||t<nextDash||P.pos.y>.05&&!S.blocked(P.pos.x,P.pos.y-.06,P.pos.z,.20,1.7*api.height()))return false;
  energy-=20;nextDash=t+1.25;const k=api.keys(),x=Number(k.has('KeyD'))-Number(k.has('KeyA')),z=Number(k.has('KeyW'))-Number(k.has('KeyS')),y=api.yaw();
  const dir=new T.Vector3(Math.cos(y)*x-Math.sin(y)*(x||z?z:1),0,-Math.sin(y)*x-Math.cos(y)*(x||z?z:1)).normalize();
  dash={dir,end:t+.24,invulnerableUntil:t+.16};api.cancelGun();api.endHook();api.sound(230,.10,'triangle',.025);return true;
 }
 function tick(dt){const t=api.time();energy=Math.min(100,energy+dt*10);shake=Math.max(0,shake-dt);
  if(dash){if(t>=dash.end)dash=null;else{const distance=9*dt,steps=Math.ceil(distance/.06);for(let i=0;i<steps;i++)if(!api.move(dash.dir.x*distance/steps,dash.dir.z*distance/steps)){dash=null;break;}}}
  if(attack){if(!attack.done&&t>=attack.hitAt){attack.done=true;strikeHit(attack);}if(t>=attack.start+attack.duration)attack=null;}
  blade.visible=!!attack;avatar.weapon.visible=!attack;
  if(attack){const p=Math.min(1,(t-attack.start)/attack.duration),s=Math.sin(p*Math.PI);blade.position.set(.16,1.15,-.20);blade.rotation.set(attack.kind==='heavy'?-1.6+p*2.8:0,attack.kind==='heavy'?0:(p-.5)*4.8*(attack.combo%2?1:-1),-.12);avatar.arms[1].rotation.x=-1.15-s*.8;avatar.arms[0].rotation.x=-.9-s*.6;avatar.group.rotation.y=api.yaw()+Math.sin(p*Math.PI*2)*.16;}
  for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;const p=1-e.life/e.total;e.mesh.scale.setScalar(e.scale*(.25+.75*p));e.mesh.material.opacity=Math.max(0,.75*(1-p));if(e.life<=0){removeEffect(e);effects.splice(i,1);}}
  for(let i=numbers.length-1;i>=0;i--){const n=numbers[i];n.life-=dt;n.mesh.position.y+=dt*.55;n.mesh.material.opacity=Math.max(0,n.life/.65);if(n.life<=0){scene.remove(n.mesh);n.texture.dispose();n.mesh.material.dispose();numbers.splice(i,1);}}
 }
 function reset(){energy=100;attack=null;dash=null;chain=0;lastLight=-99;nextAttack=nextDash=nextPulse=shake=0;blade.visible=false;avatar.weapon.visible=true;for(const e of effects){removeEffect(e);}effects.length=0;for(const n of numbers){scene.remove(n.mesh);n.texture.dispose();n.mesh.material.dispose();}numbers.length=0;}
 return {strike,pulse,dodge,tick,reset,number,kill:()=>energy=Math.min(100,energy+10),busy:()=>!!attack||!!dash,dashing:()=>!!dash,invulnerable:()=>!!dash&&api.time()<dash.invulnerableUntil,shake:()=>shake,state:()=>({energy,combo:chain,attacking:!!attack,dashing:!!dash,dashCooldown:Math.max(0,nextDash-api.time()),pulseCooldown:Math.max(0,nextPulse-api.time()),effects:effects.length,numbers:numbers.length})};
}

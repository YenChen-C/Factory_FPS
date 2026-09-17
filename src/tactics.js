function makeTactics(T,S,api){
 let agv=null;const navPoints=()=>S.candidates(api.player.pos.clone().setY(0),0,999);
 function goal(pos,min=3){const candidates=navPoints().filter(p=>p.distanceTo(pos)>min&&p.distanceTo(pos)<32);return candidates.length?candidates[Math.floor(Math.random()*candidates.length)].clone():pos.clone();}
 function init(e){e.awareness='巡邏';e.lastKnown=null;e.lastSeen=-99;e.facing=Math.random()*Math.PI*2;e.patrol=goal(e.pos);e.route=[];e.routeAt=0;e.searchEnd=0;}
 function forget(e){e.lastKnown=null;e.lastSeen=-99;e.searchEnd=0;e.visible=false;e.awareness='巡邏';e.route=[];e.routeAt=0;e.stuck=0;e.patrol=goal(e.pos);e.cooldown=Math.max(e.cooldown||0,1);}
 function hear(pos,radius=20){if(api.passive?.())return;for(const e of api.enemies())if(e.hp>0&&e.flash<=0&&e.pos.distanceTo(pos)<radius&&!e.visible){e.lastKnown=pos.clone();e.lastSeen=api.time();e.searchEnd=api.time()+15;e.awareness='搜索';e.routeAt=0;}}
 function think(e,dt){const now=api.time(),eye=e.pos.clone().add(new T.Vector3(0,e.boss?1.65:1.36,0)),target=api.player.pos.clone().add(new T.Vector3(0,api.playerHeight()*1.15,0)),delta=target.clone().sub(eye),distance=delta.length(),front=new T.Vector3(-Math.sin(e.facing),0,-Math.cos(e.facing));
  e.visible=!api.passive?.()&&e.flash<=0&&distance<30&&(distance<3||delta.clone().setY(0).normalize().dot(front)>.173648)&&S.clear(eye,target);
  if(e.visible){e.lastKnown=api.player.pos.clone();e.lastSeen=now;e.searchEnd=now+15;e.awareness='追擊';e.facing=Math.atan2(-delta.x,-delta.z);}
  else if(e.lastKnown&&now<e.searchEnd)e.awareness='搜索';else{e.lastKnown=null;e.awareness='巡邏';}
  let destination=e.lastKnown||e.patrol;if(!destination||(!e.lastKnown&&destination.distanceTo(e.pos)<.65)){e.patrol=goal(e.pos);destination=e.patrol;e.routeAt=0;}
  const keepDistance=e.creeper?1:e.boss?7:6;let movement=null;
  if(e.visible){if(distance>keepDistance)movement=api.player.pos.clone();else if(!e.creeper&&distance<2.5)movement=e.pos.clone().add(e.pos.clone().sub(api.player.pos).setY(0).normalize());}
  else if(destination.distanceTo(e.pos)>.7){if(now>=e.routeAt){e.route=S.path(e.pos,destination);e.routeAt=now+2.5;}while(e.route.length&&e.route[0].distanceTo(e.pos)<.20)e.route.shift();movement=e.route[0];}
  else if(e.lastKnown)e.facing+=dt*1.4;
  if(movement&&e.flash<.2){const v=movement.clone().sub(e.pos).setY(0);if(v.length()>.04){if(!e.visible)e.facing=Math.atan2(-v.x,-v.z);v.normalize().multiplyScalar((e.boss?.95:1.25+e.tier*.2)*(e.status['水']?.end>now?.9:1)*dt);const moved=api.move(e,v.x,0,v.z,e.boss?2.04:1.7,e.boss?.264:.22);e.stuck=moved?0:e.stuck+dt;api.openDoor(e.pos);if(e.stuck>1){e.routeAt=0;if(!e.lastKnown)e.patrol=goal(e.pos);e.stuck=0;}e.model.legs[0].rotation.x=Math.sin(now*8)*.4;e.model.legs[1].rotation.x=-e.model.legs[0].rotation.x;}}
  e.model.group.rotation.y=e.facing;return distance;
 }
 function clear(){if(agv){api.scene.remove(agv.mesh);agv.label.material.map.dispose();agv.label.material.dispose();agv=null;}}
 function spawnAGV(){clear();const points=navPoints().filter(p=>!S.blocked(p.x,0,p.z,.34,.8));if(!points.length)return;const pos=points[Math.floor(Math.random()*points.length)].clone(),g=new T.Group();g.name='Supply_AGV';
  api.mesh(g,'box',0xb9c5c6,0,.20,0,.52,.27,.64);api.mesh(g,'box',0x355568,0,.35,0,.48,.04,.59);for(const x of [-.25,.25])for(const z of [-.22,.22])api.mesh(g,'sphere',0x242d35,x,.10,z,.055,.09,.09);
  const cargo=new T.Group();g.add(cargo);api.mesh(cargo,'box',0xbe9a56,0,.49,0,.40,.24,.44);api.mesh(cargo,'box',0xe4dfbf,0,.615,0,.065,.01,.44);api.mesh(g,'box',0x7be8ca,0,.26,-.327,.23,.07,.015);
  const c=document.createElement('canvas');c.width=256;c.height=64;const tex=new T.CanvasTexture(c),label=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));label.position.set(0,.95,0);label.scale.set(1.7,.425,1);g.add(label);g.position.copy(pos);api.scene.add(g);
  agv={pos,mesh:g,hp:50,cargo,supplies:3,items:['heal','armor','grenade'],label,canvas:c,route:[],goal:goal(pos),next:0,last:''};
 }
 function tickAGV(dt){if(!agv)return;const a=agv,now=api.time();if(a.hp>0&&a.pos.distanceTo(api.player.pos)>1.6){if(now>=a.next||!a.route.length){if(!a.goal||a.pos.distanceTo(a.goal)<.8)a.goal=goal(a.pos);a.route=S.path(a.pos,a.goal);a.next=now+4;}while(a.route.length&&a.route[0].distanceTo(a.pos)<.2)a.route.shift();if(a.route.length){const v=a.route[0].clone().sub(a.pos).setY(0).normalize().multiplyScalar(dt*.85);if(!api.move(a,v.x,0,v.z,.72,.34)){a.goal=goal(a.pos);a.next=now+1;}else a.mesh.rotation.y=Math.atan2(-v.x,-v.z);api.openDoor(a.pos);}}
  a.mesh.position.copy(a.pos);const text=a.hp>0?'AGV '+Math.ceil(a.hp)+'/50 · 補給 '+a.supplies:'AGV 已損毀';if(text!==a.last){const c=a.canvas.getContext('2d');c.clearRect(0,0,256,64);c.fillStyle='#142835dd';c.fillRect(0,0,256,64);c.font='bold 23px sans-serif';c.textAlign='center';c.fillStyle=a.hp>0?'#a8f3cf':'#e5a095';c.fillText(text,128,40);a.label.material.map.needsUpdate=true;a.last=text;}}
 function damageAGV(n,source){if(!agv||agv.hp<=0||source==='playerGun')return false;agv.hp=Math.max(0,agv.hp-n);if(!agv.hp){agv.supplies=0;agv.cargo.visible=false;agv.mesh.rotation.z=.15;api.notify('AGV 已損毀，補給遺失',2);}return true;}
 function supply(){if(!agv||agv.hp<=0||!agv.supplies||agv.pos.distanceTo(api.player.pos)>1.7||!S.clear(api.player.pos.clone().add(new T.Vector3(0,.7,0)),agv.pos.clone().add(new T.Vector3(0,.7,0)),true))return false;for(let i=0;i<agv.items.length;i++){if(api.supply(agv.items[i])){agv.items.splice(i,1);agv.supplies--;agv.cargo.visible=agv.supplies>0;return true;}}api.notify('生命與防彈衣已滿，補給保留',1);return true;}
 return {init,forget,hear,think,spawnAGV,tickAGV,damageAGV,supply,clear,getAGV:()=>agv};
}

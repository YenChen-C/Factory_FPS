/* Factory Strike: deterministic, renderer-independent match simulation. */
(function(root){'use strict';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const WEAPONS={
 rifle:{name:'AR-36',label:'突擊步槍',model:'rifle',damage:28,mag:30,reserve:120,interval:.105,reload:2.25,spread:.012,recoil:.014,range:90,auto:true},
 carbine:{name:'C4 Compact',label:'卡賓步槍',model:'rifle',damage:25,mag:30,reserve:150,interval:.087,reload:2.0,spread:.016,recoil:.012,range:70,auto:true},
 smg:{name:'V9 Vector',label:'衝鋒槍',model:'smg',damage:20,mag:32,reserve:160,interval:.067,reload:1.75,spread:.024,recoil:.009,range:48,auto:true},
 shotgun:{name:'M12 Breacher',label:'霰彈槍',model:'shotgun',damage:13,pellets:8,mag:8,reserve:40,interval:.83,reload:2.7,spread:.095,recoil:.06,range:32,auto:false},
 sniper:{name:'SR-8',label:'栓動狙擊槍',model:'sniper',damage:88,mag:5,reserve:25,interval:1.18,reload:3.0,spread:.002,recoil:.055,range:150,auto:false,scope:true},
 dmr:{name:'DMR-21',label:'精準射手步槍',model:'sniper',damage:48,mag:15,reserve:75,interval:.28,reload:2.4,spread:.006,recoil:.024,range:120,auto:false,scope:true},
 lmg:{name:'LM-60',label:'輕機槍',model:'rifle',damage:29,mag:60,reserve:180,interval:.115,reload:4.0,spread:.025,recoil:.02,range:90,auto:true},
 pistol:{name:'P9 Service',label:'半自動手槍',model:'pistol',damage:31,mag:15,reserve:60,interval:.23,reload:1.45,spread:.014,recoil:.02,range:50,auto:false},
 knife:{name:'Combat Knife',label:'戰鬥刀',model:'knife',damage:55,mag:1,reserve:0,interval:.55,reload:0,spread:0,recoil:0,range:1.9,auto:false}
};
const MODES={tdm:{name:'團隊死鬥',tag:'TEAM DEATHMATCH',limit:50,time:480,respawn:true},ts:{name:'回合殲滅',tag:'TEAM SURVIVOR',limit:5,time:150,rounds:true},ctf:{name:'奪旗行動',tag:'CAPTURE THE FLAG',limit:3,time:600,respawn:true},bomb:{name:'爆破任務',tag:'BOMB & DEFUSE',limit:5,time:150,rounds:true},practice:{name:'射擊練習',tag:'TRAINING RANGE',limit:Infinity,time:0,respawn:true}};
function sphereRay(o,d,c,r,max){const q=o.clone().sub(c),b=q.dot(d),disc=b*b-q.lengthSq()+r*r;if(disc<0)return null;const t=-b-Math.sqrt(disc);return t>0&&t<max?t:null;}
function createMatch({space:S,data:D,doors=[],rng=Math.random,emit=()=>{}}){
 const M={actors:[],projectiles:[],smokes:[],drops:[],flags:[],time:0,phase:'menu',mode:'tdm',scores:[0,0],round:1,remaining:480,result:null,difficulty:1,teamSize:5,friendlyFire:false,events:[],bases:[],sites:[],player:null,bomb:null,command:'attack',commandUntil:0};
 let seq=0,thinkIndex=0,navTokens=0,component=[],spawnPools=[],roundEnd=0,fx=0;
 const event=(type,p={})=>{const e={type,time:M.time,...p};M.events.push(e);if(M.events.length>40)M.events.shift();emit(e);};
 const sample=a=>a[Math.floor(rng()*a.length)],dist=(a,b)=>a.distanceTo(b),alive=a=>a.hp>0;
 function prepareMap(){
  const seen=new Uint8Array(S.walk.length);let biggest=[];
  for(let i=0;i<S.walk.length;i++)if(S.walk[i]&&!seen[i]){const group=[i];seen[i]=1;for(let j=0;j<group.length;j++){const p=S.point(group[j]);for(const k of (S.neighbors?S.neighbors(group[j]):[[.65,0],[-.65,0],[0,.65],[0,-.65]].map(([x,z])=>S.idx(p.x+x,p.z+z)))){if(k>=0&&S.walk[k]&&!seen[k]){seen[k]=1;group.push(k);}}}if(group.length>biggest.length)biggest=group;}
  component=biggest.map(S.point);if(component.length<20)throw Error('廠區可通行區域不足');
  const center=component.reduce((a,p)=>a.add(p),V()).divideScalar(component.length);
  let a=component.reduce((a,p)=>dist(p,center)>dist(a,center)?p:a,component[0]);
  let b=component.reduce((b,p)=>dist(p,a)>dist(b,a)?p:b,component[0]);
  // Pull bases away from dead-end map extremities, while retaining long lanes.
  const pickNear=p=>component.filter(q=>dist(q,p)<7).sort((a,b)=>dist(a,center)-dist(b,center))[0]||p;
  a=pickNear(a);b=pickNear(b);M.bases=[a.clone(),b.clone()];
  spawnPools=M.bases.map(base=>component.filter(p=>dist(p,base)<6));
  const route=S.path(a,b);const mid=route[Math.floor(route.length*.55)]||center;
  M.sites=[mid.clone(),component.filter(p=>dist(p,mid)>12&&dist(p,a)>12&&dist(p,b)>8).sort((a,b)=>dist(a,center)-dist(b,center))[0]?.clone()||mid.clone()];
 }
 function safeSpawn(team){const pool=spawnPools[team],foes=M.actors.filter(a=>alive(a)&&a.team!==team);let best=sample(pool),score=-Infinity;for(let i=0;i<32;i++){const p=sample(pool);if(S.blocked(p.x,0,p.z,.23,1.7))continue;const separation=Math.min(30,...foes.map(a=>dist(p,a.pos))),occupied=M.actors.some(a=>alive(a)&&dist(a.pos,p)<.7);const s=separation+rng()*2-(occupied?100:0);if(s>score){score=s;best=p;}}return best.clone();}
 function equip(a,loadout){a.loadout={primary:'rifle',vest:true,helmet:true,medic:false,...loadout};a.active=a.loadout.primary;a.inventory=[a.loadout.primary,'pistol','knife'];a.ammo={};a.reserve={};for(const id of a.inventory){a.ammo[id]=WEAPONS[id].mag;a.reserve[id]=WEAPONS[id].reserve;}a.armor=a.loadout.vest?100:0;a.helmet=a.loadout.helmet?60:0;a.frag=2;a.flash=1;a.smoke=1;}
 function spawn(a){a.pos.copy(safeSpawn(a.team));a.hp=100;a.bleed=0;a.leg=0;a.stamina=100;a.vel.set(0,0,0);a.grounded=true;a.crouch=false;a.slide=0;a.wallJumps=0;a.lastWall=null;a.wallTime=-10;a.bandage=0;a.reload=0;a.cooldown=0;a.flashTime=0;a.invulnerable=M.time+(MODES[M.mode].rounds?0:2);a.respawnAt=0;a.target=null;a.memory=null;a.memoryUntil=0;a.path=[];a.pathTime=0;a.facing=Math.atan2(-(M.bases[1-a.team].x-a.pos.x),-(M.bases[1-a.team].z-a.pos.z));a.pitch=0;a.nextThink=0;a.burst=0;a.grenadeCD=M.time+8+rng()*10;equip(a,a.loadout);event('spawn',{actor:a.id});}
 function newActor(team,human=false,loadout={}){const a={id:seq++,team,human,name:human?'YOU':['Kestrel','Ghost','Nova','Rook','Viper','Echo','Atlas','Jade'][M.actors.filter(a=>a.team===team).length%8],pos:V(),vel:V(),hp:100,kills:0,deaths:0,assists:0,captures:0,shots:0,hits:0,damage:0,contributors:{},loadout,think:0,phase:rng()*6.28};M.actors.push(a);spawn(a);return a;}
 function resetObjectives(){M.flags=M.bases.map((p,team)=>({team,base:p.clone(),pos:p.clone(),carrier:null,home:true,returnAt:0}));M.bomb={carrier:M.actors.find(a=>a.team===M.attackTeam&&alive(a))?.id??null,pos:null,planted:false,site:-1,progress:0,worker:null,explodeAt:0};}
 function start(options={}){M.mode=MODES[options.mode]?options.mode:'tdm';M.teamSize=clamp(+options.teamSize||5,2,8);M.difficulty=clamp(+options.difficulty||1,.5,1.6);M.friendlyFire=!!options.friendlyFire;M.actors=[];M.projectiles=[];M.smokes=[];M.drops=[];M.events=[];M.time=0;M.scores=[0,0];M.round=1;M.attackTeam=0;M.result=null;M.phase='warmup';M.warmup=3;M.remaining=MODES[M.mode].time;seq=0;
  if(!component.length)prepareMap();const team=options.team===1?1:0;M.player=newActor(team,true,options.loadout);
  if(M.mode==='practice'){for(let i=0;i<5;i++)newActor(1-team,false,{primary:'rifle'});for(const a of M.actors.slice(1)){a.pos.copy(sample(component.filter(p=>dist(p,M.player.pos)>5&&dist(p,M.player.pos)<22))||sample(component));}}
  else for(let t=0;t<2;t++)for(let i=M.actors.filter(a=>a.team===t).length;i<M.teamSize;i++)newActor(t,false,{primary:sample(['rifle','rifle','smg','carbine','shotgun','dmr','sniper']),vest:true,helmet:rng()>.25,medic:i%4===2});
  resetObjectives();event('start',{mode:M.mode});return M;
 }
 function end(winner,reason){if(M.phase==='ended')return;M.phase='ended';M.result={winner,reason};event('matchEnd',{winner,reason});}
 function finishRound(winner,reason){if(M.phase!=='active')return;if(winner!==null)M.scores[winner]++;event('roundEnd',{winner,reason});if(M.scores.some(s=>s>=MODES[M.mode].limit)){end(winner,reason);return;}M.phase='intermission';roundEnd=M.time+5;}
 function nextRound(){M.round++;M.attackTeam=(M.round-1)%2;M.remaining=MODES[M.mode].time;M.projectiles=[];M.smokes=[];M.drops=[];M.phase='warmup';M.warmup=3;for(const a of M.actors)spawn(a);resetObjectives();event('roundStart',{round:M.round});}
 function kill(a,by,weapon){if(a.hp<0||a.respawnAt)return;a.hp=0;a.deaths++;a.bleed=0;a.bandage=0;a.reload=0;a.vel.set(0,0,0);a.respawnAt=M.time+(M.mode==='practice'?.05:4);
  if(by&&by.id!==a.id){if(by.team!==a.team){by.kills++;if(M.mode==='tdm')M.scores[by.team]++;}else by.kills--;}
  for(const [id,t]of Object.entries(a.contributors))if(M.time-t<8&&+id!==by?.id){const other=M.actors.find(x=>x.id===+id);if(other)other.assists++;}a.contributors={};
  for(const flag of M.flags)if(flag.carrier===a.id){flag.carrier=null;flag.pos.copy(a.pos);flag.home=false;flag.returnAt=M.time+20;event('flagDrop',{team:flag.team});}
  if(M.bomb?.carrier===a.id&&!M.bomb.planted){M.bomb.carrier=null;M.bomb.pos=a.pos.clone();}
  if(M.mode!=='practice')M.drops.push({id:a.active==='knife'?a.loadout.primary:a.active,pos:a.pos.clone(),ammo:a.ammo[a.active]||0,expire:M.time+25});
  event('kill',{actor:a.id,by:by?.id??null,weapon,name:a.name,killer:by?.name||'環境'});
 }
 function hurt(a,damage,zone='body',by=null,weapon='rifle'){if(!alive(a)||M.phase!=='active'||a.invulnerable>M.time)return 0;if(by&&by.team===a.team&&by.id!==a.id&&!M.friendlyFire)return 0;if(M.mode==='practice'&&a.human)return 0;
  let value=damage*(zone==='head'?2.6:zone==='legs'?.65:1);let absorbed=0;if(zone==='head'&&a.helmet>0){absorbed=Math.min(a.helmet,value*.55);a.helmet-=absorbed;}else if(zone==='body'&&a.armor>0){absorbed=Math.min(a.armor,value*.48);a.armor-=absorbed;}value-=absorbed;a.hp=Math.max(0,a.hp-value);a.bandage=0;if(by&&by.team!==a.team){by.damage+=value;a.contributors[by.id]=M.time;}if(zone==='legs')a.leg=Math.min(1,a.leg+.45);if(value>9&&weapon!=='bleed')a.bleed=Math.min(3,a.bleed+value*.012);a.lastDamage=M.time;
  event('hurt',{actor:a.id,by:by?.id??null,damage:value,zone});if(a.hp<=0)kill(a,by,weapon);return value;
 }
 function eye(a){return a.pos.clone().add(V(0,a.crouch||a.slide>0?1.05:1.57,0));}
 function dir(a){return V(-Math.sin(a.facing)*Math.cos(a.pitch),Math.sin(a.pitch),-Math.cos(a.facing)*Math.cos(a.pitch));}
 function smokeBlocks(a,b){const ab=b.clone().sub(a),len=ab.length();ab.normalize();return M.smokes.some(s=>s.end>M.time&&sphereRay(a,ab,s.pos,Math.min(4,(M.time-s.start)*2),len)!==null||s.end>M.time&&(dist(a,s.pos)<3.5||dist(b,s.pos)<3.5));}
 function canSee(a,b){return !smokeBlocks(a,b)&&S.clear(a,b);}
 function ray(o,d,max,shooter){let hit=S.cast(o,d,max),limit=hit?.distance||max;for(const a of M.actors)if(a!==shooter&&alive(a)){const scale=a.crouch||a.slide>0?.69:1;for(const [h,r,zone]of [[1.57,.19,'head'],[1.05,.3,'body'],[.42,.25,'legs']]){const t=sphereRay(o,d,a.pos.clone().add(V(0,h*scale,0)),r,limit);if(t!==null){limit=t;hit={actor:a,distance:t,point:o.clone().addScaledVector(d,t),zone};}}}return hit||{distance:max,point:o.clone().addScaledVector(d,max)};}
 function noise(a,radius=30){for(const b of M.actors)if(!b.human&&b.team!==a.team&&alive(b)&&dist(a.pos,b.pos)<radius&&b.flashTime<=0){b.memory=a.pos.clone();b.memoryUntil=M.time+9;}}
 function reload(a){if(!alive(a)||a.active==='knife'||a.reload>0||a.bandage>0)return;const w=WEAPONS[a.active];if(a.ammo[a.active]>=w.mag||a.reserve[a.active]<=0)return;a.reload=w.reload;a.reloadTotal=w.reload;event('reload',{actor:a.id});}
 function switchWeapon(a,id){if(!a.inventory.includes(id)||!alive(a))return;a.active=id;a.reload=0;a.bandage=0;a.cooldown=Math.max(.18,a.cooldown);event('switch',{actor:a.id,weapon:id});}
 function shoot(a){if(!alive(a)||M.phase!=='active'||a.reload>0||a.bandage>0||a.cooldown>0)return false;const w=WEAPONS[a.active];if(a.active!=='knife'&&a.ammo[a.active]<=0){reload(a);return false;}if(a.active!=='knife')a.ammo[a.active]--;a.cooldown=w.interval;a.invulnerable=0;a.shots++;
  const o=eye(a),forward=dir(a),moving=Math.hypot(a.vel.x,a.vel.z),spread=w.spread*(a.aim?.28:1)*(a.crouch?.65:1)*(1+moving*.12)*(a.grounded?1:2.1)*(a.flashTime>0?4:1);
  let hitAny=false;for(let i=0;i<(w.pellets||1);i++){const d=forward.clone().add(V((rng()-.5)*spread,(rng()-.5)*spread,(rng()-.5)*spread)).normalize(),h=ray(o,d,w.range,a);if(h.actor){const fall=a.active==='shotgun'?clamp(1-h.distance/45,.25,1):clamp(1-h.distance/(w.range*2),.6,1);const damage=hurt(h.actor,w.damage*fall,h.zone,a,a.active);if(damage>0)hitAny=true;}event('shot',{actor:a.id,weapon:a.active,from:o.clone(),to:h.point.clone(),hit:!!h.actor,zone:h.zone,normal:h.normal?.clone(),first:i===0});}if(hitAny)a.hits++;if(a.active!=='knife'){noise(a);a.pitch=clamp(a.pitch+w.recoil*(a.aim?.7:1),-1.45,1.45);}return true;
 }
 function bandage(a){if(!alive(a)||a.bandage>0||(!a.bleed&&!a.leg))return false;a.bandage=a.loadout.medic?1.5:3;a.bandageTotal=a.bandage;a.reload=0;event('bandage',{actor:a.id});return true;}
 function heal(a,b){if(!alive(a)||!alive(b)||a.team!==b.team||dist(a.pos,b.pos)>2.2||!S.clear(eye(a),eye(b)))return false;b.bleed=0;b.leg=0;b.hp=Math.max(b.hp,a.loadout.medic?90:50);event('heal',{actor:b.id,by:a.id});return true;}
 function move(a,dx,dy,dz){const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))/.1)),h=a.crouch||a.slide>0?1.15:1.72;let wall=null;
  for(let i=0;i<n;i++){if(!S.blocked(a.pos.x+dx/n,a.pos.y,a.pos.z,.22,h))a.pos.x+=dx/n;else{a.vel.x=0;wall=V(-Math.sign(dx),0,0);}if(!S.blocked(a.pos.x,a.pos.y,a.pos.z+dz/n,.22,h))a.pos.z+=dz/n;else{a.vel.z=0;wall=V(0,0,-Math.sign(dz));}if(a.pos.y+dy/n<=0){a.pos.y=0;if(a.vel.y<0){a.grounded=true;a.wallJumps=0;}a.vel.y=0;}else if(!S.blocked(a.pos.x,a.pos.y+dy/n,a.pos.z,.22,h)){a.pos.y+=dy/n;a.grounded=false;}else{if(dy<0){a.grounded=true;a.wallJumps=0;}a.vel.y=0;}}
  if(wall){a.lastWall=wall;a.wallTouch=M.time;}return wall;
 }
 function jump(a){if(!alive(a)||a.stamina<10||a.bandage>0)return false;if(a.grounded){a.vel.y=5.6;a.grounded=false;a.stamina-=10;a.slide=0;event('jump',{actor:a.id});return true;}if(a.lastWall&&M.time-a.wallTouch<.15&&M.time-a.wallTime>.25&&a.wallJumps<3){a.vel.addScaledVector(a.lastWall,6.8);a.vel.y=5.6;a.wallTime=M.time;a.wallJumps++;a.stamina-=12;event('walljump',{actor:a.id});return true;}
  // Vault a waist-high obstacle only if both the landing and swept rise are clear.
  const forward=V(-Math.sin(a.facing),0,-Math.cos(a.facing)),p=a.pos.clone().addScaledVector(forward,.7);if(a.pos.y<1.15&&S.blocked(p.x,0,p.z,.22,1.7)&&!S.blocked(p.x,1.2,p.z,.22,1.7)&&!S.blocked(a.pos.x,1.2,a.pos.z,.22,1.7)){a.vel.y=5.6;a.vel.addScaledVector(forward,3);a.stamina-=12;return true;}return false;
 }
 function crouch(a,on){if(on&&!a.crouch&&a.grounded&&Math.hypot(a.vel.x,a.vel.z)>5.5&&a.stamina>=15){a.slide=.85;a.slideDir=V(a.vel.x,0,a.vel.z).normalize();a.stamina-=15;event('slide',{actor:a.id});}if(on)a.crouch=true;else if(!S.blocked(a.pos.x,a.pos.y,a.pos.z,.22,1.72))a.crouch=false;}
 function movement(a,input,dt){if(!alive(a))return;const forward=V(-Math.sin(a.facing),0,-Math.cos(a.facing)),right=V(Math.cos(a.facing),0,-Math.sin(a.facing)),wish=forward.multiplyScalar(input.z||0).addScaledVector(right,input.x||0);if(wish.length()>1)wish.normalize();
  let speed=input.walk?2.15:a.crouch?2.25:a.aim?3.1:4.8;const sprint=input.sprint&&!a.aim&&!a.crouch&&a.stamina>0&&wish.length()>.1&&a.bandage<=0;
  if(sprint){speed=7.9;a.stamina=Math.max(0,a.stamina-dt*(a.loadout.vest?23:15));}else a.stamina=Math.min(100,a.stamina+dt*(wish.length()>.1?13:25));if(a.leg)speed*=1-.42*a.leg;if(a.bandage>0)speed*=.45;if(a.active==='lmg')speed*=.86;
  if(a.slide>0){a.slide=Math.max(0,a.slide-dt);wish.copy(a.slideDir);speed=6+3*a.slide;}const acc=a.grounded?14:2.4,k=1-Math.exp(-acc*dt);a.vel.x+=(wish.x*speed-a.vel.x)*k;a.vel.z+=(wish.z*speed-a.vel.z)*k;
  a.vel.y-=17*dt;const fall=a.vel.y;move(a,a.vel.x*dt,a.vel.y*dt,a.vel.z*dt);if(a.grounded&&fall<-10)hurt(a,(-fall-10)*8,'legs',null,'fall');
  if(a.grounded&&Math.hypot(a.vel.x,a.vel.z)>2.5&&M.time>(a.nextStep||0)){a.nextStep=M.time+(sprint?.28:.42);event('step',{actor:a.id});if(sprint)noise(a,11);}
 }
 function throwItem(a,type='frag'){if(!alive(a)||M.phase!=='active'||a[type]<=0||a.bandage>0||a.throwCD>M.time)return false;a[type]--;a.throwCD=M.time+.7;const p={id:++fx,owner:a.id,type,pos:eye(a),vel:dir(a).multiplyScalar(13).add(V(0,2.3,0)),fuse:type==='frag'?2.2:1.5,bounces:0};M.projectiles.push(p);event('throw',{actor:a.id,id:p.id,kind:type});return true;}
 function explode(p){const by=M.actors.find(a=>a.id===p.owner);if(p.type==='smoke'){M.smokes.push({id:p.id,pos:p.pos.clone(),start:M.time,end:M.time+15});event('smoke',{pos:p.pos.clone(),id:p.id});return;}
  event('explosion',{pos:p.pos.clone(),kind:p.type});for(const a of M.actors)if(alive(a)){const e=eye(a),distance=dist(e,p.pos),radius=p.type==='frag'?7:13;if(distance>=radius||!S.clear(p.pos,e))continue;if(p.type==='frag')hurt(a,150*(1-distance/radius),'body',by,'frag');else{const facing=dir(a).dot(p.pos.clone().sub(e).normalize());a.flashTime=Math.max(a.flashTime,(1-distance/radius)*(facing>0?4.5:1.1));a.target=null;a.memory=null;a.memoryUntil=0;}}if(by)noise(by,45);
 }
 function interact(a,dt){if(!alive(a))return '';const b=M.bomb;
  if(M.mode==='bomb'){if(!b.planted&&b.carrier===a.id){const site=M.sites.findIndex(p=>dist(a.pos,p)<2.3);if(site>=0){if(dt){if(b.worker!==a.id)b.progress=0;b.worker=a.id;b.progress+=dt;b.workAt=M.time;if(b.progress>=3){b.planted=true;b.carrier=null;b.pos=a.pos.clone();b.site=site;b.explodeAt=M.time+40;b.progress=0;b.worker=null;event('planted',{actor:a.id,site});}}return '按住 F 安裝炸彈';}}
   if(b.planted&&a.team!==M.attackTeam&&dist(a.pos,b.pos)<2.3){if(dt){if(b.worker!==a.id)b.progress=0;b.worker=a.id;b.progress+=dt;b.workAt=M.time;if(b.progress>=5){b.planted=false;finishRound(a.team,'炸彈已拆除');}}return '按住 F 拆除炸彈';}
   if(!b.planted&&b.carrier===null&&b.pos&&a.team===M.attackTeam&&dist(a.pos,b.pos)<1.8){if(dt){b.carrier=a.id;b.pos=null;}return '按 F 拾取炸彈';}
  }
  const patient=M.actors.find(b=>b!==a&&b.team===a.team&&alive(b)&&b.hp<90&&dist(a.pos,b.pos)<2&&S.clear(eye(a),eye(b)));if(patient){if(dt){a.healProgress=(a.healProgress||0)+dt;if(a.healProgress>2){heal(a,patient);a.healProgress=0;}}return '按住 F 治療 '+patient.name;}
  const drop=M.drops.find(d=>dist(d.pos,a.pos)<1.6);if(drop){if(dt){a.inventory[0]=drop.id;a.loadout.primary=drop.id;a.ammo[drop.id]=drop.ammo;a.reserve[drop.id]=WEAPONS[drop.id].mag*2;switchWeapon(a,drop.id);M.drops.splice(M.drops.indexOf(drop),1);}return '按 F 拾取 '+WEAPONS[drop.id].name;}
  const door=doors.find(d=>Math.hypot(a.pos.x-d.hinge[0],a.pos.z-d.hinge[1])<d.r+1.1);if(door){if(dt){door.holdUntil=M.time+4;door.target=1;}return '按 F 開門';}
  return '';
 }
 function objective(a){if(M.mode==='practice'){if(!a.patrol||dist(a.pos,a.patrol)<1)a.patrol=sample(component.filter(p=>dist(p,a.pos)<12))||sample(component);return a.patrol;}
  if(M.commandUntil>M.time&&a.team===M.player.team&&!a.human){if(M.command==='follow'&&alive(M.player))return M.player.pos;if(M.command==='hold')return M.commandPos;}
  if(M.mode==='ctf'){const own=M.flags[a.team],enemy=M.flags[1-a.team];if(enemy.carrier===a.id)return own.base;if(own.carrier!==null){const carrier=M.actors.find(b=>b.id===own.carrier);return carrier.pos;}if(!own.home&&a.id%3===0)return own.pos;if(enemy.carrier!==null){const carrier=M.actors.find(b=>b.id===enemy.carrier);return carrier.pos;}return a.id%4===0?own.base:enemy.pos;}
  if(M.mode==='bomb'){const b=M.bomb;if(b.planted)return b.pos;if(a.team===M.attackTeam){if(b.carrier===null&&b.pos)return b.pos;return M.sites[a.id%2];}return M.sites[a.id%2];}
  if(a.memory&&a.memoryUntil>M.time)return a.memory;if(!a.patrol||dist(a.pos,a.patrol)<1||M.time>a.patrolUntil){const candidates=component.filter(p=>dist(p,M.bases[1-a.team])<20);a.patrol=sample(candidates.length?candidates:component);a.patrolUntil=M.time+15;}return a.patrol;
 }
 function steer(a,target,dt,sprint=false){let goal=target;if(navTokens>0&&(M.time>a.pathTime||!a.path?.length)&&dist(a.pos,target)>1){a.path=S.path(a.pos,target);a.pathTime=M.time+1.5+rng();navTokens--;}
  if(a.path?.length){while(a.path.length&&dist(a.pos,a.path[0])<.16)a.path.shift();goal=a.path[0]||target;}
  const delta=goal.clone().sub(a.pos).setY(0);if(delta.length()<.18)return movement(a,{},dt);const distance=delta.length();delta.normalize();const f=V(-Math.sin(a.facing),0,-Math.cos(a.facing)),r=V(Math.cos(a.facing),0,-Math.sin(a.facing));const factor=Math.min(1,distance/.45);movement(a,{x:delta.dot(r)*factor,z:delta.dot(f)*factor,sprint:sprint&&a.path.length>3},dt);
  if(Math.hypot(a.vel.x,a.vel.z)<.35){a.stuck=(a.stuck||0)+dt;if(a.stuck>1){a.pathTime=0;a.stuck=0;const side=V(delta.z,0,-delta.x).multiplyScalar(rng()<.5?1:-1);move(a,side.x*.3,0,side.z*.3);}}else a.stuck=0;
 }
 function think(a){a.nextThink=M.time+.18+rng()*.12;if(a.flashTime>0||M.mode==='practice'){a.target=null;return;}const visible=M.actors.filter(b=>alive(b)&&b.team!==a.team&&dist(a.pos,b.pos)<42&&b.invulnerable<=M.time).sort((b,c)=>dist(a.pos,b.pos)-dist(a.pos,c.pos));let target=null;for(const b of visible.slice(0,5)){const delta=b.pos.clone().sub(a.pos).normalize(),f=V(-Math.sin(a.facing),0,-Math.cos(a.facing));if(dist(a.pos,b.pos)<6||f.dot(delta)>-.25||a.memory){if(canSee(eye(a),eye(b))){target=b;break;}}}if(target){if(a.target!==target.id)a.reactAt=M.time+(1.7-M.difficulty)*.35+rng()*.22;a.target=target.id;a.memory=target.pos.clone();a.memoryUntil=M.time+10;}else a.target=null;}
 function bot(a,dt){if(M.time>=a.nextThink)think(a);const target=M.actors.find(b=>b.id===a.target&&alive(b));a.aim=false;
  if(target&&a.flashTime<=0){const delta=eye(target).sub(eye(a)),d=delta.length();const idealYaw=Math.atan2(-delta.x,-delta.z),angle=Math.atan2(Math.sin(idealYaw-a.facing),Math.cos(idealYaw-a.facing));a.facing+=clamp(angle,-dt*7,dt*7);const bias=(1.7-M.difficulty)*.018;a.pitch=Math.atan2(delta.y,Math.hypot(delta.x,delta.z))+Math.sin(M.time*3+a.phase)*bias;a.aim=d>12;
   const lateral=Math.sin(M.time*.8+a.phase)>.3?.55:-.55;movement(a,{x:lateral,z:d>19?.7:d<5?-.6:0},dt);
   if(M.time>a.reactAt&&Math.abs(angle)<.13&&canSee(eye(a),eye(target))){const obstruction=ray(eye(a),dir(a),d+1,a);if(!obstruction.actor||obstruction.actor.team!==a.team){if(a.burst<=0||M.time>=a.burstUntil){a.burst=2+Math.floor(rng()*4);a.burstUntil=M.time+.7+rng()*.5;}if(M.time<a.burstUntil&&shoot(a)){a.burst--;if(!a.burst)a.reactAt=M.time+.2+rng()*.3;}}}
   if(M.time>a.grenadeCD&&d>9&&d<23&&a.frag>0&&rng()<dt*.5){throwItem(a,'frag');a.grenadeCD=M.time+18;}
  }else{const goal=objective(a);const delta=goal.clone().sub(a.pos);if(delta.length()>.3){const ideal=Math.atan2(-delta.x,-delta.z),angle=Math.atan2(Math.sin(ideal-a.facing),Math.cos(ideal-a.facing));a.facing+=clamp(angle,-dt*3,dt*3);a.pitch*=Math.exp(-dt*4);}steer(a,goal,dt,dist(a.pos,goal)>14&&a.stamina>30);if(a.bleed&&a.bandage<=0)bandage(a);interact(a,dt);}
  if(a.ammo[a.active]<=0)reload(a);
 }
 function flags(){for(const f of M.flags){if(f.carrier!==null){const a=M.actors.find(a=>a.id===f.carrier);f.pos.copy(a.pos);const own=M.flags[a.team];if(own.home&&dist(a.pos,own.base)<1.5){M.scores[a.team]++;a.captures++;f.carrier=null;f.home=true;f.pos.copy(f.base);event('capture',{actor:a.id,team:a.team});}}else{if(!f.home&&M.time>f.returnAt){f.home=true;f.pos.copy(f.base);event('flagReturn',{team:f.team});}for(const a of M.actors)if(alive(a)&&dist(a.pos,f.pos)<1.3){if(a.team!==f.team){f.carrier=a.id;f.home=false;a.invulnerable=0;event('flagTaken',{actor:a.id,team:f.team});break;}else if(!f.home){f.home=true;f.pos.copy(f.base);event('flagReturn',{team:f.team});}}}}}
 function tick(dt,input={}){dt=clamp(dt,0,.05);if(M.phase==='menu'||M.phase==='ended'||M.paused)return;M.time+=dt;navTokens=2;for(const d of doors){const near=M.actors.some(a=>alive(a)&&Math.hypot(a.pos.x-d.hinge[0],a.pos.z-d.hinge[1])<d.r+1.15&&(!a.human||d.type==='sliding'||d.t>.1));d.target=near||d.holdUntil>M.time?1:0;d.t+=(d.target-d.t)*Math.min(1,dt*5);}
  if(M.phase==='warmup'){M.warmup-=dt;if(M.warmup<=0){M.phase='active';event('live');}return;}if(M.phase==='intermission'){if(M.time>=roundEnd)nextRound();return;}
  if(M.remaining>0)M.remaining=Math.max(0,M.remaining-dt);M.drops=M.drops.filter(d=>d.expire>M.time);M.smokes=M.smokes.filter(s=>s.end>M.time);
  if(M.bomb&&M.time-(M.bomb.workAt||0)>.12){M.bomb.progress=0;M.bomb.worker=null;}
  for(const a of M.actors){if(!alive(a)){if(MODES[M.mode].respawn&&M.time>=a.respawnAt){spawn(a);if(M.mode==='practice'&&!a.human)a.pos.copy(sample(component.filter(p=>dist(p,M.player.pos)>4&&dist(p,M.player.pos)<20))||sample(component));}continue;}
   a.cooldown=Math.max(0,a.cooldown-dt);a.flashTime=Math.max(0,a.flashTime-dt);if(a.reload>0){a.reload-=dt;if(a.reload<=0){const count=Math.min(WEAPONS[a.active].mag-a.ammo[a.active],a.reserve[a.active]);a.ammo[a.active]+=count;a.reserve[a.active]-=count;event('reloaded',{actor:a.id});}}
   if(a.bandage>0){a.bandage-=dt;if(a.bandage<=0){a.bleed=0;a.leg=0;event('bandaged',{actor:a.id});}}
   if(a.bleed>0&&!(M.mode==='practice'&&a.human)){a.hp=Math.max(0,a.hp-a.bleed*dt);if(a.hp<=0){const id=Object.keys(a.contributors).sort((x,y)=>a.contributors[y]-a.contributors[x])[0];kill(a,M.actors.find(b=>b.id===+id),'bleed');continue;}}
   if(a.human){if(input.yaw!==undefined)a.facing=input.yaw;if(input.pitch!==undefined)a.pitch=input.pitch;a.aim=!!input.aim;crouch(a,!!input.crouch);if(input.jump)jump(a);movement(a,input,dt);if(input.fire&&(WEAPONS[a.active].auto||input.firePressed))shoot(a);if(input.use)interact(a,dt);else a.healProgress=0;}else bot(a,dt);
  }
  for(let i=M.projectiles.length-1;i>=0;i--){const p=M.projectiles[i];p.fuse-=dt;p.vel.y-=13*dt;const delta=p.vel.clone().multiplyScalar(dt),hit=S.cast(p.pos,delta.clone().normalize(),delta.length()+.07);if(hit){p.pos.copy(hit.point).addScaledVector(hit.normal,.08);p.vel.reflect(hit.normal).multiplyScalar(.5);p.bounces++;event('bounce',{pos:p.pos.clone()});}else p.pos.add(delta);if(p.pos.y<.08){p.pos.y=.08;p.vel.y=Math.abs(p.vel.y)*.35;p.vel.x*=.9;p.vel.z*=.9;}if(p.fuse<=0){M.projectiles.splice(i,1);explode(p);}}
  if(M.mode==='ctf')flags();if(M.mode==='tdm'||M.mode==='ctf'){if(M.scores.some(s=>s>=MODES[M.mode].limit)||M.remaining<=0)end(M.scores[0]===M.scores[1]?null:M.scores[0]>M.scores[1]?0:1,'比賽結束');}
  if(MODES[M.mode].rounds){const living=[0,1].map(t=>M.actors.filter(a=>a.team===t&&alive(a)).length),b=M.bomb;
   if(M.mode==='bomb'&&b.planted){if(M.time>=b.explodeAt){event('explosion',{pos:b.pos.clone(),kind:'bomb'});finishRound(M.attackTeam,'炸彈引爆');}else if(!living[1-M.attackTeam])finishRound(M.attackTeam,'守方全滅');}
   else if(!living[0]||!living[1])finishRound(!living[0]&&!living[1]?null:living[0]?0:1,'敵隊殲滅');else if(M.remaining<=0)finishRound(M.mode==='bomb'?1-M.attackTeam:null,'回合時間結束');}
 }
 function command(type){M.command=type;M.commandUntil=M.time+18;M.commandPos=M.player.pos.clone();event('command',{command:type});}
 return {M,start,tick,hurt,kill,shoot,reload,switchWeapon,throwItem,bandage,heal,jump,crouch,move,interact,command,eye,dir,ray,canSee,smokeBlocks,safeSpawn,prepareMap,finishRound,end,spawn,get component(){return component;}};
}
root.StrikeCore={WEAPONS,MODES,createMatch,sphereRay};if(typeof module!=='undefined')module.exports=root.StrikeCore;
})(typeof window!=='undefined'?window:globalThis);

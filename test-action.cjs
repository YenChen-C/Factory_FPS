const fs=require('fs'),assert=require('assert');
const harness=fs.readFileSync(__dirname+'/test.cjs','utf8').split("check('offline app")[0];
const {A,T,C}=new Function('require','__dirname',harness+';return {A,T,C};')(require,__dirname);
const V=C.THREE.Vector3,checks=[];function check(name,f){f();checks.push(name);console.log('PASS',name);}
const advance=(s)=>{for(let i=0;i<Math.ceil(s*100);i++){T.setTime(T.getTime()+.01);T.actions.tick(.01);}};
A.start();A.closeShop();
check('actions are blocked during purchase and pause',()=>{assert(!T.actions.strike());assert(!T.actions.dodge());assert(!T.actions.pulse());T.setMode('paused');assert(!T.actions.strike());assert.equal(T.actions.state().energy,100);});
T.setMode('combat');T.spawnEnemy();const e=T.enemies[0];e.hp=e.maxHP=1000;
const points=T.space.candidates(T.player.pos,0,100);let pair;
for(const p of points){const q=p.clone().add(new V(0,0,-1.3));if(!T.space.blocked(q.x,0,q.z)&&T.space.clear(p.clone().setY(1.15),q.clone().setY(1.15))){pair=[p,q];break;}}
assert(pair);T.player.pos.copy(pair[0]);e.pos.copy(pair[1]);T.setView(0,0);
check('three timed strikes deal 24, 30, 42 once each',()=>{for(const d of [24,30,42]){const hp=e.hp;assert(T.actions.strike());assert(!T.actions.strike());advance(.38);assert.equal(e.hp,hp-d);}assert.equal(T.actions.state().combo,3);});
check('heavy strike costs 20 and deals 65 after windup',()=>{T.actions.reset();const hp=e.hp;assert(T.actions.strike(true));assert.equal(T.actions.state().energy,80);advance(.2);assert.equal(e.hp,hp);advance(.15);assert.equal(e.hp,hp-65);advance(.4);});
check('front-facing requirement rejects enemy behind player',()=>{T.actions.reset();T.setView(Math.PI,0);const hp=e.hp;T.actions.strike();advance(.4);assert.equal(e.hp,hp);T.setView(0,0);});
check('pulse has damage falloff and seven-second cooldown',()=>{T.actions.reset();const hp=e.hp;assert(T.actions.pulse());assert(e.hp<hp&&e.hp>=hp-55);assert.equal(T.actions.state().energy,55);assert(!T.actions.pulse());advance(7.01);assert(T.actions.pulse());});
check('dash has a brief invulnerability window',()=>{T.actions.reset();T.player.pos.copy(pair[0]);T.player.hp=100;T.player.armor=0;assert(T.actions.dodge());T.damagePlayer(20);assert.equal(T.player.hp,100);advance(.18);T.damagePlayer(20);assert.equal(T.player.hp,80);advance(.1);assert(!T.actions.dashing());});
check('melee cannot damage through static obstacles',()=>{T.actions.reset();let found;
 for(const p of points){for(let y=0;y<6.28;y+=.3){const dir=new V(-Math.sin(y),0,-Math.cos(y)),h=T.space.cast(p.clone().setY(1.15),dir,.8);if(h&&h.kind==='wall'){found={p,y,q:h.point.clone().addScaledVector(dir,.2).setY(0)};break;}}if(found)break;}
 assert(found);T.player.pos.copy(found.p);T.setView(found.y,0);e.pos.copy(found.q);const hp=e.hp;T.actions.strike();advance(.4);assert.equal(e.hp,hp);
 T.actions.reset();T.actions.dodge();advance(.3);assert(!T.space.blocked(T.player.pos.x,T.player.pos.y,T.player.pos.z));});
check('skill state and effects clear on new round',()=>{T.actions.reset();T.player.pos.copy(pair[0]);T.actions.pulse();assert(T.actions.state().effects>0);T.beginBuy();const s=T.actions.state();assert.equal(s.energy,100);assert.equal(s.effects,0);assert.equal(s.numbers,0);assert.equal(s.pulseCooldown,0);});
fs.writeFileSync(__dirname+'/evidence/action-checks.json',JSON.stringify({passed:true,browserGPUVerified:false,checks},null,2));

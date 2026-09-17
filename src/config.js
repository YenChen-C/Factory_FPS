/* Tunable gameplay defaults. Approved rules take precedence over these balance values. */
const CFG={version:'S1.11',cabinetHP:100,machineBurnSeconds:60,machineBlastRadius:6,machineBlastDamage:200,floorHeight:4.5,wallHP:300,machineHP:200,cabinetHeight:.95,walk:2.8,run:4.4,crouch:1.5,jump:4.1,gravity:12,playerHP:100,armorMax:100,armorAbsorb:.45,buySeconds:20,startMoney:2400,jetDrain:50,jetFill:10,jetRise:2.2,grappleRange:5,grappleSpeed:1.5,grappleCooldown:3,tracerSpeed:80,tracerRadius:.015,enemyHitChance:.75,barrelHP:35,barrelRadius:6,barrelDamage:200,barrelCount:10,dropSeconds:10,maxEnemies:8,elementLevel:3,maxLevel:10,grenadeDamage:150,grenadeRadius:4,grenadeFuse:2.2,flashRadius:9,flashFuse:1.5,particleBudget:160,maxDecals:50,targetFPS:30,shopPrices:{armor:650,grenade:250,flash:180,heal:350}};
const GUNS={
 pistol:{name:'P9 手槍',slot:'side',price:0,damage:19,mag:12,interval:.28,reload:1.2,recoil:.025,range:45,pellets:1,spread:.004,element:'雷',color:0x71899b},
 rifle:{name:'AR-30 步槍',slot:'main',price:1400,damage:23,mag:30,interval:.13,reload:1.7,recoil:.031,range:60,pellets:1,spread:.008,element:'火',color:0x638a71},
 smg:{name:'SM-24 衝鋒槍',slot:'main',price:1100,damage:14,mag:24,interval:.075,reload:1.4,recoil:.024,range:32,pellets:1,spread:.018,element:'水',color:0x527b9e},
 shotgun:{name:'SG-6 霰彈槍',slot:'main',price:1600,damage:10,mag:6,interval:.8,reload:2,recoil:.07,range:22,pellets:7,spread:.075,element:'土',color:0xa48a5b},
 sniper:{name:'SR-5 狙擊槍',slot:'main',price:2300,damage:72,mag:5,interval:1.1,reload:2.3,recoil:.065,range:90,pellets:1,spread:.001,element:'雷',color:0x8a759d}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function gunLevel(xp){return Math.min(CFG.maxLevel,1+Math.floor(Math.sqrt(Math.max(0,xp)/80)));}
function gunStats(id,xp=0){const g=GUNS[id],level=gunLevel(xp),n=level-1;return {...g,id,level,damage:g.damage*(1+n*.035),mag:g.mag+Math.floor(n*g.mag*.04),recoil:g.recoil*(1-n*.045),crit:.04+n*.01,elementChance:level>=CFG.elementLevel?.12+(level-CFG.elementLevel)*.02:0};}
function explosionFalloff(distance,radius,maximum){return maximum*Math.max(0,1-distance/radius);}
function armorDamage(hp,armor,damage,head=false){const absorb=head?0:Math.min(armor,damage*CFG.armorAbsorb);return {hp:Math.max(0,hp-damage+absorb),armor:Math.max(0,armor-absorb),loss:damage-absorb};}
if(typeof module!=='undefined')module.exports={CFG,GUNS,gunLevel,gunStats,explosionFalloff,armorDamage};

const {core,M,start,events}=require('./test.cjs'),assert=require('node:assert/strict');
for(const mode of ['tdm','ts','ctf','bomb']){
 start({mode,teamSize:3});M.player.human=false;const began=Date.now();
 for(let i=0;i<60*640&&M.phase!=='ended';i++)core.tick(1/60,{});
 const planted=events.filter(e=>e.type==='planted').length,captures=events.filter(e=>e.type==='capture').length,rounds=events.filter(e=>e.type==='roundEnd').length;
 console.log('MATCH',JSON.stringify({mode,phase:M.phase,time:Math.round(M.time),score:M.scores,round:M.round,planted,captures,rounds,shots:M.actors.reduce((s,a)=>s+a.shots,0),realMs:Date.now()-began}));
 assert(M.actors.every(a=>Number.isFinite(a.hp)));assert.equal(M.phase,'ended','Full matches must terminate');
 if(mode==='bomb')assert(planted>0,'Bots should plant at least once');if(mode==='ctf')assert(captures>0,'Bots should complete at least one capture');
}
console.log('FULL MATCH RESULT: all four modes completed with objective play');

/* Procedural Web Audio effects: self-contained, cached noise, bounded voices. */
function makeBattleAudio(){
 let ctx=null,master=null,noise=null,voices=0,enabled=true,volume=.65,frame=null,musicPaused=false;
 const el=id=>document.getElementById(id);
 function unlock(){try{if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=enabled?volume:0;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.ratio.value=8;master.connect(limiter);limiter.connect(ctx.destination);noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return true;}catch(e){return false;}}
 function voice(kind,freq,duration,level,filterType='lowpass',cutoff=2500){if(!enabled||volume<=0||voices>=48||!unlock())return;try{const t=ctx.currentTime,source=kind==='noise'?ctx.createBufferSource():ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();if(kind==='noise')source.buffer=noise;else{source.type=kind;source.frequency.setValueAtTime(freq,t);source.frequency.exponentialRampToValueAtTime(Math.max(25,freq*.28),t+duration);}filter.type=filterType;filter.frequency.value=cutoff;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,level),t+.003);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter);filter.connect(gain);gain.connect(master);voices++;source.onended=()=>{voices--;source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);source.stop(t+duration+.01);}catch(e){}}
 const attenuate=d=>1/(1+Math.max(0,d)*.16);
 function gun(id,distance=0,strength=1){const spec={pistol:[155,.12,.26,4200],rifle:[115,.15,.30,3400],smg:[190,.09,.22,5200],shotgun:[75,.32,.44,2100],sniper:[60,.45,.48,1800]}[id]||[155,.12,.26,4200],a=attenuate(distance)*strength;voice('noise',0,spec[1],spec[2]*a,'lowpass',spec[3]);voice('sine',spec[0],spec[1]*.75,.25*a);}
 function explosion(distance=0){const a=attenuate(distance);voice('noise',0,1.1,.55*a,'lowpass',1100);voice('sine',75,.65,.55*a);voice('noise',0,.12,.28*a,'highpass',1700);}
 function flash(distance=0){const a=attenuate(distance);voice('noise',0,.22,.40*a,'highpass',2600);voice('sine',1900,.65,.045*a,'highpass',1000);}
 function tone(freq,duration,type,gain){voice(type,freq,duration,gain);}
 function command(func,args=[]){frame?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args}),'https://www.youtube.com');}
 function pauseMusic(){if(!frame||musicPaused)return;musicPaused=true;command('pauseVideo');}
 function resumeMusic(){if(!frame||!musicPaused)return;musicPaused=false;command('playVideo');}
 el('sfxEnabled').onchange=e=>{enabled=e.target.checked;if(master)master.gain.value=enabled?volume:0;unlock();};
 el('sfxVolume').oninput=e=>{volume=Number(e.target.value)/100;if(master)master.gain.value=enabled?volume:0;unlock();};
 el('musicToggle').onclick=()=>{if(frame){frame.remove();frame=null;el('musicToggle').textContent='啟用背景音樂';el('musicStatus').textContent='背景音樂已關閉';return;}
  frame=document.createElement('iframe');frame.title='背景音樂 — YouTube';frame.allow='autoplay; encrypted-media; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';let origin='';if(window.location&&/^https?:$/.test(window.location.protocol))origin='&origin='+encodeURIComponent(window.location.origin);frame.src='https://www.youtube.com/embed/n2bKLqUKb9w?autoplay=1&loop=1&playlist=n2bKLqUKb9w&enablejsapi=1&playsinline=1'+origin;el('musicPlayer').appendChild(frame);musicPaused=false;el('musicToggle').textContent='關閉背景音樂';el('musicStatus').textContent='若未自動播放，請點影片播放鍵；無法載入時可在 YouTube 開啟原曲。';};
 return {unlock,tone,gun,explosion,flash,pauseMusic,resumeMusic};
}

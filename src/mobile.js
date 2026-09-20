/* Thumb-first controls. All pointer ownership lives here; no game timers. */
function makeMobileControls(api){
 const $=api.$,root=$('touchControls'),stick=$('moveStick'),knob=$('stickKnob'),buttons=[...root.querySelectorAll('button[data-action]')];
 const defaults={sensitivity:100,adsSensitivity:65,size:100,leftFire:false};
 let settings={...defaults},moveId=null,lookId=null,lastX=0,lastY=0,ads=false,crouch=false,settingsReturn=false;
 const held=new Map();
 try{const saved=JSON.parse(localStorage.getItem('factory-touch-v2')||'{}');for(const k of ['sensitivity','adsSensitivity','size'])if(Number.isFinite(saved[k]))settings[k]=Math.max(k==='size'?85:30,Math.min(k==='size'?115:180,saved[k]));settings.leftFire=saved.leftFire===true;}catch(e){}
 const byName=n=>buttons.filter(b=>b.dataset.action===n);
 const mark=(n,on)=>byName(n).forEach(b=>{b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 function sync(){api.fireHeld([...held.values()].some(p=>p.name==='fire'||p.name==='fireLeft'));api.aim(ads);api.key('ControlLeft',crouch);for(const [name,code]of [['jump','Space'],['hook','KeyV']])api.key(code,[...held.values()].some(p=>p.name===name));mark('aim',ads);mark('crouch',crouch);for(const n of ['fire','fireLeft','jump','hook'])mark(n,[...held.values()].some(p=>p.name===n));}
 function saveSettings(){try{localStorage.setItem('factory-touch-v2',JSON.stringify(settings));}catch(e){}applySettings();}
 function applySettings(){root.style.setProperty('--touch-scale',settings.size/100);$('leftFire').hidden=!settings.leftFire;for(const k of ['sensitivity','adsSensitivity','size']){$('touch_'+k).value=settings[k];$('touch_'+k+'Value').textContent=settings[k]+'%';}$('touch_leftFire').checked=settings.leftFire;}
 function move(e){const r=stick.getBoundingClientRect(),radius=r.width*.35;let x=(e.clientX-r.left-r.width/2)/radius,z=-(e.clientY-r.top-r.height/2)/radius,len=Math.hypot(x,z);const speed=Math.min(1,Math.max(0,(len-.16)/.84));if(len){x=x/len*speed;z=z/len*speed;}const sprint=z>.82&&Math.abs(x)<.5;api.move(x,z,true);api.key('ShiftLeft',sprint);for(const [key,on]of [['KeyW',z>.1],['KeyS',z<-.1],['KeyA',x<-.1],['KeyD',x>.1]])api.key(key,on);knob.style.transform='translate('+x*radius+'px,'+-z*radius+'px)';$('runHint').textContent=sprint?'奔跑中':'推遠向前奔跑';stick.classList.toggle('running',sprint);}
 function stopMove(e){if(e&&e.pointerId!==moveId)return;moveId=null;api.move(0,0,false);for(const k of ['KeyW','KeyS','KeyA','KeyD','ShiftLeft'])api.key(k,false);knob.style.transform='';stick.classList.toggle('running',false);$('runHint').textContent='推遠向前奔跑';}
 function look(dx,dy){api.look(dx,dy,(ads?settings.adsSensitivity:settings.sensitivity)/100*(ads?.002:.003));}
 function closeTray(){for(const id of ['utilityTray','throwTray'])$(id).hidden=true;mark('skills',false);mark('throws',false);}
 function reset(){stopMove();lookId=null;held.clear();ads=crouch=false;sync();closeTray();}
 function capture(el,e){e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(err){}}
 stick.addEventListener('pointerdown',e=>{if(!api.allowed()||moveId!==null)return;capture(stick,e);moveId=e.pointerId;move(e);});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===moveId&&api.allowed()){e.preventDefault();move(e);}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,stopMove);
 api.canvas.addEventListener('pointerdown',e=>{if(!api.allowed()||lookId!==null||e.clientX<innerWidth*.32)return;capture(api.canvas,e);lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;});
 api.canvas.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||!api.allowed())return;e.preventDefault();if(![...held.values()].some(p=>p.name==='fire'))look(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])api.canvas.addEventListener(event,e=>{if(e.pointerId===lookId)lookId=null;});
 function release(e){if(!held.has(e.pointerId))return;held.delete(e.pointerId);sync();}
 for(const b of buttons){b.addEventListener('pointerdown',e=>{if(!api.allowed()||b.disabled)return;const n=b.dataset.action;capture(b,e);api.unlock();held.set(e.pointerId,{name:n,x:e.clientX,y:e.clientY});if(n==='aim')ads=!ads;else if(n==='crouch')crouch=!crouch;else if(n==='skills'||n==='throws'){const id=n==='skills'?'utilityTray':'throwTray',open=$(id).hidden;closeTray();$(id).hidden=!open;mark(n,open);}else if(!['fire','fireLeft','jump','hook'].includes(n)){api.action(n);if(['grenade','flash','strike','heavy','pulse','dodge'].includes(n))closeTray();}sync();if(n==='fire'||n==='fireLeft')api.fire();});
 b.addEventListener('pointermove',e=>{const p=held.get(e.pointerId);if(!p||!api.allowed())return;e.preventDefault();if(p.name==='fire')look(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,release);
 b.addEventListener('contextmenu',e=>e.preventDefault());}
 function openSettings(){settingsReturn=api.allowed();if(settingsReturn)api.pause();reset();$('touchSettings').hidden=false;applySettings();}
 function closeSettings(){ $('touchSettings').hidden=true;if(settingsReturn)api.resume();settingsReturn=false;}
 for(const id of ['touchSettingsBtn','menuTouchSettings','pauseTouchSettings'])$(id).onclick=openSettings;
 $('closeTouchSettings').onclick=closeSettings;
 $('resetTouchSettings').onclick=()=>{settings={...defaults};saveSettings();};
 for(const k of ['sensitivity','adsSensitivity','size'])$('touch_'+k).oninput=e=>{settings[k]=Number(e.target.value);saveSettings();};
 $('touch_leftFire').onchange=e=>{settings.leftFire=e.target.checked;saveSettings();};
 function update(state){ads=api.aiming();root.hidden=!api.allowed();$('touchOrientation').hidden=root.hidden||innerWidth>=innerHeight;$('touchInteraction').hidden=!state.interaction;$('touchInteraction').textContent=state.interaction||'互動';$('mobileAmmo').textContent=state.reloading?'換彈中':state.ammo+' / '+state.mag;$('mobileGun').textContent=state.gun;$('mobileGrenades').textContent=state.grenades;byName('grenade').forEach(b=>{b.disabled=!state.combat||state.grenades<=0;b.textContent='手榴彈 '+state.grenades;});byName('flash').forEach(b=>{b.disabled=!state.combat||state.flashes<=0;b.textContent='閃光彈 '+state.flashes;});byName('weapon').forEach(b=>b.disabled=!state.hasMain);byName('reload').forEach(b=>b.disabled=!state.combat||state.reloading||state.ammo>=state.mag);mark('aim',api.aiming());}
 addEventListener('blur',reset);addEventListener('orientationchange',reset);addEventListener('resize',reset);
 applySettings();return {reset,update,openSettings,closeSettings,state:()=>({settings:{...settings},ads,crouch,moveId,lookId,held:held.size})};
}

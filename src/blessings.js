function makeBlessings(api){
 const catalog=[
  {id:'attack',name:'強化攻擊',text:'槍擊、近戰與爆炸傷害 +30／40／50%',values:[30,40,50]},
  {id:'grenade',name:'彈藥補給',text:'立即獲得手榴彈 1／2／3 顆，可超過攜帶上限',values:[1,2,3]},
  {id:'reach',name:'延伸刀鋒',text:'近戰距離 +30／40／50%',values:[30,40,50]},
  {id:'height',name:'體型變化',text:'隨機變為原始身高的 70% 或 130%，取代上次身高效果',values:[-30,30]},
  {id:'speed',name:'輕盈步伐',text:'走路、跑步與蹲行速度 +15／20／25%',values:[15,20,25]},
  {id:'element',name:'元素附魔',text:'隨機火／雷／水／土，槍擊額外傷害 +1～10 點；該元素每次命中有 15% 機率附加原有狀態',values:[1,2,3,4,5,6,7,8,9,10]},
  {id:'armor',name:'加厚防彈衣',text:'防彈衣上限 +10／15／20／25%，並補上新增容量',values:[10,15,20,25]},
  {id:'mag',name:'擴充彈匣',text:'所有槍枝彈匣容量 +5／10／15／20／25%；換彈或購槍後裝滿',values:[5,10,15,20,25]},
  {id:'revive',name:'再戰一次',text:'獲得一次自動復活：滿血、保留裝備與祝福、3 秒免傷',values:[1]}
 ];
 const B={};let options=[],pending=false,round=0,result='';
 function reset(){Object.assign(B,{attack:1,reach:1,height:1,speed:1,armor:1,mag:1,revives:0,elements:{},history:[]});options=[];pending=false;round=0;result='';}
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 function offer(wave){round=wave;result='';options=[];pending=wave>1;if(pending){const a=catalog.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}options=a.slice(0,3);}}
 function choose(id,wave=round){if(!pending||wave!==round||!api.canChoose())return false;const c=options.find(o=>o.id===id);if(!c)return false;const n=pick(c.values);let extra='';
  if(id==='attack'||id==='reach'||id==='speed'||id==='mag')B[id]+=n/100;
  else if(id==='height'){B.height=1+n/100;api.resize();}
  else if(id==='grenade')api.grenades(n);
  else if(id==='armor'){const old=api.armorMax();B.armor+=n/100;api.armorFill(api.armorMax()-old);}
  else if(id==='revive')B.revives++;
  else if(id==='element'){extra=pick(['火','雷','水','土']);B.elements[extra]=(B.elements[extra]||0)+n;}
  result=c.name+'：'+extra+(n>0?'+':'')+n+(['attack','reach','height','speed','armor','mag'].includes(id)?'%':id==='revive'?' 次':id==='grenade'?' 顆':' 點');
  B.history.push({wave:round,id,value:n,element:extra,result});pending=false;api.changed(result);return true;
 }
 function skip(){if(!pending||!api.canChoose())return false;pending=false;result='本波已略過祝福';api.changed(result);return true;}
 function render(root){root.replaceChildren();root.hidden=round<=1;if(round<=1)return;const title=document.createElement('h3');title.textContent=pending?'通關祝福 · 免費三選一':'本波祝福';root.append(title);const info=document.createElement('p');info.className='muted';info.textContent=pending?'選定後才抽數值；選擇期間購買倒數暫停。選好或略過後繼續倒數。':result;root.append(info);
  if(pending){const grid=document.createElement('div');grid.className='grid';for(const c of options){const el=document.createElement('div');el.className='item';const title=document.createElement('b');title.textContent=c.name;const text=document.createElement('p');text.textContent=c.text;const b=document.createElement('button');b.textContent='免費選擇';const token=round;b.onclick=()=>choose(c.id,token);el.append(title,text,b);grid.append(el);}root.append(grid);const s=document.createElement('button');s.textContent='略過本波祝福';s.onclick=skip;root.append(s);}
  const history=document.createElement('p');history.className='muted';history.textContent='累積：攻擊 +'+Math.round((B.attack-1)*100)+'% · 近戰距離 +'+Math.round((B.reach-1)*100)+'% · 移速 +'+Math.round((B.speed-1)*100)+'% · 身高 '+Math.round(B.height*100)+'% · 復活 '+B.revives+' 次';root.append(history);const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='已獲得祝福（'+B.history.length+'）';details.append(summary);for(const h of B.history){const row=document.createElement('p');row.textContent='第 '+(h.wave-1)+' 波通關 · '+h.result;details.append(row);}root.append(details);
 }
 reset();return {B,offer,choose,skip,render,reset,pending:()=>pending,state:()=>({options:options.map(c=>({id:c.id,name:c.name,text:c.text})),pending,round,result,...B,elements:{...B.elements},history:B.history.slice()})};
}

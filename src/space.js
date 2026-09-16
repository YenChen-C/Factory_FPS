/* Analytic collision volumes plus a spatial index, independent of visual mesh detail. */
function makeSpace(D,F){
 const boxes=[],polys=[],hash=new Map(),cell=2;
 const inside=(x,z,p)=>{let v=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!=(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])v=!v;return v;};
 const segDist=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
 function index(o){const id=polys.length;polys.push(o);o.minX=Math.min(...o.p.map(p=>p[0]));o.maxX=Math.max(...o.p.map(p=>p[0]));o.minZ=Math.min(...o.p.map(p=>p[1]));o.maxZ=Math.max(...o.p.map(p=>p[1]));for(let x=Math.floor((o.minX-.3)/cell);x<=Math.floor((o.maxX+.3)/cell);x++)for(let z=Math.floor((o.minZ-.3)/cell);z<=Math.floor((o.maxZ+.3)/cell);z++){const k=x+','+z;if(!hash.has(k))hash.set(k,[]);hash.get(k).push(id);}}
 function rect(x,z,w,d,lo,hi,kind='solid',yaw=0){const c=Math.cos(yaw),s=Math.sin(yaw);index({p:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>[x+a*c-b*s,z+a*s+b*c]),lo,hi,kind});}
 for(const [wallIndex,w] of D.walls.entries())index({wallIndex,p:w.outer,holes:w.holes||[],lo:0,hi:CFG.floorHeight,kind:'wall'});
 for(const d of D.doors)rect(d.hinge[0]+Math.cos(d.angle)*d.r/2,d.hinge[1]+Math.sin(d.angle)*d.r/2,d.r+.06,.17,d.height||2.1,CFG.floorHeight,'wall',d.angle);
 for(const o of D.objects){if(o.kind==='rack'){
 // Open metal rack: posts and thin shelf planes, not a filled bounding box.
 const yaw=o.yaw||0,c=Math.cos(yaw),s=Math.sin(yaw);for(const a of [-o.w/2+.025,o.w/2-.025])for(const b of [-o.d/2+.025,o.d/2-.025])rect(o.x+a*c-b*s,o.z+a*s+b*c,.045,.045,0,1.8,'rack');
 for(const h of [.16,.70,1.24,1.78])rect(o.x,o.z,o.w,o.d,h-.015,h+.015,'rack',yaw);
 }else if(o.kind==='table'){rect(o.x,o.z,o.w,o.d,.725,.795,'table',o.yaw||0);for(const a of [-o.w/2+.07,o.w/2-.07])for(const b of [-o.d/2+.07,o.d/2-.07])rect(o.x+a*Math.cos(o.yaw||0)-b*Math.sin(o.yaw||0),o.z+a*Math.sin(o.yaw||0)+b*Math.cos(o.yaw||0),.05,.05,0,.76,'table');}
 else index({p:o.outline,lo:0,hi:o.kind==='machine'?1.8:CFG.cabinetHeight,kind:o.kind,machineName:o.kind==='machine'?o.name:null});}
 for(const a of D.airUnits)for(const s of [-1,1])rect(a.x+s*(a.w/2-.1),a.z,.18,a.d,0,2.3,'wall');
 for(const b of D.barriers||[])rect(b.x,b.z,b.w,b.d,0,b.h,'wall');
 for(const t of D.turnstiles)rect(t.x,t.z,.3,.58,0,1.08,'solid');
 for(const o of D.sanitary)rect(o.x,o.z,.5,.6,0,1,'solid');
 for(const o of D.stairs)rect(o.x,o.z+o.steps*.12,o.w,o.steps*.24,0,3,'wall');
 function doorPoly(d){let ax=d.hinge[0],az=d.hinge[1],a=d.angle+d.swing*d.t;if(d.type==='sliding'){ax+=d.slide[0]*d.t;az+=d.slide[1]*d.t;a=d.angle;}const ux=Math.cos(a),uz=Math.sin(a),r=.035;return Object.assign(d.body||(d.body={}),{disabled:!!d.destroyed,p:[[ax-uz*r,az+ux*r],[ax+ux*d.r-uz*r,az+uz*d.r+ux*r],[ax+ux*d.r+uz*r,az+uz*d.r-ux*r],[ax+uz*r,az-ux*r]],lo:0,hi:d.height||2.1,kind:'door',door:d});}
 function solid(o,x,z){return inside(x,z,o.p)&&!(o.holes||[]).some(h=>inside(x,z,h));}
 function blocked(x,y,z,r=.22,h=1.7,doors=true){if(!inside(x,z,D.floor))return true;const ids=hash.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[];const check=o=>{if(o.disabled)return false;if(y>=o.hi-.005||y+h<=o.lo+.005)return false;if(solid(o,x,z))return true;for(const p of [o.p,...(o.holes||[])])for(let i=0;i<p.length;i++)if(segDist(x,z,p[i],p[(i+1)%p.length])<r)return true;return false;};for(const id of ids)if(check(polys[id]))return true;if(doors)for(const d of F.doors)if(Math.hypot(x-d.hinge[0],z-d.hinge[1])<d.r+1.5&&check(doorPoly(d)))return true;return false;}
 function intersect(o,origin,dir,max){let nearest=max,normal=null;
 for(const y of [o.lo,o.hi])if(Math.abs(dir.y)>1e-8){const t=(y-origin.y)/dir.y;if(t>.002&&t<nearest&&solid(o,origin.x+dir.x*t,origin.z+dir.z*t)){nearest=t;normal=new THREE.Vector3(0,y===o.hi?1:-1,0);}}
 for(const p of [o.p,...(o.holes||[])])for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],sx=b[0]-a[0],sz=b[1]-a[1],det=dir.x*sz-dir.z*sx;if(Math.abs(det)<1e-9)continue;const dx=a[0]-origin.x,dz=a[1]-origin.z,t=(dx*sz-dz*sx)/det,u=(dx*dir.z-dz*dir.x)/det,y=origin.y+dir.y*t;if(t>.002&&t<nearest&&u>=0&&u<=1&&y>=o.lo&&y<=o.hi){nearest=t;normal=new THREE.Vector3(-sz,0,sx).normalize();if(normal.dot(dir)>0)normal.negate();}}
 return normal?{distance:nearest,point:origin.clone().addScaledVector(dir,nearest),normal,kind:o.kind,body:o,door:o.door}:null;}
 function cast(origin,dir,max=100,wallsOnly=false){let best=null,limit=max;const ids=new Set();for(let t=0;t<=max;t+=.65){const x=origin.x+dir.x*t,z=origin.z+dir.z*t;for(const i of hash.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[])ids.add(i);}for(const id of ids){const o=polys[id];if(o.disabled)continue;if(wallsOnly&&o.kind!=='wall')continue;const hit=intersect(o,origin,dir,limit);if(hit){best=hit;limit=hit.distance;}}
 for(const d of F.doors){if(d.destroyed)continue;const hit=intersect(doorPoly(d),origin,dir,limit);if(hit){best=hit;limit=hit.distance;}}
 for(const [y,n]of [[0,1],[CFG.floorHeight,-1]])if(Math.abs(dir.y)>1e-8){const t=(y-origin.y)/dir.y;if(t>.002&&t<limit&&inside(origin.x+dir.x*t,origin.z+dir.z*t,D.floor)){limit=t;best={distance:t,point:origin.clone().addScaledVector(dir,t),normal:new THREE.Vector3(0,n,0),kind:y===0?'floor':'ceiling'};}}
 return best;}
 function clear(a,b,walls=false){const d=b.clone().sub(a),len=d.length();return !cast(a,d.normalize(),Math.max(0,len-.06),walls);}
 const minX=Math.min(...D.floor.map(p=>p[0])),minZ=Math.min(...D.floor.map(p=>p[1])),step=.65,W=Math.ceil((Math.max(...D.floor.map(p=>p[0]))-minX)/step)+1,H=Math.ceil((Math.max(...D.floor.map(p=>p[1]))-minZ)/step)+1,walk=new Uint8Array(W*H),dist=new Int32Array(W*H),queue=new Int32Array(W*H);
 const point=i=>new THREE.Vector3(minX+(i%W)*step,0,minZ+Math.floor(i/W)*step),idx=(x,z)=>{const a=Math.round((x-minX)/step),b=Math.round((z-minZ)/step);return a>=0&&a<W&&b>=0&&b<H?b*W+a:-1;};
 for(let i=0;i<walk.length;i++){const p=point(i);walk[i]=!blocked(p.x,0,p.z,.22,1.7,false);}
 function flow(target){let start=idx(target.x,target.z);if(start<0||!walk[start]){let best=Infinity;for(let i=0;i<walk.length;i++)if(walk[i]){const q=point(i).distanceToSquared(new THREE.Vector3(target.x,0,target.z));if(q<best){best=q;start=i;}}}dist.fill(-1);let head=0,tail=0;if(start<0)return;queue[tail++]=start;dist[start]=0;while(head<tail){const i=queue[head++];for(const j of [i-1,i+1,i-W,i+W])if(j>=0&&j<walk.length&&Math.abs(j%W-i%W)<=1&&walk[j]&&dist[j]<0){dist[j]=dist[i]+1;queue[tail++]=j;}}}
 function next(pos){const i=idx(pos.x,pos.z);if(i<0)return null;let best=i;for(const j of [i-1,i+1,i-W,i+W])if(j>=0&&j<dist.length&&Math.abs(j%W-i%W)<=1&&dist[j]>=0&&(dist[best]<0||dist[j]<dist[best]))best=j;return dist[best]>=0?point(best):null;}
 function candidates(pos,min=7,max=20){const a=[];for(let i=0;i<walk.length;i++)if(dist[i]>=0){const p=point(i),d=p.distanceTo(pos);if(d>min&&d<max)a.push(p);}return a;}
 function setMachineSelection(names){const keep=new Set(names);for(const o of polys)if(o.kind==='machine')o.disabled=!keep.has(o.machineName);for(let i=0;i<walk.length;i++){const p=point(i);walk[i]=!blocked(p.x,0,p.z,.22,1.7,false);}}
 function rebuild(){for(let i=0;i<walk.length;i++){const p=point(i);walk[i]=!blocked(p.x,0,p.z,.22,1.7,false);}}
 function path(from,to){let start=idx(from.x,from.z),end=idx(to.x,to.z);const nearest=(p)=>{let best=-1,d=Infinity;for(let i=0;i<walk.length;i++)if(walk[i]){const n=point(i).distanceToSquared(p);if(n<d){d=n;best=i;}}return best;};if(start<0||!walk[start])start=nearest(from);if(end<0||!walk[end])end=nearest(to);if(start<0||end<0)return [];const prev=new Int32Array(walk.length);prev.fill(-1);const q=[start];prev[start]=start;for(let head=0;head<q.length&&prev[end]<0;head++){const i=q[head];for(const j of [i-1,i+1,i-W,i+W])if(j>=0&&j<walk.length&&Math.abs(j%W-i%W)<=1&&walk[j]&&prev[j]<0){prev[j]=i;q.push(j);}}if(prev[end]<0)return [];const out=[];for(let i=end;i!==start;i=prev[i])out.push(point(i));return out.reverse();}
 return {path,rebuild,setMachineSelection,blocked,cast,clear,flow,next,candidates,inside,polys,doorPoly,point,walk,dist,idx};
}

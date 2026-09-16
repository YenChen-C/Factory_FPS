/* Arena material direction: warm alloy, slate walls, cool fixtures.
 * Fixture placement stays tied to CAD; dressing does not change navigation. */
function makeArenaLook(T,scene,F,D){
 F.mats.wall.color.setHex(0x76858a);F.mats.trim.color.setHex(0x465966);
 F.mats.floor.color.setHex(0xa2aaa6);F.mats.floor.roughness=.82;
 F.mats.blue.color.setHex(0x536f87);F.mats.body.color.setHex(0xb5c3c8);
 F.mats.metal.roughness=.38;F.mats.metal.metalness=.68;
 F.mats.ceiling.color.setHex(0x9aabb4);
 const fill=new T.DirectionalLight(0x81cbd4,.65);fill.position.set(-25,18,-20);scene.add(fill);
 // Recessed floor seams and speckle, generated locally and embedded with the app.
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 ctx.fillStyle='#b9c4c5';ctx.fillRect(0,0,256,256);
 let seed=41;for(let i=0;i<4500;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;ctx.fillStyle=i%2?'#aebbbb':'#c3cccc';ctx.fillRect(x,seed%256,1,1);}
 ctx.fillStyle='#7a8c91';ctx.fillRect(0,0,256,2);ctx.fillRect(0,0,2,256);ctx.fillStyle='#d0d8d8';ctx.fillRect(2,2,253,1);ctx.fillRect(2,2,1,253);
 for(const x of [12,244])for(const y of [12,244]){ctx.fillStyle='#899b9e';ctx.beginPath();ctx.arc(x,y,1.6,0,Math.PI*2);ctx.fill();}
 const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(.5,.5);tex.colorSpace=T.SRGBColorSpace;F.mats.floor.map=tex;
 // Cabinet door seams are visible geometry in the existing batches; preserve their contact.
 const frameMat=new T.MeshStandardMaterial({color:0x596c74,roughness:.8,metalness:.25}),lampMat=new T.MeshBasicMaterial({color:0xd9bb85}),geo=new T.BoxGeometry(1,1,1);
 const band=new T.InstancedMesh(geo,frameMat,D.fixtures.length*2),accents=new T.InstancedMesh(geo,lampMat,D.fixtures.length*2),dummy=new T.Object3D();
 band.name='Ceiling_fixture_frames';accents.name='Fixture_warm_edges';let i=0;
 for(const f of D.fixtures)for(const o of [-.72,.72]){
  dummy.position.set(f.x,CFG.floorHeight-.09,f.z+o);dummy.scale.set(2.40,.018,.15);dummy.updateMatrix();band.setMatrixAt(i,dummy.matrix);
  dummy.position.set(f.x,CFG.floorHeight-.105,f.z+o+.075);dummy.scale.set(2.28,.018,.012);dummy.updateMatrix();accents.setMatrixAt(i,dummy.matrix);i++;
 }
 F.ceiling.add(band,accents);
 return {texture:tex};
}

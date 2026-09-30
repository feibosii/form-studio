import {intersections,chainCircles} from '../src/circleChain';
import {drawGeometry} from '../src/geometry';
import {defaults} from '../src/state';
import {render} from '../src/engine';
async function run(){
 const assert=(value:boolean,message:string)=>{if(!value)throw Error(message)};
 const a={x:0,y:0,r:5},b={x:6,y:0,r:5};const cross=intersections(a,b);
 assert(cross.length===2,'Two intersections');for(const p of cross){assert(Math.abs(Math.hypot(p.x,p.y)-5)<1e-6,'On first circle');assert(Math.abs(Math.hypot(p.x-6,p.y)-5)<1e-6,'On second circle')}
 assert(intersections(a,{x:20,y:0,r:5}).length===0,'Disjoint circles');assert(intersections(a,a).length===0,'Coincident circles');
 const image=await createImageBitmap(await(await fetch('/sample.jpg')).blob()),base=new OffscreenCanvas(1200,675),c=base.getContext('2d')!;c.drawImage(image,0,0,1200,675);const pixels=c.getImageData(0,0,1200,675).data;
 const s={...defaults,field:true,nodeLabels:true,circleChain:true,distribution:'uniform'};
 const circles=chainCircles(pixels,1200,675,s);assert(circles.length===s.chainCount,'Circle count');for(let i=1;i<circles.length;i++)assert(Math.abs(circles[i].r/circles[i-1].r-s.chainRatio)<1e-8,'Radius progression');
 const capture=(seed:number)=>{const ctx=new OffscreenCanvas(1200,675).getContext('2d')!,labels:unknown[]=[];ctx.fillText=(text,x,y)=>{labels.push([text,x,y])};drawGeometry(ctx,pixels,1200,675,{...s,seed});return labels};
 const labels=capture(s.seed);assert(labels.length>0&&labels.length<=s.labelCount,'Sparse label count');assert(JSON.stringify(labels)===JSON.stringify(capture(s.seed)),'Seed determinism');assert(JSON.stringify(labels)!==JSON.stringify(capture(s.seed+1)),'Seed changes selection');
 const canvas=render(image,s,2000,1125) as OffscreenCanvas;const blob=await canvas.convertToBlob({type:'image/png'});const decoded=await createImageBitmap(blob);assert(decoded.width===2000&&decoded.height===1125,'Export resolution');decoded.close();image.close();
 document.querySelector('pre')!.textContent=`PASS: geometric intersections, radius progression, ${labels.length} sparse labels, deterministic seeds, and full-resolution export.`;
}
run().catch(e=>document.querySelector('pre')!.textContent='FAIL: '+e.stack);

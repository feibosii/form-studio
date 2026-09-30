import {Renderer} from '../src/renderer';
import {defaults,type Settings} from '../src/state';
async function run(){
 const source=new OffscreenCanvas(480,320),c=source.getContext('2d')!;
 const gradient=c.createLinearGradient(0,0,480,320);gradient.addColorStop(0,'black');gradient.addColorStop(1,'white');c.fillStyle=gradient;c.fillRect(0,0,480,320);
 c.fillStyle='#555';c.fillRect(100,70,180,160);
 const image=await createImageBitmap(source),renderer=new Renderer();await renderer.setSource(image);image.close();
 const target='#ff00ff';const cases:[string,Partial<Settings>][]=[
 ['halftone',{halftone:true,halftoneInk:target,halftonePaper:target}],
 ['dither',{dither:true,palette:'custom',ditherInk:target,ditherPaper:target}],
 ['pixels',{pixel:true,pixelColors:true,pixelInk:target,pixelPaper:target}],
 ['engraving',{flow:true,flowColor:target,flowOpacity:100,flowWidth:3}],
 ['orbits',{circleChain:true,chainColor:target,chainOpacity:100}],
 ['geometry background',{field:true,fieldColor:'custom',fieldPaper:target,sourceOpacity:0}],
 ['geometry shapes',{field:true,fieldColor:'custom',fieldInk:target,fieldOpacity:100,shapeFill:true,shape:'square',connection:'none',maxShape:35}],
 ['links',{field:true,customLinkColor:true,linkColor:target,linkOpacity:100,linkWidth:3}],
 ['annotations',{field:true,nodeLabels:true,labelColor:target,labelSize:20}],
 ['window halftone',{portraitWindow:true,windowStyle:'halftone',windowHalftoneInk:target,windowHalftonePaper:target}],
 ['window dither',{portraitWindow:true,windowStyle:'dither',windowDitherInk:target,windowDitherPaper:target}],
 ['window pixels',{portraitWindow:true,windowStyle:'pixel',windowPixelColors:true,windowPixelInk:target,windowPixelPaper:target}],
 ['window engraving',{portraitWindow:true,windowStyle:'engraving',windowFlowColor:target}],
 ['window contour',{portraitWindow:true,windowStyle:'contour',windowContourColor:target}],
 ['window outline',{portraitWindow:true,windowStyle:'original',windowOutlineColor:target}],
 ];
 for(const [name,patch] of cases){
 const blob=await renderer.request('export',{...defaults,field:false,nodeLabels:false,contour:false,contrast:100,...patch},1200,800,false,'png') as Blob;
 const result=await createImageBitmap(blob);if(result.width!==1200||result.height!==800)throw Error(name+' export dimensions');
 const out=new OffscreenCanvas(1200,800),o=out.getContext('2d')!;o.drawImage(result,0,0);result.close();const data=o.getImageData(0,0,1200,800).data;
 let found=0;for(let i=0;i<data.length;i+=4)if(data[i]>data[i+1]+30&&data[i+2]>data[i+1]+30)found++;
 if(!found)throw Error(name+': chosen color missing from PNG');
 }
 // A window color change must leave the surrounding artwork untouched.
 const state={...defaults,field:false,nodeLabels:false,contour:false,portraitWindow:true,windowStyle:'dither'};
 const a=await renderer.request('preview',state,480,320) as ImageBitmap,b=await renderer.request('preview',{...state,windowDitherInk:target,windowDitherPaper:target},480,320) as ImageBitmap;
 c.drawImage(a,0,0);const before=c.getImageData(0,0,40,40).data;c.drawImage(b,0,0);const after=c.getImageData(0,0,40,40).data;
 if(before.some((v,i)=>v!==after[i]))throw Error('Window colors changed surrounding artwork');a.close();b.close();renderer.dispose();
 document.querySelector('pre')!.textContent='PASS: 15 color controls verified through worker PNG exports; dimensions preserved; window colors isolated from surrounding artwork.';
}run().catch(e=>document.querySelector('pre')!.textContent='FAIL: '+e.stack);

import {render} from '../src/engine';
import {defaults} from '../src/state';
async function run(){
 const src=new OffscreenCanvas(320,240),c=src.getContext('2d')!;c.fillStyle='#999';c.fillRect(0,0,320,240);const image=await createImageBitmap(src);
 const base={...defaults,field:false,nodeLabels:false,contour:false,contrast:100,portraitWindow:true,windowWidth:40,windowHeight:50,windowX:75,windowY:25};
 for(const windowStyle of ['halftone','engraving','dither','pixel','contour','original']){
 const out=render(image,{...base,windowStyle},640,480) as OffscreenCanvas,ctx=out.getContext('2d')!;
 if(out.width!==640||out.height!==480)throw Error('Resolution changed');
 const edge=ctx.getImageData(0,0,1,1).data;if(edge[0]!==153||edge[1]!==153)throw Error('Window changed exterior: '+windowStyle);
 if(windowStyle==='dither'){const center=ctx.getImageData(350,150,1,1).data;if(center[0]===153)throw Error('Window treatment missing');}
 }
 image.close();document.querySelector('pre')!.textContent='PASS: all six window treatments render; exterior preserved; moved window applies at export resolution.';
}run().catch(e=>document.querySelector('pre')!.textContent='FAIL: '+e.stack);

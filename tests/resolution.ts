import {Renderer} from '../src/renderer';
import {defaults,dimensions} from '../src/state';
const report=document.querySelector('pre')!;
async function run(){
 const s={...defaults,field:false,nodeLabels:false,contour:false,contrast:100};
 const equal=(a:unknown,b:unknown)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(JSON.stringify({actual:a,expected:b}));};
 equal(dimensions(6000,4000,s),{width:6000,height:4000});
 equal(dimensions(6000,4000,{...s,ratio:'square'}),{width:4000,height:4000});
 equal(dimensions(10000,5000,s),{width:10000,height:5000});
 const big=dimensions(6000,4000,s,2);if(big.width>10000||big.width*big.height>50_010_000)throw Error('Upscale budget exceeded');
 const input=new OffscreenCanvas(3000,1000),c=input.getContext('2d')!;
 c.fillStyle='white';c.fillRect(0,0,3000,1000);c.fillStyle='black';for(let x=0;x<3000;x+=2)c.fillRect(x,0,1,1000);
 const image=await createImageBitmap(input),renderer=new Renderer();await renderer.setSource(image);image.close();
 const output=await renderer.request('export',{...s,field:true,sourceOpacity:100,distribution:'uniform',density:190,nodeLabels:true,labelCount:16,labelColor:'#ff0000',fieldColor:'custom',fieldInk:'#ff0000',connection:'none'},3000,1000,false,'png') as Blob;
 const decoded=await createImageBitmap(output);equal([decoded.width,decoded.height],[3000,1000]);
 c.drawImage(decoded,0,0);const pixels=c.getImageData(0,0,3000,1).data;
 for(let x=0;x<3000;x++){if(pixels[x*4]===pixels[x*4+1]&&pixels[x*4]!== (x%2?255:0))throw Error('Native single-pixel detail lost');}
 decoded.close();renderer.dispose();report.textContent='PASS: native export dimensions, crop dimensions, upscale limits, and single-pixel photo detail with geometry and annotations through worker PNG export.';
}run().catch(e=>report.textContent='FAIL: '+e.stack);

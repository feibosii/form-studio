import {detectSubject} from '../src/subjectMask';
import {render} from '../src/engine';
import {defaults} from '../src/state';
async function run(){
 const photo=await createImageBitmap(await (await fetch('/sample-portrait.jpg')).blob());
 const small=await createImageBitmap(photo,{resizeWidth:341,resizeHeight:512});
 const mask=await detectSubject(small);if(!mask)throw Error('Sample person not detected');
 const blank=new OffscreenCanvas(256,256);blank.getContext('2d')!.fillRect(0,0,256,256);
 const empty=await createImageBitmap(blank);if(await detectSubject(empty))throw Error('Blank image detected as person');
 const results=[];
 for(const ratio of ['original','square'])for(const size of [600,1200]){
  const s={...defaults,field:false,nodeLabels:false,grid:true,gridOpacity:100,gridSubject:true,ratio};
  const a=render(photo,s,size,size,false,mask) as OffscreenCanvas,b=render(photo,s,size,size,false,null) as OffscreenCanvas;
  const x=a.getContext('2d')!.getImageData(0,0,size,size).data,y=b.getContext('2d')!.getImageData(0,0,size,size).data;
  let difference=0;for(let i=0;i<x.length;i+=4)if(x[i]!==y[i])difference++;
  if(difference<100)throw Error('Grid not masked');results.push({ratio,size,changedPixels:difference});
 }
 document.querySelector('pre')!.textContent=JSON.stringify({status:'passed',mask:{width:mask.width,height:mask.height},results},null,2);photo.close();small.close();empty.close();
}
run().catch(error=>{document.querySelector('pre')!.textContent=String(error.stack||error);});

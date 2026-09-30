import {render} from './engine';
import type {Settings} from './state';
import type {SubjectMask} from './subjectMask';
export class Renderer{
 detectionSource:ImageBitmap|null=null;mask:Promise<SubjectMask|null>|null=null;revision=0;
 async subject(){
  if(!this.detectionSource)return null;
  if(!this.mask){const revision=this.revision,copy=createImageBitmap(this.detectionSource);this.onSubjectStatus('Detecting subject…');this.mask=copy.then(async image=>{try{return await (await import('./subjectMask')).detectSubject(image);}finally{image.close();}}).then(mask=>{if(revision===this.revision)this.onSubjectStatus(mask?'Person detected':'No person detected — grid unchanged');return mask;}).catch(()=>{if(revision===this.revision)this.onSubjectStatus('Detection unavailable — grid unchanged');return null;});}
  return this.mask;
 }
 worker:Worker|null=null;source:ImageBitmap|null=null;id=0;pending=new Map<number,{resolve:(value:any)=>void,reject:(e:Error)=>void}>();
 constructor(public onSubjectStatus:(status:string)=>void=()=>{}){if(typeof OffscreenCanvas!=='undefined'&&typeof Worker!=='undefined'){this.worker=new Worker(new URL('./render.worker.ts',import.meta.url),{type:'module'});this.worker.onmessage=({data})=>{const p=this.pending.get(data.id);if(!p){data.image?.close();return;}this.pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.blob||data.image);};this.worker.onerror=()=>{this.pending.forEach(p=>p.reject(new Error('The image renderer stopped. Reload the page to continue.')));this.pending.clear();};}}
 async setSource(image:ImageBitmap){this.revision++;this.mask=null;this.detectionSource?.close();const scale=Math.min(1,512/Math.max(image.width,image.height));this.detectionSource=await createImageBitmap(image,{resizeWidth:Math.max(1,Math.round(image.width*scale)),resizeHeight:Math.max(1,Math.round(image.height*scale))});this.onSubjectStatus('');this.source?.close();this.source=null;if(this.worker){const copy=await createImageBitmap(image);this.worker.postMessage({type:'source',image:copy},[copy]);}else this.source=await createImageBitmap(image);}
 async request(type:'preview'|'export',state:Settings,width:number,height:number,compare=false,format='png'):Promise<ImageBitmap|Blob>{
 const revision=this.revision,mask=state.grid&&state.gridSubject&&!compare?await this.subject():null;if(revision!==this.revision)throw new Error('Image changed during detection.');
 if(this.worker){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.worker!.postMessage({type,state,width,height,compare,format,id,mask});});}
 await new Promise(r=>setTimeout(r,0));if(!this.source)throw new Error('Please load an image.');const result=render(this.source,state,width,height,compare,mask);if(type==='preview')return createImageBitmap(result);if(typeof OffscreenCanvas!=='undefined'&&result instanceof OffscreenCanvas)return result.convertToBlob({type:`image/${format}`,quality:1});return new Promise((resolve,reject)=>(result as HTMLCanvasElement).toBlob(b=>b?resolve(b):reject(new Error('Could not create the export.')),`image/${format}`,1));
 }
 dispose(){this.revision++;this.detectionSource?.close();this.worker?.terminate();this.source?.close();this.pending.forEach(p=>p.reject(new Error('Renderer closed.')));this.pending.clear();}
}

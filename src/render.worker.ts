import {render} from './engine';
import type {Settings} from './state';
let source:ImageBitmap|null=null;
self.onmessage=async(e:MessageEvent)=>{const m=e.data;try{if(m.type==='source'){source?.close();source=m.image;return;}if(!source)throw new Error('Please load an image first.');const canvas=render(source,m.state as Settings,m.width,m.height,m.compare,m.mask) as OffscreenCanvas;if(m.type==='export'){const blob=await canvas.convertToBlob({type:m.format==='jpeg'?'image/jpeg':'image/png',quality:1});self.postMessage({id:m.id,blob});}else{const image=canvas.transferToImageBitmap();self.postMessage({id:m.id,image},[image]);}}catch(error){self.postMessage({id:m.id,error:error instanceof Error?error.message:'Rendering failed. Try a smaller image.'});}};

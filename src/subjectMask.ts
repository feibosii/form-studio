import {FilesetResolver,ImageSegmenter} from '@mediapipe/tasks-vision';
export type SubjectMask={width:number;height:number;data:Uint8ClampedArray};
let detector:Promise<ImageSegmenter>|undefined;
export async function detectSubject(image:ImageBitmap):Promise<SubjectMask|null>{
 detector??=FilesetResolver.forVisionTasks(new URL('segmentation/wasm', document.baseURI).href).then(files=>ImageSegmenter.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('segmentation/selfie_segmenter.tflite', document.baseURI).href,delegate:'CPU'},runningMode:'IMAGE',outputConfidenceMasks:true,outputCategoryMask:false})).catch(error=>{detector=undefined;throw error;});
 const model=await detector,result=model.segment(image);
 try{
  const mask=result.confidenceMasks?.[0];if(!mask)return null;
  const confidence=mask.getAsFloat32Array(),data=new Uint8ClampedArray(confidence.length*4);let strong=0;
  for(let i=0;i<confidence.length;i++){const p=confidence[i];if(p>.8)strong++;const a=Math.max(0,Math.min(1,(p-.35)/.4));data[i*4+3]=Math.round(a*a*(3-2*a)*255);}
  if(strong<confidence.length*.005||strong>confidence.length*.98)return null;
  return {width:mask.width,height:mask.height,data};
 }finally{result.close();}
}

import type {Settings} from './state';

/** Signed smoothing: negative amounts enhance detail before overlays. */
export function reduceNoise(data:Uint8ClampedArray,width:number,height:number,amount:number){
 if(amount===0)return;
 const source=data.slice(),blend=Math.max(-1,Math.min(1,amount/100)),threshold=10+Math.abs(blend)*30;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;if(!source[i+3])continue;
  let r=0,g=0,b=0,total=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=height)continue;
   const j=(yy*width+xx)*4;if(!source[j+3])continue;
   const distance=((source[j]-source[i])**2+(source[j+1]-source[i+1])**2+(source[j+2]-source[i+2])**2)/3;
   const weight=(dx===0&&dy===0?2:1)/(1+distance/(threshold*threshold));
   r+=source[j]*weight;g+=source[j+1]*weight;b+=source[j+2]*weight;total+=weight;
  }
  data[i]=source[i]+blend*(r/total-source[i]);data[i+1]=source[i+1]+blend*(g/total-source[i+1]);data[i+2]=source[i+2]+blend*(b/total-source[i+2]);
 }
}

export function adjustTones(data:Uint8ClampedArray,s:Settings){
 const saturation=s.grayscale?0:s.saturation/100,contrast=s.contrast/100;
 const black=(s.blackPoint||0)/100*.25,shadows=(s.shadows||0)/100,highlights=(s.highlights||0)/100;
 for(let i=0;i<data.length;i+=4){
  const luminance=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;
  const l=luminance/255,shift=shadows*(1-l)**2*.35+highlights*l*l*.35;
  for(let c=0;c<3;c++){
   let value=((luminance+(data[i+c]-luminance)*saturation)*s.brightness/100-128)*contrast+128;
   value+=shift*255;
   data[i+c]=Math.max(0,Math.min(255,(value-black*255)/(1-black)));
  }
 }
}

/** Bounded-memory strips with untouched halo rows prevent denoising seams. */
export function adjustPhoto(context:CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,width:number,height:number,s:Settings){
 let previous:Uint8ClampedArray|undefined;
 for(let row=0;row<height;row+=256){
  const count=Math.min(256,height-row),top=row>0?1:0,start=row-top;
  const image=context.getImageData(0,start,width,Math.min(height-start,count+top+1));
  if(previous)image.data.set(previous,0);
  previous=image.data.slice((top+count-1)*width*4,(top+count)*width*4);
  reduceNoise(image.data,width,image.height,s.noiseReduction||0);
  adjustTones(image.data,s);
  context.putImageData(image,0,start,0,top,width,count);
 }
}

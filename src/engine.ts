import {defaults,palettes,type Settings} from './state';
import {drawGeometry,drawFlow} from './geometry';
import type {SubjectMask} from './subjectMask';
import {adjustPhoto} from './photoAdjustments';
import {drawCircleChain} from './circleChain';
type Surface=OffscreenCanvas|HTMLCanvasElement;
type Context=OffscreenCanvasRenderingContext2D|CanvasRenderingContext2D;
function surface(w:number,h:number):Surface {if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function ctx(c:Surface):Context{return c.getContext('2d',{willReadFrequently:true}) as Context;}
function rgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export const pipeline='Composition → Color → Pixel → Dither → Halftone → Contours → Grid → Engraving → Geometry → Circle chain → Portrait window';
export function render(source:ImageBitmap,s:Settings,width:number,height:number,compare=false,subject:SubjectMask|null=null):Surface{
 const out=surface(width,height),o=ctx(out),ratio=({square:1,portrait:4/5,story:9/16,landscape:16/9} as Record<string,number>)[s.ratio]||source.width/source.height;
 let sw=source.width,sh=source.height;if(sw/sh>ratio)sw=sh*ratio;else sh=sw/ratio;
 const sx=(source.width-sw)*s.x/100,sy=(source.height-sh)*s.y/100;
 o.imageSmoothingQuality='high';o.drawImage(source,sx,sy,sw,sh,0,0,width,height);if(compare)return out;
 // One canonical raster keeps thresholds, sampled colors and geometry consistent across preview and export.
 const w=ratio>=1?1200:Math.max(1,Math.round(1200*ratio)),h=ratio>=1?Math.max(1,Math.round(1200/ratio)):1200;
 const base=surface(w,h),b=ctx(base);b.drawImage(source,sx,sy,sw,sh,0,0,w,h);
 adjustPhoto(b,w,h,s);
 // Preserve native source detail for color-only output.
 if(!s.pixel&&!s.mosaic&&!s.dither&&!s.halftone)adjustPhoto(o,width,height,s);
 if(s.pixel){const small=surface(Math.max(1,Math.ceil(w/s.pixelSize)),Math.max(1,Math.ceil(h/s.pixelSize))),p=ctx(small);p.drawImage(base,0,0,small.width,small.height);if(s.pixelColors){const cells=p.getImageData(0,0,small.width,small.height),ink=rgb(s.pixelInk),paper=rgb(s.pixelPaper);for(let i=0;i<cells.data.length;i+=4){const lum=(cells.data[i]*.2126+cells.data[i+1]*.7152+cells.data[i+2]*.0722)/255;for(let c=0;c<3;c++)cells.data[i+c]=ink[c]+(paper[c]-ink[c])*lum;}p.putImageData(cells,0,0);}b.imageSmoothingEnabled=false;b.drawImage(small,0,0,w,h);b.imageSmoothingEnabled=true;}
 if(s.mosaic){const pixels=b.getImageData(0,0,w,h).data,c=s.cellSize;b.save();b.globalAlpha=s.mosaicOpacity/100;for(let y=0;y<h;y+=c)for(let x=0;x<w;x+=c){const triangles=[[[x,y],[x+c,y],[x,y+c]],[[x+c,y],[x+c,y+c],[x,y+c]]];for(const t of triangles){const tx=Math.min(w-1,Math.round(t.reduce((a,p)=>a+p[0],0)/3)),ty=Math.min(h-1,Math.round(t.reduce((a,p)=>a+p[1],0)/3)),i=(ty*w+tx)*4;b.fillStyle=`rgb(${pixels[i]},${pixels[i+1]},${pixels[i+2]})`;b.beginPath();t.forEach((p,i)=>i?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.closePath();b.fill();}}b.restore();}
 if(s.dither){const matrix=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],pixels=b.getImageData(0,0,w,h).data,[dark,light]=s.palette==='custom'?[s.ditherInk,s.ditherPaper]:palettes[s.palette],c=s.ditherSize;
 for(let y=0;y<h;y+=c)for(let x=0;x<w;x+=c){const i=(y*w+x)*4,lum=(pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255;b.fillStyle=lum>(matrix[(Math.floor(y/c)%4)*4+Math.floor(x/c)%4]+.5)/16?light:dark;b.fillRect(x,y,c,c);}}
 if(s.pixel||s.mosaic||s.dither||s.halftone){o.imageSmoothingEnabled=!(s.pixel||s.dither);o.drawImage(base,0,0,width,height);o.imageSmoothingEnabled=true;}
 o.save();o.scale(width/w,height/h);
 if(s.halftone){const pixels=b.getImageData(0,0,w,h).data;const a=s.angle*Math.PI/180,co=Math.cos(a),si=Math.sin(a),diag=Math.hypot(w,h);o.fillStyle=s.halftonePaper;o.fillRect(0,0,w,h);o.fillStyle=s.halftoneInk;o.beginPath();for(let y=-diag/2;y<diag/2;y+=s.spacing)for(let x=-diag/2;x<diag/2;x+=s.spacing){const px=x*co-y*si+w/2,py=x*si+y*co+h/2;if(px<0||py<0||px>=w||py>=h)continue;const i=(Math.floor(py)*w+Math.floor(px))*4,lum=(pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255,r=s.spacing*.53*Math.sqrt(1-lum)*s.dotScale;if(r>.1){o.moveTo(px+r,py);o.arc(px,py,r,0,Math.PI*2);}}o.fill();}
 if(s.contour){
  const pixels=b.getImageData(0,0,w,h).data,step=4,cols=Math.ceil(w/step)+1,rows=Math.ceil(h/step)+1,lum=new Float32Array(cols*rows);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=(Math.min(h-1,y*step)*w+Math.min(w-1,x*step))*4;lum[y*cols+x]=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;}
  o.strokeStyle=s.contourColor;o.globalAlpha=s.contourOpacity/100;o.lineWidth=s.lineWidth;o.lineJoin='round';
  for(let level=1;level<=s.levels;level++){const t=255*level/(s.levels+1);o.beginPath();for(let y=0;y<rows-1;y++)for(let x=0;x<cols-1;x++){
   const v=[lum[y*cols+x],lum[y*cols+x+1],lum[(y+1)*cols+x+1],lum[(y+1)*cols+x]],points=[[x*step,y*step],[(x+1)*step,y*step],[(x+1)*step,(y+1)*step],[x*step,(y+1)*step]],cross:number[][]=[];
   for(let e=0;e<4;e++){const n=(e+1)%4;if((v[e]>=t)!==(v[n]>=t)){const f=(t-v[e])/(v[n]-v[e]);cross.push([points[e][0]+f*(points[n][0]-points[e][0]),points[e][1]+f*(points[n][1]-points[e][1])]);}}
   // Resolve saddle cells according to their center luminance.
   if(cross.length===4&&v.reduce((a,n)=>a+n,0)/4>=t)cross.push(cross.shift()!);
   for(let i=0;i+1<cross.length;i+=2){o.moveTo(...cross[i] as [number,number]);o.lineTo(...cross[i+1] as [number,number]);}
  }o.stroke();}o.globalAlpha=1;
 }
 if(s.grid){
  const layer=s.gridSubject&&subject?surface(width,height):null,g=layer?ctx(layer):o;
  if(layer)g.scale(width/w,height/h);g.save();g.strokeStyle=s.gridColor;g.lineWidth=s.gridWidth;g.globalAlpha=s.gridOpacity/100;g.beginPath();for(let x=0;x<=w;x+=s.gridSpacing){g.moveTo(x,0);g.lineTo(x,h);}for(let y=0;y<=h;y+=s.gridSpacing){g.moveTo(0,y);g.lineTo(w,y);}g.stroke();g.restore();
  if(layer&&subject){const mask=surface(subject.width,subject.height),m=ctx(mask),pixels=m.createImageData(subject.width,subject.height);pixels.data.set(subject.data);m.putImageData(pixels,0,0);g.globalCompositeOperation='destination-out';g.globalAlpha=1;g.drawImage(mask,sx/source.width*subject.width,sy/source.height*subject.height,sw/source.width*subject.width,sh/source.height*subject.height,0,0,w,h);o.save();o.globalAlpha=1;o.drawImage(layer,0,0,w,h);o.restore();}
 }
 if(s.flow)drawFlow(o,b.getImageData(0,0,w,h).data,w,h,s);
 if(s.field)drawGeometry(o,b.getImageData(0,0,w,h).data,w,h,s);
 if(s.circleChain)drawCircleChain(o,b.getImageData(0,0,w,h).data,w,h,s);
 o.restore();
 if(s.portraitWindow){
  // Render the same crop with an independent treatment, then clip in output coordinates.
  const treatment:Settings={...defaults,ratio:s.ratio,x:s.x,y:s.y,brightness:s.brightness,contrast:s.contrast,saturation:s.saturation,grayscale:s.grayscale,blackPoint:s.blackPoint,shadows:s.shadows,highlights:s.highlights,noiseReduction:s.noiseReduction,contour:false,grid:false,gridSubject:false,portraitWindow:false,
   halftone:s.windowStyle==='halftone',flow:s.windowStyle==='engraving',dither:s.windowStyle==='dither',pixel:s.windowStyle==='pixel',
   spacing:s.windowDetail,flowSpacing:s.windowDetail,pixelSize:s.windowDetail*2,ditherSize:Math.max(1,Math.round(s.windowDetail/3)),palette:'custom',ditherInk:s.windowDitherInk,ditherPaper:s.windowDitherPaper,halftoneInk:s.windowHalftoneInk,halftonePaper:s.windowHalftonePaper,flowColor:s.windowFlowColor,pixelColors:s.windowPixelColors,pixelInk:s.windowPixelInk,pixelPaper:s.windowPixelPaper};
  if(s.windowStyle==='contour'){treatment.contour=true;treatment.contourColor=s.windowContourColor;}
  const layer=render(source,treatment,width,height,s.windowStyle==='original');
  const ww=width*s.windowWidth/100,wh=height*s.windowHeight/100,x=(width-ww)*s.windowX/100,y=(height-wh)*s.windowY/100;
  o.save();o.beginPath();o.rect(x,y,ww,wh);o.clip();o.drawImage(layer,0,0);o.restore();
  if(s.windowOutline){const line=width/w;o.save();o.strokeStyle=s.windowOutlineColor;o.lineWidth=line;o.strokeRect(x+line/2,y+line/2,Math.max(0,ww-line),Math.max(0,wh-line));o.restore();}
 }
 return out;
}

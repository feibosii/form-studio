import type {Settings} from './state';
type Circle={x:number;y:number;r:number};
type Context=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
export function intersections(a:Circle,b:Circle):{x:number;y:number}[]{
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
 if(d<1e-8||d>a.r+b.r||d<Math.abs(a.r-b.r))return [];
 const along=(a.r*a.r-b.r*b.r+d*d)/(2*d),height=Math.sqrt(Math.max(0,a.r*a.r-along*along)),x=a.x+along*dx/d,y=a.y+along*dy/d;
 return height<1e-8?[{x,y}]:[{x:x-height*dy/d,y:y+height*dx/d},{x:x+height*dy/d,y:y-height*dx/d}];
}
export function chainCircles(pixels:Uint8ClampedArray,w:number,h:number,s:Settings):Circle[]{
 const lum=(x:number,y:number)=>{const i=(Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4;return pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;};
 let x=w/2,y=h/2,best=0;
 for(let py=8;py<h-8;py+=4)for(let px=8;px<w-8;px+=4){const edge=Math.hypot(lum(px+3,py)-lum(px-3,py),lum(px,py+3)-lum(px,py-3));if(edge>best){best=edge;x=px;y=py;}}
 const angle=s.chainAngle*Math.PI/180;let dx=Math.cos(angle),dy=Math.sin(angle);
 const room=(vx:number,vy:number)=>Math.min(Math.abs(vx)<1e-8?Infinity:(vx>0?w-x:x)/Math.abs(vx),Math.abs(vy)<1e-8?Infinity:(vy>0?h-y:y)/Math.abs(vy));
 if(room(-dx,-dy)>room(dx,dy)){dx=-dx;dy=-dy;}
 const circles:Circle[]=[];let r=s.chainRadius;
 for(let i=0;i<s.chainCount;i++){circles.push({x,y,r});const next=r*s.chainRatio;const distance=(r+next)*.55;x+=dx*distance;y+=dy*distance;r=next;}
 return circles;
}
export function drawCircleChain(o:Context,pixels:Uint8ClampedArray,w:number,h:number,s:Settings){
 const circles=chainCircles(pixels,w,h,s);o.save();o.strokeStyle=o.fillStyle=s.chainColor;o.globalAlpha=s.chainOpacity/100;o.lineWidth=1;
 for(const c of circles){o.beginPath();o.arc(c.x,c.y,c.r,0,Math.PI*2);o.stroke();}
 if(s.chainIntersections)for(let i=1;i<circles.length;i++)for(const p of intersections(circles[i-1],circles[i])){o.beginPath();o.arc(p.x,p.y,2.2,0,Math.PI*2);o.fill();}
 o.restore();
}

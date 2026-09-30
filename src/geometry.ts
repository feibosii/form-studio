import {geometryColors} from './state';
import type {Settings} from './state';
type Context=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
type Point={x:number,y:number,l:number,color:string,angle:number,rnd:number;edge:number};
export function seededRandom(seed:number){let a=seed|0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
// Bowyer–Watson: remove circumcircle cavities and retriangulate their boundaries.
function delaunay(points:Point[]):[number,number][]{
 const p=points.map(q=>[q.x,q.y]),n=p.length;p.push([-10000,-10000],[10000,-10000],[0,20000]);
 const triangle=(a:number,b:number,c:number)=>{const [ax,ay]=p[a],[bx,by]=p[b],[cx,cy]=p[c],d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));if(Math.abs(d)<1e-9)return null;const aa=ax*ax+ay*ay,bb=bx*bx+by*by,cc=cx*cx+cy*cy,x=(aa*(by-cy)+bb*(cy-ay)+cc*(ay-by))/d,y=(aa*(cx-bx)+bb*(ax-cx)+cc*(bx-ax))/d;return {a,b,c,x,y,r:(ax-x)**2+(ay-y)**2};};
 let ts=[triangle(n,n+1,n+2)!];
 for(let i=0;i<n;i++){const edges=new Map<string,[number,number]>(),keep:typeof ts=[];for(const t of ts){if((p[i][0]-t.x)**2+(p[i][1]-t.y)**2<=t.r+1e-7){for(const [a,b] of [[t.a,t.b],[t.b,t.c],[t.c,t.a]]){const key=a<b?`${a}:${b}`:`${b}:${a}`;if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}}else keep.push(t);}for(const [a,b] of edges.values()){const t=triangle(a,b,i);if(t)keep.push(t);}ts=keep;}
 const edges=new Map<string,[number,number]>();for(const t of ts)if(t.a<n&&t.b<n&&t.c<n)for(const [a,b] of [[t.a,t.b],[t.b,t.c],[t.c,t.a]])edges.set(a<b?`${a}:${b}`:`${b}:${a}`,[a,b]);return [...edges.values()];
}
export function drawGeometry(o:Context,pixels:Uint8ClampedArray,w:number,h:number,s:Settings){
 const random=seededRandom(s.seed),lum=(x:number,y:number)=>{const i=(Math.max(0,Math.min(h-1,Math.round(y)))*w+Math.max(0,Math.min(w-1,Math.round(x))))*4;return (pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255;};
 const points:Point[]=[],buckets=new Set<string>(),cell=Math.sqrt(w*h/s.density)*.42;
 for(let i=0;i<s.density*20&&points.length<s.density;i++){const x=random()*(w-2)+1,y=random()*(h-2)+1,l=lum(x,y),gx=lum(x+3,y)-lum(x-3,y),gy=lum(x,y+3)-lum(x,y-3),edge=Math.hypot(gx,gy),keep=s.distribution==='edge'?edge*100>=s.edgeThreshold:s.distribution==='luminance'?random()>.15+l*.72:true;if(!keep)continue;const key=`${Math.floor(x/cell)}:${Math.floor(y/cell)}`;if(buckets.has(key))continue;buckets.add(key);const idx=(Math.floor(y)*w+Math.floor(x))*4;points.push({x,y,l,color:`rgb(${pixels[idx]},${pixels[idx+1]},${pixels[idx+2]})`,angle:Math.atan2(gy,gx)+Math.PI/2,rnd:random(),edge});}
 const [ink,paper]=geometryColors(s);
 o.save();o.globalAlpha=1-s.sourceOpacity/100;o.fillStyle=paper;o.fillRect(0,0,w,h);o.globalAlpha=s.linkOpacity/100;o.lineWidth=s.linkWidth;
 let links:[number,number][]=[];
 if(s.connection==='delaunay')links=delaunay(points);
 else if(s.connection==='radial'&&points.length){const center=points.reduce((best,p,i)=>Math.hypot(p.x-w/2,p.y-h/2)<Math.hypot(points[best].x-w/2,points[best].y-h/2)?i:best,0);links=points.map((_,i)=>[center,i]);}
 else if(s.connection!=='none'){for(let i=0;i<points.length;i++){const a=points[i],near=points.map((b,j)=>({j,d:Math.hypot(a.x-b.x,a.y-b.y),alignment:Math.abs(Math.cos(Math.atan2(b.y-a.y,b.x-a.x)-a.angle))})).filter(q=>q.j!==i&&q.d<s.linkDistance&&(s.connection!=='chain'||q.alignment>.7)).sort((a,b)=>a.d-b.d).slice(0,s.connection==='chain'?1:2);for(const q of near)if(q.j>i)links.push([i,q.j]);}}
 for(const [i,j] of links){const a=points[i],b=points[j];if(Math.hypot(a.x-b.x,a.y-b.y)>s.linkDistance)continue;o.strokeStyle=s.customLinkColor?s.linkColor:s.fieldColor==='source'?a.color:ink;o.beginPath();o.moveTo(a.x,a.y);if(s.connection==='orthogonal'||(s.connection==='hybrid'&&i%2===0))o.lineTo(b.x,a.y);o.lineTo(b.x,b.y);o.stroke();}
 o.globalAlpha=s.fieldOpacity/100;o.lineWidth=s.shapeStroke;const shapes=['circle','square','diamond','cross','bracket','triangle'];
 for(const p of points){const f=(1-p.l)*s.hierarchy/100+p.rnd*(1-s.hierarchy/100),r=(Math.min(s.minShape,s.maxShape)+Math.abs(s.maxShape-s.minShape)*f)/2,shape=s.shape==='mixed'?shapes[Math.floor(p.rnd*shapes.length)]:s.shape;
 o.save();o.translate(p.x,p.y);o.rotate(p.angle*s.variation/100);o.strokeStyle=o.fillStyle=s.fieldColor==='source'?p.color:ink;o.beginPath();
 if(shape==='circle')o.arc(0,0,r,0,Math.PI*2);else if(shape==='square')o.rect(-r,-r,r*2,r*2);
 else if(shape==='diamond'){o.moveTo(0,-r);o.lineTo(r,0);o.lineTo(0,r);o.lineTo(-r,0);o.closePath();}
 else if(shape==='triangle'){o.moveTo(0,-r);o.lineTo(r,r);o.lineTo(-r,r);o.closePath();}
 else if(shape==='cross'){o.moveTo(-r,0);o.lineTo(r,0);o.moveTo(0,-r);o.lineTo(0,r);}
 else if(shape==='bracket'){for(const sign of [-1,1]){o.moveTo(sign*r,sign*r*.25);o.lineTo(sign*r,sign*r);o.lineTo(sign*r*.25,sign*r);}}
 else if(shape==='glyph'){o.font=`${Math.max(6,r*2)}px monospace`;o.textAlign='center';o.textBaseline='middle';o.fillText(' .:+*#%@'[Math.min(7,Math.floor((1-p.l)*8))],0,0);}
 if(s.shapeFill&&['circle','square','triangle','diamond'].includes(shape))o.fill();else o.stroke();o.restore();}
 if(s.nodeLabels){
  const degree=new Array(points.length).fill(0);for(const [i,j] of links)if(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)<=s.linkDistance){degree[i]++;degree[j]++;}
  const ranked=points.map((p,i)=>({p,i,score:p.edge*4+degree[i]*.08})).sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.ceil(points.length*.4)));
  const rng=seededRandom(s.seed^0x51A7);const chosen=ranked.map(v=>({...v,order:rng()})).sort((a,b)=>a.order-b.order);
  const boxes:{x:number;y:number;w:number;h:number}[]=[];
  o.font=`${s.labelSize}px monospace`;o.textAlign='left';o.textBaseline='top';o.globalAlpha=s.fieldOpacity/100;
  for(const {p,i} of chosen){if(boxes.length>=Math.min(s.labelCount,Math.ceil(points.length*.15)))break;
   const kind=Math.floor(rng()*3),letter=String.fromCharCode(65+Math.floor(rng()*26)),text=kind===0?`${letter}${String(i+1).padStart(3,'0')}`:kind===1?`L=${p.l.toFixed(2)}`:`θ=${Math.round(p.angle*180/Math.PI)}°`;
   const width=o.measureText(text).width,height=s.labelSize+4,gap=Math.max(s.minShape,s.maxShape)/2+5;
   const x=p.x+gap+width<w-6?p.x+gap:p.x-gap-width,y=Math.max(6,Math.min(h-height-6,p.y-height/2));
   if(x<6||x+width>w-6||height>h-12||boxes.some(b=>x<b.x+b.w+18&&x+width+18>b.x&&y<b.y+b.h+14&&y+height+14>b.y))continue;
   boxes.push({x,y,w:width,h:height});o.fillStyle=s.labelColor;o.fillText(text,x,y);
  }
 }
 o.restore();
}
export function drawFlow(o:Context,pixels:Uint8ClampedArray,w:number,h:number,s:Settings){o.save();o.globalAlpha=s.flowOpacity/100;o.lineWidth=s.flowWidth;o.strokeStyle=s.flowColor;for(let y=0;y<h;y+=s.flowSpacing){o.beginPath();for(let x=0;x<=w;x+=3){const i=(Math.min(h-1,Math.round(y))*w+Math.min(w-1,x))*4,lum=(pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255,py=y+(lum-.5)*s.flowStrength+Math.sin(x/75+y/95)*s.flowStrength*.2;x?o.lineTo(x,py):o.moveTo(x,py);}o.stroke();}o.restore();}

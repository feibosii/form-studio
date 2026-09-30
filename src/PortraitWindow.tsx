import {useRef,type PointerEvent} from 'react';
import type {Settings} from './state';
export function PortraitWindow({s,update,begin,end,t}:{s:Settings;update:(v:Partial<Settings>)=>void;begin:()=>void;end:()=>void;t:(v:string)=>string}){
 const drag=useRef<{id:number;x:number;y:number;w:number;h:number;left:number;top:number;width:number;height:number;corner:string}|null>(null);
 const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
 const down=(e:PointerEvent<HTMLDivElement>)=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const r=e.currentTarget.parentElement!.getBoundingClientRect();begin();drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,left:(100-s.windowWidth)*s.windowX/100,top:(100-s.windowHeight)*s.windowY/100,width:s.windowWidth,height:s.windowHeight,corner:(e.target as HTMLElement).dataset.corner||''};e.currentTarget.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=(e.clientX-d.x)/d.w*100,dy=(e.clientY-d.y)/d.h*100;let l=d.left,top=d.top,w=d.width,h=d.height;
 if(!d.corner){l=clamp(l+dx,0,100-w);top=clamp(top+dy,0,100-h);}else{const right=l+w,bottom=top+h;if(d.corner.includes('l')){l=clamp(l+dx,0,right-10);w=right-l;}else w=clamp(w+dx,10,100-l);if(d.corner.includes('t')){top=clamp(top+dy,0,bottom-10);h=bottom-top;}else h=clamp(h+dy,10,100-top);}
 const round=(v:number)=>Math.round(v*10)/10;update({windowWidth:round(w),windowHeight:round(h),windowX:round(w>=100?50:l/(100-w)*100),windowY:round(h>=100?50:top/(100-h)*100)});};
 const finish=()=>{if(drag.current){drag.current=null;end();}};
 return <div className="portrait-window-editor" aria-label={t('Move portrait window')} onPointerDown={down} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} style={{left:`${(100-s.windowWidth)*s.windowX/100}%`,top:`${(100-s.windowHeight)*s.windowY/100}%`,width:`${s.windowWidth}%`,height:`${s.windowHeight}%`}}>{['tl','tr','bl','br'].map(c=><span key={c} data-corner={c} className={`window-handle ${c}`}/>)}</div>;
}

import {useEffect,useLayoutEffect,useRef,useState,type RefObject} from 'react';

/** Camera-only motion: one composited update per display frame, no editor rerenders. */
export function useCanvasView(viewport:RefObject<HTMLDivElement|null>){
 const artwork=useRef<HTMLDivElement>(null),zoomOutput=useRef<HTMLOutputElement>(null);
 const position=useRef({x:0,y:0,zoom:1}),frame=useRef<number|null>(null);
 const pointer=useRef<{id:number;x:number;y:number;originX:number;originY:number}|null>(null);
 const rasterZoom=useRef(1);
 const [detailZoom,setDetailZoom]=useState(1),detailTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const refine=()=>{if(detailTimer.current)clearTimeout(detailTimer.current);detailTimer.current=setTimeout(()=>setDetailZoom(position.current.zoom),320);};
 const lockedRef=useRef(false),[locked,setLocked]=useState(false);
 const paint=()=>{frame.current=null;const p=position.current;if(artwork.current){artwork.current.style.translate=`${p.x}px ${p.y}px`;artwork.current.style.scale=String(p.zoom/rasterZoom.current);}if(zoomOutput.current)zoomOutput.current.value=`${Math.round(p.zoom*100)}%`;};
 // Rebase the settled zoom into layout dimensions so WebKit cannot stretch a cached texture.
 useLayoutEffect(()=>{const el=artwork.current;rasterZoom.current=detailZoom;if(!el)return;el.style.transition='none';paint();void el.offsetWidth;const id=requestAnimationFrame(()=>{el.style.transition='';});return()=>cancelAnimationFrame(id);},[detailZoom]);
 const schedule=()=>{if(frame.current===null)frame.current=requestAnimationFrame(paint);};
 const stop=()=>{const drag=pointer.current;pointer.current=null;const host=viewport.current;host?.classList.remove('is-dragging');if(drag&&host?.hasPointerCapture(drag.id))host.releasePointerCapture(drag.id);};
 const reset=()=>{stop();position.current={x:0,y:0,zoom:1};schedule();refine();};
 const zoomBy=(delta:number)=>{if(lockedRef.current)return;position.current.zoom=Math.max(.25,Math.min(4,position.current.zoom+delta));schedule();refine();};
 const toggleLock=()=>{stop();lockedRef.current=!lockedRef.current;setLocked(lockedRef.current);};
 useEffect(()=>{
  const host=viewport.current;if(!host)return;
  const down=(e:PointerEvent)=>{if(lockedRef.current||pointer.current||!e.isPrimary||e.button!==0||(e.target as Element).closest('.portrait-window-editor,.zoom-tools,button,input,select'))return;e.preventDefault();pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY,originX:position.current.x,originY:position.current.y};host.setPointerCapture(e.pointerId);host.classList.add('is-dragging');};
  const move=(e:PointerEvent)=>{const drag=pointer.current;if(lockedRef.current||!drag||e.pointerId!==drag.id)return;position.current.x=drag.originX+e.clientX-drag.x;position.current.y=drag.originY+e.clientY-drag.y;schedule();};
  const up=(e:PointerEvent)=>{if(pointer.current?.id!==e.pointerId)return;move(e);stop();};
  const cancel=(e:PointerEvent)=>{if(pointer.current?.id===e.pointerId)stop();};
  const wheel=(e:WheelEvent)=>{if((e.target as Element).closest('.zoom-tools'))return;e.preventDefault();if(lockedRef.current)return;const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?host.clientHeight:1);position.current.zoom=Math.max(.25,Math.min(4,position.current.zoom*Math.exp(-Math.max(-150,Math.min(150,delta))*.002)));schedule();refine();};
  const preventDrag=(e:DragEvent)=>e.preventDefault();
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancel);host.addEventListener('lostpointercapture',cancel);host.addEventListener('wheel',wheel,{passive:false});host.addEventListener('dragstart',preventDrag);
  paint();
  return()=>{if(detailTimer.current)clearTimeout(detailTimer.current);stop();if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null;host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancel);host.removeEventListener('lostpointercapture',cancel);host.removeEventListener('wheel',wheel);host.removeEventListener('dragstart',preventDrag);};
 },[]);
 return {artwork,zoomOutput,detailZoom,locked,toggleLock,zoomBy,reset,fit:()=>{if(!lockedRef.current)reset();}};
}

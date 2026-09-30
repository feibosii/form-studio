import {useLayoutEffect,useRef,type ReactNode} from 'react';

export function Sidebar({className,children}:{className:string;children:ReactNode}){
 const panel=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),thumb=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const host=panel.current!,view=viewport.current!,body=content.current!,handle=thumb.current!,rail=track.current!;
  let frame=0,drag:{id:number;y:number;scroll:number;ratio:number}|null=null;
  const update=()=>{frame=0;const h=view.clientHeight,total=Math.max(h,body.offsetHeight),usable=h>0&&total>h+1;host.dataset.scrollable=String(usable);rail.setAttribute('aria-hidden',String(!usable));
   const size=usable?Math.max(28,h*h/total):h;handle.style.height=`${size}px`;handle.style.transform=`translateY(${usable?(h-size)*view.scrollTop/(total-h):0}px)`;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const down=(e:PointerEvent)=>{if(host.dataset.scrollable!=='true'||e.button!==0)return;e.preventDefault();const h=view.clientHeight,rect=handle.getBoundingClientRect(),travel=h-rect.height;if(travel<=0)return;
   if(e.target!==handle)view.scrollTop=(e.clientY-rail.getBoundingClientRect().top-rect.height/2)/travel*(view.scrollHeight-h);
   drag={id:e.pointerId,y:e.clientY,scroll:view.scrollTop,ratio:(view.scrollHeight-h)/travel};rail.setPointerCapture(e.pointerId);host.dataset.dragging='true';schedule();
  };
  const move=(e:PointerEvent)=>{if(drag&&drag.id===e.pointerId){view.scrollTop=drag.scroll+(e.clientY-drag.y)*drag.ratio;schedule();}};
  const up=()=>{drag=null;delete host.dataset.dragging;};
  const observer=new ResizeObserver(schedule);observer.observe(view);observer.observe(body);view.addEventListener('scroll',schedule,{passive:true});rail.addEventListener('pointerdown',down);rail.addEventListener('pointermove',move);rail.addEventListener('pointerup',up);rail.addEventListener('pointercancel',up);rail.addEventListener('lostpointercapture',up);update();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();view.removeEventListener('scroll',schedule);rail.removeEventListener('pointerdown',down);rail.removeEventListener('pointermove',move);rail.removeEventListener('pointerup',up);rail.removeEventListener('pointercancel',up);rail.removeEventListener('lostpointercapture',up);};
 },[]);
 return <aside ref={panel} className={className}><div ref={viewport} className="sidebar-scroll"><div ref={content} className="sidebar-content">{children}</div></div><div ref={track} className="sidebar-track" aria-hidden="true"><div ref={thumb} className="sidebar-thumb"/></div></aside>;
}

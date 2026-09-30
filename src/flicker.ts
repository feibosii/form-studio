import {useEffect,useLayoutEffect,useRef} from 'react';

/** Brief local feedback; never hide controls or delay interaction. */
export function useFlicker(locale:string,mode:string,tab:string){
 const root=useRef<HTMLDivElement>(null);
 const active=useRef(new Map<Element,Animation>());
 const previous=useRef<{locale:string,mode:string,tab:string}|null>(null);
 const play=(elements:Element[])=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  elements.forEach(element=>{
   if(!element.getClientRects().length)return;
   active.current.get(element)?.cancel();
   const animation=element.animate([
    {opacity:.78,translate:'0 1px',offset:0},
    {opacity:1,translate:'0 0',offset:.45},
    {opacity:.9,translate:'0 0',offset:.60},
    {opacity:1,translate:'0 0',offset:1},
   ],{duration:240,easing:'cubic-bezier(.2,.7,.3,1)'});
   active.current.set(element,animation);
   animation.onfinish=()=>{if(active.current.get(element)===animation)active.current.delete(element);};
  });
 };
 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion: reduce)');
  const stop=()=>{if(query.matches){active.current.forEach(a=>a.cancel());active.current.clear();}};
  query.addEventListener('change',stop);
  return()=>{query.removeEventListener('change',stop);active.current.forEach(a=>a.cancel());active.current.clear();};
 },[]);
 useLayoutEffect(()=>{
  const before=previous.current;
  previous.current={locale,mode,tab};
  const selector=!before?'header .brand':before.locale!==locale?
   '.language-toggle,.section summary>span:nth-child(2),.preset-control>span':
   before.mode!==mode?'.mode-switch [aria-pressed=true]':
   before.tab!==tab?'.mobile-tabs [aria-pressed=true]':'';
  if(selector)play(Array.from(root.current?.querySelectorAll(selector)??[]));
 },[locale,mode,tab]);
 return {root,onChangeCapture:(event:React.FormEvent<HTMLDivElement>)=>{
  const target=event.target as HTMLElement;
  if(target.matches('select'))play([target]);
  if(target.matches('input[type=checkbox]')){
   const label=target.closest('.toggle')?.querySelector('span');
   if(label)play([label]);
  }
 },onClickCapture:(event:React.MouseEvent<HTMLDivElement>)=>{
  const target=event.target as HTMLElement;
  const control=target.closest('.shape-picker button');
  if(control)play(control.matches('summary')?Array.from(control.querySelectorAll('span:nth-child(2)')):[control]);
 }};
}

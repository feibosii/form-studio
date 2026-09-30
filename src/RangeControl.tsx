import {memo,useLayoutEffect,useEffect,useRef} from 'react';
import type {Settings} from './state';
import {parseRangeValue} from './rangeValue';

type Props={label:string;setting:keyof Settings;value:number;min:number;max:number;step:number;suffix:string;disabled:boolean;begin:()=>void;end:()=>void;update:(patch:Partial<Settings>)=>void};
/** Native thumb and readout respond immediately; editing work is batched per display frame. */
export const RangeControl=memo(function RangeControl(p:Props){
 const input=useRef<HTMLInputElement>(null),output=useRef<HTMLInputElement>(null),editing=useRef(false);
 const nativeValue=useRef(p.value);
 const frame=useRef(0),pending=useRef<number|null>(null),dragging=useRef(false);
 const latest=useRef(p);latest.current=p;
 const flush=()=>{cancelAnimationFrame(frame.current);frame.current=0;if(pending.current!==null){const value=pending.current;pending.current=null;latest.current.update({[latest.current.setting]:value});}};
 const finish=()=>{if(!dragging.current&&pending.current===null)return;flush();dragging.current=false;latest.current.end();};
 useLayoutEffect(()=>{if(!dragging.current&&pending.current===null){nativeValue.current=p.value;if(input.current)input.current.value=String(p.value);}if(output.current&&!editing.current)output.current.value=`${nativeValue.current}${p.suffix}`;});
 const commit=()=>{if(!editing.current)return;editing.current=false;const props=latest.current,value=parseRangeValue(output.current!.value,props.min,props.max,props.step);if(value!==null&&value!==props.value){props.begin();props.update({[props.setting]:value});props.end();nativeValue.current=value;if(input.current)input.current.value=String(value);}output.current!.value=`${value??props.value}${props.suffix}`;};
 useEffect(()=>{
  // Let the browser own its native range-thumb drag. Capturing the pointer on
  // the input can steal it from the thumb in WebKit and turn drags into clicks.
  const release=()=>finish();
  window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);
  return()=>{cancelAnimationFrame(frame.current);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',release);};
 },[]);
 return <div className="range-control"><span>{p.label}<input className="range-value" ref={output} type="text" inputMode={p.min<0?'text':'decimal'} aria-label={p.label} disabled={p.disabled} defaultValue={`${p.value}${p.suffix}`} style={{width:`${Math.max(5,String(p.min).length+p.suffix.length+2,String(p.max).length+p.suffix.length+2)}ch`}}
 onFocus={e=>{editing.current=true;e.currentTarget.value=String(nativeValue.current);e.currentTarget.select();}}
 onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}else if(e.key==='Escape'){e.preventDefault();editing.current=false;e.currentTarget.value=`${latest.current.value}${latest.current.suffix}`;e.currentTarget.blur();}}}/></span><input ref={input} aria-label={p.label} type="range" disabled={p.disabled} min={p.min} max={p.max} step={p.step} defaultValue={p.value}
 onPointerDown={()=>{dragging.current=true;p.begin();}}
 onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} onBlur={finish}
 onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)){dragging.current=true;p.begin();}}} onKeyUp={finish}
 onChange={e=>{const value=Number(e.currentTarget.value);nativeValue.current=value;if(output.current)output.current.value=`${value}${p.suffix}`;pending.current=value;if(!frame.current)frame.current=requestAnimationFrame(flush);}}/></div>;
});

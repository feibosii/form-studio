import {useCallback,useRef,useState} from 'react';
import {defaults,type Settings} from './state';
export function useHistory(){
 const [state,setState]=useState<Settings>(defaults),current=useRef(state),past=useRef<Settings[]>([]),future=useRef<Settings[]>([]),start=useRef<Settings|null>(null);
 const [,refresh]=useState(0);const emit=useCallback((s:Settings)=>{current.current=s;setState(s);},[]);
 const begin=useCallback(()=>{if(!start.current)start.current=current.current;},[]);
 const end=useCallback(()=>{if(start.current&&JSON.stringify(start.current)!==JSON.stringify(current.current)){past.current=[...past.current.slice(-79),start.current];future.current=[];}start.current=null;refresh(n=>n+1);},[]);
 const update=useCallback((patch:Partial<Settings>,manual=true)=>{const next={...current.current,...patch,...(manual?{preset:'Custom'}:{})};if(JSON.stringify(next)===JSON.stringify(current.current))return;if(!start.current){past.current=[...past.current.slice(-79),current.current];future.current=[];}emit(next);},[emit]);
 const undo=useCallback(()=>{start.current=null;const previous=past.current.pop();if(previous){future.current.push(current.current);emit(previous);}},[]);
 const redo=useCallback(()=>{start.current=null;const next=future.current.pop();if(next){past.current.push(current.current);emit(next);}},[]);
 return {state,update,begin,end,undo,redo,canUndo:past.current.length>0,canRedo:future.current.length>0};
}

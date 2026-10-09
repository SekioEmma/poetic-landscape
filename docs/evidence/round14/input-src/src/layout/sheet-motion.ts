import {useLayoutEffect,useRef,useState,type RefObject} from 'react';
import type {ReaderLayout,ReadingSpace} from './reader-layout';
export type SheetRect={left:number;top:number;width:number;height:number};
export const rectOf=(el:HTMLElement):SheetRect=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};};
const frames=(r:SheetRect)=>({...Object.fromEntries(Object.entries(r).map(([k,v])=>[k,`${v}px`])),right:'auto',bottom:'auto',marginLeft:'0px',marginRight:'0px',transform:'none'});
function easing(x:number){let lo=0,hi=1;for(let i=0;i<14;i++){const t=(lo+hi)/2,q=1-t,v=3*q*q*t*.2+3*q*t*t*.2+t*t*t;if(v<x)lo=t;else hi=t;}const t=(lo+hi)/2,q=1-t;return 3*q*q*t*.8+3*q*t*t+t*t*t;}
// The next intent starts at the currently visible shell, not the old start/end.
export function useSheetMotion(ref:RefObject<HTMLElement|null>,space:ReadingSpace,layout:ReaderLayout,reduced:boolean,suspended:boolean,onStable:()=>void){
 const pending=useRef<SheetRect|null>(null),last=useRef<SheetRect|null>(null),revision=useRef(0),[version,setVersion]=useState(0);
 const stable=useRef(onStable);stable.current=onStable;
 const sample=useRef(0),trace=useRef<object[]>([]);
 function cancel(){revision.current++;cancelAnimationFrame(sample.current);}
 function capture(){const el=ref.current;if(!el)return;pending.current=rectOf(el);cancel();}
 function clearDrag(){const el=ref.current;if(!el)return;for(const k of ['left','top','width','height','right','bottom','marginLeft','marginRight','transform'] as const)el.style[k]='';}
 function refresh(){setVersion(v=>v+1);}
 function drag(r:SheetRect){const el=ref.current;if(!el)return;el.dataset.readerMotion='dragging';Object.assign(el.style,frames(r));}
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const from=pending.current??last.current;pending.current=null;cancel();clearDrag();const target=rectOf(el);last.current=target;el.dataset.targetRect=JSON.stringify({...target,right:target.left+target.width,bottom:target.top+target.height});const n=revision.current;
  const done=()=>{if(n!==revision.current)return;clearDrag();el.dataset.readerMotion='idle';stable.current();el.dispatchEvent(new CustomEvent('reader-settled',{bubbles:true}));};
  const quiet=reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!from||quiet||suspended||Object.keys(target).every(k=>Math.abs(target[k as keyof SheetRect]-from[k as keyof SheetRect])<.5)){done();return;}
  // Interpolate the shell's real layout box. Text keeps its own pixel size;
  // no finished WA effect or compositor layer survives a reversed intent.
  el.dataset.readerMotion='moving';trace.current=[];const start=performance.now(),tracing=new URLSearchParams(location.search).has('readerTrace');
  const tick=(now:number)=>{if(n!==revision.current)return;const progress=Math.min(1,(now-start)/220),eased=easing(progress);const box={} as SheetRect;for(const key of Object.keys(target) as (keyof SheetRect)[])box[key]=from[key]+(target[key]-from[key])*eased;Object.assign(el.style,frames(box));if(tracing){trace.current.push({t:now,...rectOf(el),space});el.dataset.shellFrames=JSON.stringify(trace.current);}if(progress<1)sample.current=requestAnimationFrame(tick);else done();};
  tick(start);
  return()=>cancel();
 },[space,layout.width,layout.height,layout.top,reduced,suspended,version]);
 return {capture,cancel,clearDrag,refresh,drag};
}

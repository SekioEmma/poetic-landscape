import {useLayoutEffect,useRef,type RefObject} from 'react';
import {mapReadingArea} from '../layout/reader-layout';
export function MapControls({host,kind,onZoom,onReset,disabled=false}:{host:RefObject<HTMLDivElement|null>;kind:'overview'|'local';onZoom:(direction:1|-1)=>void;onReset:()=>void;disabled?:boolean}){
 const tools=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const el=host.current,node=tools.current;if(!el||!node)return;
  const position=()=>{const a=mapReadingArea(el),b=el.getBoundingClientRect();let x=a.left+a.width-56,y=a.top+a.height-152;const selected=el.querySelector<HTMLElement>('.geo-entry.selected,.overview-entry.selected,.map-place.selected');const r=selected?.getBoundingClientRect();if(r&&r.right>b.left+x&&r.left<b.left+x+44&&r.bottom>b.top+y&&r.top<b.top+y+140)y=a.top+12;x=Math.max(a.left+4,x);y=Math.max(a.top+4,y);node.style.left=`${x}px`;node.style.top=`${y}px`;node.dataset.position=JSON.stringify({x,y,safe:a});};
  const update=()=>{position();const limits=el.dataset.zoomLimits;if(!limits)return;const {min,max,target}=JSON.parse(limits) as {min:number;max:number;target:number};const plus=node.querySelector<HTMLButtonElement>('[data-zoom=plus]'),minus=node.querySelector<HTMLButtonElement>('[data-zoom=minus]');if(plus){plus.disabled=disabled||target>=max-.001;plus.title=plus.disabled&&!disabled?'已到最大尺度':'放大';}if(minus){minus.disabled=disabled||target<=min+.001;minus.title=minus.disabled&&!disabled?'已到最小尺度':'缩小';}};
  const observer=new ResizeObserver(update);observer.observe(el);const root=el.closest('.app');const sheet=root?.querySelector('.reading-sheet');if(sheet)observer.observe(sheet);window.addEventListener('resize',update);root?.addEventListener('reader-settled',update);el.addEventListener('map-annotations',update);update();
  return()=>{observer.disconnect();window.removeEventListener('resize',update);root?.removeEventListener('reader-settled',update);el.removeEventListener('map-annotations',update);};
 });
 const reset=kind==='overview'?'看全国':'定位此地';
 return <div ref={tools} className={`map-toolset ${kind==='overview'?'overview-controls panzoom-exclude':'map-controls'}`} aria-label={kind==='overview'?'全国图面控制':'局部地图控制'} inert={disabled}>
  <button className="map-reset" disabled={disabled} aria-label={reset} title={reset} onClick={onReset}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg></button>
  <div className="map-zoom"><button data-zoom="plus" disabled={disabled} aria-label={kind==='overview'?'放大全国地图':'放大地图'} title="放大" onClick={()=>onZoom(1)}>＋</button><button data-zoom="minus" disabled={disabled} aria-label={kind==='overview'?'缩小全国地图':'缩小地图'} title="缩小" onClick={()=>onZoom(-1)}>−</button></div>
 </div>;
}

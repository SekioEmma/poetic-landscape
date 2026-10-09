import {useEffect,useLayoutEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {settleReaderGesture} from '../layout/reader-gesture';
import {useSheetMotion,rectOf,type SheetRect} from '../layout/sheet-motion';
import type {Place,Work,Relation,PlaceDetail} from '../data/catalog';
import {WorkReader} from './WorkReader';
import {PlaceContext} from './PlaceContext';
import {workScenes} from '../data/visual';
import {PoemPicture} from './PoemPicture';
import type {ReaderLayout,ReadingSpace} from '../layout/reader-layout';
export type ReadingTab='诗文'|'地点';
const tabs:ReadingTab[]=['诗文','地点'];
type Position={anchor:string|null;offset:number;top:number};
const positions=new Map<string,Position>();
export function ReadingPanel({place,detail,works,relations,workId,onWork,tab,onTab,space,layout,onSpace,onClose,onSource,failure,local,onMap,matched=true,closing=false,reduced=false,suspended=false}:{place:Place;detail:PlaceDetail;works:Work[];relations:Relation[];workId:string;onWork:(id:string)=>void;tab:ReadingTab;onTab:(tab:ReadingTab)=>void;space:ReadingSpace;layout:ReaderLayout;onSpace:(space:ReadingSpace)=>void;onClose:()=>void;onSource:()=>void;failure:string;local:boolean;onMap:()=>void;matched?:boolean;closing?:boolean;reduced?:boolean;suspended?:boolean}){
 const expanded=space==='focused',collapsed=space==='collapsed';
 const spaceButton=useRef<HTMLButtonElement>(null);
 const heading=useRef<HTMLHeadingElement>(null),scroll=useRef<HTMLDivElement>(null),sheet=useRef<HTMLElement>(null),chooser=useRef<HTMLDivElement>(null),chooserButton=useRef<HTMLButtonElement>(null);
 const [choosing,setChoosing]=useState(false);
 const linked=relations.filter(r=>r.placeId===place.id),relation=linked.find(r=>r.workId===workId)??linked[0];
 const work=works.find(w=>w.id===relation.workId)!,scene=workScenes[work.id];
 // Place information is one page, shared between the linked poems.
 const memoryKey=tab==='诗文'?`${place.id}/${work.id}/${tab}`:`${place.id}/地点`,activeKey=useRef(memoryKey),restoring=useRef(false);
 // A short poem can fit entirely in the larger detent. Its clamped scroll
 // position must not overwrite the smaller detent's semantic reading memory.
 const clampedRestore=useRef<{key:string;top:number}|null>(null);
 function remember(){const el=scroll.current;if(!el||restoring.current||collapsed||suspended||gesture.current||sheet.current?.dataset.readerMotion==='moving')return;if(clampedRestore.current?.key===activeKey.current&&Math.abs(el.scrollTop-clampedRestore.current.top)<.5)return;clampedRestore.current=null;const y=el.getBoundingClientRect().top;const item=Array.from(el.querySelectorAll<HTMLElement>('[data-read-anchor]')).find(n=>n.getBoundingClientRect().bottom>y+2);positions.set(activeKey.current,{anchor:item?.dataset.readAnchor??null,offset:item?item.getBoundingClientRect().top-y:0,top:el.scrollTop});}
 function restore(){const el=scroll.current,p=positions.get(memoryKey);if(!el||collapsed)return;restoring.current=true;activeKey.current=memoryKey;const item=p?.anchor?Array.from(el.querySelectorAll<HTMLElement>('[data-read-anchor]')).find(n=>n.dataset.readAnchor===p.anchor):null;const wanted=p?(item?el.scrollTop+item.getBoundingClientRect().top-el.getBoundingClientRect().top-p.offset:p.top):0;el.scrollTop=wanted;clampedRestore.current=Math.abs(el.scrollTop-wanted)>.5?{key:memoryKey,top:el.scrollTop}:null;restoring.current=false;}
 useLayoutEffect(()=>{heading.current?.focus({preventScroll:true});},[place.id]);
 useLayoutEffect(()=>{restore();},[memoryKey,space,layout.width,layout.height,layout.top]);
 const gesture=useRef<{id:number;y:number;lastY:number;lastTime:number;velocity:number;start:SheetRect;moved:boolean;capture:HTMLElement}|null>(null);
 const suppressClick=useRef(false);
 const shell=useSheetMotion(sheet,space,layout,reduced,suspended,restore);
 useLayoutEffect(()=>{if(collapsed||suspended)setChoosing(false);},[collapsed,suspended]);
 useLayoutEffect(()=>{if(closing){shell.cancel();setChoosing(false);}},[closing]);
 useEffect(()=>{const resize=()=>{if(gesture.current){gesture.current=null;shell.capture();shell.clearDrag();shell.refresh();}else if(sheet.current?.dataset.readerMotion==='moving')shell.capture();};window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 function pointerStart(e:ReactPointerEvent<HTMLElement>){const target=e.target as HTMLElement;if(layout.type!=='bottom'||closing||suspended||!target.closest('.reader-grabber,.sheet-topline')||(target.closest('button,a')&&!target.closest('.reader-grabber')))return;remember();shell.capture();const start=rectOf(e.currentTarget);gesture.current={id:e.pointerId,y:e.clientY,lastY:e.clientY,lastTime:e.timeStamp,velocity:0,start,moved:false,capture:target.closest<HTMLElement>('.reader-grabber,.sheet-topline')!};gesture.current.capture.setPointerCapture(e.pointerId);}
 function pointerMove(e:ReactPointerEvent<HTMLElement>){const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dy=e.clientY-g.y;if(!g.moved&&Math.abs(dy)<8)return;g.moved=true;const dt=e.timeStamp-g.lastTime;if(dt>0)g.velocity=(e.clientY-g.lastY)/dt;g.lastY=e.clientY;g.lastTime=e.timeStamp;const height=Math.max(92,Math.min(layout.focusedHeight,g.start.height-dy));shell.drag({...g.start,top:layout.bottom-height,height});}
 function pointerEnd(e:ReactPointerEvent<HTMLElement>,cancelled=false){const g=gesture.current;if(!g||g.id!==e.pointerId)return;const visible=rectOf(e.currentTarget);gesture.current=null;suppressClick.current=g.moved||Math.abs(e.clientY-g.y)>2;if(g.capture.hasPointerCapture(e.pointerId))g.capture.releasePointerCapture(e.pointerId);if(!g.moved){if(new URLSearchParams(location.search).has('readerTrace'))e.currentTarget.dataset.gestureTrace=JSON.stringify({dy:e.clientY-g.y,velocity:0,from:space,to:space,cancelled,pointerType:e.pointerType});shell.clearDrag();return;}const dy=e.clientY-g.y,velocity=e.timeStamp-g.lastTime>100?0:g.velocity;const next=settleReaderGesture(space,dy,velocity,visible.height,[92,layout.readingHeight,layout.focusedHeight],cancelled);if(new URLSearchParams(location.search).has('readerTrace'))e.currentTarget.dataset.gestureTrace=JSON.stringify({dy,velocity,height:visible.height,from:space,to:next,cancelled,pointerType:e.pointerType});shell.capture();shell.clearDrag();setChoosing(false);onSpace(next);shell.refresh();}
 useEffect(()=>{if(!choosing)return;const outside=(e:PointerEvent)=>{if(!chooser.current?.contains(e.target as Node))setChoosing(false);};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open],#directory')){e.preventDefault();e.stopImmediatePropagation();setChoosing(false);chooserButton.current?.focus({preventScroll:true});}};document.addEventListener('pointerdown',outside,true);window.addEventListener('keydown',escape,true);return()=>{document.removeEventListener('pointerdown',outside,true);window.removeEventListener('keydown',escape,true);};},[choosing]);
 function changeSpace(next:ReadingSpace){const origin=document.activeElement;remember();shell.capture();gesture.current=null;shell.clearDrag();setChoosing(false);onSpace(next);shell.refresh();requestAnimationFrame(()=>{if(!origin?.classList.contains('reader-grabber')&&(document.activeElement===origin||(!origin?.isConnected&&document.activeElement===document.body)))spaceButton.current?.focus({preventScroll:true});});}
 function changeTab(t:ReadingTab){remember();setChoosing(false);onTab(t);}
 function pickWork(id:string){if(id!==work.id){remember();onWork(id);}setChoosing(false);requestAnimationFrame(()=>chooserButton.current?.focus({preventScroll:true}));}
 return <aside ref={sheet} className={`reading-sheet ${expanded?'expanded':''} ${collapsed?'collapsed':''} ${closing?'closing':''}`} inert={closing||suspended} aria-hidden={closing||suspended||undefined} data-suspended={suspended} onPointerDown={pointerStart} onPointerMove={pointerMove} onPointerUp={e=>pointerEnd(e)} onPointerCancel={e=>pointerEnd(e,true)} aria-label={`${place.name}阅读案`} data-testid="reading-sheet" data-place-id={place.id} data-memory-key={memoryKey} data-space={space}>
  <div className="reader-fixed">
   {layout.type==='bottom'&&<button className="reader-grabber" aria-label="调整阅读案高度" title="上下拖动调整；也可用上下键或Enter" onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}changeSpace(space==='collapsed'?'reading':space==='reading'?'focused':'collapsed');}} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const order:ReadingSpace[]=['collapsed','reading','focused'];changeSpace(order[Math.max(0,Math.min(2,order.indexOf(space)+(e.key==='ArrowUp'?1:-1)))]);}}}><span/></button>}
   <div className="sheet-topline"><h2 ref={heading} tabIndex={-1}>{place.name}</h2><div className="sheet-tools">{!collapsed&&<button className="reader-icon" aria-label="收起读案" title="收起读案，保留当前阅读" onClick={()=>changeSpace('collapsed')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>}<button ref={spaceButton} className={`mobile-expand ${collapsed?'reader-continue':'reader-icon'}`} aria-label={collapsed?'继续阅读':expanded?'恢复大小':'展开阅读'} title={collapsed?'继续阅读':expanded?'恢复大小':'展开阅读'} onClick={()=>changeSpace(collapsed||expanded?'reading':'focused')} aria-expanded={expanded}>{collapsed?'继续阅读':<svg viewBox="0 0 24 24" aria-hidden="true">{expanded?<path d="M5 9h4V5m6 0v4h4M5 15h4v4m6 0v-4h4"/>:<path d="M9 5H5v4m10-4h4v4M5 15v4h4m6 0h4v-4"/>}</svg>}</button><button className="close-button reader-icon" aria-label="关闭阅读案" title="关闭地点阅读并返回地图" onClick={()=>{remember();onClose();}}><svg key={space} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div></div>
   {collapsed&&<p className="collapsed-title">{work.title} · {work.author}{!matched&&<span className="reading-filter-tag"> · 筛选外</span>}</p>}

   <div className="sheet-heading" hidden={collapsed} inert={collapsed}>
    <div className="reader-navigation"><div className="detail-tabs" role="tablist" aria-label="阅读内容">{tabs.map(t=><button key={t} id={`tab-${t}`} role="tab" aria-selected={tab===t} aria-controls={`content-${t}`} tabIndex={tab===t?0:-1} onClick={()=>changeTab(t)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=tabs[(tabs.indexOf(t)+1)%2];changeTab(next);document.getElementById(`tab-${next}`)?.focus();}}}>{t}</button>)}</div>{!matched&&<span className="reading-filter-tag reader-filter" title="当前阅读不在筛选结果中">筛选外</span>}
     {tab==='诗文'&&linked.length>1&&<div ref={chooser} className="poem-chooser"><button ref={chooserButton} aria-expanded={choosing} aria-controls="poem-choices" onClick={()=>setChoosing(v=>!v)}>诗篇 {linked.length}篇 <span aria-hidden="true">⌄</span></button>{choosing&&<div id="poem-choices" className="poem-choices" role="group" aria-label="选择关联诗篇">{linked.map(r=>{const w=works.find(w=>w.id===r.workId)!;return <button key={r.id} aria-pressed={r.workId===work.id} onClick={()=>pickWork(r.workId)}><span>{w.title}</span><small>{w.author} · {w.era}{r.workId===work.id?' · 当前篇目':''}</small></button>;})}</div>}</div>}
    </div>
   </div>
  </div>
  <div ref={scroll} hidden={collapsed} inert={collapsed} className="sheet-scroll" tabIndex={0} aria-label="阅读案正文" onScroll={remember}>
   <section role="tabpanel" id={`content-${tab}`} aria-labelledby={`tab-${tab}`}>
    {tab==='诗文'?<>
     <div className="poem-inscription" data-work-id={work.id} data-read-anchor="inscription"><h3>{work.title}</h3><p className="poet-byline">{work.author}<span>{work.era}</span></p></div>
     <WorkReader work={work} relation={relation}/>
     <section className="poem-context" data-read-anchor="interpretation"><h4>诗文与此地</h4><p className="body-copy interpretation">{work.interpretation}</p><button className="text-link" onClick={()=>changeTab('地点')}>看看诗文中的地点 <span aria-hidden="true">→</span></button></section>
     {scene&&<PoemPicture key={scene.file} scene={scene}/>}
     <details className="reading-sources" data-read-anchor="work-sources"><summary>底本与版本</summary><p>{work.variant}</p><a href={work.source} target="_blank" rel="noreferrer">{work.sourceTitle}</a><button className="text-link" onClick={onSource}>完整出处与许可</button></details>
    </>:<PlaceContext key={place.id} detail={detail} failure={failure} onSource={onSource} local={local} onMap={onMap}/>}
   </section>
  </div>
 </aside>;
}


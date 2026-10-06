import {useEffect,useRef,useState} from 'react';
import type {Place,Work,Relation,PlaceDetail} from '../data/catalog';
import {WorkReader} from './WorkReader';
import {PlaceContext,PlaceHistory} from './PlaceContext';
export type ReadingTab='诗文'|'此地'|'沿革';
const tabs:ReadingTab[]=['诗文','此地','沿革'];
export function ReadingPanel({place,detail,works,relations,workId,onWork,tab,onTab,expanded,onExpand,onClose,onSource,failure}:{place:Place;detail:PlaceDetail;works:Work[];relations:Relation[];workId:string;onWork:(id:string)=>void;tab:ReadingTab;onTab:(tab:ReadingTab)=>void;expanded:boolean;onExpand:()=>void;onClose:()=>void;onSource:()=>void;failure:string}){
 const heading=useRef<HTMLHeadingElement>(null);const scroll=useRef<HTMLDivElement>(null);const [rememberedOriginal,setRememberedOriginal]=useState(false);
 const linked=relations.filter(r=>r.placeId===place.id);const relation=linked.find(r=>r.workId===workId)??linked[0];const work=works.find(w=>w.id===relation.workId)!;
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[place.id]);
 useEffect(()=>{if(scroll.current)scroll.current.scrollTop=0;},[tab,work.id]);
 return <aside className={`reading-sheet ${expanded?'expanded':''}`} aria-label={`${place.name}阅读案`} data-testid="reading-sheet" data-place-id={place.id}>
  <div className="sheet-tools"><button className="return-link" onClick={onClose}>← 返回中国地图</button><button className="mobile-expand" onClick={onExpand} aria-expanded={expanded}>{expanded?'半屏阅读':'展开阅读'}</button><button className="close-button" aria-label="关闭阅读案" onClick={onClose}>×</button></div>
  <div ref={scroll} className="sheet-scroll" tabIndex={0} aria-label="阅读案正文"><div className="place-heading"><span className="eyebrow">{place.region}</span><h2 ref={heading} tabIndex={-1}>{place.name}</h2><p>{place.description}</p></div>
   <div className="detail-tabs" role="tablist" aria-label="阅读内容">{tabs.map(t=><button key={t} id={`tab-${t}`} role="tab" aria-selected={tab===t} aria-controls={`content-${t}`} tabIndex={tab===t?0:-1} onClick={()=>onTab(t)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=tabs[(tabs.indexOf(t)+(e.key==='ArrowRight'?1:2))%3];onTab(next);document.getElementById(`tab-${next}`)?.focus();}}}>{t}</button>)}</div>
   <section role="tabpanel" id={`content-${tab}`} aria-labelledby={`tab-${tab}`}>{tab==='诗文'?<>
    {linked.length>1&&<div className="work-switcher" role="group" aria-label="切换关联作品">{linked.map(r=><button key={r.id} aria-pressed={r.workId===work.id} onClick={()=>{const d=document.querySelector<HTMLDetailsElement>('.original');setRememberedOriginal(!!d?.open);onWork(r.workId);}}>{works.find(w=>w.id===r.workId)?.title}</button>)}</div>}
    <div key={work.id} ref={el=>{const d=el?.querySelector<HTMLDetailsElement>('.original');if(d&&rememberedOriginal)d.open=true;}}><WorkReader work={work} relation={relation} onSource={onSource} onPlace={()=>onTab('此地')}/></div>
   </>:tab==='此地'?<PlaceContext key={place.id} detail={detail} failure={failure} onSource={onSource}/>:<PlaceHistory detail={detail}/>}</section>
  </div><footer className="sheet-footer"><span className="fine-seal">读</span><span>让文字回到山水之间</span><button onClick={onSource}>出处 ↗</button></footer>
 </aside>;
}

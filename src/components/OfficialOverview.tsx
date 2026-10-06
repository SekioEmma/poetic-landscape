import {useRef,useState} from 'react';
import {basemap,imageAnchors,imageGroups} from '../data/basemap';
import {places,relations} from '../data/content';
import {preferredWork} from '../data/exploration';
import type {SearchResult} from '../data/catalog';
const mapImage=`${import.meta.env.BASE_URL}${basemap.file}`;
export function OfficialOverview({selected,expanded,local,results,onSelect,onSource}:{selected:string|null;expanded:boolean;local:boolean;results:SearchResult[];onSelect:(id:string,workId?:string)=>void;onSource:()=>void}){
 const viewer=useRef<HTMLDialogElement>(null);const viewport=useRef<HTMLDivElement>(null);const chooser=useRef<HTMLDialogElement>(null);const [zoom,setZoom]=useState(false);const [failed,setFailed]=useState(false);const [groupId,setGroupId]=useState('');
 const groups=imageGroups.map(g=>({...g,results:results.filter(r=>g.placeIds.includes(r.place.id))})).filter(g=>g.results.length);
 const activeGroup=groups.find(g=>g.id===groupId);
 function pick(result:SearchResult){chooser.current?.close();onSelect(result.place.id,preferredWork(result,relations));}
 function zoomToPixels(x:number,y:number){setZoom(true);requestAnimationFrame(()=>{const frame=viewport.current;const image=frame?.querySelector('img');if(frame&&image){frame.scrollTo({left:image.clientWidth*x/basemap.width-frame.clientWidth/2,top:image.clientHeight*y/basemap.height-frame.clientHeight/2,behavior:'instant'});frame.focus({preventScroll:true});}});}
 return <>
  <section className={`official-overview ${expanded?'reader-expanded':''}`} hidden={local} aria-label="官方中国地图图片总览" data-testid="official-overview" data-mode="image-overview" data-original-width={basemap.width} data-original-height={basemap.height}>
   <div className="official-sheet" data-testid="official-sheet"><img className="official-image" src={mapImage} alt="中国地图完整原图，原底图审图号GS(2023)2763号，保留图名、图例、国界、省界、岛屿及全部注记" onError={()=>setFailed(true)} onLoad={()=>setFailed(false)} draggable={false}/>
    {!failed&&groups.map(g=>{const anchor=imageAnchors.find(a=>a.placeId===g.anchorPlaceId)!;const single=g.results.length===1;
     return <div key={g.id} className={`image-entry entry-${g.id}`} style={{left:`${anchor.x/basemap.width*100}%`,top:`${anchor.y/basemap.height*100}%`}} data-group-id={g.id} data-place-ids={g.results.map(r=>r.place.id).join(',')} data-image-x={anchor.x} data-image-y={anchor.y}><span className="image-place-ring" aria-hidden="true"/><span className="entry-leader" aria-hidden="true"/><button className={`image-place ${g.results.some(r=>r.place.id===selected)?'selected':''}`} aria-label={`全国图${single?'地点':'分组'}：${single?g.results[0].place.name:g.label}（${g.results.length}处）`} aria-pressed={g.results.some(r=>r.place.id===selected)} onClick={()=>{if(single)pick(g.results[0]);else{setGroupId(g.id);chooser.current?.showModal();}}}><span>{single?g.results[0].place.name:g.label}</span>{!single&&<small>{g.results.length}处 ▾</small>}</button></div>;
    })}
   </div>{failed&&<p className="official-load-error" role="alert">官方原图未加载，请从寻诗文目录继续阅读。</p>}
  </section>
  {expanded&&selected&&!local&&<div className="reader-city-reference">{places.find(p=>p.id===selected)?.region} · {places.find(p=>p.id===selected)?.name}<small>半屏可查看地图</small></div>}
  {!local&&<div className="official-caption"><span>原底图 <strong>{basemap.reviewNumber}</strong> · 自然资源部监制</span><div><button onClick={onSource}>来源与改动 ↗</button><button onClick={()=>{setZoom(false);viewer.current?.showModal();}}>放大原图 ↗</button></div></div>}
  <dialog ref={chooser} className="group-dialog" aria-label={`${activeGroup?.label??''}地点选择`}><header><div><span className="eyebrow">从一处山河开始</span><h2>{activeGroup?.label} · 地点笺</h2></div><button autoFocus aria-label="关闭地点选择" onClick={()=>chooser.current?.close()}>×</button></header>{activeGroup?.results.map(r=><button key={r.place.id} className="group-item" data-place-id={r.place.id} onClick={()=>pick(r)}><span><strong>{r.place.name}</strong><small>{r.place.region} · {r.place.description}</small></span><span aria-hidden="true">→</span></button>)}</dialog>
  <dialog ref={viewer} className="official-viewer" aria-label="官方地图原图查看"><header><div><strong>中国地图 · 原图查看</strong><small>原底图 {basemap.reviewNumber} · 等比例显示，未裁切或改色</small></div><button autoFocus aria-label="关闭原图查看" onClick={()=>viewer.current?.close()}>×</button></header><div className="viewer-controls"><button aria-pressed={!zoom} onClick={()=>setZoom(false)}>完整图幅</button><button aria-pressed={zoom} onClick={()=>zoomToPixels(3000,3000)}>放大看注记</button><button onClick={()=>zoomToPixels(2645,6540)}>查看原图审图号</button><a href={mapImage} target="_blank" rel="noreferrer">打开原始 JPG ↗</a></div><div ref={viewport} className={`viewer-scroll ${zoom?'zoomed':''}`} tabIndex={0} aria-label="原图滚动区域"><img src={mapImage} alt="官方地图原图，含完整南海诸岛与底部图例及审图号"/></div><p>放大后可横向、纵向滚动查看；项目叠加与交互的审核状态单独记录。</p></dialog>
 </>;
}

import {useEffect,useMemo,useRef,useState} from 'react';
import {MapCanvas} from './components/MapCanvas';
import {OfficialOverview} from './components/OfficialOverview';
import {ReadingPanel} from './components/ReadingPanel';
import type {ReadingTab} from './components/ReadingPanel';
import {SourceDialog} from './components/SourceDialog';
import {ExplorerDirectory} from './components/ExplorerDirectory';
import {places,works,relations,placeDetails} from './data/content';
import {explore,preferredWork} from './data/exploration';
import type {Theme} from './data/catalog';
export default function App(){
 const lab=location.pathname.endsWith('/map-lab');
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [selected,setSelected]=useState<string|null>(null);const [workId,setWorkId]=useState('');const [tab,setTab]=useState<ReadingTab>('诗文');
 const [directory,setDirectory]=useState(false);const [expanded,setExpanded]=useState(false);const [failure,setFailure]=useState('');const [mapReady,setMapReady]=useState(false);
 const [everLocal,setEverLocal]=useState(lab);const [unmounted,setUnmounted]=useState(false);const [query,setQuery]=useState('');const [theme,setTheme]=useState<Theme|'全部'>('全部');
 const sourceDialog=useRef<HTMLDialogElement>(null);const directoryButton=useRef<HTMLButtonElement>(null);
 const results=useMemo(()=>explore(places,works,relations,query,theme),[query,theme]);const place=places.find(p=>p.id===selected);const detail=placeDetails.find(d=>d.placeId===selected);
 const local=!!detail?.local&&tab==='此地';const lifecycleLab=new URLSearchParams(location.search).has('lifecycle');
 function select(id:string,preferred?:string){const result=results.find(r=>r.place.id===id);setSelected(id);setWorkId(preferred??(result?preferredWork(result,relations):relations.find(r=>r.placeId===id)?.workId)??'');setTab('诗文');setExpanded(false);setDirectory(false);}
 function close(){setSelected(null);setTab('诗文');setExpanded(false);directoryButton.current?.focus();}
 function changeTab(t:ReadingTab){if(t==='此地'&&detail?.local)setEverLocal(true);setTab(t);}
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(directory)setDirectory(false);else if(selected)close();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[selected,directory]);
 const showSource=()=>sourceDialog.current?.showModal();
 return <main data-reduced-motion={reduced} data-visible-place-ids={results.map(r=>r.place.id).join(',')} className={`app ${!lab?'official-mode':''} ${selected?'has-detail':''} ${local?'local-view':''} ${expanded?'reader-expanded':''}`}>
  {everLocal&&!unmounted&&<MapCanvas view={{placeId:selected,local,expanded,reduced}} onSelect={id=>{if(id!==selected)select(id);}} onFailure={setFailure} onReady={()=>{setMapReady(true);setFailure('');}}/>}
  <div className="paper-fibres" aria-hidden="true"/>
  {!lab&&<OfficialOverview selected={selected} expanded={expanded} local={local} results={results} onSelect={select} onSource={showSource}/>}
  <header className="site-header"><a className="brand" href="#" onClick={e=>{e.preventDefault();close();}} aria-label="诗文山河首页"><span className="seal" aria-hidden="true">山河</span><span>诗文山河<small>一笺诗文 · 一处山河</small></span></a><nav aria-label="页面导航"><button ref={directoryButton} aria-expanded={directory} aria-controls="directory" onClick={()=>setDirectory(!directory)}><span aria-hidden="true">☷</span> 寻诗文 <small>{results.length}处</small></button><button className="source-button" onClick={showSource}>出处 <span aria-hidden="true">↗</span></button></nav></header>
  {!selected&&<section className="map-intro" aria-label="探索介绍"><span className="eyebrow">山河为卷</span><h1>循诗，<br/>入山河。</h1><p>点一处，读一篇。</p>{(query||theme!=='全部')&&<button className="filter-indicator" onClick={()=>setDirectory(true)}>{query||theme} · {results.length}处 ↗</button>}</section>}
  {selected&&local&&<div className="view-caption"><span>{detail?.local?.title}</span><small>湖岸 · 堤道 · 岛屿</small></div>}
  {directory&&<ExplorerDirectory results={results} works={works} relations={relations} query={query} onQuery={setQuery} theme={theme} onTheme={setTheme} availableThemes={[...new Set(places.flatMap(p=>p.themes))]} selected={selected} onSelect={select} onClose={()=>setDirectory(false)}/>}
  {failure&&<section className="map-failure" role="alert"><strong>局部地图暂不可交互</strong><p>{failure} 诗文与全国原图仍可查看。</p><button onClick={()=>setDirectory(true)}>从目录继续阅读 →</button></section>}
  {!selected&&<figure className="painted-scene"><img src={`${import.meta.env.BASE_URL}assets/lake-scene.svg`} alt="原创细笔点景：小亭、疏树与一叶舟"/><figcaption>湖上一点</figcaption></figure>}
  {place&&detail&&<ReadingPanel key={place.id} place={place} detail={detail} works={works} relations={relations} workId={workId} onWork={setWorkId} tab={tab} onTab={changeTab} expanded={expanded} onExpand={()=>setExpanded(!expanded)} onClose={close} onSource={showSource} failure={failure}/>}
  <footer className="map-footer"><div className="map-legend"><span className="tiny-dot"/> {selected?place?.name:'六处山河 · 八篇诗文'}</div><button onClick={showSource}>{local?'© OSM contributors · ODbL':lab?'自然地理候选层 · 开发验证':'山河有据 · 诗文有源'} ↗</button><span className="edition">自由探索 · 〇二</span></footer>
  <SourceDialog dialog={sourceDialog} placeId={selected} workId={workId} reduced={reduced} onReduced={setReduced}/>
  {lab&&<div className="lab-label">独立开发验证入口：点 / 线 / 面为测试几何。<a href="./">返回正式页面</a></div>}
  {lifecycleLab&&<button className="lifecycle-control" onClick={()=>{setUnmounted(!unmounted);setMapReady(false);}}>测试：{unmounted?'挂载':'卸载'}地图</button>}
  <span className="sr-only" role="status">{mapReady?'交互地图已加载':''}{place?`，当前地点${place.name}，${tab}`:'，中国地图总览，详情关闭'}</span>
 </main>;
}

import {useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {MapCanvas} from './components/MapCanvas';
import {OfficialOverview} from './components/OfficialOverview';
import {ReadingPanel} from './components/ReadingPanel';
import type {ReadingTab} from './components/ReadingPanel';
import {SourceDialog} from './components/SourceDialog';
import {ExplorerDirectory} from './components/ExplorerDirectory';
import {places,works,relations,placeDetails} from './data/content';
import {explore,preferredWork} from './data/exploration';
import type {Theme} from './data/catalog';
import {useReaderLayout} from './layout/useReaderLayout';
import type {ReadingSpace} from './layout/reader-layout';
export default function App(){
 const lab=location.pathname.endsWith('/map-lab');
 const [quiet,setQuiet]=useState(false);const [osReduced,setOsReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);const reduced=quiet||osReduced;
 const [selected,setSelected]=useState<string|null>(null);const [workId,setWorkId]=useState('');const [tab,setTab]=useState<ReadingTab>('诗文');
 const [directory,setDirectory]=useState(false);const [space,setSpace]=useState<ReadingSpace>('reading');const expanded=space==='focused';const [failure,setFailure]=useState('');const [mapReady,setMapReady]=useState(false);
 const [localRequested,setLocalRequested]=useState(false);
 const [everLocal,setEverLocal]=useState(lab);const [unmounted,setUnmounted]=useState(false);const [query,setQuery]=useState('');const [theme,setTheme]=useState<Theme|'全部'>('全部');
 const [originalRequest,setOriginalRequest]=useState(0);const sourceDialog=useRef<HTMLDialogElement>(null);const directoryButton=useRef<HTMLButtonElement>(null);
 const [closing,setClosing]=useState(false);const [retained,setRetained]=useState<string|null>(null);const exitTimer=useRef<ReturnType<typeof setTimeout>|null>(null);const returnTarget=useRef<HTMLElement|null>(null);

 const root=useRef<HTMLElement>(null),readerTrace=useRef<object[]>([]);
 const layout=useReaderLayout(root),compact=layout.directoryModal;
 const spaceStyle={'--bottom-inset':`${layout.bottomInset}px`,'--workspace-top':`${layout.top}px`,'--reading-width':`${layout.readingWidth}px`,'--focused-width':`${layout.focusedWidth}px`,'--reading-height':`${layout.readingHeight}px`,'--focused-height':`${layout.focusedHeight}px`} as CSSProperties;
 // Opt-in DOM evidence for exit geometry and interrupted presence transitions.
 useLayoutEffect(()=>{if(!new URLSearchParams(location.search).has('readerTrace')||!root.current)return;const sheet=root.current.querySelector('.reading-sheet'),controls=root.current.querySelector('.overview-controls');readerTrace.current.push({t:performance.now(),selected,retained,expanded,space,layout:layout.type,closing,present:!!sheet,height:sheet?.getBoundingClientRect().height,controls:controls?getComputedStyle(controls).visibility:null});if(readerTrace.current.length>80)readerTrace.current.shift();root.current.dataset.readerTrace=JSON.stringify(readerTrace.current);},[selected,retained,expanded,space,layout.type,closing]);

 function closeDirectory(){setDirectory(false);requestAnimationFrame(()=>directoryButton.current?.focus({preventScroll:true}));}
 const results=useMemo(()=>explore(places,works,relations,query,theme),[query,theme]);const readingId=selected??retained;const place=places.find(p=>p.id===readingId);const detail=placeDetails.find(d=>d.placeId===readingId);
 const local=!!selected&&!!detail?.local&&localRequested;const lifecycleLab=new URLSearchParams(location.search).has('lifecycle');
 function select(id:string,preferred?:string){if(exitTimer.current)clearTimeout(exitTimer.current);setClosing(false);setRetained(null);setLocalRequested(false);if(!selected)returnTarget.current=document.activeElement as HTMLElement;const result=results.find(r=>r.place.id===id);setSelected(id);setWorkId(preferred??(result?preferredWork(result,relations):relations.find(r=>r.placeId===id)?.workId)??'');setTab('诗文');setSpace(layout.defaultSpace);setDirectory(false);requestAnimationFrame(()=>document.querySelector<HTMLHeadingElement>('.reading-sheet h2')?.focus({preventScroll:true}));}
 function close(){if(!selected)return;setRetained(selected);setClosing(true);setSelected(null);setLocalRequested(false);const quiet=reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;if(exitTimer.current)clearTimeout(exitTimer.current);exitTimer.current=setTimeout(()=>{setRetained(null);setClosing(false);setSpace('reading');exitTimer.current=null;requestAnimationFrame(()=>{const target=returnTarget.current;if(target?.isConnected&&target.getClientRects().length&&!target.closest('[inert]')&&getComputedStyle(target).visibility!=='hidden')target.focus({preventScroll:true});else directoryButton.current?.focus({preventScroll:true});});},quiet?0:260);}
 function changeTab(t:ReadingTab){setTab(t);}
 function changeMap(){if(local)setLocalRequested(false);else{setEverLocal(true);setLocalRequested(true);}}
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(directory)closeDirectory();else if(selected)close();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[selected,directory,reduced]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setOsReduced(media.matches);media.addEventListener('change',update);return()=>{media.removeEventListener('change',update);if(exitTimer.current)clearTimeout(exitTimer.current);};},[]);
 const showSource=()=>{if(directory)setDirectory(false);sourceDialog.current?.showModal();};
 return <main ref={root} style={spaceStyle} data-reader-layout={layout.type} data-reading-space={readingId?space:'exploring'} data-directory-open={directory} data-directory-modal={compact} data-reduced-motion={reduced} data-visible-place-ids={results.map(r=>r.place.id).join(',')} className={`app ${!lab?'official-mode':''} ${readingId?'has-detail':''} ${local?'local-view':''} ${readingId&&expanded?'reader-expanded':''}`}>
  <div className="exploration-surface" inert={directory&&compact}>
  {everLocal&&!unmounted&&<MapCanvas view={{placeId:selected,local,expanded:expanded&&!directory,reduced,layout,space}} onSelect={id=>{if(id!==selected)select(id);}} onFailure={setFailure} onReady={()=>{setMapReady(true);setFailure('');}}/>}
  <i className="safe-area-probe" aria-hidden="true"/><div className="paper-fibres" aria-hidden="true"/>
  {!lab&&<OfficialOverview selected={selected} workId={workId} expanded={expanded&&!directory} originalRequest={originalRequest} layout={layout} local={local} reduced={reduced} results={results} onSelect={select} onSource={showSource} onRead={()=>setDirectory(true)}/>}
  <header className="site-header"><a className="brand" href="#" onClick={e=>{e.preventDefault();close();}} aria-label="诗文山河首页"><span className="seal" aria-hidden="true">山河</span><span>诗文山河<small>一笺诗文 · 一处山河</small></span></a><nav aria-label="页面导航"><button className="search-entry" ref={directoryButton} aria-expanded={directory} aria-controls="directory" onClick={()=>sourceDialog.current?.open?sourceDialog.current.close():setDirectory(v=>!v)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><span>寻诗文</span><small>地点、诗篇或作者</small></button><button className="source-button" onClick={showSource}>出处</button></nav></header>
  {!selected&&<section className="map-intro" aria-label="探索介绍"><span className="eyebrow">山河为卷</span><h1>循诗，<br/>入山河。</h1><p>点一处，读一篇。</p>{(query||theme!=='全部')&&<button className="filter-indicator" onClick={()=>setDirectory(true)}>{query||theme} · {results.length}处 ↗</button>}</section>}
  {selected&&local&&<button className="back-national" onClick={()=>setLocalRequested(false)}><span aria-hidden="true">←</span> 回全国</button>}{selected&&local&&<div className="view-caption"><span>{detail?.local?.title}</span><small>湖岸 · 堤道 · 岛屿</small></div>}
  {failure&&<section className="map-failure" role="alert"><strong>局部地图暂不可交互</strong><p>{failure} 诗文与全国原图仍可查看。</p><button onClick={()=>setDirectory(true)}>从目录继续阅读 →</button></section>}
  {place&&detail&&<ReadingPanel key={place.id} place={place} detail={detail} works={works} relations={relations} workId={workId} onWork={setWorkId} tab={tab} onTab={changeTab} space={space} layout={layout} onSpace={setSpace} onClose={close} onSource={showSource} failure={failure} local={local} onMap={changeMap} closing={closing} reduced={reduced} suspended={directory} matched={results.some(r=>r.place.id===readingId)}/>}
  <footer className="map-footer"><div className="map-legend">{selected?place?.name:'六处山河，八篇诗文'}</div><button onClick={showSource}>{local?'© OSM contributors · ODbL':lab?'自然地理候选层 · 开发验证':'原图与出处'}</button><span className="edition">诗画同观</span></footer>
  </div>
  {directory&&<ExplorerDirectory modal={compact} results={results} works={works} relations={relations} query={query} onQuery={setQuery} theme={theme} onTheme={setTheme} availableThemes={[...new Set(places.flatMap(p=>p.themes))]} selected={selected} onSelect={select} onClose={closeDirectory}/>}
  <SourceDialog dialog={sourceDialog} placeId={selected} workId={workId} reduced={reduced} onReduced={setQuiet} onOriginal={()=>setOriginalRequest(n=>n+1)}/>
  {lab&&<div className="lab-label">独立开发验证入口：点 / 线 / 面为测试几何。<a href="./">返回正式页面</a></div>}
  {lifecycleLab&&<button className="lifecycle-control" onClick={()=>{setUnmounted(!unmounted);setMapReady(false);}}>测试：{unmounted?'挂载':'卸载'}地图</button>}
  <span className="sr-only" role="status">{mapReady?'交互地图已加载':''}{place?`，当前地点${place.name}，${tab}`:'，中国地图总览，详情关闭'}</span>
 </main>;
}


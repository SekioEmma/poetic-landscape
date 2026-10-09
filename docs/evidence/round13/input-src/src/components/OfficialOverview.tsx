import {useEffect,useRef,useState} from 'react';
import {basemap} from '../data/basemap';
import type {SearchResult} from '../data/catalog';
import type {ReaderLayout} from '../layout/reader-layout';
import {OverviewViewport} from './OverviewViewport';
const mapImage=`${import.meta.env.BASE_URL}${basemap.file}`;
export function OfficialOverview({selected,workId,expanded,layout,local,reduced,results,onSelect,onRead,originalRequest,fallback=false}:{selected:string|null;workId:string;expanded:boolean;layout:ReaderLayout;local:boolean;reduced:boolean;results:SearchResult[];onSelect:(id:string,workId?:string)=>void;onSource:()=>void;onRead:()=>void;originalRequest:number;fallback?:boolean}){
 const viewer=useRef<HTMLDialogElement>(null),viewport=useRef<HTMLDivElement>(null);const [zoom,setZoom]=useState(false),[originalFailed,setOriginalFailed]=useState(false);
 useEffect(()=>{if(originalRequest){setZoom(false);viewer.current?.showModal();}},[originalRequest]);
 function zoomToPixels(x:number,y:number){setZoom(true);requestAnimationFrame(()=>{const frame=viewport.current,image=frame?.querySelector('img');if(frame&&image){frame.scrollTo({left:image.clientWidth*x/basemap.width-frame.clientWidth/2,top:image.clientHeight*y/basemap.height-frame.clientHeight/2,behavior:'instant'});frame.focus({preventScroll:true});}});}
 return <>{fallback&&<OverviewViewport {...{selected,workId,expanded,layout,local,reduced,results,onSelect,onRead}}/>}

 <dialog ref={viewer} className="official-viewer" aria-label="官方地图原图查看"><header><div><strong>中国地图 · 原图查看</strong><small>原底图 {basemap.reviewNumber} · {basemap.imprint} · 未修改原件</small></div><button autoFocus aria-label="关闭原图查看" onClick={()=>viewer.current?.close()}>×</button></header><div className="viewer-controls"><button aria-pressed={!zoom} onClick={()=>setZoom(false)}>完整图幅</button><button aria-pressed={zoom} onClick={()=>zoomToPixels(3000,3000)}>放大看注记</button><button onClick={()=>zoomToPixels(2645,6540)}>查看原图审图号</button><a href={mapImage} target="_blank" rel="noreferrer">打开原始 JPG ↗</a></div><div ref={viewport} className={`viewer-scroll ${zoom?'zoomed':''}`} tabIndex={0} aria-label="原图滚动区域"><img loading="lazy" src={`${import.meta.env.BASE_URL}${new URLSearchParams(location.search).has('originalFail')?'assets/test-intentionally-missing-original.jpg':basemap.file}`} onError={()=>setOriginalFailed(true)} alt="官方地图原图，含完整南海诸岛与底部图例及审图号"/>{originalFailed&&<p role="alert">原图未能加载；关闭此窗口后仍可从目录阅读诗文。</p>}</div><p>原底图编号标识原件身份；项目设计版的处理与审核状态单独记录。</p></dialog></>;
}

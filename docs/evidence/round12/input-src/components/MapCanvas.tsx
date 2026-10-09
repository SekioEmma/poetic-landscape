import { useEffect, useRef, useState } from 'react';
import {MapControls} from './MapControls';
import type { MapAdapter, ViewState } from '../map/MapAdapter';
declare global {interface Window {__mapDiagnostics?:()=>unknown;__mapLifecycle?:{created:number;destroyed:number};}}
export function MapCanvas({view,onSelect,onFailure,onReady}:{view:ViewState;onSelect:(id:string)=>void;onFailure:(text:string)=>void;onReady:()=>void}){
 const container=useRef<HTMLDivElement>(null);const adapter=useRef<MapAdapter|null>(null);const callbacks=useRef({onSelect,onFailure,onReady});callbacks.current={onSelect,onFailure,onReady};
 const latest=useRef(view);latest.current=view;const [status,setStatus]=useState('loading');const [localFailed,setLocalFailed]=useState(false);
 useEffect(()=>{
  let disposed=false;let instance:MapAdapter|undefined;
  const initialize=async()=>{try{
   if(new URLSearchParams(location.search).has('mapFail'))throw Error('测试入口主动禁用地图');
   const {MapAdapter}=await import('../map/MapAdapter');
   if(disposed||!container.current)return;
   window.__mapLifecycle??={created:0,destroyed:0};window.__mapLifecycle.created++;
   document.documentElement.dataset.mapsCreated=String(window.__mapLifecycle.created);
   container.current.dataset.instanceId=String(window.__mapLifecycle.created);
   instance=new MapAdapter(container.current,id=>callbacks.current.onSelect(id),()=>{if(!disposed){adapter.current=instance!;instance!.update(latest.current);setStatus('ready');callbacks.current.onReady();}},text=>{if(!disposed){setLocalFailed(latest.current.local);setStatus(latest.current.local?'ready':'failed');callbacks.current.onFailure(text);}});
   adapter.current=instance;window.__mapDiagnostics=()=>instance?.diagnostics();
  }catch(e){if(!disposed){setStatus('failed');callbacks.current.onFailure(e instanceof Error?e.message:'地图初始化失败');}}};
  void initialize();
  return()=>{disposed=true;if(instance){instance.destroy();if(window.__mapLifecycle){window.__mapLifecycle.destroyed++;document.documentElement.dataset.mapsDestroyed=String(window.__mapLifecycle.destroyed);}}adapter.current=null;delete window.__mapDiagnostics;};
 },[]);
 useEffect(()=>{if(!view.local)setLocalFailed(false);adapter.current?.update(view);},[view.placeId,view.local,view.expanded,view.reduced,view.space,view.layout,view.resultIds?.join(','),view.searchIds?.join(',')]);
 return <><div ref={container} className="map-canvas" inert={view.expanded&&view.layout?.type==='bottom'} data-testid="map" data-map-status={status} aria-label="山河地图"/>{status==='loading'&&<div className="map-loading" role="status">正在铺展山河…<small>可先从目录阅读诗文</small></div>}<MapControls host={container} kind={view.local?'local':'overview'} disabled={status!=='ready'||localFailed||(view.expanded&&view.layout?.type==='bottom')} onZoom={direction=>adapter.current?.zoom(direction*.5)} onReset={()=>adapter.current?.locate()}/></>;
}


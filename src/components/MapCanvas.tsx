import { useEffect, useRef, useState } from 'react';
import type { MapAdapter, ViewState } from '../map/MapAdapter';
declare global {interface Window {__mapDiagnostics?:()=>unknown;__mapLifecycle?:{created:number;destroyed:number};}}
export function MapCanvas({view,onSelect,onFailure,onReady}:{view:ViewState;onSelect:(id:string)=>void;onFailure:(text:string)=>void;onReady:()=>void}){
 const container=useRef<HTMLDivElement>(null);const adapter=useRef<MapAdapter|null>(null);const callbacks=useRef({onSelect,onFailure,onReady});callbacks.current={onSelect,onFailure,onReady};
 const latest=useRef(view);latest.current=view;const [status,setStatus]=useState('loading');
 useEffect(()=>{
  let disposed=false;let instance:MapAdapter|undefined;
  const initialize=async()=>{try{
   if(new URLSearchParams(location.search).has('mapFail'))throw Error('测试入口主动禁用地图');
   const response=await fetch(`${import.meta.env.BASE_URL}geodata/westlake.json`);if(!response.ok)throw Error('西湖局部数据未加载');await response.json();
   const {MapAdapter}=await import('../map/MapAdapter');
   if(disposed||!container.current)return;
   window.__mapLifecycle??={created:0,destroyed:0};window.__mapLifecycle.created++;
   document.documentElement.dataset.mapsCreated=String(window.__mapLifecycle.created);
   container.current.dataset.instanceId=String(window.__mapLifecycle.created);
   instance=new MapAdapter(container.current,id=>callbacks.current.onSelect(id),()=>{if(!disposed){adapter.current=instance!;instance!.update(latest.current);setStatus('ready');callbacks.current.onReady();}},text=>{if(!disposed){setStatus('failed');callbacks.current.onFailure(text);}},location.pathname.endsWith('/map-lab'));
   adapter.current=instance;window.__mapDiagnostics=()=>instance?.diagnostics();
  }catch(e){if(!disposed){setStatus('failed');callbacks.current.onFailure(e instanceof Error?e.message:'地图初始化失败');}}};
  void initialize();
  return()=>{disposed=true;if(instance){instance.destroy();if(window.__mapLifecycle){window.__mapLifecycle.destroyed++;document.documentElement.dataset.mapsDestroyed=String(window.__mapLifecycle.destroyed);}}adapter.current=null;delete window.__mapDiagnostics;};
 },[]);
 useEffect(()=>{adapter.current?.update(view);},[view.placeId,view.local,view.expanded,view.reduced]);
 return <><div ref={container} className="map-canvas" data-testid="map" data-map-status={status} aria-label="山河地图"/>{status==='loading'&&<div className="map-loading" role="status">正在铺展山河…<small>阅读可从地点目录开始</small></div>}<div className="map-controls" aria-label="地图缩放"><button aria-label="放大地图" disabled={status!=='ready'||view.expanded} onClick={()=>adapter.current?.zoom(0.5)}>＋</button><button aria-label="缩小地图" disabled={status!=='ready'||view.expanded} onClick={()=>adapter.current?.zoom(-0.5)}>−</button></div></>;
}

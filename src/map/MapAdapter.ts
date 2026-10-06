import { Scene, PointLayer, LineLayer, PolygonLayer } from '@antv/l7';
import { MapLibre } from '@antv/l7-maps';
import * as maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { places,placeDetails } from '../data/content';
export type ViewState={placeId:string|null;local:boolean;expanded:boolean;reduced?:boolean};
const url=(path:string)=>`${import.meta.env.BASE_URL}${path}`;
const overview:[[number,number],[number,number]]=[[73,3],[136,54]];
export class MapAdapter {
 readonly map:maplibregl.Map;
 readonly scene:Scene;
 private markers:maplibregl.Marker[]=[];
 private localLabels:maplibregl.Marker[]=[];
 private state:ViewState={placeId:null,local:false,expanded:false};
 private loaded=false;
 private points?:{show:()=>unknown;hide:()=>unknown;setData:(data:unknown)=>unknown};
 private isLab=false;
 private disposed=false;
 private observer:ResizeObserver;
 private timer:ReturnType<typeof setTimeout>;
 private localReady=false;
 private select:(id:string)=>void;
 private container:HTMLDivElement;
 constructor(container:HTMLDivElement,select:(id:string)=>void,ready:()=>void,fail:(message:string)=>void,lab=false){
  this.select=select;
  this.isLab=lab;
  this.container=container;
  // L7's adapter removes its MapLibre container on destroy. Own an inner node,
  // leaving React's outer node intact for hot reload and remount.
  const ownedContainer=document.createElement('div');ownedContainer.style.cssText='position:absolute;inset:0';container.appendChild(ownedContainer);
  this.map=new maplibregl.Map({container:ownedContainer,center:[104,34],zoom:2,minZoom:1,maxZoom:5.3,attributionControl:false,renderWorldCopies:false,style:{version:8,sources:{land:{type:'geojson',data:url('geodata/land.json')}},layers:[{id:'paper',type:'background',paint:{'background-color':'#F4F0E6'}},{id:'land',type:'fill',source:'land',layout:{visibility:lab?'visible':'none'},paint:{'fill-color':'#edeadd','fill-opacity':0.94}},{id:'shore',type:'line',source:'land',layout:{visibility:lab?'visible':'none'},paint:{'line-color':'#829888','line-width':0.7,'line-opacity':0.46}}]}});
  this.map.dragRotate.disable();this.map.touchZoomRotate.disableRotation();
  this.scene=new Scene({id:container,map:new MapLibre({mapInstance:this.map}),logoVisible:false,antialias:true});
  this.timer=setTimeout(()=>{if(!this.loaded&&!this.disposed)fail('地图初始化超时；可从地点目录继续阅读。');},18000);
  this.map.on('error',e=>{if(!this.disposed)fail(`地图资源或渲染失败：${e.error?.message||'未知错误'}。可从目录继续阅读。`);});
  this.scene.on('loaded',async()=>{
   try{
   if(!this.map.isStyleLoaded())await new Promise<void>(resolve=>this.map.once('load',()=>resolve()));
   if(this.disposed)return;
   this.loaded=true;clearTimeout(this.timer);
   const points={type:'FeatureCollection',features:places.map(p=>({type:'Feature',properties:{placeId:p.id},geometry:{type:'Point',coordinates:p.coordinates}}))};
   const layer=new PointLayer({name:'literary-places'}).source(points).shape('circle').size(9).color('#8D5044').style({opacity:0.9,stroke:'#FCFAF4',strokeWidth:2});
   layer.on('click',e=>{const id=e.feature?.properties?.placeId;if(id)this.select(id);});
   this.scene.addLayer(layer);
   this.points=layer;
   for(const p of places){
    const button=document.createElement('button');button.className='map-place';button.dataset.placeId=p.id;button.setAttribute('aria-label',`地图地点：${p.name}`);button.innerHTML=`<span class="map-dot" aria-hidden="true"></span><span class="map-name">${p.name}</span><small>${p.region.split(' · ')[1]}</small>`;
    button.onclick=()=>this.select(p.id);
    const left=p.id!=='huxin';button.classList.toggle('label-left',left);
    this.markers.push(new maplibregl.Marker({element:button,anchor:left?'right':'left',offset:left?[10,0]:[-10,0]}).setLngLat(p.coordinates).addTo(this.map));
   }
   this.map.addSource('local-water',{type:'geojson',data:url('geodata/westlake.json')});
   this.map.addLayer({id:'lake-water',type:'fill',source:'local-water',layout:{visibility:'none'},paint:{'fill-color':['case',['==',['get','place'],'islet'],'#ece8da','#a8bbb9'],'fill-opacity':0.72}});
   this.map.addLayer({id:'lake-shore',type:'line',source:'local-water',layout:{visibility:'none'},paint:{'line-color':'#637c6c','line-opacity':0.65,'line-width':1}});
   this.map.addSource('causeways',{type:'geojson',data:url('geodata/causeways.json')});
   this.map.addLayer({id:'causeways',type:'line',source:'causeways',layout:{visibility:'none'},paint:{'line-color':'#7b806b','line-opacity':0.7,'line-width':1.2}});
   const labels=await fetch(url('geodata/local-labels.json')).then(r=>r.json()) as {name:string;coordinates:[number,number]}[];
   if(this.disposed)return;
   for(const label of labels){const element=document.createElement('span');element.className='local-label';element.textContent=label.name;this.localLabels.push(new maplibregl.Marker({element,offset:label.name==='阮公墩'?[-25,-22]:[0,0]}).setLngLat(label.coordinates).addTo(this.map));}
   this.map.on('sourcedata',e=>{if(e.sourceId==='local-water'&&e.isSourceLoaded)this.localReady=true;});
   if(lab)this.addLab();
   this.update(this.state);ready();
   }catch(error){this.loaded=false;clearTimeout(this.timer);if(!this.disposed)fail(error instanceof Error?error.message:'地图图层加载失败');}
  });
  this.observer=new ResizeObserver(()=>{if(this.disposed)return;this.map.resize();if(this.loaded){for(const marker of this.localLabels)marker.getElement().style.display=this.state.local&&!(innerWidth<768&&this.state.expanded)?'':'none';this.applyCamera(0);}});this.observer.observe(container);
  this.map.on('moveend',()=>this.writeDiagnostics());
 }
 private addLab(){
  const polygon={type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[100,30],[107,30],[107,36],[100,36],[100,30]]]}}]};
  const line={type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[98,27],[110,39]]}}]};
  this.scene.addLayer(new PolygonLayer({name:'dev-only-polygon'}).source(polygon).shape('fill').color('#506553').style({opacity:0.25}));
  this.scene.addLayer(new LineLayer({name:'dev-only-line'}).source(line).shape('line').size(2).color('#8D5044'));
 }
 update(state:ViewState){this.state=state;if(!this.loaded||this.disposed)return;
  const local=state.local&&!!placeDetails.find(d=>d.placeId===state.placeId)?.local;
  this.points?.setData({type:'FeatureCollection',features:places.filter(p=>local?p.id===state.placeId:this.isLab).map(p=>({type:'Feature',properties:{placeId:p.id},geometry:{type:'Point',coordinates:p.coordinates}}))});
  this.map.setMaxZoom(local?14:5.3);
  for(const id of ['land','shore'])this.map.setLayoutProperty(id,'visibility',!local&&this.isLab?'visible':'none');
  for(const id of ['lake-water','lake-shore','causeways'])this.map.setLayoutProperty(id,'visibility',local?'visible':'none');
  this.map.setPaintProperty('paper','background-color',local?'#F4F0E6':'#e9eeea');
  if(local||this.isLab)this.points?.show();else this.points?.hide();
  for(const m of this.markers){const el=m.getElement();el.classList.toggle('selected',el.dataset.placeId===state.placeId);el.setAttribute('aria-pressed',String(el.dataset.placeId===state.placeId));el.style.display=local?(el.dataset.placeId===state.placeId?'':'none'):this.isLab?'':'none';}
  for(const m of this.localLabels)m.getElement().style.display=local&&!(innerWidth<768&&state.expanded)?'':'none';
  // View/reader changes switch discrete layouts. Frame immediately so a small
  // expanded-reader strip cannot linger after returning to the half screen.
  this.applyCamera(0);
  this.writeDiagnostics();
 }
 private applyCamera(duration:number){
  const s=this.state;const mobile=innerWidth<768;const p=places.find(p=>p.id===s.placeId);
  const padding={top:mobile?100:120,bottom:mobile?(p?(s.expanded?innerHeight*0.78:innerHeight*0.49):130):80,left:mobile?30:140,right:mobile?30:(p?460:100)};
  // Keep camera clear of the reading sheet. Expanded mobile leaves a small visible map strip.
  if(mobile&&s.expanded){padding.top=78;padding.bottom=innerHeight-121;}
  this.map.stop();this.map.setPadding({top:0,bottom:0,left:0,right:0});
  // L7 2.29.1 viewport ignores MapLibre's persistent camera padding. Compute an
  // offset geographic center with cameraForBounds, then animate with zero padding.
  const bounds=s.local?placeDetails.find(d=>d.placeId===s.placeId)?.local?.bounds??overview:p?[[p.coordinates[0]-.1,p.coordinates[1]-.1],[p.coordinates[0]+.1,p.coordinates[1]+.1]]:overview;
  const camera=this.map.cameraForBounds(bounds as [[number,number],[number,number]],{padding,maxZoom:s.local?13.4:p?5.3:4});
  if(camera)this.map.easeTo({...camera,duration,padding:{top:0,bottom:0,left:0,right:0}});
 }
 zoom(delta:number){this.map.zoomTo(Math.min(this.map.getMaxZoom(),this.map.getZoom()+delta),{duration:this.state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches?0:180});}
 diagnostics(){return {loaded:this.loaded,localReady:this.localReady,layers:this.scene.getLayers().map(l=>l.name),view:this.state,zoom:this.map.getZoom(),center:this.map.getCenter(),localVisible:this.loaded?this.map.getLayoutProperty('lake-water','visibility'):null,points:places.map(p=>({id:p.id,...this.map.project(p.coordinates)}))};}
 private writeDiagnostics(){if(!this.loaded||this.disposed)return;this.container.dataset.mapView=this.state.local?'local':this.isLab?'overview':'image-overview';this.container.dataset.naturalEarthVisibility=String(this.map.getLayoutProperty('land','visibility'));this.container.dataset.l7PointVisibility=this.state.local||this.isLab?'visible':'none';this.container.dataset.localVisibility=String(this.map.getLayoutProperty('lake-water','visibility'));this.container.dataset.selectedPlace=this.state.placeId||'';this.container.dataset.l7Layers=this.scene.getLayers().map(l=>l.name).join(',');this.container.dataset.cameraPadding=JSON.stringify(this.map.getPadding());this.container.dataset.cameraBounds=JSON.stringify(this.map.getBounds().toArray());this.container.dataset.maxZoom=String(this.map.getMaxZoom());}
 destroy(){if(this.disposed)return;this.disposed=true;clearTimeout(this.timer);this.observer.disconnect();for(const m of [...this.markers,...this.localLabels])m.remove();this.scene.destroy();}
}
export type LocalGeodata=FeatureCollection;

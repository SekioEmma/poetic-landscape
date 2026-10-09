import {Scene,PointLayer} from '@antv/l7';
import {MapLibre} from '@antv/l7-maps';
import * as ml from 'maplibre-gl';
import type {FeatureCollection,Feature} from 'geojson';
import {places,placeDetails,relations} from '../data/content';
import {mapReadingArea,type ReaderLayout,type ReadingSpace} from '../layout/reader-layout';
import {iconMarkup} from '../components/CategoryIcon';
import {wgsToGcj,renderGeometry} from './coordinates';
import {CameraIntent,type CameraSource} from './camera-intent';
import {nationalBasemap,explorationScale,clusterRadii,panBounds,labelBudget,relativeLevel,sortPoints,clusterName,stressPoints,type NationalPoint,type MapLevel} from './national-config';
import {memberKey,uniqueGroups,nearTarget,closeGroups,layoutLabels,progressiveZoom,placeList,overlaps,type Rect} from './annotation-layout';
export type ViewState={placeId:string|null;local:boolean;expanded:boolean;reduced?:boolean;layout?:ReaderLayout;space?:ReadingSpace;resultIds?:string[];searchIds?:string[]};
export type GeoCamera={center:[number,number];zoom:number;bearing:0;pitch:0};
const url=(p:string)=>import.meta.env.BASE_URL+p;
const empty=():FeatureCollection=>({type:'FeatureCollection',features:[]});
const zero={top:0,right:0,bottom:0,left:0};
const localLayers=['lake-water','lake-islands','lake-shore-soft','lake-shore','causeways-paper','causeways'];
const nationalLayers=['national-fill','province-lines','national-outline','cluster-index'];
type Annotation={key:string;point:[number,number];members:NationalPoint[];selected:boolean;count:number;clusterId?:number};
export class MapAdapter{
 readonly map:ml.Map;readonly scene:Scene;
 private state:ViewState={placeId:null,local:false,expanded:false};
 private disposed=false;private loaded=false;private localReady=false;private localLoading?:Promise<void>;
 private points:NationalPoint[];private markers=new Map<string,ml.Marker>();private dormantMarkers=new Map<string,ml.Marker>();private provinces:ml.Marker[]=[];private localLabels:ml.Marker[]=[];
 private l7?:{setData:(data:unknown)=>unknown};private timer:ReturnType<typeof setTimeout>;private refreshTimer?:ReturnType<typeof setTimeout>;private observer:ResizeObserver;private revision=0;private annotationRevision=0;
 private z0=2;private level:MapLevel='national';private phone=false;private manual=false;private sourceKey='';
 private exploration:GeoCamera|null=null;private nationalReading:GeoCamera|null=null;private localCamera:GeoCamera|null=null;
 private list:HTMLDivElement|null=null;private listTrigger:HTMLElement|null=null;private trace:object[]=[];private focusedKey='';
 private clusterIntent:number|null=null;private pendingCluster:{node:Annotation;key:string;request:number;version:number;revision:number;input:number;intent:number}|null=null;private waitingForIdle=false;private remeasure=false;private candidates=new Map<string,number>();private sourceVersion=0;private clusterRequest=0;private nodeSerial=0;
 private intent=new CameraIntent();private inputRevision=0;
 private settled=()=>{if(this.remeasure){const c=this.camera(nationalBasemap.bounds,5);if(c?.zoom!==undefined){this.z0=c.zoom;this.remeasure=false;}}this.setSafeArea();this.refresh();};
 constructor(private container:HTMLDivElement,private select:(id:string)=>void,ready:()=>void,private fail:(text:string)=>void){
  const fixture=new URLSearchParams(location.search).get('mapStress');
  this.points=fixture==='12'||fixture==='40'?stressPoints(Number(fixture) as 12|40):places.map(p=>({id:p.id,name:p.name,region:p.region,coordinates:p.coordinates,iconId:p.id,works:relations.filter(r=>r.placeId===p.id).length,importance:p.id==='huxin'?3:2}));
  this.phone=innerWidth<600;
  const owned=document.createElement('div');owned.className='map-owned';owned.style.cssText='position:absolute;inset:0;width:100%;height:100%';container.appendChild(owned);
  // Reuse the pinned MapLibre bridge and L7 scene lifecycle. No style replacement.
  this.map=new ml.Map({container:owned,center:[104,34],zoom:2,minZoom:.5,maxZoom:explorationScale.nationalMax,attributionControl:false,renderWorldCopies:true,pitch:0,bearing:0,style:{version:8,sources:{},layers:[{id:'paper',type:'background',paint:{'background-color':'#F4F0E6'}}]}});
  this.map.dragRotate.disable();this.map.touchZoomRotate.disableRotation();this.map.keyboard.disableRotation();
  this.scene=new Scene({id:container,map:new MapLibre({mapInstance:this.map}),logoVisible:false,antialias:true});
  this.timer=setTimeout(()=>{if(!this.loaded&&!this.disposed)fail('全国地图加载超时。可从目录继续阅读。');},18000);
  this.map.on('error',e=>{if(!this.disposed)fail('地图资源未能加载：'+(e.error?.message||'未知错误'));});
  this.scene.on('loaded',()=>{void this.initialize().then(()=>{if(this.disposed)return;this.loaded=true;clearTimeout(this.timer);this.fitNational(0);this.update(this.state,true);ready();}).catch(e=>{clearTimeout(this.timer);if(!this.disposed)fail(String(e));});});
  this.observer=new ResizeObserver(()=>{if(!this.disposed)this.resize();});this.observer.observe(container);
  this.map.on('dragstart',e=>{if(e.originalEvent)this.markManual(false);});this.map.on('zoomstart',e=>{if(e.originalEvent)this.markManual(false);});
  // Capture precedes the descendant canvas handlers. Cancel our ease once here,
  // never from dragstart/zoomstart after MapLibre has begun its native gesture.
  owned.addEventListener('pointerdown',this.onInput,true);owned.addEventListener('wheel',this.onInput,{passive:true,capture:true});
  this.map.on('movestart',()=>{this.waitingForIdle=true;container.dataset.renderState='moving';this.closeList(false);for(const m of this.provinces)m.getElement().style.display='none';});
  this.map.on('move',()=>this.addTrace('moving'));
  this.map.on('zoom',()=>{if(!this.intent.active)this.syncPanBounds();});
  this.map.on('dragend',()=>{this.addTrace('native-drag-end');this.write();});
  this.map.on('moveend',e=>{if(!this.disposed){const id=(e as typeof e&{cameraIntent?:number}).cameraIntent;if(typeof id==='number')this.intent.finish(id);container.dataset.renderState='idle';this.syncPanBounds();this.addTrace('idle');this.refresh();this.write();}});
  this.map.on('sourcedata',e=>{if(e.sourceId==='culture-index'&&e.isSourceLoaded){this.waitingForIdle=true;this.refresh();}});
  this.map.on('idle',()=>{if(this.waitingForIdle){this.waitingForIdle=false;this.refresh();}});
  this.map.on('click',e=>{if(!(e.originalEvent.target as HTMLElement)?.closest('button,.nearby-list'))this.closeList();});
  container.closest('.app')?.addEventListener('reader-settled',this.settled);window.addEventListener('keydown',this.escape,true);
 }
 private onInput=(e:Event)=>{if((e.target as HTMLElement)?.closest('button,.nearby-list'))return;this.markManual(true);};
 private markManual(beforeHandlers:boolean){this.manual=true;this.inputRevision++;const root=this.container.closest<HTMLElement>('.app');if(root)root.dataset.mapExplored='true';const stopAutomatic=this.intent.cancel();if(beforeHandlers&&stopAutomatic){this.map.stop();this.addTrace('cancel-automatic-before-handler');}this.addTrace(beforeHandlers?'user-input':'native-gesture-start');this.write();}
 private escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&this.list&&!document.querySelector('dialog[open]')&&this.container.closest<HTMLElement>('.app')?.dataset.directoryOpen!=='true'){e.preventDefault();e.stopImmediatePropagation();this.closeList();}};
 private async json(path:string){const r=await fetch(url(path));if(!r.ok)throw Error(path+' HTTP '+r.status);return r.json();}
 private async initialize(){
  if(!this.map.isStyleLoaded())await new Promise<void>(resolve=>this.map.once('load',()=>resolve()));
  const [provinces,outline]=await Promise.all([this.json(new URLSearchParams(location.search).has('baseFail')?'geodata/missing-national.json':nationalBasemap.provinces),this.json(nationalBasemap.outline)]);
  if(this.disposed)return;
  this.map.addSource('national',{type:'geojson',data:provinces});this.map.addSource('outline',{type:'geojson',data:outline});
  this.map.addLayer({id:'national-fill',type:'fill',source:'national',paint:{'fill-color':'#dfe8e1','fill-opacity':.68}});
  this.map.addLayer({id:'province-lines',type:'line',source:'national',paint:{'line-color':'#899688','line-width':['interpolate',['linear'],['zoom'],2,.4,6,.7],'line-opacity':.42}});
  this.map.addLayer({id:'national-outline',type:'line',source:'outline',paint:{'line-color':'#526f62','line-width':['interpolate',['linear'],['zoom'],2,1.05,6,1.4],'line-opacity':.86}});
  this.map.addSource('culture-index',{type:'geojson',data:empty(),cluster:true,clusterRadius:this.phone?clusterRadii.phone:clusterRadii.desktop,clusterMaxZoom:explorationScale.clusterMax,maxzoom:14});
  this.map.addLayer({id:'cluster-index',type:'circle',source:'culture-index',paint:{'circle-radius':1,'circle-opacity':0}});
  const points=new PointLayer({name:'literary-places'}).source(empty()).shape('circle').size('selected',v=>v?5:2.7).color('selected',v=>v?'#8D5044':'#506553').style({opacity:.9,stroke:'#FCFAF4',strokeWidth:1});this.scene.addLayer(points);this.l7=points;
  for(const f of (provinces as FeatureCollection).features){const p=f.properties;if(!p?.name||!p.center)continue;const el=document.createElement('span');el.className='province-label';el.textContent=p.name.replace(/省|市|自治区|壮族|回族|维吾尔/g,'');this.provinces.push(new ml.Marker({element:el}).setLngLat(p.center).addTo(this.map));}
  this.container.dataset.featureCount=String(provinces.features.length);this.container.dataset.coordinateSystem=nationalBasemap.renderCoordinates;
 }
 private async ensureLocal(){
  if(this.localReady)return;
  if(new URLSearchParams(location.search).has('localFail'))throw Error('局部地图测试入口：数据不可用。');
  const [water,paths,labels]=await Promise.all([this.json('geodata/westlake.json'),this.json('geodata/causeways.json'),this.json('geodata/local-labels.json')]);if(this.disposed)return;
  // Same approximate transform for every ring, island, causeway, label and point.
  this.map.addSource('local-water',{type:'geojson',data:renderGeometry(water)});this.map.addSource('causeways',{type:'geojson',data:renderGeometry(paths)});
  const hidden={visibility:'none' as const};
  this.map.addLayer({id:'lake-water',type:'fill',source:'local-water',filter:['!=',['get','place'],'island'],layout:hidden,paint:{'fill-color':'#c6d9d6','fill-opacity':.94}});
  this.map.addLayer({id:'lake-islands',type:'fill',source:'local-water',filter:['==',['get','place'],'island'],layout:hidden,paint:{'fill-color':'#e4e9da','fill-opacity':.96}});
  this.map.addLayer({id:'lake-shore-soft',type:'line',source:'local-water',layout:hidden,paint:{'line-color':'#a8bbb9','line-width':['interpolate',['linear'],['zoom'],10,1,14,3],'line-opacity':['interpolate',['linear'],['zoom'],10,.08,14,.25]}});
  this.map.addLayer({id:'lake-shore',type:'line',source:'local-water',layout:hidden,paint:{'line-color':['case',['==',['get','place'],'island'],'#7d8d6e','#637c6c'],'line-width':['interpolate',['linear'],['zoom'],10,.45,14,1.2],'line-opacity':['interpolate',['linear'],['zoom'],10,.22,14,.7]}});
  this.map.addLayer({id:'causeways-paper',type:'line',source:'causeways',layout:hidden,paint:{'line-color':'#fcfaf4','line-width':['interpolate',['linear'],['zoom'],10,2,14,5]}});
  this.map.addLayer({id:'causeways',type:'line',source:'causeways',layout:hidden,paint:{'line-color':'#818b69','line-width':['interpolate',['linear'],['zoom'],10,.5,14,1.3],'line-opacity':['interpolate',['linear'],['zoom'],10,.4,14,.86]}});
  const all=[...labels];for(const name of ['苏堤','白堤']){const f=paths.features.filter((f:Feature)=>f.properties?.name===name&&f.geometry.type==='LineString').sort((a:Feature,b:Feature)=>(b.geometry as GeoJSON.LineString).coordinates.length-(a.geometry as GeoJSON.LineString).coordinates.length)[0];if(f)all.push({name,coordinates:f.geometry.coordinates[Math.floor(f.geometry.coordinates.length/2)]});}
  for(const label of all){const el=document.createElement('span');el.className='local-label';el.textContent=label.name;el.style.display='none';this.localLabels.push(new ml.Marker({element:el,offset:label.name==='阮公墩'?[-25,-22]:[0,0]}).setLngLat(wgsToGcj(label.coordinates)).addTo(this.map));}
  this.localReady=true;
 }
 update(state:ViewState,initial=false){
  const old=this.state;this.state=state;if(!this.loaded||this.disposed)return;
  if(this.clusterIntent!==null&&this.intent.owns(this.clusterIntent)&&this.intent.active)this.stop();this.pendingCluster=null;this.clusterRequest++;
  const rev=++this.revision,inputRev=this.inputRevision;this.closeList(false);
  if(!old.placeId&&state.placeId&&!initial){this.exploration=this.getCamera();this.manual=false;}
  if(old.local&&!state.local)this.localCamera=this.getCamera();
  if(old.placeId!==state.placeId&&state.placeId)this.localCamera=null;
  const apply=()=>{if(this.disposed||rev!==this.revision)return;const local=state.local&&this.localReady;
   this.map.setMinZoom(local?explorationScale.localMin:Math.max(.5,this.z0-explorationScale.nationalRetreat));this.map.setMaxZoom(local?explorationScale.localMax:explorationScale.nationalMax);this.syncPanBounds();for(const id of nationalLayers)this.map.setLayoutProperty(id,'visibility',local?'none':'visible');
   if(this.localReady)for(const id of localLayers)this.map.setLayoutProperty(id,'visibility',local?'visible':'none');
   for(const m of this.localLabels)m.getElement().style.display=local?'':'none';
   const key=JSON.stringify([state.resultIds,state.placeId,local]);if(key!==this.sourceKey){this.sourceKey=key;this.sourceVersion++;this.clusterRequest++;const result=this.points.filter(p=>(!state.resultIds||state.resultIds.includes(p.id)||p.test)&&p.id!==state.placeId).sort((a,b)=>a.id.localeCompare(b.id));(this.map.getSource('culture-index') as ml.GeoJSONSource).setData({type:'FeatureCollection',features:(local?[]:result).map(p=>({type:'Feature',id:p.id,properties:{placeId:p.id},geometry:{type:'Point',coordinates:wgsToGcj(p.coordinates)}}))});}
   if(inputRev!==this.inputRevision){this.refresh();this.write();return;}
   if(!state.placeId&&old.placeId){if(this.exploration)this.restoreCamera(this.exploration);this.exploration=null;this.manual=false;}
   else if(old.local&&!state.local){if(this.nationalReading)this.restoreCamera(this.nationalReading);this.manual=false;}
   else if(state.local&&!old.local){this.manual=false;if(this.localCamera)this.restoreCamera(this.localCamera);else this.fitLocal();}
   else if(state.placeId&&state.placeId!==old.placeId){this.manual=false;this.focusPlace(state.placeId);}
   else if(old.local===state.local)this.setSafeArea();
   this.refresh();this.write();
  };
  if(state.local&&!old.local)this.nationalReading=this.getCamera();
  if(state.local&&!this.localReady){this.localLoading??=this.ensureLocal();void this.localLoading.then(apply).catch(e=>{if(!this.disposed&&rev===this.revision)this.fail(String(e));});}else apply();
 }
 getCamera():GeoCamera{const c=this.map.getCenter();return {center:[c.lng,c.lat],zoom:this.map.getZoom(),bearing:0,pitch:0};}
 restoreCamera(c:GeoCamera){this.stop();this.map.setMaxBounds(null);this.syncPanBounds(c.zoom);const id=this.intent.begin('restore');this.map.jumpTo({...c,padding:zero},{cameraIntent:id});this.intent.finish(id);this.addTrace('restore');}
 private duration(){return this.state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches?0:320;}
 private camera(bounds:[[number,number],[number,number]],maxZoom:number){const a=mapReadingArea(this.container);if(a.width<=56||a.height<=64)return undefined;return this.map.cameraForBounds(bounds,{padding:{left:a.left+28,right:this.container.clientWidth-a.left-a.width+28,top:a.top+32,bottom:this.container.clientHeight-a.top-a.height+32},maxZoom});}
 private fit(bounds:[[number,number],[number,number]],maxZoom:number,duration=this.duration(),source:CameraSource='place'){this.stop();this.map.setMaxBounds(null);const c=this.camera(bounds,maxZoom);if(c){this.syncPanBounds(c.zoom);const id=this.intent.begin(source);this.map.easeTo({...c,duration,padding:zero,bearing:0,pitch:0},{cameraIntent:id});}this.addTrace('fit-'+source);}
 fitNational(duration=this.duration()){
  // An explicit reset may arrive before ResizeObserver after a viewport change.
  // Synchronize the public map viewport before measuring the full-country fit.
  this.stop();this.manual=false;this.map.resize();this.measureNational();this.syncPanBounds();this.fit(nationalBasemap.bounds,5,duration,'national');this.level='national';
 }
 focusPlace(id:string){const p=this.points.find(p=>p.id===id);if(!p)return;const [x,y]=wgsToGcj(p.coordinates);this.fit([[x-1.7,y-1.1],[x+1.7,y+1.1]],Math.min(this.z0+2,6.3));}
 private fitLocal(){const d=placeDetails.find(d=>d.placeId===this.state.placeId)?.local;if(d)this.fit(d.bounds.map(c=>wgsToGcj(c)) as [[number,number],[number,number]],14,this.duration(),'local');}
 private async expandCluster(n:Annotation,trigger:HTMLElement){
  this.stop();const request=++this.clusterRequest,version=this.sourceVersion,revision=this.revision,input=this.inputRevision,id=this.intent.begin('cluster'),key=n.key;this.clusterIntent=id;this.write();
  const valid=()=>!this.disposed&&request===this.clusterRequest&&version===this.sourceVersion&&revision===this.revision&&input===this.inputRevision&&this.intent.owns(id)&&this.markers.has(key)&&!this.map.isMoving();
  const points=n.members.map(p=>wgsToGcj(p.coordinates)),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),screens=points.map(p=>this.map.project(p));
  const spread=Math.max(Math.max(...screens.map(p=>p.x))-Math.min(...screens.map(p=>p.x)),Math.max(...screens.map(p=>p.y))-Math.min(...screens.map(p=>p.y)));
  try{
   const expansion=n.clusterId===undefined?Infinity:await (this.map.getSource('culture-index') as ml.GeoJSONSource).getClusterExpansionZoom(n.clusterId);
   if(!valid())return;
   const a=mapReadingArea(this.container),margin=this.phone?40:64,bounds:[[number,number],[number,number]]=[[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]];
   const padding={left:a.left+margin,right:this.container.clientWidth-a.left-a.width+margin,top:a.top+margin,bottom:this.container.clientHeight-a.top-a.height+margin};
   const c=a.width>margin*2+44&&a.height>margin*2+44?this.map.cameraForBounds(bounds,{padding,maxZoom:this.map.getMaxZoom()}):undefined;
   const current=this.map.getZoom(),target=progressiveZoom(current,expansion,c?.zoom??-Infinity,this.map.getMaxZoom(),spread<18);
   this.container.dataset.clusterDecision=JSON.stringify({key,ids:n.members.map(p=>p.id),current,expansion:Number.isFinite(expansion)?expansion:null,fit:c?.zoom,target,margin,action:target===null?'list':'expand',sourceVersion:version,request});
   if(target===null||!c){this.intent.finish(id);this.openList(n,trigger);this.addTrace('cluster-list');this.refresh();return;}
   this.pendingCluster={node:n,key,request,version,revision,input,intent:id};this.manual=false;const next=this.map.cameraForBounds(bounds,{padding,maxZoom:target})!;this.syncPanBounds(target);this.map.easeTo({...next,zoom:target,padding:zero,bearing:0,pitch:0,duration:this.duration()},{cameraIntent:id});this.addTrace('cluster-step');
  }catch{if(valid()){this.intent.finish(id);this.openList(n,trigger);this.refresh();}}
 }
 setSafeArea(){if(!this.loaded||this.manual||this.intent.active||!this.state.placeId||this.disposed)return;const p=this.points.find(p=>p.id===this.state.placeId);if(!p)return;const a=mapReadingArea(this.container);if(a.width<160||a.height<130)return;const pt=this.map.project(wgsToGcj(p.coordinates)),x=Math.max(a.left+84,Math.min(pt.x,a.left+a.width-84)),y=Math.max(a.top+38,Math.min(pt.y,a.top+a.height-44));if(Math.abs(pt.x-x)>1||Math.abs(pt.y-y)>1){this.stop();const id=this.intent.begin('safe-area');this.map.panBy([pt.x-x,pt.y-y],{duration:0},{cameraIntent:id});this.intent.finish(id);this.addTrace('safe-correction');}}
 stop(){this.intent.cancel();this.clusterIntent=null;this.pendingCluster=null;this.map.stop();}
 private syncPanBounds(zoom=this.map.getZoom()){if(!this.loaded)return;const local=this.state.local&&this.localReady;const bounds=local?placeDetails.find(d=>d.placeId===this.state.placeId)?.local?.bounds.map(c=>wgsToGcj(c)) as [[number,number],[number,number]]|undefined:undefined;this.map.setMaxBounds(panBounds(zoom,this.container.clientWidth,this.container.clientHeight,bounds));}
 private measureNational(){if(this.state.local)return;this.map.setMaxBounds(null);this.map.setMinZoom(.5);const c=this.camera(nationalBasemap.bounds,5);this.remeasure=c?.zoom===undefined;if(c?.zoom!==undefined){this.z0=c.zoom;const min=Math.max(.5,this.z0-explorationScale.nationalRetreat);this.map.setMinZoom(this.manual?Math.min(min,this.map.getZoom()):min);}}
 resize(){this.map.resize();if(this.loaded){this.measureNational();this.syncPanBounds();}const phone=innerWidth<600;if(phone!==this.phone&&this.loaded){this.phone=phone;this.sourceVersion++;this.clusterRequest++;void (this.map.getSource('culture-index') as ml.GeoJSONSource).setClusterOptions({cluster:true,clusterRadius:phone?clusterRadii.phone:clusterRadii.desktop,clusterMaxZoom:explorationScale.clusterMax}).then(()=>this.refresh());}this.setSafeArea();this.refresh();}
 zoom(delta:number){const target=Math.max(this.map.getMinZoom(),Math.min(this.map.getMaxZoom(),(this.intent.zoomTarget??this.map.getZoom())+delta));const a=mapReadingArea(this.container),around=this.map.unproject([a.left+a.width/2,a.top+a.height/2]);this.manual=true;this.stop();this.syncPanBounds(target);const id=this.intent.begin('button',target);this.map.easeTo({zoom:target,around,duration:this.duration()?200:0},{cameraIntent:id});this.addTrace('zoom-button');this.write();}
 locate(){this.manual=false;if(this.state.local)this.fitLocal();else this.fitNational();}
 private refresh(){clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>{void this.annotations();},40);}
 private annotationObstacles():Rect[]{
  const b=this.container.getBoundingClientRect(),root=this.container.closest('.app');
  return [...(root?.querySelectorAll<HTMLElement>('.map-toolset,.map-attribution,.site-header,.reading-sheet:not(.closing),.nearby-list,.map-stress-note,.map-intro,.back-national')??[])].filter(e=>getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(e=>{const r=e.getBoundingClientRect();return {left:r.left-b.left-5,right:r.right-b.left+5,top:r.top-b.top-5,bottom:r.bottom-b.top+5};});
 }
 private async annotations(){
  if(!this.loaded||this.disposed||this.waitingForIdle||this.map.isMoving()||!this.map.isSourceLoaded('culture-index'))return;const rev=++this.annotationRevision,stateRev=this.revision,sourceVersion=this.sourceVersion,input=this.inputRevision,src=this.map.getSource('culture-index') as ml.GeoJSONSource;
  const valid=()=>rev===this.annotationRevision&&stateRev===this.revision&&sourceVersion===this.sourceVersion&&input===this.inputRevision&&!this.disposed&&!this.map.isMoving();
  this.level=relativeLevel(this.map.getZoom()-this.z0,this.level);let nodes:Annotation[]=[];const seen=new Set<string>();
  if(!this.state.local)for(const f of this.map.queryRenderedFeatures({layers:['cluster-index']})){
   const cluster=!!f.properties.cluster,workerKey=cluster?'c-'+f.properties.cluster_id:'p-'+f.properties.placeId;if(seen.has(workerKey)||f.geometry.type!=='Point')continue;seen.add(workerKey);
   const coords=f.geometry.coordinates as [number,number],pos=this.map.project(coords);if(pos.x<0||pos.y<0||pos.x>this.container.clientWidth||pos.y>this.container.clientHeight)continue;
   try{const leaves=cluster?await src.getClusterLeaves(f.properties.cluster_id,100,0):[f];if(!valid())return;const ids=leaves.map(f=>f.properties?.placeId),members=this.points.filter(p=>ids.includes(p.id)&&p.id!==this.state.placeId&&(!this.state.resultIds||this.state.resultIds.includes(p.id)||p.test));if(members.length)nodes.push({key:memberKey(members.map(p=>p.id)),point:cluster?coords:wgsToGcj(members[0].coordinates),members,selected:false,count:members.length,clusterId:cluster?f.properties.cluster_id:undefined});}catch{/* next source event retries */}
  }
  // Rendered tiles can overlap during a source refresh; claim each member once.
  nodes=uniqueGroups<NationalPoint,Annotation>(nodes).map(({node:n,members,unchanged})=>{if(unchanged)return n;const coordinates=members.map(p=>wgsToGcj(p.coordinates)),point:[number,number]=[coordinates.reduce((s,c)=>s+c[0],0)/members.length,coordinates.reduce((s,c)=>s+c[1],0)/members.length];return {...n,key:memberKey(members.map(p=>p.id)),members,count:members.length,point,clusterId:undefined};});
  const current=this.points.find(p=>p.id===this.state.placeId);if(current){const selectedPoint=wgsToGcj(current.coordinates),screen=this.map.project(selectedPoint),neighbors:NationalPoint[]=[];nodes=nodes.flatMap(n=>{const members=n.members.filter(p=>{if(nearTarget(screen,this.map.project(wgsToGcj(p.coordinates)))){neighbors.push(p);return false;}return true;});if(!members.length)return [];if(members.length===n.count)return [n];const coords=members.map(p=>wgsToGcj(p.coordinates)),point:[number,number]=[coords.reduce((v,c)=>v+c[0],0)/coords.length,coords.reduce((v,c)=>v+c[1],0)/coords.length];return [{...n,key:memberKey(members.map(p=>p.id)),members,count:members.length,point,clusterId:undefined}];});const members=[current,...neighbors];nodes.unshift({key:memberKey(members.map(p=>p.id)),point:selectedPoint,members,selected:true,count:members.length});}
  // Native clusters are retained; only close, otherwise overlapping DOM targets merge.
  nodes=closeGroups(nodes.map(n=>({node:n,point:this.map.project(n.point)}))).map(group=>{if(group.length===1)return group[0].node;const picked=group.find(g=>g.node.selected)?.node??group[0].node,members=[...new Map(group.flatMap(g=>g.node.members).map(p=>[p.id,p])).values()];return {...picked,key:memberKey(members.map(p=>p.id)),members,count:members.length,clusterId:undefined};});
  const priority=(n:Annotation)=>n.selected?400:n.key===this.focusedKey?350:n.members.some(p=>this.state.searchIds?.includes(p.id))?200:100+Math.max(...n.members.map(p=>p.importance));
  const ordered=nodes.sort((a,b)=>priority(b)-priority(a)||a.key.localeCompare(b.key));
  this.l7?.setData({type:'FeatureCollection',features:ordered.map(n=>({type:'Feature',properties:{selected:Number(n.selected)},geometry:{type:'Point',coordinates:n.point}}))});
  const keep=new Set(ordered.map(n=>n.key));for(const [key,m] of this.markers)if(!keep.has(key)){m.remove();this.markers.delete(key);this.dormantMarkers.set(key,m);if(this.dormantMarkers.size>128)this.dormantMarkers.delete(this.dormantMarkers.keys().next().value!);}
  const area=mapReadingArea(this.container),safe={left:area.left,top:area.top,right:area.left+area.width,bottom:area.top+area.height},obstacles=this.annotationObstacles();
  const inputs=ordered.map(n=>{
   let marker=this.markers.get(n.key);if(!marker&&this.dormantMarkers.has(n.key)){marker=this.dormantMarkers.get(n.key)!;this.dormantMarkers.delete(n.key);marker.addTo(this.map);this.markers.set(n.key,marker);}if(!marker){const el=document.createElement('button');el.className='geo-entry';el.dataset.annotationKey=n.key;el.dataset.nodeSerial=String(++this.nodeSerial);
    const symbol=document.createElement('span');symbol.className='geo-symbol';symbol.setAttribute('aria-hidden','true');const title=document.createElement('span');title.className='geo-title';el.append(symbol,title);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','geo-leader');svg.setAttribute('aria-hidden','true');const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1','22');line.setAttribute('y1','22');svg.append(line);el.prepend(svg);
    marker=new ml.Marker({element:el,anchor:'center'}).setLngLat(n.point).addTo(this.map);this.markers.set(n.key,marker);
    el.onfocus=()=>{if(this.focusedKey!==n.key){this.focusedKey=n.key;this.refresh();}};el.onblur=()=>{this.focusedKey='';this.refresh();};
   }
   marker.setLngLat(n.point);marker.setOffset([0,0]);const el=marker.getElement(),p=n.selected?current!:n.members[0],name=n.selected?p.name:n.count>1?clusterName(n.members):p.name;
   el.classList.toggle('selected',n.selected);el.classList.toggle('clustered',n.count>1);el.classList.toggle('focused',n.key===this.focusedKey);el.dataset.placeId=n.selected||n.count===1?p.id:'';el.dataset.memberIds=n.members.map(p=>p.id).sort().join(',');el.dataset.count=String(n.count);
   el.setAttribute('aria-label',n.selected||n.count===1?'地图地点：'+p.name:'地图分组：'+name);el.setAttribute('aria-pressed',String(n.selected));el.setAttribute('aria-description',n.selected&&this.state.resultIds&&!this.state.resultIds.includes(p.id)?'当前阅读，不在筛选结果':n.count>1?'打开或逐级探索全部'+n.count+'个地点':'');
   const symbol=el.querySelector<HTMLElement>('.geo-symbol')!,kind=n.selected?'selected-'+p.iconId+'-'+n.count:n.count>1?'cluster':p.iconId;
   if(symbol.dataset.kind!==kind){symbol.dataset.kind=kind;symbol.innerHTML=n.count>1&&!n.selected?'<span class="geo-count"></span>':iconMarkup(p.iconId);if(n.selected&&n.count>1){const count=document.createElement('span');count.className='geo-neighbor-count';symbol.append(count);}}
   const count=symbol.querySelector('.geo-count,.geo-neighbor-count');if(count)count.textContent=String(n.count);
   const title=el.querySelector<HTMLElement>('.geo-title')!;title.textContent=name;title.style.width='max-content';const width=Math.ceil(title.getBoundingClientRect().width);el.onclick=()=>{if(n.count>1)void this.expandCluster(n,el);else{this.clusterRequest++;this.stop();this.select(p.id);}};
   const pt=this.map.project(n.point);obstacles.push({left:pt.x-12,right:pt.x+12,top:pt.y-12,bottom:pt.y+12});
   return {key:n.key,anchor:pt,width,priority:priority(n),required:n.selected||n.key===this.focusedKey};
  });
  const {result,occupied,shown}=layoutLabels(inputs,safe,obstacles,labelBudget(this.level,this.phone),this.candidates),evidence=[];
  for(const n of ordered){const el=this.markers.get(n.key)!.getElement(),title=el.querySelector<HTMLElement>('.geo-title')!,pt=this.map.project(n.point),placed=result.get(n.key)!,chosen=placed.rect;
   title.style.visibility=chosen?'visible':'hidden';title.style.opacity=chosen?'1':'0';title.style.left=(chosen?22+chosen.left-pt.x:22)+'px';title.style.top=(chosen?22+chosen.top-pt.y:22)+'px';
   el.dataset.candidate=String(placed.candidate);el.dataset.labelVisible=String(!!chosen);const leader=el.querySelector<SVGElement>('.geo-leader')!;leader.style.display=chosen?'':'none';const line=leader.querySelector('line')!;line.setAttribute('x2',String(chosen?22+(chosen.left>pt.x?19:chosen.right<pt.x?-19:0):22));line.setAttribute('y2',String(chosen?22+(chosen.top+15-pt.y):22));
   evidence.push({key:n.key,ids:n.members.map(p=>p.id),selected:n.selected,focused:n.key===this.focusedKey,priority:priority(n),nodeSerial:el.dataset.nodeSerial,anchor:{x:pt.x,y:pt.y},visual:{x:pt.x,y:pt.y},offset:[0,0],label:chosen,candidate:placed.candidate,reused:placed.reused,count:n.count});
  }
  let provincialCount=0;const cx=area.left+area.width/2,cy=area.top+area.height/2;const ranked=[...this.provinces].sort((a,b)=>{const p=this.map.project(a.getLngLat()),q=this.map.project(b.getLngLat());return Math.hypot(p.x-cx,p.y-cy)-Math.hypot(q.x-cx,q.y-cy)||(a.getElement().textContent??'').localeCompare(b.getElement().textContent??'');});for(const m of ranked){const pt=this.map.project(m.getLngLat()),r={left:pt.x-35,right:pt.x+35,top:pt.y-10,bottom:pt.y+10},visible=!this.state.local&&provincialCount<(this.phone?3:6)&&r.left>safe.left&&r.right<safe.right&&r.top>safe.top&&r.bottom<safe.bottom&&!occupied.some(o=>overlaps(r,o,6));m.getElement().style.display=visible?'':'none';if(visible){provincialCount++;occupied.push(r);}}
  this.container.dataset.annotationCamera=JSON.stringify(this.getCamera());this.container.dataset.annotationListOpen=String(!!this.list);this.container.dataset.annotationSourceVersion=String(this.sourceVersion);this.container.dataset.annotations=JSON.stringify(evidence);this.container.dataset.labelObstacles=JSON.stringify(obstacles);this.container.dataset.labelCount=String(shown);this.container.dataset.level=this.level;this.container.dataset.z0=String(this.z0);this.write();
  const pending=this.pendingCluster;this.pendingCluster=null;if(pending&&pending.request===this.clusterRequest&&pending.version===this.sourceVersion&&pending.revision===this.revision&&pending.input===this.inputRevision&&this.intent.owns(pending.intent)){const unchanged=ordered.find(n=>n.key===pending.key);if(unchanged){this.container.dataset.clusterFallback='same members after step; complete list';this.openList(unchanged,this.markers.get(unchanged.key)!.getElement());}}
 }
 private openList(n:Annotation,trigger:HTMLElement){
  this.closeList(false);this.listTrigger=trigger;const el=document.createElement('div');el.className='nearby-list';el.setAttribute('role','dialog');el.setAttribute('aria-label','邻近地点');
  const header=document.createElement('div');header.className='nearby-list-header';const heading=document.createElement('strong');heading.textContent=clusterName(n.members);header.appendChild(heading);const close=document.createElement('button');close.className='nearby-list-close';close.textContent='关闭';close.setAttribute('aria-label','关闭邻近地点');close.onclick=()=>this.closeList();header.appendChild(close);el.appendChild(header);const items=document.createElement('div');items.className='nearby-list-items';el.appendChild(items);
  for(const p of sortPoints(n.members,this.state.placeId)){const b=document.createElement('button');b.textContent=p.name+'　'+p.works+'篇';const meta=document.createElement('small');meta.textContent=p.region;b.appendChild(meta);b.setAttribute('aria-pressed',String(p.id===this.state.placeId));b.onclick=()=>{this.closeList(false);this.select(p.id);};items.appendChild(b);}
  el.onkeydown=e=>{if(e.key==='Tab'){const buttons=[...el.querySelectorAll('button')],i=buttons.indexOf(document.activeElement as HTMLButtonElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}};
  const a=mapReadingArea(this.container),pt=this.map.project(n.point),width=Math.min(248,a.width-8),maxHeight=Math.min(260,a.height-8),blocked=this.annotationObstacles();
  for(const marker of this.markers.values()){const q=this.map.project(marker.getLngLat());blocked.push({left:q.x-22,right:q.x+22,top:q.y-22,bottom:q.y+22});const title=marker.getElement().querySelector<HTMLElement>('.geo-title');if(title&&getComputedStyle(title).visibility==='visible'){const r=title.getBoundingClientRect(),origin=this.container.getBoundingClientRect();blocked.push({left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top});}}
  el.style.width=width+'px';el.style.maxHeight=maxHeight+'px';el.style.visibility='hidden';this.container.appendChild(el);const height=Math.min(maxHeight,el.offsetHeight),position=placeList(pt,{left:a.left,top:a.top,right:a.left+a.width,bottom:a.top+a.height},width,height,blocked);el.style.left=position.left+'px';el.style.top=position.top+'px';el.style.maxHeight=(position.bottom-position.top)+'px';el.style.visibility='visible';this.list=el;close.focus();this.refresh();


 }
 private closeList(focus=true){if(focus){this.clusterRequest++;if(this.clusterIntent!==null&&this.intent.owns(this.clusterIntent)&&this.intent.active)this.stop();}if(!this.list)return;const held=this.list.contains(document.activeElement);this.list.remove();this.list=null;if(focus&&this.listTrigger?.isConnected)this.listTrigger.focus({preventScroll:true});else if(focus||held){this.container.tabIndex=-1;this.container.focus({preventScroll:true});}}
 private addTrace(event:string){if(!new URLSearchParams(location.search).has('mapTrace'))return;this.trace.push({t:performance.now(),event,selected:this.state.placeId,intent:this.intent.id,active:this.intent.active,target:this.intent.zoomTarget,z0:this.z0,area:mapReadingArea(this.container),viewport:[this.container.clientWidth,this.container.clientHeight],...this.getCamera()});if(this.trace.length>480)this.trace.shift();this.container.dataset.cameraTrace=JSON.stringify(this.trace);}
 private write(){if(!this.loaded||this.disposed)return;this.container.dataset.cameraActive=String(this.intent.active);this.container.dataset.sourceVersion=String(this.sourceVersion);this.container.dataset.sourceUpdating=String(!this.map.isSourceLoaded('culture-index'));this.container.dataset.mapView=this.state.local&&this.localReady?'local':'national';this.container.dataset.safeArea=JSON.stringify(mapReadingArea(this.container));this.container.dataset.camera=JSON.stringify(this.getCamera());this.container.dataset.zoomLimits=JSON.stringify({min:this.map.getMinZoom(),max:this.map.getMaxZoom(),target:this.intent.zoomTarget??this.map.getZoom()});this.container.dataset.cameraBounds=JSON.stringify(this.map.getBounds().toArray());this.container.dataset.cameraPadding=JSON.stringify(this.map.getPadding());this.container.dataset.selectedPlace=this.state.placeId||'';this.container.dataset.manualCamera=String(this.manual);this.container.dataset.l7Layers=this.scene.getLayers().map(l=>l.name).join(',');this.container.dataset.cameraMemory=JSON.stringify({exploration:this.exploration,nationalReading:this.nationalReading,local:this.localCamera});this.container.dataset.fixture=String(this.points.some(p=>p.test));this.container.dispatchEvent(new Event('map-annotations'));}
 diagnostics(){return {loaded:this.loaded,localReady:this.localReady,view:this.state,camera:this.getCamera(),layers:this.scene.getLayers().map(l=>l.name),points:this.points.map(p=>({id:p.id,source:p.coordinates,render:wgsToGcj(p.coordinates),screen:this.map.project(wgsToGcj(p.coordinates))})),memory:{exploration:this.exploration,nationalReading:this.nationalReading,local:this.localCamera}};}
 dispose(){this.destroy();}
 destroy(){if(this.disposed)return;this.disposed=true;this.revision++;this.intent.cancel();clearTimeout(this.timer);clearTimeout(this.refreshTimer);this.observer.disconnect();this.closeList(false);this.container.closest('.app')?.removeEventListener('reader-settled',this.settled);window.removeEventListener('keydown',this.escape,true);const owned=this.map.getContainer();owned.removeEventListener('pointerdown',this.onInput,true);owned.removeEventListener('wheel',this.onInput,true);for(const m of [...this.markers.values(),...this.dormantMarkers.values(),...this.provinces,...this.localLabels])m.remove();this.scene.destroy();}
}
export type LocalGeodata=FeatureCollection;

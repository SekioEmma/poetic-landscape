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
export type ViewState={placeId:string|null;local:boolean;expanded:boolean;reduced?:boolean;layout?:ReaderLayout;space?:ReadingSpace;resultIds?:string[];searchIds?:string[]};
export type GeoCamera={center:[number,number];zoom:number;bearing:0;pitch:0};
const url=(p:string)=>import.meta.env.BASE_URL+p;
const empty=():FeatureCollection=>({type:'FeatureCollection',features:[]});
const zero={top:0,right:0,bottom:0,left:0};
const localLayers=['lake-water','lake-islands','lake-shore-soft','lake-shore','causeways-paper','causeways'];
const nationalLayers=['national-fill','province-lines','national-outline','cluster-index'];
type Annotation={key:string;point:[number,number];members:NationalPoint[];selected:boolean;count:number};
export class MapAdapter{
 readonly map:ml.Map;readonly scene:Scene;
 private state:ViewState={placeId:null,local:false,expanded:false};
 private disposed=false;private loaded=false;private localReady=false;private localLoading?:Promise<void>;
 private points:NationalPoint[];private markers=new Map<string,ml.Marker>();private provinces:ml.Marker[]=[];private localLabels:ml.Marker[]=[];
 private l7?:{setData:(data:unknown)=>unknown};private timer:ReturnType<typeof setTimeout>;private refreshTimer?:ReturnType<typeof setTimeout>;private observer:ResizeObserver;private revision=0;private annotationRevision=0;
 private z0=2;private level:MapLevel='national';private phone=false;private manual=false;private sourceKey='';
 private exploration:GeoCamera|null=null;private nationalReading:GeoCamera|null=null;private localCamera:GeoCamera|null=null;
 private list:HTMLDivElement|null=null;private listTrigger:HTMLElement|null=null;private trace:object[]=[];private focusedKey='';
 private remeasure=false;
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
  this.map.on('movestart',()=>{container.dataset.renderState='moving';this.closeList(false);for(const m of this.provinces)m.getElement().style.display='none';});
  this.map.on('move',()=>this.addTrace('moving'));
  this.map.on('zoom',()=>this.syncPanBounds());
  this.map.on('dragend',()=>{this.addTrace('native-drag-end');this.write();});
  this.map.on('moveend',e=>{if(!this.disposed){const id=(e as typeof e&{cameraIntent?:number}).cameraIntent;if(typeof id==='number')this.intent.finish(id);container.dataset.renderState='idle';this.addTrace('idle');this.refresh();this.write();}});
  this.map.on('sourcedata',e=>{if(e.sourceId==='culture-index'&&e.isSourceLoaded)this.refresh();});
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
  const rev=++this.revision,inputRev=this.inputRevision;this.closeList(false);
  if(!old.placeId&&state.placeId&&!initial){this.exploration=this.getCamera();this.manual=false;}
  if(old.local&&!state.local)this.localCamera=this.getCamera();
  if(old.placeId!==state.placeId&&state.placeId)this.localCamera=null;
  const apply=()=>{if(this.disposed||rev!==this.revision)return;const local=state.local&&this.localReady;
   this.map.setMinZoom(local?explorationScale.localMin:Math.max(.5,this.z0-explorationScale.nationalRetreat));this.map.setMaxZoom(local?explorationScale.localMax:explorationScale.nationalMax);this.syncPanBounds();for(const id of nationalLayers)this.map.setLayoutProperty(id,'visibility',local?'none':'visible');
   if(this.localReady)for(const id of localLayers)this.map.setLayoutProperty(id,'visibility',local?'visible':'none');
   for(const m of this.localLabels)m.getElement().style.display=local?'':'none';
   const key=JSON.stringify([state.resultIds,state.placeId,local]);if(key!==this.sourceKey){this.sourceKey=key;const result=this.points.filter(p=>(!state.resultIds||state.resultIds.includes(p.id)||p.test)&&p.id!==state.placeId).sort((a,b)=>a.id.localeCompare(b.id));(this.map.getSource('culture-index') as ml.GeoJSONSource).setData({type:'FeatureCollection',features:(local?[]:result).map(p=>({type:'Feature',id:p.id,properties:{placeId:p.id},geometry:{type:'Point',coordinates:wgsToGcj(p.coordinates)}}))});}
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
 fitCluster(members:NationalPoint[]){const c=members.map(p=>wgsToGcj(p.coordinates)),xs=c.map(p=>p[0]),ys=c.map(p=>p[1]);this.fit([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],this.map.getMaxZoom(),this.duration(),'cluster');}
 setSafeArea(){if(!this.loaded||this.manual||this.intent.active||!this.state.placeId||this.disposed)return;const p=this.points.find(p=>p.id===this.state.placeId);if(!p)return;const a=mapReadingArea(this.container);if(a.width<160||a.height<130)return;const pt=this.map.project(wgsToGcj(p.coordinates)),x=Math.max(a.left+84,Math.min(pt.x,a.left+a.width-84)),y=Math.max(a.top+38,Math.min(pt.y,a.top+a.height-44));if(Math.abs(pt.x-x)>1||Math.abs(pt.y-y)>1){this.stop();const id=this.intent.begin('safe-area');this.map.panBy([pt.x-x,pt.y-y],{duration:0},{cameraIntent:id});this.intent.finish(id);this.addTrace('safe-correction');}}
 stop(){this.intent.cancel();this.map.stop();}
 private syncPanBounds(zoom=this.map.getZoom()){if(!this.loaded)return;const local=this.state.local&&this.localReady;const bounds=local?placeDetails.find(d=>d.placeId===this.state.placeId)?.local?.bounds.map(c=>wgsToGcj(c)) as [[number,number],[number,number]]|undefined:undefined;this.map.setMaxBounds(panBounds(zoom,this.container.clientWidth,this.container.clientHeight,bounds));}
 private measureNational(){if(this.state.local)return;this.map.setMaxBounds(null);this.map.setMinZoom(.5);const c=this.camera(nationalBasemap.bounds,5);this.remeasure=c?.zoom===undefined;if(c?.zoom!==undefined){this.z0=c.zoom;const min=Math.max(.5,this.z0-explorationScale.nationalRetreat);this.map.setMinZoom(this.manual?Math.min(min,this.map.getZoom()):min);}}
 resize(){this.map.resize();if(this.loaded){this.measureNational();this.syncPanBounds();}const phone=innerWidth<600;if(phone!==this.phone&&this.loaded){this.phone=phone;void (this.map.getSource('culture-index') as ml.GeoJSONSource).setClusterOptions({cluster:true,clusterRadius:phone?clusterRadii.phone:clusterRadii.desktop,clusterMaxZoom:explorationScale.clusterMax}).then(()=>this.refresh());}this.setSafeArea();this.refresh();}
 zoom(delta:number){const target=Math.max(this.map.getMinZoom(),Math.min(this.map.getMaxZoom(),(this.intent.zoomTarget??this.map.getZoom())+delta));const a=mapReadingArea(this.container),around=this.map.unproject([a.left+a.width/2,a.top+a.height/2]);this.manual=true;this.stop();this.syncPanBounds(target);const id=this.intent.begin('button',target);this.map.easeTo({zoom:target,around,duration:this.duration()?200:0},{cameraIntent:id});this.addTrace('zoom-button');this.write();}
 locate(){this.manual=false;if(this.state.local)this.fitLocal();else this.fitNational();}
 private refresh(){clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>{void this.annotations();},40);}
 private async annotations(){
  if(!this.loaded||this.disposed||this.map.isMoving())return;const rev=++this.annotationRevision,stateRev=this.revision,src=this.map.getSource('culture-index') as ml.GeoJSONSource;
  this.level=relativeLevel(this.map.getZoom()-this.z0,this.level);const nodes:Annotation[]=[],seen=new Set<string>();
  if(!this.state.local)for(const f of this.map.querySourceFeatures('culture-index')){
   const cluster=!!f.properties.cluster,key=cluster?'c-'+f.properties.cluster_id:'p-'+f.properties.placeId;if(seen.has(key)||f.geometry.type!=='Point')continue;seen.add(key);
   const coords=f.geometry.coordinates as [number,number],pos=this.map.project(coords);if(pos.x<0||pos.y<0||pos.x>this.container.clientWidth||pos.y>this.container.clientHeight)continue;
   try{const leaves=cluster?await src.getClusterLeaves(f.properties.cluster_id,100,0):[f];if(rev!==this.annotationRevision||stateRev!==this.revision||this.disposed)return;const ids=leaves.map(f=>f.properties?.placeId),members=this.points.filter(p=>ids.includes(p.id));if(members.length)nodes.push({key,point:cluster?coords:wgsToGcj(members[0].coordinates),members,selected:false,count:members.length});}catch{/* worker source changed; next sourcedata rebuilds */}
  }
  const current=this.points.find(p=>p.id===this.state.placeId);if(current)nodes.unshift({key:'selected-'+current.id,point:wgsToGcj(current.coordinates),members:[current],selected:true,count:1});
  const ordered=nodes.sort((a,b)=>Number(b.selected)-Number(a.selected)||Number(b.key===this.focusedKey)-Number(a.key===this.focusedKey)||Number(b.members.some(p=>this.state.searchIds?.includes(p.id)))-Number(a.members.some(p=>this.state.searchIds?.includes(p.id)))||Math.max(...b.members.map(p=>p.importance))-Math.max(...a.members.map(p=>p.importance))||a.members.map(p=>p.id).sort().join(',').localeCompare(b.members.map(p=>p.id).sort().join(',')));
  this.l7?.setData({type:'FeatureCollection',features:ordered.map(n=>({type:'Feature',properties:{selected:Number(n.selected)},geometry:{type:'Point',coordinates:n.point}}))});
  const keep=new Set(ordered.map(n=>n.key));for(const [key,m] of this.markers)if(!keep.has(key)){m.remove();this.markers.delete(key);}
  const safe=mapReadingArea(this.container),budget=labelBudget(this.level,this.phone),occupied:{left:number;top:number;right:number;bottom:number}[]=[];
  const tools=this.container.parentElement?.querySelector('.map-toolset')?.getBoundingClientRect(),b=this.container.getBoundingClientRect();if(tools)occupied.push({left:tools.left-b.left-8,top:tools.top-b.top-8,right:tools.right-b.left+8,bottom:tools.bottom-b.top+8});
  const visualPoints=new Map<string,{x:number;y:number;ox:number;oy:number}>();
  for(const n of ordered){const p=this.map.project(n.point);let ox=0,oy=0;const previous=[...visualPoints.values()];if(!n.selected&&previous.some(v=>Math.hypot(p.x-v.x,p.y-v.y)<44)){for(const [x,y] of [[44,0],[-44,0],[0,44],[0,-44]]){if(p.x+x<safe.left+22||p.x+x>safe.left+safe.width-22||p.y+y<safe.top+22||p.y+y>safe.top+safe.height-22||previous.some(v=>Math.hypot(p.x+x-v.x,p.y+y-v.y)<44))continue;ox=x;oy=y;break;}}const v={x:p.x+ox,y:p.y+oy,ox,oy};visualPoints.set(n.key,v);occupied.push({left:v.x-11,right:v.x+11,top:v.y-11,bottom:v.y+11});}
  let shown=0;const evidence=[];
  for(const n of ordered){
   let marker=this.markers.get(n.key);if(!marker){const el=document.createElement('button');el.className='geo-entry';el.dataset.annotationKey=n.key;marker=new ml.Marker({element:el,anchor:'center'}).setLngLat(n.point).addTo(this.map);this.markers.set(n.key,marker);}marker.setLngLat(n.point);
   const visual=visualPoints.get(n.key)!;marker.setOffset([visual.ox,visual.oy]);const el=marker.getElement(),p=n.members[0],name=n.count>1?clusterName(n.members):p.name;el.classList.toggle('selected',n.selected);el.classList.toggle('clustered',n.count>1);el.dataset.placeId=n.count===1?p.id:'';el.dataset.memberIds=n.members.map(p=>p.id).sort().join(',');el.dataset.count=String(n.count);el.setAttribute('aria-label',n.count>1?'地图分组：'+name:'地图地点：'+p.name);el.setAttribute('aria-pressed',String(n.selected));el.setAttribute('aria-description',n.selected&&!this.state.resultIds?.includes(p.id)?'当前阅读，不在筛选结果':'');
   el.innerHTML='<span class="geo-symbol">'+(n.count>1?'<span class="geo-count">'+n.count+'</span>':iconMarkup(p.iconId))+'</span><span class="geo-title"></span>';const title=el.querySelector<HTMLElement>('.geo-title')!;title.textContent=name;
   el.onclick=()=>{this.stop();if(n.count>1){const extent=n.members.map(p=>this.map.project(wgsToGcj(p.coordinates))),dx=Math.max(...extent.map(p=>p.x))-Math.min(...extent.map(p=>p.x)),dy=Math.max(...extent.map(p=>p.y))-Math.min(...extent.map(p=>p.y));const near=Math.max(dx,dy)<18,atMax=this.map.getZoom()>=this.map.getMaxZoom()-.3;if(atMax)this.openList(n,el);else{this.manual=false;const revision=this.revision;this.fitCluster(n.members);const intent=this.intent.id;if(near){if(!this.duration())this.openList(n,el);else this.map.once('moveend',()=>{if(!this.disposed&&!this.manual&&revision===this.revision&&this.intent.owns(intent))this.openList(n,el);});}}}else this.select(p.id);};
   const pt=visual,width=Math.min(280,Math.max(52,safe.width-8),Math.max(52,title.scrollWidth+12)),height=30;let chosen:{left:number;top:number;right:number;bottom:number}|undefined,dx=0,dy=0;
   if(shown<budget||n.selected)for(const [x,y] of [[19,0],[-width-19,0],[-width/2,-37],[-width/2,37],[19,-28],[-width-19,28]]){const r={left:pt.x+x,top:pt.y+y-height/2,right:pt.x+x+width,bottom:pt.y+y+height/2};if(r.left<safe.left||r.top<safe.top||r.right>safe.left+safe.width||r.bottom>safe.top+safe.height||occupied.some(o=>r.left<o.right+6&&r.right>o.left-6&&r.top<o.bottom+6&&r.bottom>o.top-6))continue;chosen=r;dx=x;dy=y;break;}
   title.style.visibility=chosen?'visible':'hidden';title.style.left=(22+dx)+'px';title.style.top=(22+dy-height/2)+'px';title.style.width=width+'px';el.onfocus=()=>{if(this.focusedKey!==n.key){this.focusedKey=n.key;this.refresh();}};el.onblur=()=>{this.focusedKey='';this.refresh();};if(chosen){occupied.push(chosen);shown++;const endX=dy!==0&&Math.abs(dx+width/2)<1?0:dx<0?-19:19;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','geo-leader');svg.setAttribute('aria-hidden','true');svg.innerHTML='<line x1="22" y1="22" x2="'+(22+endX)+'" y2="'+(22+dy)+'"/>';el.prepend(svg);}
   if(visual.ox||visual.oy){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','geo-leader geo-anchor-leader');svg.setAttribute('aria-hidden','true');svg.innerHTML='<line x1="22" y1="22" x2="'+(22-visual.ox)+'" y2="'+(22-visual.oy)+'"/>';el.prepend(svg);}
   const actual=this.map.project(n.point);evidence.push({key:n.key,ids:n.members.map(p=>p.id),selected:n.selected,anchor:{x:actual.x,y:actual.y},visual:{x:pt.x,y:pt.y},offset:[visual.ox,visual.oy],label:chosen||null,leader:Math.max(Math.hypot(visual.ox,visual.oy),chosen?Math.abs(dy)||19:0),count:n.count});
  }
  let provincialCount=0;const cx=safe.left+safe.width/2,cy=safe.top+safe.height/2;const ranked=[...this.provinces].sort((a,b)=>{const p=this.map.project(a.getLngLat()),q=this.map.project(b.getLngLat());return Math.hypot(p.x-cx,p.y-cy)-Math.hypot(q.x-cx,q.y-cy)||(a.getElement().textContent??'').localeCompare(b.getElement().textContent??'');});for(const m of ranked){const pt=this.map.project(m.getLngLat()),visible=!this.state.local&&provincialCount<(this.phone?3:6)&&pt.x>safe.left+35&&pt.x<safe.left+safe.width-35&&pt.y>safe.top+20&&pt.y<safe.top+safe.height-20&&!occupied.some(r=>pt.x>r.left-30&&pt.x<r.right+30&&pt.y>r.top-18&&pt.y<r.bottom+18);m.getElement().style.display=visible?'':'none';if(visible){provincialCount++;occupied.push({left:pt.x-35,right:pt.x+35,top:pt.y-10,bottom:pt.y+10});}}
  this.container.dataset.annotations=JSON.stringify(evidence);this.container.dataset.labelCount=String(shown);this.container.dataset.level=this.level;this.container.dataset.z0=String(this.z0);this.write();
 }
 private openList(n:Annotation,trigger:HTMLElement){
  this.closeList(false);this.listTrigger=trigger;const el=document.createElement('div');el.className='nearby-list';el.setAttribute('role','dialog');el.setAttribute('aria-label','邻近地点');
  const heading=document.createElement('strong');heading.textContent=clusterName(n.members);el.appendChild(heading);const close=document.createElement('button');close.textContent='关闭';close.setAttribute('aria-label','关闭邻近地点');close.onclick=()=>this.closeList();el.appendChild(close);
  for(const p of sortPoints(n.members,this.state.placeId)){const b=document.createElement('button');b.textContent=p.name+'　'+p.works+'篇';const meta=document.createElement('small');meta.textContent=p.region;b.appendChild(meta);b.setAttribute('aria-pressed',String(p.id===this.state.placeId));b.onclick=()=>{this.closeList(false);this.select(p.id);};el.appendChild(b);}
  el.onkeydown=e=>{if(e.key==='Tab'){const buttons=[...el.querySelectorAll('button')],i=buttons.indexOf(document.activeElement as HTMLButtonElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}};
  const a=mapReadingArea(this.container),pt=this.map.project(n.point);el.style.left=Math.max(a.left+4,Math.min(pt.x-100,a.left+a.width-292))+'px';el.style.top=Math.max(a.top+4,Math.min(pt.y+22,a.top+a.height-230))+'px';this.container.appendChild(el);this.list=el;close.focus();
 }
 private closeList(focus=true){if(!this.list)return;this.list.remove();this.list=null;if(focus){if(this.listTrigger?.isConnected)this.listTrigger.focus();else this.markers.values().next().value?.getElement().focus();}}
 private addTrace(event:string){if(!new URLSearchParams(location.search).has('mapTrace'))return;this.trace.push({t:performance.now(),event,selected:this.state.placeId,intent:this.intent.id,active:this.intent.active,target:this.intent.zoomTarget,z0:this.z0,area:mapReadingArea(this.container),viewport:[this.container.clientWidth,this.container.clientHeight],...this.getCamera()});if(this.trace.length>480)this.trace.shift();this.container.dataset.cameraTrace=JSON.stringify(this.trace);}
 private write(){if(!this.loaded||this.disposed)return;this.container.dataset.mapView=this.state.local&&this.localReady?'local':'national';this.container.dataset.safeArea=JSON.stringify(mapReadingArea(this.container));this.container.dataset.camera=JSON.stringify(this.getCamera());this.container.dataset.zoomLimits=JSON.stringify({min:this.map.getMinZoom(),max:this.map.getMaxZoom(),target:this.intent.zoomTarget??this.map.getZoom()});this.container.dataset.cameraBounds=JSON.stringify(this.map.getBounds().toArray());this.container.dataset.cameraPadding=JSON.stringify(this.map.getPadding());this.container.dataset.selectedPlace=this.state.placeId||'';this.container.dataset.manualCamera=String(this.manual);this.container.dataset.l7Layers=this.scene.getLayers().map(l=>l.name).join(',');this.container.dataset.cameraMemory=JSON.stringify({exploration:this.exploration,nationalReading:this.nationalReading,local:this.localCamera});this.container.dataset.fixture=String(this.points.some(p=>p.test));this.container.dispatchEvent(new Event('map-annotations'));}
 diagnostics(){return {loaded:this.loaded,localReady:this.localReady,view:this.state,camera:this.getCamera(),layers:this.scene.getLayers().map(l=>l.name),points:this.points.map(p=>({id:p.id,source:p.coordinates,render:wgsToGcj(p.coordinates),screen:this.map.project(wgsToGcj(p.coordinates))})),memory:{exploration:this.exploration,nationalReading:this.nationalReading,local:this.localCamera}};}
 dispose(){this.destroy();}
 destroy(){if(this.disposed)return;this.disposed=true;this.revision++;this.intent.cancel();clearTimeout(this.timer);clearTimeout(this.refreshTimer);this.observer.disconnect();this.closeList(false);this.container.closest('.app')?.removeEventListener('reader-settled',this.settled);window.removeEventListener('keydown',this.escape,true);const owned=this.map.getContainer();owned.removeEventListener('pointerdown',this.onInput,true);owned.removeEventListener('wheel',this.onInput,true);for(const m of [...this.markers.values(),...this.provinces,...this.localLabels])m.remove();this.scene.destroy();}
}
export type LocalGeodata=FeatureCollection;

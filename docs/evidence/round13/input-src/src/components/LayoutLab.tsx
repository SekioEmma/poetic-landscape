import {useState} from 'react';
import {OverviewViewport} from './OverviewViewport';
import {places} from '../data/content';
import {imageAnchors} from '../data/basemap';
import fixture from '../../docs/planning/layout-fixture-round6.json';
import scope from '../../docs/planning/release-scope-v1.json';
import type {Place} from '../data/catalog';
const planned:Place[]=fixture.items.map(p=>({id:p.id,name:p.name,region:p.region,coordinates:p.coordinates as [number,number],coordinateSystem:'WGS84',coordinateSource:p.coordinateSource,precision:p.modernObject,aliases:[],description:'规划布局，不提供未发布作品',themes:[]}));
const catalog=scope.places.map(p=>[...places,...planned].find(q=>q.id===p.id)!);
const anchors=[...imageAnchors,...fixture.items.map(p=>({placeId:p.id,city:p.region.split('·').at(-1)!,x:p.x,y:p.y,number:'规划',inspection:p.imageReference}))];
const results=catalog.map(place=>({place,matchedWorkIds:[]}));
export default function LayoutLab(){const [selected,setSelected]=useState<string|null>(null);return <main className="app official-mode layout-lab" data-layout-count={catalog.length}><OverviewViewport selected={selected} workId="" expanded={false} local={false} reduced={false} results={results} onSelect={setSelected} onRead={()=>setSelected(null)} layoutData={{places:catalog,anchors}}/><header className="site-header"><strong>规划布局 · 12处压力检查</strong><a href="./">返回正式六处页面</a></header><aside className="layout-summary"><strong>{catalog.find(p=>p.id===selected)?.name??'选择地点检查标签与分组'}</strong><p>仅城市区域图片参照；不是新内容发布或古址配准。</p><button onClick={()=>setSelected(null)}>退出选择</button></aside></main>;}

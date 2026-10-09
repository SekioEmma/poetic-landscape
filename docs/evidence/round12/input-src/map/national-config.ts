export const nationalBasemap={
 id:'geoatlas-learning-v1',title:'全国地理学习样板',source:'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
 provinces:'geodata/national-geoatlas.json',outline:'geodata/national-outline-geoatlas.json',
 sourceCoordinates:'GCJ-02 (adopted from DataV documentation; response has no CRS field)',renderCoordinates:'GCJ-02 / Web Mercator',
 attribution:'GeoAtlas / 高德 · 学习样板',publication:'仅学习交流；正式发布许可待补',
 // Geometry-derived bounds include every island and the special 100000_JD feature.
 bounds:[[73,3],[136,54]] as [[number,number],[number,number]],
};
export type NationalPoint={id:string;name:string;region:string;coordinates:[number,number];iconId:string;works:number;importance:number;test?:boolean};
export type MapLevel='national'|'regional'|'city';
export function relativeLevel(d:number,old:MapLevel):MapLevel{
 if(old==='national')return d>2.62?'city':d>1.12?'regional':'national';
 if(old==='city')return d<.88?'national':d<2.38?'regional':'city';
 return d<.88?'national':d>2.62?'city':'regional';
}
export function labelBudget(level:MapLevel,phone:boolean){return (phone?{national:4,regional:6,city:8}:{national:8,regional:12,city:16})[level];}
export function clusterName(points:NationalPoint[]){const cities=new Set(points.map(p=>p.region.split(' · ')[1])),provinces=new Set(points.map(p=>p.region.split(' · ')[0]));return cities.size===1?`${[...cities][0]}·${points.length}处`:provinces.size===1?`${[...provinces][0]}·${points.length}处`:`${points.length}处地点`;}
export function sortPoints(points:NationalPoint[],selected:string|null,searchIds:string[]=[]){return [...points].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected)||Number(searchIds.includes(b.id))-Number(searchIds.includes(a.id))||b.importance-a.importance||a.id.localeCompare(b.id));}
export function stressPoints(count:12|40):NationalPoint[]{
 const seeds:[[number,number],string][]=[[[120.1396631,30.2485869],'杭州'],[[120.1384499,30.24597875],'杭州'],[[114.296944,30.546944],'武汉'],[[104.026331,30.662169],'成都'],[[93.84,40.36],'西北'],[[94.05,39.92],'西北'],[[86.21,40.49],'西北'],[[119.75,39.99],'北方'],[[126.64,45.75],'东北'],[[121.46,31.22],'东部'],[[113.27,23.13],'南部'],[[91.11,29.65],'西部']];
 return Array.from({length:count},(_,i)=>{const [c,city]=seeds[i%seeds.length];const ring=Math.floor(i/seeds.length);return {id:`test-${String(i).padStart(2,'0')}`,name:`测试${i+1}${i%7===0?'·近邻长地名边缘题注':''}`,region:`测试区域 · ${city}`,coordinates: i===13?[...seeds[0][0]]:[c[0]+(ring?ring*.016:0),c[1]+(ring?ring*.012:0)],iconId:['huxin','huanghe','dufu','xihu','hanshan','guazhou'][i%6],works:1+i%3,importance:i%4,test:true};});
}

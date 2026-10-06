import type {Place,Work,Relation,SearchResult,Theme} from './catalog';
export const themes:Theme[]=['楼台与城郭','江湖与行旅','山川与隐逸','关山与家国'];
const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,'');
// Both map entries and directory consume this one result set. No UI-specific matching.
export function explore(places:Place[],works:Work[],relations:Relation[],query:string,theme:Theme|'全部'):SearchResult[]{
 const q=normalize(query);
 return places.flatMap(place=>{
  if(theme!=='全部'&&!place.themes.includes(theme))return [];
  const linked=relations.filter(r=>r.placeId===place.id).map(r=>works.find(w=>w.id===r.workId)!);
  const matchedWorkIds=q?linked.filter(w=>normalize(w.title+' '+w.author).includes(q)).map(w=>w.id):[];
  const matchPlace=normalize([place.name,place.region,...place.aliases].join(' ')).includes(q);
  return !q||matchPlace||matchedWorkIds.length?[{place,matchedWorkIds}]:[];
 });
}
export function preferredWork(result:SearchResult,relations:Relation[]){return result.matchedWorkIds[0]??relations.find(r=>r.placeId===result.place.id)?.workId;}

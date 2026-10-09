/** Screen-only text layout. Geography and hit targets never move to fit a name. */
export type Rect={left:number;top:number;right:number;bottom:number};
export type Anchor={x:number;y:number};
export type LabelInput={key:string;anchor:Anchor;width:number;priority:number;required:boolean};
export const memberKey=(ids:string[])=>[...new Set(ids)].sort().join('|');
export function uniqueGroups<T extends {id:string},N extends {key:string;members:T[];count:number}>(nodes:N[]){
 const claimed=new Set<string>();return [...nodes].sort((a,b)=>a.count-b.count||a.key.localeCompare(b.key)).flatMap(node=>{const members=node.members.filter(p=>!claimed.has(p.id));members.forEach(p=>claimed.add(p.id));return members.length?[{node,members,unchanged:members.length===node.members.length}]:[];});
}
export const overlaps=(a:Rect,b:Rect,gap=0)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
export const contains=(safe:Rect,r:Rect)=>r.left>=safe.left&&r.right<=safe.right&&r.top>=safe.top&&r.bottom<=safe.bottom;
export function candidates(p:Anchor,width:number):Rect[]{
 return [[19,0],[-width-19,0],[-width/2,-37],[-width/2,37],[19,-28],[-width-19,28]].map(([x,y])=>({left:p.x+x,top:p.y+y-15,right:p.x+x+width,bottom:p.y+y+15}));
}
export function layoutLabels(inputs:LabelInput[],safe:Rect,obstacles:Rect[],budget:number,memory:Map<string,number>){
 const occupied=[...obstacles],result=new Map<string,{candidate:number|null;rect:Rect|null;reused:boolean}>();let shown=0;
 for(const p of [...inputs].sort((a,b)=>b.priority-a.priority||a.key.localeCompare(b.key))){
  const boxes=candidates(p.anchor,p.width);
  // A focused edge entry gets a readable name inside the map, without moving its icon.
  if(p.required&&p.anchor.x>=safe.left-22&&p.anchor.x<=safe.right+22&&p.anchor.y>=safe.top-22&&p.anchor.y<=safe.bottom+22){
   const left=Math.max(safe.left,Math.min(p.anchor.x-p.width/2,safe.right-p.width));
   for(const top of [p.anchor.y-52,p.anchor.y+22,p.anchor.y-79,p.anchor.y+49,safe.top,safe.bottom-30,Math.max(safe.top,Math.min(p.anchor.y-15,safe.bottom-30)),...obstacles.flatMap(o=>[o.top-36,o.bottom+6])])boxes.push({left,top,right:left+p.width,bottom:top+30});
  }
  const old=memory.get(p.key),order=[...(old===undefined||old>=boxes.length?[]:[old]),...boxes.map((_,i)=>i).filter(i=>i!==old)];
  const chosen=(p.required||shown<budget)?order.find(i=>contains(safe,boxes[i])&&!occupied.some(r=>overlaps(boxes[i],r,6))):undefined;
  if(chosen!==undefined){memory.set(p.key,chosen);occupied.push(boxes[chosen]);shown++;}
  result.set(p.key,{candidate:chosen??null,rect:chosen===undefined?null:boxes[chosen],reused:chosen!==undefined&&chosen===old});
 }
 return {result,occupied,shown};
}
/** If one centre falls inside another 44px target, offer a shared entry. */
export const nearTarget=(a:Anchor,b:Anchor,distance=24)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))<distance;
export function closeGroups<T extends {point:Anchor}>(nodes:T[],distance=24):T[][]{
 const groups:T[][]=[];
 for(const node of nodes){const touching=groups.filter(g=>g.some(n=>nearTarget(n.point,node.point,distance)));
  const merged=[node,...touching.flat()];for(const g of touching)groups.splice(groups.indexOf(g),1);groups.push(merged);
 }
 return groups;
}
export function progressiveZoom(current:number,expansion:number,fitZoom:number,max:number,near:boolean){
 if(near||current>=max-.3||!Number.isFinite(expansion)||expansion>current+2+.001||fitZoom<expansion-.01||expansion<=current+.01)return null;
 // Half a level gives newly split 44px targets breathing room, within the budget.
 return Math.min(expansion+.5,current+2,max);
}
export function placeList(anchor:Anchor,safe:Rect,width:number,height:number,blocked:Rect[]):Rect{
 const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(v,max));
 let fallback:Rect|undefined;
 for(let h=height;h>=Math.min(height,128);h=Math.max(128,h-32)){
  const positions=[[anchor.x+36,anchor.y-30],[anchor.x-width-36,anchor.y-30],[anchor.x-width/2,anchor.y-h-48],[anchor.x-width/2,anchor.y+48],[safe.left+4,safe.top+4],[safe.right-width-4,safe.top+4],[safe.left+4,safe.bottom-h-4],[safe.right-width-4,safe.bottom-h-4]];
  // The usable band may start below a notice, rather than at a map corner.
  // Try obstacle edges as well as anchor-relative positions before shrinking.
  const xs=[safe.left+4,safe.right-width-4,...blocked.flatMap(o=>[o.left-width-8,o.right+8])];
  const ys=[safe.top+4,safe.bottom-h-4,...blocked.flatMap(o=>[o.top-h-8,o.bottom+8])];
  for(const y of ys)for(const x of xs)positions.push([x,y]);
  for(const [x,y] of positions){const left=clamp(x,safe.left+4,safe.right-width-4),top=clamp(y,safe.top+4,safe.bottom-h-4),r={left,top,right:left+width,bottom:top+h};fallback??=r;if(!blocked.some(o=>overlaps(r,o,4)))return r;}
  if(h<=128)break;
 }
 return fallback!;
}

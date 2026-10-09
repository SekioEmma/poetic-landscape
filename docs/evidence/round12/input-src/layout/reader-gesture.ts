import type {ReadingSpace} from './reader-layout';
const order:ReadingSpace[]=['collapsed','reading','focused'];
// Pointer cancellation and small movements keep the current semantic detent.
export function settleReaderGesture(space:ReadingSpace,dy:number,velocity:number,height:number,heights:number[],cancelled=false):ReadingSpace{
 if(cancelled||Math.abs(dy)<8)return space;
 if(Math.abs(velocity)>.45)return order[Math.max(0,Math.min(2,order.indexOf(space)+(velocity<0?1:-1)))];
 if(Math.abs(dy)<=48)return space;
 const distances=heights.map(h=>Math.abs(h-height));
 return order[distances.indexOf(Math.min(...distances))];
}

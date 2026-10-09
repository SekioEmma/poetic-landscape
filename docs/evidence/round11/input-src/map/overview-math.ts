export type Camera={x:number;y:number;scale:number};
export type Size={width:number;height:number};
export type Point={x:number;y:number};
export const MIN_SCALE=1,MAX_SCALE=7;
export function fittedImage(frame:Size,image:Size){const ratio=Math.min(frame.width/image.width,frame.height/image.height);return {width:image.width*ratio,height:image.height*ratio,left:(frame.width-image.width*ratio)/2,top:(frame.height-image.height*ratio)/2,ratio};}
export function projectAnchor(p:Point,frame:Size,image:Size,camera:Camera){const fit=fittedImage(frame,image);return {x:frame.width/2+camera.scale*(fit.left+p.x*fit.ratio+camera.x-frame.width/2),y:frame.height/2+camera.scale*(fit.top+p.y*fit.ratio+camera.y-frame.height/2)};}
export function focusCamera(p:Point,frame:Size,image:Size,target:Point,scale:number):Camera {const fit=fittedImage(frame,image);return {scale,x:(target.x-frame.width/2)/scale-(fit.left+p.x*fit.ratio-frame.width/2),y:(target.y-frame.height/2)/scale-(fit.top+p.y*fit.ratio-frame.height/2)};}
export function resizedCamera(camera:Camera,old:Size,next:Size){const oldFit=fittedImage(old,{width:5826,height:7249});const fit=fittedImage(next,{width:5826,height:7249});return {...camera,x:camera.x*fit.ratio/oldFit.ratio,y:camera.y*fit.ratio/oldFit.ratio};}
export function collides(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number},gap=5){return Math.abs(a.x-b.x)<(a.width+b.width)/2+gap&&Math.abs(a.y-b.y)<(a.height+b.height)/2+gap;}
export function clusters<T extends Point & {id:string}>(points:T[]){const groups:T[][]=[];for(const p of points){const near=groups.filter(g=>g.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<32));if(!near.length)groups.push([p]);else{const first=near[0];first.push(p);for(const extra of near.slice(1)){first.push(...extra);groups.splice(groups.indexOf(extra),1);}}}return groups;}

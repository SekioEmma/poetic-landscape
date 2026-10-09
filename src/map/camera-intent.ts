export type CameraSource='place'|'cluster'|'national'|'local'|'restore'|'button'|'safe-area';
/** Application-owned motion only. Native handlers keep their own lifecycle. */
export class CameraIntent {
 private serial=0;
 active=false;
 zoomTarget:number|undefined;
 begin(publicSource:CameraSource,target?:number){this.serial++;this.active=true;this.zoomTarget=publicSource==='button'?target:undefined;return this.serial;}
 owns(id:number){return id===this.serial;}
 finish(id:number){if(this.owns(id)){this.active=false;this.zoomTarget=undefined;}}
 cancel(){const wasAutomatic=this.active;this.serial++;this.active=false;this.zoomTarget=undefined;return wasAutomatic;}
 get id(){return this.serial;}
}

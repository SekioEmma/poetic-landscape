// L7 2.29.1 imports the MapLibre 3.x default namespace. MapLibre 6 uses named
// exports. Keep that namespace contract explicitly, without altering node_modules.
import * as maplibregl from 'maplibre-gl/dist/maplibre-gl.mjs';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);
maplibregl.setWorkerCount(2);
export * from 'maplibre-gl/dist/maplibre-gl.mjs';
// L7's paired adapter reads map.transform.width/height (MapLibre 3 contract).
// In the pinned 6.12.0 source it lives on the internal Camera object.
export class Map extends maplibregl.Map {
 get transform(){return this._camera.transform;}
}
export default maplibregl;

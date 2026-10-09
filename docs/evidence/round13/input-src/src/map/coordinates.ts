import type {FeatureCollection} from 'geojson';
// Adapted from wandergis/coordtransform (MIT). Reference and license archived in
// docs/evidence/round11, public/legal/coordtransform-MIT.txt. Approximate public
// conversion, not a survey-grade registration. Source WGS84 files remain intact.
export function wgsToGcj([lng,lat]:readonly number[]):[number,number]{
 if(!(lng>73.66&&lng<135.05&&lat>3.86&&lat<53.55))return [lng,lat];
 const x=lng-105,y=lat-35,pi=Math.PI;
 let dy=-100+2*x+3*y+.2*y*y+.1*x*y+.2*Math.sqrt(Math.abs(x));
 dy+=(20*Math.sin(6*x*pi)+20*Math.sin(2*x*pi))*2/3;
 dy+=(20*Math.sin(y*pi)+40*Math.sin(y/3*pi))*2/3;
 dy+=(160*Math.sin(y/12*pi)+320*Math.sin(y*pi/30))*2/3;
 let dx=300+x+2*y+.1*x*x+.1*x*y+.1*Math.sqrt(Math.abs(x));
 dx+=(20*Math.sin(6*x*pi)+20*Math.sin(2*x*pi))*2/3;
 dx+=(20*Math.sin(x*pi)+40*Math.sin(x/3*pi))*2/3;
 dx+=(150*Math.sin(x/12*pi)+300*Math.sin(x/30*pi))*2/3;
 const rad=lat/180*pi,magic=1-.00669342162296594323*Math.sin(rad)**2,sqrt=Math.sqrt(magic);
 dy=dy*180/((6378245*(1-.00669342162296594323))/(magic*sqrt)*pi);
 dx=dx*180/(6378245/sqrt*Math.cos(rad)*pi);
 return [lng+dx,lat+dy];
}
export function renderGeometry(source:FeatureCollection):FeatureCollection{
 const mapCoordinates=(v:unknown):unknown=>Array.isArray(v)?typeof v[0]==='number'?[...wgsToGcj(v as number[]),...(v as number[]).slice(2)]:v.map(mapCoordinates):v;
 return {...source,features:source.features.map(f=>({...f,geometry:f.geometry.type==='GeometryCollection'?f.geometry:{...f.geometry,coordinates:mapCoordinates(f.geometry.coordinates)}}))} as FeatureCollection;
}

import {useState} from 'react';
import type {PlaceDetail} from '../data/catalog';
const photoPositions=new Map<string,boolean>();
export function PlaceContext({detail,failure,onSource,local,onMap}:{detail:PlaceDetail;failure:string;onSource:()=>void;local:boolean;onMap:()=>void}){
 const [showPhoto,setShowPhoto]=useState(()=>photoPositions.get(detail.placeId)??false);const photo=detail.photo;
 return <article className="place-content"><h3 data-read-anchor="place-title">此地风物</h3><p className="body-copy" data-read-anchor="place-intro">{detail.intro}</p>{detail.difference&&<p className="place-difference">{detail.difference}</p>}
  <h3 data-read-anchor="history-title">文化沿革</h3>{detail.history.map((p,i)=><p className="body-copy" data-read-anchor={`history-${i}`} key={i}>{p}</p>)}
  {detail.local&&<section className="local-entry"><h3 data-read-anchor="local-title">{detail.local.title}</h3><p className="body-copy" data-read-anchor="local-description">{detail.local.description}</p>{failure&&<p className="source-note">局部地图暂不可交互，仍可继续阅读与查看全国图面。</p>}<button className="text-link" onClick={onMap}>{local?'回全国图面':'查看局部地图'} <span aria-hidden="true">→</span></button><div className="geography-key"><span><i className="water-swatch"/> 湖水</span><span><i className="islet-swatch"/> 湖岸与岛屿</span></div><button className="text-link" onClick={onSource}>地图来源</button></section>}
  {photo&&<section data-read-anchor="photo"><button className="photo-toggle" aria-expanded={showPhoto} onClick={()=>{photoPositions.set(detail.placeId,!showPhoto);setShowPhoto(!showPhoto);}}>{showPhoto?'收起真实图景':'展开真实图景'} <span aria-hidden="true">{showPhoto?'−':'＋'}</span></button>{showPhoto&&<figure className="real-photo"><a href={`${import.meta.env.BASE_URL}${photo.file}`} target="_blank" rel="noreferrer" aria-label="查看湖心亭照片原图"><img width={photo.width} height={photo.height} src={`${import.meta.env.BASE_URL}${photo.file}`} alt="真实照片：湖心亭岛上的亭阁与林木，四周为西湖水面"/></a><figcaption><strong>{photo.title}</strong><p>{photo.caption}</p><p>摄影：{photo.author} · {photo.date}</p><a href={photo.source} target="_blank" rel="noreferrer">来源页</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a><p>{photo.changes}</p></figcaption></figure>}</section>}
  <details className="reading-sources" data-read-anchor="place-sources"><summary>地点资料来源</summary>{detail.historySources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}<button className="text-link" onClick={onSource}>位置与资料说明</button></details>
 </article>;
}


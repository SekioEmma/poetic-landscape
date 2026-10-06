import {useState} from 'react';
import type {PlaceDetail} from '../data/catalog';
export function PlaceContext({detail,failure,onSource}:{detail:PlaceDetail;failure:string;onSource:()=>void}){
 const [showPhoto,setShowPhoto]=useState(false);const photo=detail.photo;
 return <><p className="section-label">此地风物</p><p className="body-copy">{detail.intro}</p>{detail.difference&&<p className="place-difference">{detail.difference}</p>}
  {detail.local&&<><p className="section-label">{detail.local.title}</p><p className="body-copy">{failure?'局部地图暂不可交互，仍可继续阅读。':detail.local.description}</p><div className="geography-key"><span><i className="water-swatch"/> 湖水</span><span><i className="islet-swatch"/> 湖岸与岛屿</span></div><button className="text-link" onClick={onSource}>地图来源 ↗</button></>}
  {photo&&<><button className="photo-toggle" aria-expanded={showPhoto} onClick={()=>setShowPhoto(!showPhoto)}>{showPhoto?'收起真实图景':'展开真实图景'} <span aria-hidden="true">{showPhoto?'−':'＋'}</span></button>{showPhoto&&<figure className="real-photo"><a href={`${import.meta.env.BASE_URL}${photo.file}`} target="_blank" rel="noreferrer" aria-label="查看湖心亭照片原图"><img width={photo.width} height={photo.height} src={`${import.meta.env.BASE_URL}${photo.file}`} alt="真实照片：湖心亭岛上的亭阁与林木，四周为西湖水面"/></a><figcaption><strong>{photo.title}</strong><p>{photo.caption}</p><p>摄影：{photo.author} · {photo.date}</p><a href={photo.source} target="_blank" rel="noreferrer">来源页</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a><p>{photo.changes}</p></figcaption></figure>}</>}
 </>;
}
export function PlaceHistory({detail}:{detail:PlaceDetail}){return <><p className="section-label">诗文留在山水间</p>{detail.history.map((p,i)=><p className="body-copy" key={i}>{p}</p>)}<div className="history-sources">{detail.historySources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>)}</div></>;}


import {useState} from 'react';
import type {PoemScene} from '../data/visual';

export function PoemPicture({scene}:{scene:PoemScene}){
 const [failed,setFailed]=useState(false);
 if(failed)return <p className="picture-unavailable" data-read-anchor="painting" role="status">意境图暂未加载，诗文与资料仍可阅读。</p>;
 const unavailable=new URLSearchParams(location.search).has('artFail');
 return <figure className="poem-picture" data-read-anchor="painting">
  <img src={`${import.meta.env.BASE_URL}assets/${unavailable?'test-intentionally-missing-art.png':scene.file}`} alt={scene.alt} width={scene.width} height={scene.height} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
  <figcaption>{scene.caption}<span>AI辅助原创意境 · 非古建复原</span></figcaption>
 </figure>;
}

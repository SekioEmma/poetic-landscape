import type {Relation,Work} from '../data/catalog';
import {readingLayouts} from '../data/reading-layout';
export function WorkReader({work,relation}:{work:Work;relation:Relation}){
 const layout=readingLayouts[work.id];
 return <article className={`original-text ${layout.form}`} aria-label="完整原文" data-work-id={work.id} data-form={layout.form}>{work.paragraphs.map(p=>{
  const h=relation.highlight,at=p.id===h.paragraphId?p.text.indexOf(h.text):-1;
  function fragment(start:number,end:number){const a=Math.max(start,at),b=Math.min(end,at+h.text.length);return at<0||b<=a?p.text.slice(start,end):<>{p.text.slice(start,a)}<mark>{p.text.slice(a,b)}</mark>{p.text.slice(b,end)}</>;}
  const offsets=layout.paragraphs[p.id];
  return <p key={p.id} data-paragraph-id={p.id} data-read-anchor={`paragraph-${p.id}`}>{layout.form==='prose'?fragment(0,p.text.length):offsets.slice(0,-1).map((start,i)=><span className="poem-line" key={start} data-line-start={start} data-read-anchor={`line-${p.id}-${start}`}>{fragment(start,offsets[i+1])}</span>)}</p>;
 })}</article>;
}

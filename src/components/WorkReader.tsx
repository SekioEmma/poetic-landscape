import type {Relation,Work} from '../data/catalog';
export function WorkReader({work,relation,onSource,onPlace}:{work:Work;relation:Relation;onSource:()=>void;onPlace:()=>void}){
 return <div data-work-id={work.id}>
  <div className="work-card"><p className="section-label">关联作品</p><h3>{work.title}</h3><p className="work-meta">{work.author} <span>·</span> {work.era} <span>·</span> {work.collection}</p><blockquote>{relation.highlight.text}</blockquote></div>
  <p className="body-copy interpretation">{work.interpretation}</p>
  <details className="original"><summary>展开完整原文 <span aria-hidden="true">＋</span></summary><div className="original-text">{work.paragraphs.map(p=>{
   const h=relation.highlight;const at=p.id===h.paragraphId?p.text.indexOf(h.text):-1;
   return <p key={p.id} data-paragraph-id={p.id}>{at<0?p.text:<>{p.text.slice(0,at)}<mark>{h.text}</mark>{p.text.slice(at+h.text.length)}</>}</p>;
  })}</div><a href={work.source} target="_blank" rel="noreferrer">底本：{work.sourceTitle} ↗</a><button className="text-link" onClick={onSource}>出处与版本说明 ↗</button></details>
  <button className="text-link" onClick={onPlace}>看看诗文中的此地 <span aria-hidden="true">→</span></button>
 </div>;
}

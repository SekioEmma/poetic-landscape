import type {SearchResult,Theme,Work,Relation} from '../data/catalog';
import {themes,preferredWork} from '../data/exploration';
import {CategoryIcon} from './CategoryIcon';
import {useRef} from 'react';
export function ExplorerDirectory({modal,results,works,relations,query,onQuery,theme,onTheme,availableThemes,selected,onSelect,onClose}:{modal:boolean;results:SearchResult[];works:Work[];relations:Relation[];query:string;onQuery:(q:string)=>void;theme:Theme|'全部';onTheme:(t:Theme|'全部')=>void;availableThemes:Theme[];selected:string|null;onSelect:(id:string,workId?:string)=>void;onClose:()=>void}){
 const panel=useRef<HTMLElement>(null);
 return <aside ref={panel} id="directory" className="directory" role={modal?'dialog':undefined} aria-modal={modal||undefined} aria-label="地点目录" onKeyDown={e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();return;}
  if(!modal||e.key!=='Tab')return;
  const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href],[tabindex="0"]')??[]).filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }}><div className="directory-heading"><span className="eyebrow">寻山河 · 读诗文</span><button aria-label="收起地点目录" onClick={onClose}>×</button></div>
  <label className="search-label" htmlFor="place-search">搜索地点与诗文</label><div className="search-field"><input id="place-search" type="search" value={query} onChange={e=>onQuery(e.target.value)} placeholder="地点、别名、作者或篇名" autoFocus/>{query&&<button aria-label="清空搜索" onClick={()=>onQuery('')}>×</button>}</div>
  <div className="theme-filters" role="group" aria-label="主题筛选">{(['全部',...themes] as const).map(t=><button key={t} aria-pressed={theme===t} disabled={t!=='全部'&&!availableThemes.includes(t)} title={t!=='全部'&&!availableThemes.includes(t)?'本轮尚无此主题地点':undefined} onClick={()=>onTheme(t)}>{t}</button>)}</div>
  <p className="result-count" role="status">{results.length} 处地点{theme!=='全部'?` · ${theme}`:''}</p>
  <div className="directory-results">{results.map(({place:p,matchedWorkIds})=><button key={p.id} className={`directory-item ${selected===p.id?'active':''}`} aria-pressed={selected===p.id} data-place-id={p.id} onClick={()=>onSelect(p.id,preferredWork({place:p,matchedWorkIds},relations))}><CategoryIcon placeId={p.id}/><span><strong>{p.name}</strong><small>{p.region}</small>{matchedWorkIds.length>0&&<small className="search-match">{matchedWorkIds.map(id=>{const w=works.find(w=>w.id===id)!;return `${w.author}《${w.title}》`;}).join('、')}</small>}</span></button>)}</div>
  {results.length===0&&<div className="empty-results"><p>此笺暂无相应地点。</p><button onClick={()=>{onQuery('');onTheme('全部');}}>清空搜索与筛选</button></div>}
  <p className="directory-note">六处山河，八篇诗文。关山与家国主题本轮尚未收录。</p>
 </aside>;
}

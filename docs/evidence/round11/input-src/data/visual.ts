import type {Relation} from './catalog';
// Each excerpt is a literal, continuous substring of its existing relation.
export function shortQuote(relation:Relation){return relation.placeId==='huxin'?'湖心亭一点、与余舟一芥':relation.highlight.text;}
export type PoemScene={file:string;caption:string;alt:string;width:number;height:number};
export const overviewFocus={side:1.45,bottom:1.6};
// Work-specific: seasons belong to a poem, not every work at the same lake.
export const workScenes:Record<string,PoemScene>={
 'huxinting-kanxue':{file:'huxin-snow-r9-v1.png',caption:'雪夜 · 一点亭，一芥舟',alt:'AI辅助原创意境插画：雪后远亭、孤舟人影与疏枝；非湖心亭古建复原',width:1536,height:1024},
 'qiantang-chunxing':{file:'qiantang-spring-r9-v1.png',caption:'春行 · 新柳，早莺，浅草',alt:'AI辅助原创意境插画：新柳、浅草、早莺与低飞春燕；非地理实景或古建复原',width:1536,height:1024},
};

import type {Relation} from './catalog';
// Each excerpt is a literal, continuous substring of its existing relation.
export function shortQuote(relation:Relation){return relation.placeId==='huxin'?'湖心亭一点、与余舟一芥':relation.highlight.text;}
export const scenes:Record<string,{file:string;caption:string;alt:string}>={
 huxin:{file:'lake-painting-v5.png',caption:'一点亭，一芥舟',alt:'AI辅助原创意境插画：冬日远亭、轻舟、疏岸枝叶与留空湖面；非湖心亭古建复原'},
 xihu:{file:'lake-painting-v5.png',caption:'湖光与疏岸',alt:'AI辅助原创意境插画：冬日远亭、轻舟、疏岸枝叶与留空湖面；非古建复原'},
};

// Original symbols: architecture, temple/bridge, garden dwelling, water/ferry.
// Static project paths only; shared by React labels and MapLibre DOM markers.
export const iconKinds:Record<string,string>={huxin:'亭阁',huanghe:'楼台',hanshan:'寺桥',dufu:'园居',xihu:'湖水',guazhou:'渡口',yumen:'关城',yangguan:'关城',loulan:'古城'};
const paths:Record<string,string>={
 yumen:'<path d="M3 21V7H7V5H10V7H14V5H17V7H21V21M3 11H21M9 21V16Q12 12 15 16V21M1 21H23M5 15H7M17 17H19M5 18H7"/>',
 yangguan:'<path d="M2 21H22M6 21L8 7H16L18 21M7 13H17M9 7V4H15V7M10 17H14M3 20L4 17H6M18 17H20L21 20"/>',
 loulan:'<path d="M2 21H22M4 21V12H7V9H11V12H14V17M17 21V10L19 6L21 10V21M4 16H8M10 21V17H13M17 13H21M1 9L4 7M6 5H9"/>',
 huxin:'<path d="M3 12Q8 11 12 5Q16 11 21 12M5 12H19M7 12V20M17 12V20M12 13V20M4 20H20M10 6H14M8 17H16"/>',
 huanghe:'<path d="M3 8Q7 8 12 3Q17 8 21 8M5 8H19M7 8V12M17 8V12M2 15Q8 14 12 10Q16 14 22 15M4 15H20M6 15V21M18 15V21M10 15V21M14 15V21M3 21H21"/>',
 hanshan:'<path d="M2 21H22M3 18Q12 11 21 18M6 17V20M18 17V20M7 13V9M17 13V9M4 9Q8 8 12 3Q16 8 20 9M6 9H18M10 9V13M14 9V13M1 23Q5 21 9 23T17 23"/>',
 dufu:'<path d="M7 12L13 6L20 12M8 12H19V21H8ZM12 21V16H15V21M1 21H22M4 21V5M2 12L4 10L6 12M2 7L4 5L6 7M2 17L4 15L6 17M10 9L15 12M13 7L18 12"/>',
 xihu:'<path d="M2 17Q6 15 10 17T18 17T23 16M2 21Q6 19 10 21T18 21M8 13Q12 8 16 13M10 12V15M14 12V15M5 13L7 10M18 14L20 11M2 6Q4 4 6 6"/>',
 guazhou:'<path d="M3 15Q8 18 19 15L16 19H7ZM11 15V3L18 13H11M3 22Q7 20 11 22T19 22M2 12L5 12M3 10V16"/>',
};
export function iconMarkup(id:string){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]??paths.huxin}</svg>`;}
export function CategoryIcon({placeId}:{placeId:string}){return <span className="category-icon" data-icon-kind={iconKinds[placeId]} aria-hidden="true" dangerouslySetInnerHTML={{__html:iconMarkup(placeId)}}/>;}

export type Theme='楼台与城郭'|'江湖与行旅'|'山川与隐逸'|'关山与家国';
export type Place={id:string;name:string;aliases:string[];region:string;coordinates:[number,number];coordinateSystem:'WGS84';coordinateSource:string;precision:string;description:string;themes:Theme[]};
export type Work={id:string;title:string;author:string;era:string;collection:string;source:string;sourceTitle:string;paragraphs:{id:string;text:string}[];interpretation:string;variant:string};
export type Relation={id:string;placeId:string;workId:string;highlight:{paragraphId:string;text:string}};
export type Photo={file:string;width:number;height:number;title:string;caption:string;author:string;date:string;source:string;license:string;licenseUrl:string;changes:string};
export type PlaceDetail={placeId:string;intro:string;history:string[];historySources:{title:string;url:string}[];difference?:string;local?:{title:string;description:string;bounds:[[number,number],[number,number]]};photo?:Photo};
export type SearchResult={place:Place;matchedWorkIds:string[]};

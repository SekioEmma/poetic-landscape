export const basemap={
 title:'中国地图',variant:'1∶1000万 · 对开 · 界线版 · 无邻国 · 线划一',
 reviewNumber:'GS(2023)2763号',imprint:'自然资源部 监制',
 file:'assets/official-china-gs20232763.jpg',width:5826,height:7249,
 designFile:'assets/china-design-paper-v5a.png',designSha256:'7355331521eaf2dbe00f0c8e62728e4dbf0855e5c0dc0544edfdfa52252e47bc',
 sha256:'97406aba2103ce528d174eba29ec9eac4177a15f6d9ff9fe8b02555a35683e97',
 source:'https://bzdt.tianditu.gov.cn/',
 sourceDetail:'https://bzdt.ch.mnr.gov.cn/browse.html?picId=4o28b0625501ad13015501ad2bfc2188',
 acquisition:'2026-10-05 用户提供本地 JPG 与 EPS；本轮未重新从官网下载原件。图面标题、比例尺、审图号与监制署名已目视核对；实际下载地址和下载时间未提供。',
 changes:'第五轮设计版基于自然资源部标准地图原件制作，以逐像素单调颜色映射把白底协调为素纸、原线色协调为略冷墨色（d^1.08，减轻浅灰粗边）；另存PNG，原JPG与EPS独立保留。没有裁切、删注记、改变边界或岛屿形状，画幅与六处城市参照像素保持。全国由Panzoom负责拖动与缩放，项目实现标签避让、阅读聚焦和探索视野恢复；苏州与扬州各用自己的锚点，屏幕碰撞时临时分组。EPS转SVG未实施，城市注记仍密集，美术受限。成品未送审，原编号仅标识原件，不作为衍生版的新编号。',
};
// Read against the original city-symbol centres in 100% inspection crops.
// These are image-space regional references, never a geographic projection.
export const imageAnchors=[
 {placeId:'huxin',city:'杭州',x:4887,y:3588,number:'01',inspection:'hangzhou.png'},
 {placeId:'huanghe',city:'武汉',x:4227,y:3610,number:'02',inspection:'wuhan.png'},
 {placeId:'dufu',city:'成都',x:3086,y:3657,number:'03',inspection:'chengdu.png'},
 {placeId:'xihu',city:'杭州',x:4887,y:3588,number:'04',inspection:'hangzhou.png'},
 {placeId:'hanshan',city:'苏州',x:4940,y:3440,number:'05',inspection:'jiangnan.png'},
 {placeId:'guazhou',city:'扬州',x:4779,y:3320,number:'06',inspection:'jiangnan.png'},
];

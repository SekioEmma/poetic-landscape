export const basemap={
 title:'中国地图',variant:'1∶1000万 · 对开 · 界线版 · 无邻国 · 线划一',
 reviewNumber:'GS(2023)2763号',imprint:'自然资源部 监制',
 file:'assets/official-china-gs20232763.jpg',width:5826,height:7249,
 sha256:'97406aba2103ce528d174eba29ec9eac4177a15f6d9ff9fe8b02555a35683e97',
 source:'https://bzdt.tianditu.gov.cn/',
 sourceDetail:'https://bzdt.ch.mnr.gov.cn/browse.html?picId=4o28b0625501ad13015501ad2bfc2188',
 acquisition:'2026-10-05 用户提供本地 JPG 与 EPS；本轮未重新从官网下载原件。图面标题、比例尺、审图号与监制署名已目视核对；实际下载地址和下载时间未提供。',
 changes:'JPG 原始字节复制到运行资产，未重编码、裁切、改色、描边、重投影或切片；CSS 等比例缩放。第二轮扩为六地点城市参照入口，杭州二处共用原城市符号，苏州与扬州近邻采用江南短列表；标签引线仅为界面叠加，不移动原图内容。新增八作品阅读、切换、搜索筛选与按需加载的西湖局部。成品未送审，不能沿用原底图编号宣称已获审核。',
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
export const imageGroups=[
 {id:'hangzhou',label:'杭州',placeIds:['huxin','xihu'],anchorPlaceId:'huxin'},
 {id:'huanghe',label:'黄鹤楼',placeIds:['huanghe'],anchorPlaceId:'huanghe'},
 {id:'dufu',label:'杜甫草堂',placeIds:['dufu'],anchorPlaceId:'dufu'},
 {id:'jiangnan',label:'江南',placeIds:['hanshan','guazhou'],anchorPlaceId:'guazhou'},
];

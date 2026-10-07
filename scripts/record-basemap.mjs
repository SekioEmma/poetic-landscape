import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import ts from 'typescript';
const compiled=ts.transpileModule(await fs.readFile('src/data/basemap.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {imageAnchors}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const original='docs/evidence/basemaps/original/';
const files=[];
for(const name of await fs.readdir(original)){
 const buffer=await fs.readFile(original+name);
 files.push({name,path:original+name,bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),role:name.endsWith('.jpg')?'display-source':'archived-only-not-rendered'});
}
const runtime=await fs.readFile('public/assets/official-china-gs20232763.jpg');
const data={
 recorded:'2026-10-06',acquisition:'2026-10-05用户提供本地文件，声明来自自然资源部标准地图系统；第三轮未重新下载。',downloadDate:null,actualDownloadUrl:null,
 officialService:'https://bzdt.tianditu.gov.cn/',detailLinkClue:'https://bzdt.ch.mnr.gov.cn/browse.html?picId=4o28b0625501ad13015501ad2bfc2188',
 printedTitle:'中国地图',catalogueDescriptionProvidedByUser:'中国地图，1∶1000万，对开，界线版、无邻国、线划一',filenameIncludes:'无河流',
 printedScale:'1 : 10 000 000',printedReviewNumber:'GS(2023)2763号',printedImprint:'自然资源部 监制',width:5826,height:7249,
 inspection:'已查看完整JPG及100%城市/图例/署名检查裁片；EPS只核对文件名、大小、哈希和PostScript头，未渲染。未独立取得该具体条目的在线下载回执。',
 files,runtime:{path:'public/assets/official-china-gs20232763.jpg',bytes:runtime.length,sha256:crypto.createHash('sha256').update(runtime).digest('hex'),processing:'字节一致复制，未重编码、裁切、改色、重投影、切片；浏览器等比例显示'},
 imageAnchors:imageAnchors.map(a=>({place:a.placeId,city:a.city,pixel:[a.x,a.y],normalized:[a.x/5826,a.y/7249],inspectionCrop:'inspection/'+a.inspection,crop:a.city==='杭州'?[4600,3350,700,650]:a.city==='武汉'?[4070,3300,700,650]:a.city==='成都'?[2700,3350,800,700]:[4550,3000,950,900]})),
 runtimeRole:'original image viewer; nationwide main uses independent derivative',
 derivative:JSON.parse(await fs.readFile('docs/evidence/round3/derivative.json','utf8')),
 imageGroups:{strategy:'32px screen proximity, dynamic groups with offset labels; Suzhou and Yangzhou retain independent anchors; coincident Hangzhou choices in adjacent list'},
 round3:'原件保持；JPG另制逐像素青墨素纸设计版，单位图面变换；全国Panzoom探索、聚焦、恢复，局部复用L7与MapLibre。EPS转SVG未执行，地图美术受限；详见第三轮台账。',
 anchorMethod:'原图城市符号中心目视读数，约±2原图像素；仅是图片总览城市参照，不是景点像素配准或测绘位置。真实局部坐标来自独立WGS84资料。',
 geometryTreatment:'未取得可靠投影／配准参数，故未把JPG四角投到WGS84，未作全国L7地理底图；图片总览与一个持久L7局部实例切换。Natural Earth在正式页面隐藏，仅map-lab开发验证使用。',
 usage:'官方系统说明标准地图可免费浏览下载，直接使用须标注审图号；此文件未另附开放内容许可证。项目已增加地点、交互及局部数据，成品未送审，公开使用前所需审核程序未确认，不作免审结论。',
 inspectionCropTreatment:'System.Drawing按记录的矩形另存PNG，仅用于检查取点/图面署名；不作为底图或运行资产，原件保持不变。',
 projectReviewStatus:'未送审，未公开部署，未取得本项目审核文件。'
};
await fs.writeFile('docs/evidence/basemaps/manifest.json',JSON.stringify(data,null,2));
console.log('已记录用户提供原件、运行副本哈希与城市像素参照。');

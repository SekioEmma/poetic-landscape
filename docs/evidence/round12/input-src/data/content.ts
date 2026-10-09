import type {Place,Work,Relation,PlaceDetail} from './catalog';
export const places: Place[] = [
 {id:'huxin',name:'湖心亭',aliases:['杭州','西湖湖心亭'],region:'浙江 · 杭州',coordinates:[120.1396631,30.2485869],coordinateSystem:'WGS84',coordinateSource:'https://www.openstreetmap.org/way/30086285',precision:'现代亭阁轮廓中心 · 社区地理参照',description:'在西湖的留白里，读一场雪。',themes:['江湖与行旅','山川与隐逸']},
 {id:'huanghe',name:'黄鹤楼',aliases:['武汉','武昌','蛇山'],region:'湖北 · 武汉',coordinates:[114.296944,30.546944],coordinateSystem:'WGS84',coordinateSource:'https://commons.wikimedia.org/wiki/Institution:Yellow_Crane_Tower',precision:'现代黄鹤楼公开坐标，Wikimedia 结构化数据 CC0',description:'江上烟波，是乡愁，也是送别。',themes:['楼台与城郭','江湖与行旅']},
 {id:'dufu',name:'杜甫草堂',aliases:['成都','浣花溪','草堂'],region:'四川 · 成都',coordinates:[104.026331,30.662169],coordinateSystem:'WGS84',coordinateSource:'https://commons.wikimedia.org/wiki/Category:Du_Fu_Thatched_Cottage',precision:'现代杜甫草堂博物馆区域公开坐标，Wikimedia 结构化数据 CC0',description:'一间茅屋，容得下天下寒士。',themes:['山川与隐逸']},
 {id:'xihu',name:'西湖',aliases:['杭州','钱塘','杭州西湖'],region:'浙江 · 杭州',coordinates:[120.1384499,30.24597875],coordinateSystem:'WGS84',coordinateSource:'https://www.openstreetmap.org/relation/2308774',precision:'已存档 OSM 西湖关系的外包围盒中心；区域展示位置，ODbL 1.0',description:'晴雨各有姿态，春光自有归处。',themes:['江湖与行旅','山川与隐逸']},
 {id:'hanshan',name:'寒山寺与枫桥',aliases:['苏州','姑苏','寒山寺','枫桥','枫桥夜泊'],region:'江苏 · 苏州',coordinates:[120.5642846,31.3125175],coordinateSystem:'WGS84',coordinateSource:'https://www.openstreetmap.org/way/741882129',precision:'Nominatim 返回的现代寒山寺区域中心，2026-10-05 单次查询记录，ODbL 1.0',description:'一声夜半钟，越过水面与千年。',themes:['楼台与城郭','江湖与行旅']},
 {id:'guazhou',name:'瓜洲渡',aliases:['扬州','瓜洲','瓜洲古渡','瓜洲镇','邗江'],region:'江苏 · 扬州',coordinates:[119.3836118,32.2529863],coordinateSystem:'WGS84',coordinateSource:'https://www.openstreetmap.org/relation/14306193',precision:'Nominatim 返回的现代扬州瓜洲镇区域位置，非古渡遗址测点，ODbL 1.0',description:'一水之间，望见江南与故乡。',themes:['江湖与行旅']},
];
const work = {
 id:'huxinting-kanxue', title:'湖心亭看雪',author:'张岱',era:'明末清初',collection:'《陶庵梦忆》',
 source:'https://ycct.swjtu.edu.cn/info/1017/1371.htm', sourceTitle:'西南交通大学 · 中华传统经典普及基地',
 paragraphs:[
 {id:'p1',text:'崇祯五年十二月，余住西湖。大雪三日，湖中人鸟声俱绝。'},
 {id:'p2',text:'是日更定矣，余拏一小舟，拥毳衣炉火，独往湖心亭看雪。雾凇沆砀，天与云、与山、与水，上下一白。湖上影子，惟长堤一痕、湖心亭一点、与余舟一芥、舟中人两三粒而已。'},
 {id:'p3',text:'到亭上，有两人铺毡对坐，一童子烧酒，炉正沸。见余大喜，曰：“湖中焉得更有此人？”拉余同饮。余强饮三大白而别。问其姓氏，是金陵人，客此。'},
 {id:'p4',text:'及下船，舟子喃喃曰：“莫说相公痴，更有痴似相公者。”'}
 ],
 interpretation:'痕、点、芥、粒把长堤、亭、舟、人依次缩小，天地间的空白反而越来越大。人鸟声俱绝的雪夜，先让世界安静下来，再让亭中相遇与舟子的低语留下人的温度。独往并非一直孤独：一杯酒、一句痴，使这场雪有了可以回味的知音。',
 variant:'保留底本的“拏”“惟”及标点；不混用其他通行版本。叙事时间不等同于文章写作时间，具体落笔点未考定。'
};
export const works:Work[]=[work,
 {id:'huanghelou',title:'黄鹤楼',author:'崔颢',era:'唐',collection:'七言律诗',source:'https://jjc.mku.edu.cn/info/1071/1951.htm',sourceTitle:'闽南科技学院 ·《黄鹤楼》',paragraphs:[{id:'p1',text:'昔人已乘黄鹤去，此地空余黄鹤楼。'},{id:'p2',text:'黄鹤一去不复返，白云千载空悠悠。'},{id:'p3',text:'晴川历历汉阳树，芳草萋萋鹦鹉洲。'},{id:'p4',text:'日暮乡关何处是？烟波江上使人愁。'}],interpretation:'前半首从传说写到白云，时间一下子被拉得很长；后半首却落到眼前的树、洲与江上烟波。汉阳树清晰可见，故乡却看不分明。由远古的空悠悠转到日暮的愁，一次登楼便从眺望山川，变成了人在异乡寻找归处。',variant:'采用机构页面所列四联原文及标点；未复制现代赏析。今日楼阁与诗中唐代楼阁的区别见此地介绍。'},
 {id:'song-menghaoran',title:'黄鹤楼送孟浩然之广陵',author:'李白',era:'唐',collection:'七言绝句',source:'https://sxss.ntu.edu.cn/2018/0301/c6266a165797/page.htm',sourceTitle:'南通大学 · 书香师生',paragraphs:[{id:'p1',text:'故人西辞黄鹤楼，烟花三月下扬州。'},{id:'p2',text:'孤帆远影碧空尽，唯见长江天际流。'}],interpretation:'送别开始于楼前，却一直延伸到目光的尽头。三月烟花写出江南春色，孤帆的远去让这片明丽中有了惜别的分量。朋友已经看不见，江水还在向天际流去；诗人没有直接说不舍，而让久久停留的视线替他说完。',variant:'采用南通大学页面所列原文，“唯见”依此底本；不与“惟见”等其他版本拼接。'},
 {id:'maowu',title:'茅屋为秋风所破歌',author:'杜甫',era:'唐',collection:'歌行',source:'https://www.nydi.gov.cn/sitesources/xclz/page_pc/jysj/s/msyy/article16c3563fc85344e8bc2d6bcce609c8c1.html',sourceTitle:'南阳市纪委监委 · 名诗咏言',paragraphs:[{id:'p1',text:'八月秋高风怒号，卷我屋上三重茅。茅飞渡江洒江郊，高者挂罥长林梢，下者飘转沉塘坳。'},{id:'p2',text:'南村群童欺我老无力，忍能对面为盗贼。公然抱茅入竹去，唇焦口燥呼不得，归来倚杖自叹息。'},{id:'p3',text:'俄顷风定云墨色，秋天漠漠向昏黑。布衾多年冷似铁，娇儿恶卧踏里裂。床头屋漏无干处，雨脚如麻未断绝。自经丧乱少睡眠，长夜沾湿何由彻！'},{id:'p4',text:'安得广厦千万间，大庇天下寒士俱欢颜！风雨不动安如山。呜呼！何时眼前突兀见此屋，吾庐独破受冻死亦足！'}],interpretation:'风卷走屋茅，雨又浸透床铺，诗把困顿写得触手可及。到了结尾，愿望却从自己的屋子转向天下寒士：只要更多人有安稳的住处，个人的受冻也可以承担。这间小小茅屋因而承载了一个远比屋檐更宽广的胸怀。',variant:'采用南阳市纪委监委 2019-04-04 页面所列四段原文；“床头”“挂罥”等依底本。人民教育出版社所载分层论文中的引诗作为辅助核对，不复制论文内容。'},
 {id:'yin-hushang',title:'饮湖上初晴后雨二首·其二',author:'苏轼',era:'北宋',collection:'七言绝句',source:'https://www.ahstu.edu.cn/rwxy/info/1039/5500.htm',sourceTitle:'安徽科技工程大学 · 人文与外国语学院',paragraphs:[{id:'p1',text:'水光潋滟晴方好，山色空蒙雨亦奇。'},{id:'p2',text:'欲把西湖比西子，淡妆浓抹总相宜。'}],interpretation:'晴时的水光和雨中的山色，都是西湖的好看。诗人没有在两种天气中选出胜者，而用西子的淡妆与浓抹，让不同姿态相互成全。读这首诗，可以先看湖，再看山；也可以想想，同一片山水如何在光线与雨雾里，显出不同的性情。',variant:'来源页标题简写《饮湖上初晴后雨》，所列四句对应《饮湖上初晴后雨二首》其二；采用底本“空蒙”，不混入“空濛”等异文。'},
 {id:'qiantang-chunxing',title:'钱塘湖春行',author:'白居易',era:'唐',collection:'七言律诗',source:'https://www.pep.com.cn/rjdt/mtbd/202307/t20230718_1984406.shtml',sourceTitle:'人民教育出版社 · 语文课本上的80首唐诗',paragraphs:[{id:'p1',text:'孤山寺北贾亭西，水面初平云脚低。'},{id:'p2',text:'几处早莺争暖树，谁家新燕啄春泥。'},{id:'p3',text:'乱花渐欲迷人眼，浅草才能没马蹄。'},{id:'p4',text:'最爱湖东行不足，绿杨阴里白沙堤。'}],interpretation:'湖水初平、莺燕忙碌、花草渐生，春天并没有一次铺满整个画面，而是在行走中一点点被发现。诗中几处、谁家、渐欲、才能，都保留了早春未盛的分寸。最后的行不足，把沿湖观景写成一种舍不得结束的日常欢喜。',variant:'采用人教社 2023-07-18 页面第56首所列四联原文；“阴”“才”等依底本。来源正文访问偶有超时，本轮依据公开检索正文核读，访问状况在资料记录中说明。'},
 {id:'fengqiao-yebo',title:'枫桥夜泊',author:'张继',era:'唐',collection:'七言绝句',source:'https://ylj.suzhou.gov.cn/szsylj/ylwh/201808/598c909b16f34d498cceb62a03b0b2c4.shtml',sourceTitle:'苏州市园林和绿化管理局',paragraphs:[{id:'p1',text:'月落乌啼霜满天，江枫渔火对愁眠。'},{id:'p2',text:'姑苏城外寒山寺，夜半钟声到客船。'}],interpretation:'月已落，霜满天，船中的人却还没有安睡。江边树影与渔火相对，是眼前的景，也是愁绪停留的地方。后两句让远处的钟声穿过夜色，来到客船；寺与舟因此在听觉里相连，一座城外的寺院也留在了旅人的记忆中。',variant:'采用苏州市园林和绿化管理局 2018-08-07 所列全文；“江枫”“渔火”依底本，不以其他释读改写原句。'},
 {id:'bochuan-guazhou',title:'泊船瓜洲',author:'王安石',era:'北宋',collection:'七言绝句',source:'https://lib.qchm.edu.cn/2019/0514/c1529a44419/page.htm',sourceTitle:'青岛酒店管理职业技术学院图书馆',paragraphs:[{id:'p1',text:'京口瓜洲一水间，钟山只隔数重山。'},{id:'p2',text:'春风又绿江南岸，明月何时照我还？'}],interpretation:'江水和几重山，既标出眼前的距离，也衬出心中想要回去的地方。绿字让春风的到来变得可见，明月却引出尚未实现的归期。山川并不遥远，归乡仍是一句问话；泊舟的片刻，便容纳了季节轮转与人的牵挂。',variant:'采用学院图书馆《【阅读24节气】春分》所列四句（页面发布时间 2019-03-21）；末句问号依底本。不复制同页现代散文。'},
];
export const relations:Relation[]=[
 {id:'huxin-kanxue',placeId:'huxin',workId:work.id,highlight:{paragraphId:'p2',text:'惟长堤一痕、湖心亭一点、与余舟一芥、舟中人两三粒而已。'}},
 {id:'huanghe-cuihao',placeId:'huanghe',workId:'huanghelou',highlight:{paragraphId:'p3',text:'晴川历历汉阳树，芳草萋萋鹦鹉洲。'}},
 {id:'huanghe-libai',placeId:'huanghe',workId:'song-menghaoran',highlight:{paragraphId:'p1',text:'故人西辞黄鹤楼，烟花三月下扬州。'}},
 {id:'dufu-maowu',placeId:'dufu',workId:'maowu',highlight:{paragraphId:'p4',text:'安得广厦千万间，大庇天下寒士俱欢颜！'}},
 {id:'xihu-sushi',placeId:'xihu',workId:'yin-hushang',highlight:{paragraphId:'p1',text:'水光潋滟晴方好，山色空蒙雨亦奇。'}},
 {id:'xihu-baijuyi',placeId:'xihu',workId:'qiantang-chunxing',highlight:{paragraphId:'p4',text:'最爱湖东行不足，绿杨阴里白沙堤。'}},
 {id:'hanshan-zhangji',placeId:'hanshan',workId:'fengqiao-yebo',highlight:{paragraphId:'p2',text:'姑苏城外寒山寺，夜半钟声到客船。'}},
 {id:'guazhou-wanganshi',placeId:'guazhou',workId:'bochuan-guazhou',highlight:{paragraphId:'p1',text:'京口瓜洲一水间，钟山只隔数重山。'}},
];
export const photo={file:'assets/huxin-2017.jpg',width:4032,height:2418,title:'湖心亭岛 · 真实图景',caption:'西湖水面上的湖心亭岛，亭阁与林木环水而立。',author:'Bjoertvedt',date:'2017-07-21',source:'https://commons.wikimedia.org/wiki/File:West_Lake_IMG_8759_huxin_pavillion_island.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'原图打包，等比例显示；未裁切、调色或改写图像。'};
export const placeDetails:PlaceDetail[]=[
 {placeId:'huxin',intro:'湖心亭位于西湖中部的亭岛。隔水望去，亭阁与树木相伴；乘舟靠近，一座小岛便从宽阔湖面上显出轮廓。张岱的雪夜，为这处风物留下了另一种观看方式。',history:['《湖心亭看雪》以崇祯五年十二月的雪夜开篇，舟行、赴亭、饮酒与离去，组成一段短暂而鲜明的相逢。亭不只是湖中的景物，也成为彼此认出同好之人的地方。','西湖的湖泊、堤道、岛屿与亭阁，经过多个世纪的营建，共同构成文化景观。今天在湖上寻亭，既能观察岛屿与湖岸，也能沿着张岱的文字，体会山水中静观与相遇的意味。'],historySources:[{title:'UNESCO · 杭州西湖文化景观',url:'https://whc.unesco.org/en/list/1334/'},{title:'《湖心亭看雪》底本',url:work.source}],local:{title:'西湖局部 · 湖心亭',description:'湖心亭在湖的中部。沿堤道、湖岸与岛屿，看看雪夜乘舟所指向的水上空间。',bounds:[[120.116,30.224],[120.167,30.270]]},photo},
 {placeId:'huanghe',intro:'黄鹤楼在武汉武昌蛇山一带，长江与两岸城景在此相望。崔颢登楼写乡愁，李白借楼前送别写远行；同一处山川，容下两种不同的心绪。',difference:'今日所见黄鹤楼为重建楼阁，承续的是历代登临与题咏的文化。',history:['黄鹤楼的文化记忆，与楼阁本身一样丰厚。崔颢由仙人乘鹤的传说写到日暮乡关，把江上烟波化成乡愁；李白送孟浩然赴扬州，则让孤帆与长江延续朋友远去后的视线。','楼阁在历史中屡经兴废，今天的重建黄鹤楼延续了登临、观江与题咏的传统。读两首诗，可以把楼看作一个观看的起点：一边是可见的江汉景物，一边是人的归心与惜别。'],historySources:[{title:'武汉市政府 · 黄鹤楼重建档案',url:'https://www.wuhan.gov.cn/zjwh/whrw/202608/t20260826_2838750.shtml'},{title:'清华大学求真书院 · 武汉历史游学',url:'https://qzc.tsinghua.edu.cn/info/1017/5894.htm'}]},
 {placeId:'dufu',intro:'杜甫草堂在成都浣花溪畔，是纪念杜甫的博物馆与园林。竹木、溪水和纪念建筑相映，把诗人的生活片段与作品留在一处可以行走、停留的空间里。',history:['杜甫在成都的草堂生活，留下了大量关于日常、山水与世事的诗。秋风破屋时，他先写自身的寒冷与艰难，再把愿望推向天下寒士；茅屋于是成为理解诗人胸怀的一个入口。','草堂后来经历培修与扩建，逐渐形成纪念杜甫的祠堂和园林，今日以博物馆延续诗歌的阅读与传播。来到这里，可以把眼前的纪念空间与诗中的生活相互参照，感受小屋与天下之间的精神联系。'],historySources:[{title:'四川省地方志 · 成都杜甫草堂介绍',url:'https://scdfz.sc.gov.cn/upload/main/contentmanage/article/file/201701161152091833.pdf'},{title:'四川省政府 · 博物馆与草堂教育',url:'https://www.sc.gov.cn/10462/10464/10797/2015/3/25/10330618.shtml'}]},
 {placeId:'xihu',intro:'西湖位于杭州，湖面、群山、堤道与岛屿共同构成景观。晴天水光流动，雨中山色含蓄；从湖边缓步而行，又能看见春鸟、花草与堤上的柳阴。',history:['西湖的文化景观在多个世纪的经营中形成，自然山水与堤岛、亭阁、园林相互成就。文学让这些景物得到新的层次：苏轼写晴雨相宜，白居易写早春行游，张岱则把湖面写成雪后的留白。','这些作品并不只有一种观看角度。登岸、沿堤、乘舟，季节和天气变换，山水也随之显露不同性情。今日西湖仍可以沿着这些文字去读，而湖心亭则是其中适合停下来细看的一个地点。'],historySources:[{title:'UNESCO · 杭州西湖文化景观',url:'https://whc.unesco.org/en/list/1334/'},{title:'《饮湖上初晴后雨》底本',url:works.find(w=>w.id==='yin-hushang')!.source},{title:'《钱塘湖春行》底本',url:works.find(w=>w.id==='qiantang-chunxing')!.source}],local:{title:'西湖局部 · 湖山与堤岸',description:'在整片湖面上观察湖岸、堤道与三座湖中岛屿。西湖与湖心亭可分别选择，沿着诗中视线看晴雨与春行。',bounds:[[120.108,30.217],[120.173,30.276]]}},
 {placeId:'hanshan',intro:'寒山寺与枫桥位于苏州古运河沿线。寺院、桥梁与水路相邻，钟声与客船在张继的诗中相遇，成为江南行旅中流传很久的一幅夜景。',history:['枫桥一带的寺、桥、古镇与运河共同构成地方风物。水陆往来曾使这里成为商贸通行之地；诗中的客船，也让人看见江南旅途里一次短暂的夜泊。','寒山寺历经兴废，钟声与寺内诗刻延续了《枫桥夜泊》的文化记忆。寒山寺与枫桥相邻，各自是寺院与桥梁；读诗时，远处的钟声跨过水面，把两处风物连接在同一个寂静而有声的夜晚。'],historySources:[{title:'苏州市文化广电和旅游局 · 枫桥夜泊',url:'https://www.suzhou.gov.cn/szwgjyhsj/yhsjjbgk/202110/bfed4b0992444f74b1e21c4c67e7dcca.shtml'}]},
 {placeId:'guazhou',intro:'瓜洲在扬州南部、长江与运河相会的一带，隔江可望京口。渡口与水路让这里成为旅人的停泊处，江岸与明月也在诗中成为遥想故乡的线索。',difference:'这里是江苏扬州的瓜洲，与甘肃的瓜州地名不同。',history:['瓜洲的文化沿着江河展开。长江与运河的交会，使渡口与古镇连接往来船只，留下漕运、盐运和行旅的记忆；历代题咏又让一处水路节点成为人们熟悉的诗歌地名。','王安石泊船时，由京口、瓜洲与钟山的距离写到江南春色和归期。江岸变化与城镇重建之后，今日瓜洲仍以古渡、诗碑等延续诗渡记忆。读这首诗，水与山既是空间，也是人的牵挂。'],historySources:[{title:'江苏宣传网 · 扬州读城：江河明珠 千年诗渡',url:'https://www.jsxc.gov.cn/whwy/whcc/202512/t20251215_88937.shtml'}]},
];
export const sources=[
 {title:'《湖心亭看雪》原文',organization:'西南交通大学中华传统经典普及基地',url:work.source,scope:'2015-12-14 经典导读所列原文；只录公版古文，现代评论未复制。'},
 {title:'杭州西湖文化景观',organization:'UNESCO 世界遗产中心',url:'https://whc.unesco.org/en/list/1334/',scope:'湖泊、堤道、岛屿与历代景观营建；不据此考定张岱落笔点。'},
 {title:'湖心亭现代参照坐标',organization:'OpenStreetMap contributors',url:places[0].coordinateSource,scope:'way/30086285 亭阁轮廓的四顶点均值，WGS84；与 Wikimedia 岛屿区域坐标交叉比较，相距约 29 米。现代建筑参照，不是古址。'},
 {title:'湖心亭岛实景照片',organization:'Bjoertvedt / Wikimedia Commons',url:photo.source,scope:'拍摄时间、作者与 CC BY-SA 4.0 许可；照片本地存储。'},
 {title:'西湖湖岸与岛屿',organization:'OpenStreetMap contributors',url:'https://www.openstreetmap.org/copyright',scope:'WGS84 社区地理数据，ODbL 1.0；现代空间参照，不是测绘成果或历史复原。'},
 {title:'开发验证用自然海陆层',organization:'Natural Earth',url:'https://www.naturalearthdata.com/about/terms-of-use/',scope:'1:5000万自然陆地，公有领域；仅独立 /map-lab 保留，正式全国总览隐藏，不继承官方原图审图号。'}
 ,...works.filter(w=>w.id!=='huxinting-kanxue').map(w=>({title:`${w.author}《${w.title}》原文底本`,organization:w.sourceTitle,url:w.source,scope:w.variant})),
 ...places.filter(p=>p.id!=='huxin').map(p=>({title:p.name+'位置来源',organization:p.coordinateSource.includes('openstreetmap')?'OpenStreetMap contributors':'Wikimedia Commons',url:p.coordinateSource,scope:`${p.precision}；${p.coordinateSystem}。`})),
 ...placeDetails.flatMap(d=>d.historySources).filter((s,i,all)=>all.findIndex(a=>a.url===s.url)===i&&!works.some(w=>w.source===s.url)&&s.url!=='https://whc.unesco.org/en/list/1334/').map(s=>({title:s.title,organization:'公共机构文化资料',url:s.url,scope:'据此整理原创文化沿革；未复制现代文章、图片或译文。'})),
];



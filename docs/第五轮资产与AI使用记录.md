# 第五轮资产与AI使用记录

2026-10-06。机器清单、完整实际提示词、技能路径／哈希见[evidence/round5/assets.json](evidence/round5/assets.json)。

| 资产 | 取得与实际使用 | 边界 |
|---|---|---|
| public/assets/lake-painting-v5.png | 内置image_gen.imagegen，generate、transparent_background=true；无参考图片、无CLI。1774×887 RGBA，1,781,644字节，真实alpha0–253；生成原件从Codex generated_images字节复制到项目，保留原件。湖心亭／西湖阅读与来源240px样张使用 | AI辅助原创意境插画，泛化远亭、舟、雪后疏岸，非古建复原、非实景照片；未复制馆藏影像。SHA eb002857c1e8fa20009a642186ab35f2969ab2a5e0461b27576951f586fbad9b |
| public/assets/paper-fibres-v5.svg | 项目代码原创静态920×700纤维与色差；方向、长度、轻重各有变化，阅读／外围实际使用；不拦截指针 | 当代纸材，不假称历史绢本复刻；无循环动画、无滤镜作用于正文或地图 |
| public/assets/china-design-paper-v5a.png | 官方JPG逐像素单调颜色映射，5826×7249另存。A、B仅两候选；实页总览／聚焦比较后采用A | 独立衍生版，几何不变，原审图号仅标原件；不能按尺度分离嵌入城市文字 |
| docs/evidence/round5/china-design-paper-v5b.png | 另一比较候选，离开public归档，不打入运行包 | 未投入默认页面，不再继续调参 |
| CategoryIcon.tsx及旧SVG | 四类六变体符号继续代码原生；选中删去菱形、粗线、红底线叠加。lake-song.svg、tower-song.svg及旧纸纹原件保留 | 黄鹤楼阅读撤下装饰线稿，不错误复用湖景给寺桥、草堂或渡口 |

研究依据是馆方公开说明及北宋绘画研究，详见设计决策。故宫《听琴图》本次超时，未新增成功核验声明。大都会《竹禽图》与研究页面本次实际读取，但没有下载或使用馆藏数字图像。系统宋体回退，无新增字库、商业素材或地图依赖。

内置生成只调用一次；首次输出目视检查后直接用于页面，后续修整是题诗、材质与控件，不虚报二次绘画迭代。画样板不承担真实地理表达；西湖OSM数据、岛洞、湖心亭照片及署名不改。自有素材未额外指定开放许可证，既有NOTICE与各第三方权利分别保留。

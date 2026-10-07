# 诗文山河 · 诗画同观

第七轮完成原文优先的地点阅读重排，正式范围仍为6地点、8作品、8关联。打开地点即读完整原文，七绝／七律按句分行、歌行保留四段、古文按段阅读；“诗篇2篇”列完整篇名和作者，地点简介、沿革、局部入口、实景与资料同页。退出展开阅读后地图点和工具恢复，回读位置与探索视野保留。

![第七轮湖心亭阅读](docs/screenshots/round7/final-revised-1440-huxin.jpg)

手机390px初始阅读案66dvh，平板64dvh，桌面550px／展开740px；固定区实测118px。系统宋体、既有纸墨和静态纤维保留，既有湖景后置且继续标明AI意境。全国仍为v5a PNG＋Panzoom，西湖为按需创建并复用的一个L7／MapLibre组合实例。

## 启动与检查

Node22.12+兼容版本，依赖由lockfile锁定，无需API密钥。地图、worker、原文、画与照片均本地打包。

```powershell
cd 'G:\project\数媒\poetic-landscape'
npm ci
npm run dev
```

开发地址：http://127.0.0.1:5173/。生产检查：

```powershell
npm run check:data
node scripts/check-design.mjs
node scripts/check-reading.mjs
node scripts/check-overview.mjs docs/evidence/round7/overview-math-check.json
npm run build
npm run preview
```

生产地址：http://127.0.0.1:4173/，Ctrl+C停止。端口固定。`check-reading`校验独立偏移元数据、分行拼回原文与跨行高亮；现有checker继续核对冻结资产／几何／依赖。

[第七轮静态ZIP](releases/诗文山河_第七轮静态包_2026-10-07.zip)包含dist全部文件，根index.html；须用HTTP服务，不能双击HTML。ZIP与dist逐文件核验及SHA在[release.json](docs/evidence/round7/release.json)。

## 操作与范围

- 地图可拖动、滚轮或按钮缩放，近邻组可选地点；当前地名优先避让，题注位移用细引线解释，地理锚点不动。
- 寻诗文支持地点、别名、作者、篇名与主题；搜索匹配作品优先打开该篇。旧阅读被筛选排除时，地名旁标“筛选外”，地图标“当前阅读”。
- 阅读默认全文，单一正文区滚动。诗文／地点切换、展开／收起和同篇回读保存会话锚点；多篇入口支持Tab、Enter、Esc与外部点击，选择后焦点回入口。新篇从起点，镜头不因换篇重新聚焦。
- 地点页不自动切图。“查看局部地图”首次加载L7，重入保留手动镜头；“回全国图面”只换地图，返回地图／×／Esc／站名才退出阅读并恢复探索视野。
- 湖心亭照片为Bjoertvedt、2017-07-21、CC BY-SA4.0，本地原件未修改。湖心亭／西湖意境画与照片分开，画置于原文后；黄鹤楼不配错画。
- 出处可开启静观；`/?overviewFail=1`、`/?mapFail=1`为失败注入，目录和HTML全文仍可读。`/?readerTrace=1`仅启用退出几何的DOM证据，普通页面不采样。
- `/layout-lab`沿用第六轮12点规划压力页，不是新增发布内容。本轮未扩数据、字库、地图资产、主题卷或后台。

## 本轮证据与边界

[阅读设计与截图批评](docs/第七轮阅读设计决策.md) · [实际验收](docs/第七轮实际验收记录.md) · [来源增补](docs/第七轮资产与来源增补.md) · [总计划](docs/tasks/诗文山河_MVP开发计划_2026-10-05.md) · [底图台账](docs/官方底图来源与改动说明.md)。

截图见docs/screenshots/round7，原文DOM、密度、键盘换篇、R01、连续流程、局部镜头和失败路径记录见docs/evidence/round7。新增`scripts/check-reader-exit.cua.mjs`通过本机支持的cua_repl运行，真实点击退出后的缩放工具；不是只检查状态变量的单元测试，也不是普通Node浏览器启动器。

开发与生产页面实际检查完成。实体手机触摸／双指、OS减少动态设置、其他浏览器、干净安装未验证。阅读结构开发自测完成，宋画精细笔法与全国粗边／密注记仍有差距；整体G1／G2待独立视觉认可。原图编号只说明原件身份，不授予成品审核。本轮没有提交、推送或公开部署。

历史：[第六轮验收](docs/第六轮实际验收记录.md) · [第五轮验收](docs/第五轮实际验收记录.md) · [第三轮EPS限制](docs/第三轮底图处理与EPS可行性.md) · [改前README](docs/evidence/round7/README-before.md)。

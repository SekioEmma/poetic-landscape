# 诗文山河 · 诗画同观

第八轮完成地图主导的自适应读案，正式仍为6地点、8作品、8关联。1000／1024横向窗口改为窄侧案，竖屏使用页头以下工作区约48%高的底案；短横屏默认收起题签。收起保留当前地点与回读位置，明确展开才进入专注。第七轮原文／篇目／地点内部结构继续保留。

![第八轮桌面阅读](docs/screenshots/round8/final-revised-1000x750-default.jpg)

常态侧案约350–420px，768底案630px居中，手机满宽。八尺寸实测：横向安全图面宽占整个视口58.60%–66.39%，竖向安全图面高占工作区50.28%–50.65%；844×390默认题签約113px高。原文18px、作者／操作14px、44px热区；窄案不缩字。既有纸墨、静态纤维与后置湖景保持。

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
node scripts/check-reading.mjs docs/evidence/round8/reading-layout-check.json
node scripts/check-overview.mjs docs/evidence/round8/overview-math-check.json
npm run build
node scripts/check-reader-layout.mjs
npm run preview
```

生产地址：http://127.0.0.1:4173/，Ctrl+C停止，端口固定。check:data／design核对内容、依赖、照片、底图及OSM几何冻结项；check-reading核对逐字原文与跨行高亮；check-overview执行数学场景。check-reader-layout读取本轮真实浏览器DOM证据并核对当前dist构建、地图预算、原文与连续操作，不会启动浏览器或重新生成运行证据；改应用后需先用本机支持的cua_repl重采记录。

[第八轮静态ZIP](releases/诗文山河_第八轮静态包_2026-10-07.zip)为dist全部26文件、根index.html；用HTTP服务运行，不能双击HTML。逐文件核对及SHA在[release.json](docs/evidence/round8/release.json)与releases同名.sha256.txt，旧轮包继续保留。

## 操作与空间

- 全国PNG＋Panzoom拖缩、按钮缩放与近邻组选择；当前地名／锚点优先，UI引线只解释题注对应。未选点默认显示完整范围，原图对照与出处可查。
- 寻诗文支持地名、别名、作者、篇名与主题；搜索作品优先打开该篇。筛选排除当前阅读时明确标“筛选外”，不把旧点冒充结果。
- 默认单一正文里展示完整原文。诗文／地点两视图、完整篇目切换、新篇起点与同篇回读保留；多篇入口支持Tab、Enter、Esc及外部点击。
- “收起读案”留下当前地点和篇目的小题签；“继续阅读”恢复常态。“展开阅读”进入专注，“恢复分屏”回常态。×／Esc／首页才退出阅读并恢复进入前探索视野；地图空白不偷关阅读。
- 收起隐藏正文不进入键盘路径。竖屏专注时地图工具／点正确隐藏与inert；恢复后可实际缩放。1024→1025及横竖切换保存语义阅读锚点，必要避让不重置缩放。
- 地点页不自动切图。“查看局部地图”首次创建L7／MapLibre，后续复用；全国往返再入保留手动镜头。全国与局部共享真实页头／纸案矩形安全区，保护完整选中地名。当前内置浏览器整案CSS入场出现淡影或位移残留，已取消该入场；明确的底案空间位移和关闭退场保持。
- 湖心亭照片为Bjoertvedt、2017-07-21、CC BY-SA4.0，本地原件未改；既有湖景标AI辅助原创意境、非实景／复原，黄鹤楼不配错画。
- 出处可开静观。`/?overviewFail=1`、`/?mapFail=1`为失败注入，目录和HTML全文仍可读；`/?readerTrace=1`、`/?motionTrace=1`只启用DOM诊断，普通页面不采样。
- `/layout-lab`是12点隔离规划压力页，不是发布扩容。本轮不增加主题卷、后台、内容、字库或地图资产。

## 本轮证据与边界

[设计决策与全页批评](docs/第八轮设计决策.md) · [实际验收](docs/第八轮实际验收记录.md) · [来源增补](docs/第八轮资产与来源增补.md) · [总计划v2.6](docs/tasks/诗文山河_MVP开发计划_2026-10-05.md) · [底图台账](docs/官方底图来源与改动说明.md)。

截图见docs/screenshots/round8。before与final-revised-matched为同尺寸／黄鹤楼／全国camera0,0,1对照，初选聚焦另列；最终40状态、八作品DOM、R01、快速改选、阅读记忆、局部单实例与失败路径见docs/evidence/round8。旧R01 runner输入保留，实际返回文案改为收起并增加收起后×，没有删除回归来过关。

**阅读与布局开发自测通过，等待独立布局复核。** 既有内部阅读认可保留；宋画细笔仍偏水彩、全国PNG粗边／嵌入注记仍受限，G1-art与G2-map待认可，整体G1／G2未通过。原GS(2023)2763只标原件身份，成品未送审。实体手机触摸／双指、OS设置、其他浏览器／设备、干净安装与真实驱动故障未测。

本轮无提交、推送或部署，完成后停止于6／8范围；无新条件未重试Ghostscript或既有受阻清理。12／16／17及主题卷仍为后续计划。

历史：[第七轮验收](docs/第七轮实际验收记录.md) · [第六轮验收](docs/第六轮实际验收记录.md) · [第五轮验收](docs/第五轮实际验收记录.md) · [第三轮EPS限制](docs/第三轮底图处理与EPS可行性.md) · [改前README](docs/evidence/round8/README-before.md)。

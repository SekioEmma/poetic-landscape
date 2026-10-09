# 诗文山河 · 地图上一页读笺

第十四轮已本地完成：**9地点、12作品、12关联冻结**，全国轻量题注、真锚点、稳定候选与节点记忆、渐进聚合及完整近邻名单。全国和西湖复用锁定L7／MapLibre实例；纸面、正文、两画、湖心亭照片与来源保持。

全国西北在桌面2.68→4.5、手机1.83→3.5；再点敦煌直接选玉门关／阳关。杭州近邻分别选西湖和湖心亭，当前地名独立，44px按钮透明热区。普通地名用16px墨字／轻护字，选中／焦点才有短底。真实点位和地理不为构图移动。

![本轮真实生产页：湖心亭](docs/screenshots/round14/delivery-selected-1280.png)

## 本地启动

Node22.12+兼容版本；依赖按lockfile保持，无API Key、无后端。

```powershell
cd 'G:\project\数媒\poetic-landscape'
npm ci
npm run dev
```

开发地址 http://127.0.0.1:5173/。生产预览：

```powershell
npm run check:data
node scripts/check-design.mjs
node scripts/check-camera-intent.mjs
node scripts/check-reading.mjs docs/evidence/round14/reading-layout-check.json
node scripts/check-annotation-layout.mjs
npm run build
npm run preview
```

生产地址 http://127.0.0.1:4173/，Ctrl+C停止；已有服务时直接访问。检查覆盖完整原文、连续高亮、内容／坐标、全部地理环洞、照片许可、官方原图与依赖冻结。相机单测不能代替原生输入。

`node scripts/check-round14-runtime.mjs`只审计本轮已采集UI，不自动重跑浏览器。代码变化后应更新受影响实页记录。脚本默认输出为round14，旧UI证据保持；不要运行旧轮审计后改日期冒充新验收。

## 静态包

[最终第十四轮ZIP r2](releases/诗文山河_第十四轮静态包_2026-10-09_r2.zip)含dist的31文件，根index.html，约20.3MB。ZIP、dist、4173及解压4191逐文件字节对应见[release.json](docs/evidence/round14/release.json)与同名SHA清单。最初候选包保留，不作为最终交付；第十三轮历史包保持。

解压后通过HTTP运行，不能双击HTML：

```powershell
# 在解压目录；需可运行的Python
python -m http.server 8080 --bind 127.0.0.1
```

打开 http://127.0.0.1:8080/。本机默认Python曾有标准库问题，可用已验证内置运行时：

```powershell
& 'C:\Users\13398\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 8080 --bind 127.0.0.1
```

`scripts/package-static-round14.py`生成最终r2包，已有同名包只校验，不静默覆盖。代码改动后另取新包名。

## 使用与验证边界

- 全国完整范围，原生手动最大11.5；聚合单次自动最多约2级，下一分解太远／同坐标／不宜展开时给完整成员名单。名单可以鼠标或Enter选择、Esc关闭，关闭固定44px，长名单独立滚动。
- 当前阅读／焦点、搜索、普通地名、省名逐层让位。文字候选优先复用；正常图标仍在真实投影。边缘隐藏普通文字不删除按钮，键盘焦点显示完整名。
- 地点、别名、作者、篇名搜索；匹配篇优先打开。关山三处，李白两地；当前阅读不匹配时标“筛选外”，不冒充匹配结果。
- 12篇完整原文18px、真实连续高亮与版本字段保持，按篇／地点保留阅读位置。西湖局部同实例及镜头往返保持；照片按需展开并署名，意境画与实景区分。
- 地图失败会显示官方图片降级和目录阅读。图片仅有六处已核验锚点，新增西北三地不猜锚点，仍能从目录读全文。

[M01–M10实际验收](docs/第十四轮实际验收记录.md) · [方案／截图批评](docs/第十四轮设计决策.md) · [来源／底图台账](docs/第十四轮来源与底图台账.md) · [检查](docs/evidence/round14/final-checks.json) · [运行审计](docs/evidence/round14/runtime-audit.json) · [MVP v3.9](docs/tasks/诗文山河_MVP开发计划_2026-10-05.md)。

1280×720／1000×800／390×844的九点和隔离12／40点均实际运行；三次安定、五次进退、原生四次滚轮与250px拖动、同坐标、边缘长名、名单／阅读避让、局部／失败路径及新ZIP烟测均有新证据。**这是开发自测，独立验收、实体触摸／双指／取消、OS reduce动态切换、另一浏览器／干净安装和用户审美终审仍待。**不宣称60fps或旧复杂矩阵全量复跑。

## 来源、历史与停止范围

全国GeoAtlas／高德仅学习交流，正式许可与专项CRS仍缺；按DataV约定GCJ-02，地点和OSM源WGS84经既有近似适配。35要素及全部环洞、湖岛、堤道几何不改。官方GS(2023)2763 JPG／EPS、历史设计PNG及改动记录独立保留；GeoAtlas不是EPS衍生物、不沿用原号。EPS转换／配准未完成，不重试被拒安装。照片CC BY-SA 4.0、两画AI辅助意境和非复原标识保持；许可文本见public/legal。

输入v3.8、源码与哈希独立保存。第十二轮单测时间戳曾被默认路径刷新的历史说明保留，未伪造恢复；本轮只写round14。第十三轮C1开发及2026-10-09独立抽查见原记录，不把它们等同本轮独立通过。

`/?mapTrace=1`诊断，`/?mapStress=12`／`40`为明确隔离测试点；`mapFail=1`／`baseFail=1`／`localFail=1`为故障注入，不冒充真实设备故障。

第十四轮开发结束时仅本地交付。2026-10-09 用户另行要求上传 GitHub，第三至第十轮归档之后的第十一至十四轮成果已进入本次工程归档；详情见 [GitHub交付记录](docs/GitHub交付记录.md)。网站部署未执行。C2、主题卷、新地理／照片／画未实施。下一步仍按C2→两卷→跨设备候选版→成品材料，由后续任务推进。

公开仓库保留公版古诗核读摘录及源网页 URL／哈希，完整源网页 HTML 留在本地。克隆后的 `check:data` 使用冻结摘录核验，在本地有 HTML 时另检验源档哈希与全文；两种检查路径明确记录，见 [来源归档公开范围](docs/evidence/round13/sources/README.md)。

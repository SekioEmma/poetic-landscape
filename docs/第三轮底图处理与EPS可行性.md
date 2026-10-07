# 第三轮底图处理与EPS可行性

2026-10-06。这是实际结果，不是已完成EPS转换的声明。

原始EPS的二进制头为`c5d0d3c6`，PostScript段从第30字节开始，长度14,253,197字节；声明CorelDRAW X8、LanguageLevel2、BoundingBox `[486,880,1885,2621]`。只读取头和声明元数据，不按XML读取，不用正则修改几何。原始字体与语义路径完整性没有通过转换验证；没有嵌入任何字体，Windows现有宋体等仅作为界面系统字体。

已有命令检查没有发现gswin64c、Inkscape、mutool、pdftocairo、magick。查询Artifex官方GitHub发布接口得到`gs10080w64.exe`，原拟下载并以`/S /D=<项目tmp/tools/ghostscript>`在项目临时目录静默安装。自动审批拒绝这条下载／安装命令，返回`blocked by policy`，没有更具体理由；命令未执行，没有安装版本、转换命令成功记录或未改色EPS转换图。未开展长期环境改造。安装目标来源为：

https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10080/gs10080w64.exe

随后执行任务书明确允许的JPG受限路线。`scripts/derive-overview.py`用Pillow12.3.0／numpy2.3.5生成独立PNG；本机使用Bundled Python：

```powershell
& 'C:/Users/13398/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/derive-overview.py
& 'C:/Users/13398/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/check-derivative.py
```

其他环境可在已安装Pillow和numpy的Python中执行同一脚本；页面启动不需要Python、Ghostscript或重新制图。

公式：`d=(255-min(R,G,B))/255`；`RGB=round([244,240,230]+([80,101,83]-[244,240,230])*d^0.85)`。每个像素用同一单调映射，无选择性遮罩、删除、模糊、alpha或形态处理。输入与输出均5826×7249，旧像素到新图面为`x'=x,y'=y`，六个入口保持原像素。`check-derivative.py`逐行对比全部42,232,674个像素与公式输出，尺寸、摘要也核验通过。

`evidence/round3/map-colour-comparison.png`左为原JPG、右为映射PNG的缩小检查副本；不是EPS转换图。完整衍生图在`public/assets/china-design-paper-v1.png`。原件、城市检查裁片与图面南部诸岛对照可查；处理不按路径大小或颜色删地物，不移动轮廓和锚点。原图查看可还原全部未修改图幅和原署名／编号。

受限路线改善白海报与页面的割裂、紫灰及高亮颜色，但没有可靠矢量分层，不能单独整理视觉线宽或按尺度隐藏城市。原有注记密度在高倍仍明显，**地图美术未完全达标**。原GS号只标原件身份，不是项目设计版的新编号。详细输入输出哈希和工具版本见`evidence/round3/derivative.json`；项目成品未送审，没有自动推送或部署。

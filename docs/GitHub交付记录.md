# GitHub交付记录

日期：2026-10-06。用户明确要求在已登录账户下创建公开仓库。

- 仓库：https://github.com/SekioEmma/poetic-landscape
- GitHub CLI实际返回visibility为PUBLIC，默认分支main。
- 完整应用、官方JPG／EPS原件、已许可照片与地理数据、来源清单、任务文档、截图、验收日志及第二轮静态ZIP已上传。
- 首个完整交付提交：`4eea37d736313436db45893405b8af8b152c9099`。推送完成后以`git ls-remote origin refs/heads/main`确认远端相同。
- 本记录作为后续文档提交补入；最终main以GitHub提交列表为准。
- 本地node_modules、dist、环境文件、日志、临时文件不入库；安装与启动见README。未使用且再分发条件未落实的旧自助地图原始拓扑与网站HTML／JS仅保留本地，最小研究元数据保留。
- .gitattributes关闭文本自动换行转换，保留原图与记录的源文件字节摘要。
- 公开仓库未为全部资产追加统一开源许可，各资料使用条件见NOTICE及来源与许可清单。
- 本次为公开工程上传，没有配置GitHub Pages或执行公开网站部署，没有声称GitHub CI已运行。

本地实际检查：`npm run check:data`及`npm run build`通过；63项浏览器观察中60项直接通过、3项初始观察有通过的对应回归、0项未解决。详细范围与未验证项目见第二轮实际验收记录。

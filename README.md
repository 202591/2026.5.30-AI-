# 宣室异闻录

《宣室异闻录》是一个基于 `React + Vite` 的唐代志怪互动叙事绘本前端项目。

当前实现以 [PRD-宣室异闻录.md](C:/Users/28117/Documents/最终版/PRD-宣室异闻录.md) 为产品基准，围绕“五卷异闻 + 卷尾身份卡”的主流程搭建，重点包括：

- 双页古籍结构与朱砂案牍风视觉系统
- 卷一点画找异、卷二拖镜照魂、卷三听声辨鬼、卷四听声辨位、卷五落名入卷
- `Howler` 音频基础架构
- `html2canvas` 终卷身份卡导出
- `localStorage` 本地进度持久化
- AI 判词接口预留与 fallback 降级

## 项目结构

- [src](C:/Users/28117/Documents/最终版/2026.5.30-AI--main/src)
- [public](C:/Users/28117/Documents/最终版/2026.5.30-AI--main/public)
- [docs](C:/Users/28117/Documents/最终版/2026.5.30-AI--main/docs)
- [assets](C:/Users/28117/Documents/最终版/2026.5.30-AI--main/assets)
- [各场音乐](C:/Users/28117/Documents/最终版/2026.5.30-AI--main/各场音乐)

## 运行方式

```bash
npm install
npm run dev
```

## 构建 Demo

```bash
npm run build
```

构建产物默认输出到 [dist](C:/Users/28117/Documents/最终版/2026.5.30-AI--main/dist)。

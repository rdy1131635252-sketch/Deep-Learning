# 线性代数 × 神经网络 · 视觉互动教程

从标量一步走到 Transformer,共 35 章。

## 怎么打开

由于使用 `fetch()` 动态加载章节文件,**不能直接双击 index.html**(浏览器的 file:// 协议会拦截 fetch)。
需要通过本地 HTTP 服务器打开:

### 方式 1:Python(最快)

```bash
cd Deep_Learning
python3 -m http.server 8000
# 然后浏览器访问 http://localhost:8000
```

### 方式 2:Node

```bash
cd Deep_Learning
npx serve .
```

### 方式 3:VSCode

装扩展 "Live Server",右键 index.html → "Open with Live Server"

## 工程结构

```
Deep_Learning/
├── index.html           入口
├── css/
│   ├── tokens.css       设计令牌(MLU 风格配色 / 字号)
│   ├── layout.css       布局(单栏长卷轴 + 侧 TOC)
│   └── components.css   组件样式(callout / figure / quiz / code 等)
├── js/
│   ├── utils.js         工具函数(MathJax 排版 / 复制 / quiz)
│   └── main.js          路由 / 章节加载 / 进度条
├── data/
│   └── sections.js      35 章元数据
└── sections/            34 个章节 HTML 片段
    ├── 01-scalar-vector-matrix.html
    ├── 02-vector-ops.html
    ├── ...
    └── outro.html
```

## 章节列表

**线性代数 (1.1-1.9)** — 标量向量矩阵 / 向量运算 / 矩阵乘法 / 线性方程组 / 行列式逆秩迹 / 特征值 / SVD / PCA / 小测  
**线代→神经网络 (2.1-2.3)** — 矩阵乘法即前向 / 向量空间 / 线性变换  
**全连接网络 (3.1-3.9)** — 神经元 / 激活函数 / 前向 / 损失 / 梯度下降 / 反向传播 / 训练实战 / 优化器 / 正则化  
**CNN (4.1-4.2)** — 卷积原理 / 8 种经典架构(LeNet, AlexNet, VGG, GoogLeNet, ResNet, MobileNet, EfficientNet, ViT)  
**RNN/序列 (5.1-5.2)** — RNN(总览+单步) / LSTM+GRU(各两图)  
**Transformer (6.1-6.2)** — 注意力 / Transformer 架构  
**训练技巧 (7.1-7.2)** — 初始化与学习率 / 数据增强与迁移学习  
**实战 (8.1-8.3)** — 图像即矩阵 / MNIST / 训练模板  
**测验 / 结语**

## 浏览器要求

- 现代 Chrome / Firefox / Safari / Edge
- JavaScript 启用
- 联网(MathJax 和字体由 CDN 加载)

## 快捷键

- `←` / `→` 翻章节
- `PageUp` / `PageDown` 同上

## 注意

- 每章可独立看,但建议按顺序
- 进度自动保存在 localStorage(✓ 标记看过的)
- 大量章节有交互:拖拽向量、点积计算器、矩阵乘动画、特征向量可视化、SVD 步骤、PCA 数据云、激活函数曲线、卷积滑窗、CNN 架构图、RNN/LSTM/GRU 双视图...


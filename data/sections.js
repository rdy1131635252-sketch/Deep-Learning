// 章节注册表 — slug 对应 sections/ 目录下的 .html 文件
window.SECTIONS = [
  // ── 开始 ──
  { slug: 'home',               title: '首页',                   group: '',              num: '' },

  // ── 线性代数 ──
  { slug: '01-scalar-vector-matrix', title: '标量、向量、矩阵',       group: '线性代数',      num: '1.1' },
  { slug: '02-vector-ops',           title: '向量运算:加法·点积·范数', group: '线性代数',      num: '1.2' },
  { slug: '03-matmul',               title: '矩阵乘法',              group: '线性代数',      num: '1.3' },
  { slug: '04-linear-systems',       title: '线性方程组与最小二乘',    group: '线性代数',      num: '1.4' },
  { slug: '05-det-inv-rank',         title: '行列式、逆、秩、迹',     group: '线性代数',      num: '1.5' },
  { slug: '06-eigen',                title: '特征值与对角化',         group: '线性代数',      num: '1.6' },
  { slug: '07-svd',                  title: 'SVD 奇异值分解',         group: '线性代数',      num: '1.7' },
  { slug: '08-pca',                  title: 'PCA 主成分分析',         group: '线性代数',      num: '1.8' },
  { slug: '09-la-quiz',              title: '线代小测验',             group: '线性代数',      num: '1.9' },

  // ── 过渡 ──
  { slug: '10-matmul-as-forward',    title: '矩阵乘法就是前向传播',   group: '线代→神经网络', num: '2.1' },
  { slug: '11-vector-spaces',        title: '向量空间与四大子空间',   group: '线代→神经网络', num: '2.2' },
  { slug: '12-transforms',           title: '线性变换与仿射变换',     group: '线代→神经网络', num: '2.3' },

  // ── 全连接 ──
  { slug: '13-neuron',               title: '解剖一个神经元',         group: '全连接网络',    num: '3.1' },
  { slug: '14-activations',          title: '激活函数大全',           group: '全连接网络',    num: '3.2' },
  { slug: '15-forward',              title: '前向传播',               group: '全连接网络',    num: '3.3' },
  { slug: '16-loss',                 title: '损失函数',               group: '全连接网络',    num: '3.4' },
  { slug: '17-gradient-descent',     title: '梯度下降',               group: '全连接网络',    num: '3.5' },
  { slug: '18-backprop',             title: '反向传播与链式法则',     group: '全连接网络',    num: '3.6' },
  { slug: '19-training',             title: '训练实战(XOR + 画板)', group: '全连接网络',    num: '3.7' },
  { slug: '20-optimizers',           title: '优化器对比',             group: '全连接网络',    num: '3.8' },
  { slug: '21-regularization',       title: '正则化 · BN · Dropout',  group: '全连接网络',    num: '3.9' },

  // ── CNN ──
  { slug: '22-cnn-basics',           title: 'CNN 卷积原理',           group: 'CNN',           num: '4.1' },
  { slug: '23-cnn-arch',             title: '经典 CNN 架构演进',      group: 'CNN',           num: '4.2' },

  // ── RNN ──
  { slug: '24-rnn',                  title: 'RNN 循环网络',           group: 'RNN / 序列模型',num: '5.1' },
  { slug: '25-lstm-gru',             title: 'LSTM 与 GRU',            group: 'RNN / 序列模型',num: '5.2' },

  // ── Transformer ──
  { slug: '26-attention',            title: '注意力机制',             group: 'Transformer',   num: '6.1' },
  { slug: '27-transformer',          title: 'Transformer 架构',       group: 'Transformer',   num: '6.2' },

  // ── 训练技巧 ──
  { slug: '28-init-lr',              title: '初始化与学习率调度',     group: '训练技巧',      num: '7.1' },
  { slug: '29-aug-transfer',         title: '数据增强与迁移学习',     group: '训练技巧',      num: '7.2' },

  // ── 实战 ──
  { slug: '30-image-matrix',         title: '图像就是矩阵',           group: '实战',          num: '8.1' },
  { slug: '31-mnist',                title: '手写数字识别',           group: '实战',          num: '8.2' },
  { slug: '32-first-net',            title: '我的第一个网络',         group: '实战',          num: '8.3' },

  // ── 测验与结语 ──
  { slug: '33-final-quiz',           title: '综合测验',               group: '测验与结语',    num: '9' },
  { slug: 'outro',                   title: '结语与进阶',             group: '测验与结语',    num: '' },
];

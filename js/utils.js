// ============================================================
// 工具函数
// ============================================================

// shorthand
const $  = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

// 数值工具
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const sig   = z => 1 / (1 + Math.exp(-clamp(z, -50, 50)));
const relu  = z => Math.max(0, z);

// Toast
function showToast(msg, dur = 1500) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), dur);
}

// 复制代码块
function copyCode(btn) {
  const pre = btn.closest('.code').querySelector('pre');
  const text = pre.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ 已复制';
    setTimeout(() => btn.textContent = orig, 1200);
    showToast('代码已复制');
  }).catch(() => showToast('复制失败,请手动选取'));
}

// MathJax: 重新排版某个节点
function typeset(el) {
  if (window._mjReady && window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([el || document.body]).catch(e => console.error('MathJax error:', e));
  } else {
    // 等 MathJax 就绪后再 typeset
    window.addEventListener('mjready', () => typeset(el), { once: true });
  }
}

// Quiz
function quiz(question, options, correctIdx, explanation) {
  const opts = Array.isArray(options) ? options : options.split('|');
  let h = `<div class="quiz"><div class="quiz-title">${question}</div>`;
  opts.forEach((o, i) => {
    h += `<div class="quiz-opt" data-correct="${i === correctIdx ? 1 : 0}"
           onclick="checkQuiz(this, ${i === correctIdx})">
           <b>${'ABCD'[i]}.</b> ${o}</div>`;
  });
  h += `<div class="quiz-ex"><b>解答:</b> ${explanation}</div></div>`;
  return h;
}

function checkQuiz(el, isCorrect) {
  const q = el.closest('.quiz');
  if (q.dataset.answered) return;
  q.dataset.answered = '1';
  if (isCorrect) el.classList.add('ok');
  else {
    el.classList.add('no');
    $$('.quiz-opt', q).forEach(o => {
      if (o.dataset.correct === '1') o.classList.add('ok');
    });
  }
  q.querySelector('.quiz-ex').style.display = 'block';
}

// 通用代码高亮(很简单的 Python/JS 关键词高亮)
// 单次扫描 tokenizer —— 不能用多轮 replace,否则前一轮生成的
// <span class="c-xxx"> 标签会被下一轮正则再次匹配,产生嵌套污染。
function highlightCode(el) {
  const pre = el.querySelector('pre');
  if (!pre || pre.dataset.hl === '1') return;
  pre.dataset.hl = '1';

  // Python / JS 关键字
  const kws = new Set([
    'import', 'from', 'as', 'def', 'class', 'return', 'if', 'else', 'elif',
    'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None',
    'with', 'lambda', 'self', 'super', 'pass', 'yield', 'try', 'except',
    'finally', 'raise', 'break', 'continue', 'global', 'nonlocal',
    'const', 'let', 'var', 'function', 'async', 'await'
  ]);

  // 拿到纯文本源码(textContent 会把实体解码回 <, >, & 等)
  const src = pre.textContent;

  // HTML 转义
  const esc = s => s.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

  // 单次前向扫描,顺次匹配: 注释 -> 字符串 -> 数字 -> 标识符 -> 其它字符
  let out = '';
  let i = 0;
  const n = src.length;

  while (i < n) {
    const ch = src[i];

    // 注释: # 到行尾
    if (ch === '#') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      out += '<span class="c-cmt">' + esc(src.slice(i, j)) + '</span>';
      i = j;
      continue;
    }

    // 字符串: '...' 或 "..."  (简单版,支持反斜杠转义)
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < n && src[j] !== quote) {
        if (src[j] === '\\' && j + 1 < n) j += 2;
        else j++;
      }
      if (j < n) j++; // 把收尾引号吃掉
      out += '<span class="c-str">' + esc(src.slice(i, j)) + '</span>';
      i = j;
      continue;
    }

    // 数字: 整数或小数,允许前面的负号留给运算符,不在这处理
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < n && /[0-9.]/.test(src[j])) j++;
      out += '<span class="c-num">' + esc(src.slice(i, j)) + '</span>';
      i = j;
      continue;
    }

    // 标识符 / 关键字: [A-Za-z_][A-Za-z0-9_]*
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (kws.has(word)) {
        out += '<span class="c-key">' + word + '</span>';
      } else {
        out += esc(word);
      }
      i = j;
      continue;
    }

    // 其它字符(运算符、括号、空白等)原样输出(转义)
    out += esc(ch);
    i++;
  }

  pre.innerHTML = out;
}

// 防抖
function debounce(fn, wait = 200) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

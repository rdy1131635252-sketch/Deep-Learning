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
function highlightCode(el) {
  const pre = el.querySelector('pre');
  if (!pre || pre.dataset.hl === '1') return;
  pre.dataset.hl = '1';
  let html = pre.innerHTML;
  // 先保护 HTML 实体再处理
  // Python 关键字
  const kws = ['import', 'from', 'as', 'def', 'class', 'return', 'if', 'else', 'elif',
               'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None',
               'with', 'lambda', 'self', 'super', 'pass', 'yield', 'try', 'except',
               'finally', 'raise', 'break', 'continue', 'global', 'nonlocal',
               'const', 'let', 'var', 'function', 'async', 'await'];
  // 注释优先(否则关键字会抢)
  html = html.replace(/(#.*$)/gm, '<span class="c-cmt">$1</span>');
  // 字符串
  html = html.replace(/('[^']*'|"[^"]*")/g, '<span class="c-str">$1</span>');
  // 数字
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="c-num">$1</span>');
  // 关键字
  kws.forEach(k => {
    html = html.replace(new RegExp('\\b' + k + '\\b', 'g'),
                        `<span class="c-key">${k}</span>`);
  });
  pre.innerHTML = html;
}

// 防抖
function debounce(fn, wait = 200) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

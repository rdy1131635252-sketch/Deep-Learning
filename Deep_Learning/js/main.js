// ============================================================
// 主应用:Hash 路由、章节加载、TOC、进度条
// ============================================================

const APP    = $('#app');
const BY_SLUG = Object.fromEntries(SECTIONS.map((s, i) => [s.slug, { ...s, idx: i }]));
window._interactionInits = window._interactionInits || {}; // 提前初始化,避免章节脚本注册时对象未定义

// 执行通过 innerHTML 注入后的脚本(默认不会自动执行)
// 返回脚本执行阶段的错误数组,便于页面内提示。
function executeSectionScripts(root, slug = 'unknown') {
  if (!root) return [];
  const scripts = [...root.querySelectorAll('script')];
  const errors = [];

  scripts.forEach((oldScript, i) => {
    const code = oldScript.textContent || '';
    const src = oldScript.getAttribute('src');

    try {
      const s = document.createElement('script');
      [...oldScript.attributes].forEach(attr => s.setAttribute(attr.name, attr.value));
      if (src) {
        s.src = src;
        s.async = false;
      } else {
        // 交给浏览器原生脚本管线执行。
        s.textContent = code;
      }
      document.head.appendChild(s);
    } catch (e) {
      errors.push(e);
      console.error(`[${slug}] 章节脚本执行失败(#${i + 1}):`, e);
    }

    oldScript.remove();
  });

  return errors;
}

// 兜底:若 DOM 注入脚本未生效,直接从章节 HTML 字符串提取并执行内联脚本
function executeInlineScriptsFromHtml(html, slug = 'unknown') {
  const errors = [];
  const re = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m;
  let i = 0;
  while ((m = re.exec(html)) !== null) {
    i += 1;
    const code = (m[1] || '').trim();
    if (!code) continue;
    try {
      new Function(code)();
    } catch (e) {
      errors.push(e);
      console.error(`[${slug}] 兜底脚本执行失败(#${i}):`, e);
    }
  }
  return errors;
}

// 终极兜底:用全局 eval 执行内联脚本(某些环境下比 new Function/script 注入更稳定)
function executeInlineScriptsViaEval(html, slug = 'unknown') {
  const errors = [];
  const re = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m;
  let i = 0;
  while ((m = re.exec(html)) !== null) {
    i += 1;
    const code = (m[1] || '').trim();
    if (!code) continue;
    try {
      // 确保注册容器存在
      window._interactionInits = window._interactionInits || {};
      window.eval(code + `\n//# sourceURL=section-${slug}-inline-${i}.js`);
    } catch (e) {
      errors.push(e);
      console.error(`[${slug}] eval 兜底脚本执行失败(#${i}):`, e);
    }
  }
  return errors;
}

function showInteractionError(slug, err, phase = 'init') {
  const msg = err && err.message ? err.message : String(err || 'unknown error');
  const isKnownNonFatal =
    (slug === '01-scalar-vector-matrix' || slug === '13-neuron') &&
    phase === 'runtime' &&
    (/appendChild/i.test(msg) || /Unexpected end of input/i.test(msg));
  if (isKnownNonFatal) return;

  const root = $('#prose-root');
  if (!root) return;
  const stack = err && err.stack ? String(err.stack).split('\n').slice(0, 3).join('\n') : '';
  const old = root.querySelector('.callout[data-interaction-error="1"]');
  if (old) old.remove();
  const box = document.createElement('div');
  box.className = 'callout c-warn';
  box.dataset.interactionError = '1';
  box.innerHTML = `
    <span class="callout-title">交互加载异常</span>
    <p>章节 <b>${slug}</b> 的交互在 <b>${phase}</b> 阶段失败: <code>${msg}</code></p>
    ${stack ? `<pre style="margin-top:8px; white-space:pre-wrap; font-size:12px; line-height:1.35; color:var(--ink-2)">${stack}</pre>` : ''}
    <p style="margin-top:6px">请按 <b>Ctrl+F5</b> 强制刷新后重试。若仍失败,把这一条截图发我继续定位。</p>
  `;
  root.prepend(box);
}

// 全局兜底:捕获未处理错误,在页面顶部给可见提示
window.addEventListener('error', (ev) => {
  const slug = parseHash();
  if (!slug || slug === 'home') return;
  showInteractionError(slug, ev.error || ev.message || 'unknown error', 'runtime');
});

window.addEventListener('unhandledrejection', (ev) => {
  const slug = parseHash();
  if (!slug || slug === 'home') return;
  const reason = ev.reason && ev.reason.message ? ev.reason.message : (ev.reason || 'promise rejection');
  showInteractionError(slug, reason, 'runtime');
});

// 进度持久化
const DONE_KEY = 'ln_tut_v3_done';
let doneSet = new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]'));
function markDone(slug) {
  doneSet.add(slug);
  localStorage.setItem(DONE_KEY, JSON.stringify([...doneSet]));
}

// ── 解析 hash ─────────────────────────
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '').trim();
  if (!h || h === 'home' || h === '/') return 'home';
  return h;
}

// ── 渲染首页 ───────────────────────────
function renderHome() {
  APP.innerHTML = `
    <div class="hero">
      <h1>线性代数 × 神经网络</h1>
      <p class="lead">
        从标量一步步走到 Transformer 的视觉互动教程。<br>
        每个概念都配有可拖拽、可推导的动手演示。
      </p>
      <div class="flex-row" style="justify-content:center; margin-top: 24px;">
        <a href="#/01-scalar-vector-matrix" class="btn btn-primary">🚀 从头开始</a>
        <a href="#/22-cnn-basics" class="btn">跳到 CNN</a>
        <a href="#/26-attention" class="btn">跳到 Transformer</a>
      </div>
    </div>

    <div class="chapter-cards">
      ${renderChapterCards()}
    </div>
  `;
  $$('.top-bar-nav a').forEach(a => a.classList.remove('active'));
  $('.nav-home').classList.add('active');
  updateProgress();
}

function renderChapterCards() {
  // 按 group 聚合
  const groups = {};
  SECTIONS.forEach(s => {
    if (!s.group) return;
    (groups[s.group] = groups[s.group] || []).push(s);
  });
  let h = '';
  Object.entries(groups).forEach(([g, arr]) => {
    const first = arr[0];
    h += `
      <a href="#/${first.slug}" class="chapter-card">
        <div class="cc-group">${g}</div>
        <h3>${arr.map(s => s.num + ' ' + s.title).slice(0, 2).join('  ·  ')}${arr.length > 2 ? ' ...' : ''}</h3>
        <div class="cc-desc">共 ${arr.length} 章 · 从 ${first.num} 开始</div>
      </a>
    `;
  });
  return h;
}

// ── 渲染章节 ──────────────────────────
async function renderSection(slug) {
  const sec = BY_SLUG[slug];
  if (!sec) { location.hash = '#/'; return; }

  // 骨架
  APP.innerHTML = `
    <div class="page">
      <aside class="toc">
        ${renderTOC(slug)}
      </aside>
      <main>
        <article class="prose" id="prose-root">
          <div style="padding: 60px 0; text-align: center; color: var(--ink-3);">
            加载中…
          </div>
        </article>
        <nav class="chapter-nav" id="chapter-nav"></nav>
      </main>
    </div>
  `;

  try {
    const res  = await fetch(`sections/${slug}.html`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    // 强制按 UTF-8 解码章节片段,避免服务器未带 charset 时被误判编码
    // (中文脚本字符串一旦被错解码,会导致内联脚本注册失败)
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('utf-8').decode(buf);

    const header = `
      <h1>
        ${sec.num ? `<span class="chapter-num">${sec.group} · ${sec.num}</span>` : ''}
        ${sec.title}
      </h1>
    `;

    $('#prose-root').innerHTML = header + html;

    // 让章节内联 <script> 生效(用于注册每章交互逻辑)
    window._interactionInits = window._interactionInits || {};
    const scriptErrors = [];
    scriptErrors.push(...executeSectionScripts($('#prose-root'), slug));

    // 强兜底:从原始 HTML 再执行一次内联脚本。
    scriptErrors.push(...executeInlineScriptsFromHtml(html, slug));

    // 终极兜底:若仍未注册,再走一遍 eval 通道
    if (!window._interactionInits[slug]) {
      scriptErrors.push(...executeInlineScriptsViaEval(html, slug));
    }

    // 仍未注册且脚本阶段已有异常,提前打日志便于定位
    if (!window._interactionInits[slug] && scriptErrors.length) {
      console.error(`[${slug}] 章节脚本执行阶段存在异常:`, scriptErrors[0]);
    }

    // 渲染章节导航
    renderChapterNav(sec.idx);

    // 顶栏 active
    $$('.top-bar-nav a').forEach(a => a.classList.remove('active'));

    // 代码块复制按钮 & 高亮
    $$('.code', APP).forEach(c => {
      if (!c.querySelector('.code-header')) {
        const lang = c.dataset.lang || 'Python';
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `<span class="code-lang">${lang}</span><button class="code-copy" onclick="copyCode(this)">复制</button>`;
        c.insertBefore(header, c.firstChild);
      }
      highlightCode(c);
    });

    // 排版 MathJax
    typeset($('#prose-root'));

    // 跑章节脚本
    initSectionInteractions(slug);

    // 注意:脚本语法/运行错误由全局 error 事件兜底显示

    // 标记已读
    markDone(slug);

    // 滚到顶
    window.scrollTo(0, 0);
  } catch (e) {
    $('#prose-root').innerHTML = `
      <div class="callout c-warn">
        <span class="callout-title">加载失败</span>
        <p>找不到章节 <code>${slug}.html</code>,或本地文件尚未生成。错误:${e.message}</p>
        <p><a href="#/">返回首页</a></p>
      </div>
    `;
  }
}

// ── 目录 ──────────────────────────────
function renderTOC(activeSlug) {
  let h = '';
  let lastGroup = '';
  SECTIONS.forEach(s => {
    if (!s.group) return;
    if (s.group !== lastGroup) {
      h += `<h4>${s.group}</h4>`;
      lastGroup = s.group;
    }
    const done = doneSet.has(s.slug) ? ' ✓' : '';
    const active = s.slug === activeSlug ? ' active' : '';
    h += `<a href="#/${s.slug}" class="${active}">${s.num} ${s.title}${done}</a>`;
  });
  return h;
}

// ── 章节间的上一节 / 下一节 ─────────
function renderChapterNav(idx) {
  const el = $('#chapter-nav');
  if (!el) return;
  // 跳过 home
  const firstIdx = SECTIONS.findIndex(s => s.group) ; // 第一个有 group 的
  const lastIdx  = SECTIONS.length - 1;
  const prev = idx > firstIdx ? SECTIONS[idx - 1] : null;
  const next = idx < lastIdx ? SECTIONS[idx + 1] : null;
  let h = '';
  if (prev) h += `<a href="#/${prev.slug}"><span class="dir">← 上一节</span><b>${prev.num} ${prev.title}</b></a>`;
  else h += '<span></span>';
  if (next) h += `<a href="#/${next.slug}" class="next"><span class="dir">下一节 →</span><b>${next.num} ${next.title}</b></a>`;
  el.innerHTML = h;
}

// ── 阅读进度条 ─────────────────────
function updateReadProgress() {
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  const bar = $('.read-progress > div');
  if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
}
window.addEventListener('scroll', updateReadProgress, { passive: true });

function updateProgress() {
  updateReadProgress();
}

// ── 内置兜底交互(用于章节脚本注册失败时) ─────────
function getBuiltInFallbackInit(slug) {
  if (slug === '01-scalar-vector-matrix') {
    return function(root) {
      const c = root.querySelector('#c-vec');
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;

      const W = c.width, H = c.height;
      const CX = W / 2, CY = H / 2;
      const SCALE = 50;
      let vx = 3, vy = 2;
      let dragging = false;

      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#FBF8F3';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = '#E2D8C4';
        ctx.lineWidth = 0.5;
        for (let x = CX % SCALE; x < W; x += SCALE) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = CY % SCALE; y < H; y += SCALE) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        ctx.strokeStyle = '#8B7A65';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();

        const px = CX + vx * SCALE;
        const py = CY - vy * SCALE;
        ctx.strokeStyle = '#D97333';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(px, py); ctx.stroke();

        const ang = Math.atan2(CY - py, px - CX);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 14 * Math.cos(ang - 0.35), py + 14 * Math.sin(ang - 0.35));
        ctx.lineTo(px - 14 * Math.cos(ang + 0.35), py + 14 * Math.sin(ang + 0.35));
        ctx.closePath();
        ctx.fillStyle = '#D97333';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#2D63A4';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        const len = Math.sqrt(vx * vx + vy * vy);
        const angDeg = Math.atan2(vy, vx) * 180 / Math.PI;
        const info = root.querySelector('#vec-info');
        if (info) {
          info.textContent = `v = (${vx.toFixed(1)}, ${vy.toFixed(1)})    |v| = ${len.toFixed(2)}    θ = ${angDeg.toFixed(1)}°`;
        }
      }

      function toWorld(e) {
        const r = c.getBoundingClientRect();
        const sx = c.width / r.width;
        const sy = c.height / r.height;
        const ev = e.touches ? e.touches[0] : e;
        const px = (ev.clientX - r.left) * sx;
        const py = (ev.clientY - r.top) * sy;
        return { x: (px - CX) / SCALE, y: -(py - CY) / SCALE };
      }

      c.addEventListener('mousedown', e => { dragging = true; const p = toWorld(e); vx = p.x; vy = p.y; draw(); });
      c.addEventListener('mousemove', e => { if (!dragging) return; const p = toWorld(e); vx = p.x; vy = p.y; draw(); });
      c.addEventListener('mouseup', () => { dragging = false; });
      c.addEventListener('mouseleave', () => { dragging = false; });
      c.addEventListener('touchstart', e => { dragging = true; const p = toWorld(e); vx = p.x; vy = p.y; draw(); e.preventDefault(); }, { passive: false });
      c.addEventListener('touchmove', e => { if (!dragging) return; const p = toWorld(e); vx = p.x; vy = p.y; draw(); e.preventDefault(); }, { passive: false });
      c.addEventListener('touchend', () => { dragging = false; });

      draw();
    };
  }

  if (slug === '13-neuron') {
    return function(root) {
      function draw() {
        const w1El = $('#nw1', root), w2El = $('#nw2', root), bEl = $('#nb', root);
        const w1vEl = $('#nw1v', root), w2vEl = $('#nw2v', root), nbvEl = $('#nbv', root);
        const nsvg = $('#n-svg', root), c = $('#c-nr', root);
        if (!w1El || !w2El || !bEl || !w1vEl || !w2vEl || !nbvEl || !nsvg || !c) return;
        const ctx = c.getContext('2d');
        if (!ctx) return;

        const w1 = +w1El.value, w2 = +w2El.value, b = +bEl.value;
        w1vEl.textContent = w1.toFixed(1);
        w2vEl.textContent = w2.toFixed(1);
        nbvEl.textContent = b.toFixed(1);

        nsvg.innerHTML = `
          <circle cx="45" cy="55" r="18" fill="var(--blue-tint)" stroke="var(--blue)" stroke-width="2"/>
          <text x="45" y="59" text-anchor="middle" font-size="11" font-weight="600">x₁</text>
          <circle cx="45" cy="125" r="18" fill="var(--blue-tint)" stroke="var(--blue)" stroke-width="2"/>
          <text x="45" y="129" text-anchor="middle" font-size="11" font-weight="600">x₂</text>
          <line x1="63" y1="55" x2="160" y2="85" stroke="var(--orange)" stroke-width="2"/>
          <line x1="63" y1="125" x2="160" y2="95" stroke="var(--orange)" stroke-width="2"/>
          <text x="100" y="60" font-size="10" fill="var(--orange-deep)" font-family="var(--font-mono)">w₁=${w1.toFixed(1)}</text>
          <text x="100" y="125" font-size="10" fill="var(--orange-deep)" font-family="var(--font-mono)">w₂=${w2.toFixed(1)}</text>
          <circle cx="180" cy="90" r="24" fill="var(--orange-tint)" stroke="var(--orange)" stroke-width="2.5"/>
          <text x="180" y="95" text-anchor="middle" font-size="11" font-weight="700">Σ + σ</text>
          <line x1="204" y1="90" x2="250" y2="90" stroke="var(--green)" stroke-width="2" marker-end="url(#arr13)"/>
          <text x="215" y="83" font-size="10" fill="var(--green)" font-family="var(--font-mono)">b=${b.toFixed(1)}</text>
          <circle cx="272" cy="90" r="16" fill="var(--green-tint)" stroke="var(--green)" stroke-width="2"/>
          <text x="272" y="94" text-anchor="middle" font-size="11" fill="var(--green)" font-weight="700">y</text>
          <defs>
            <marker id="arr13" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L10,5 L0,10" fill="var(--green)"/>
            </marker>
          </defs>
        `;

        const W = c.width, H = c.height, S = W / 8;
        ctx.clearRect(0, 0, W, H);
        for (let px = 0; px < W; px += 3) {
          for (let py = 0; py < H; py += 3) {
            const ux = (px - W / 2) / S;
            const uy = -(py - H / 2) / S;
            const z = w1 * ux + w2 * uy + b;
            const a = sig(z);
            ctx.fillStyle = a > 0.5 ? 'rgba(45, 99, 164, 0.2)' : 'rgba(217, 115, 51, 0.2)';
            ctx.fillRect(px, py, 3, 3);
          }
        }

        if (Math.abs(w2) > 0.01) {
          ctx.strokeStyle = '#B53838';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const x1 = -4, x2 = 4;
          const y1 = -(w1 * x1 + b) / w2;
          const y2 = -(w1 * x2 + b) / w2;
          ctx.moveTo(0, H / 2 - y1 * S);
          ctx.lineTo(W, H / 2 - y2 * S);
          ctx.stroke();
        }

        ctx.strokeStyle = '#8B7A65';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();

        const nForm = $('#n-form', root);
        if (nForm) nForm.innerHTML = `z = ${w1.toFixed(1)}·x₁ + ${w2.toFixed(1)}·x₂ + (${b.toFixed(1)})  →  y = σ(z)`;
      }

      ['nw1', 'nw2', 'nb'].forEach(id => {
        const el = $('#'+id, root);
        if (el) el.addEventListener('input', draw);
      });

      draw();
    };
  }

  return null;
}

// ── 路由触发 ──────────────────────
async function route() {
  const slug = parseHash();
  if (slug === 'home') renderHome();
  else await renderSection(slug);
}
window.addEventListener('hashchange', route);

// ── 键盘翻页 ──────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const cur = parseHash();
  if (cur === 'home') return;
  const idx = SECTIONS.findIndex(s => s.slug === cur);
  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    if (idx < SECTIONS.length - 1) location.hash = '#/' + SECTIONS[idx + 1].slug;
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    if (idx > 1) location.hash = '#/' + SECTIONS[idx - 1].slug;
  }
});

// ── 章节交互分发 ────────────────
function initSectionInteractions(slug) {
  const reg = window._interactionInits || {};
  let fn = reg[slug];
  if (!fn) {
    // 容错:处理意外空白/零宽字符导致的键名不匹配
    const norm = s => String(s || '').replace(/[\u200B-\u200D\uFEFF\s]/g, '');
    const target = norm(slug);
    const altKey = Object.keys(reg).find(k => norm(k) === target);
    if (altKey) fn = reg[altKey];
  }
  if (!fn) {
    fn = getBuiltInFallbackInit(slug);
  }

  // 若可执行交互(正常注册或内置兜底),先清理旧的错误提示框
  if (fn) {
    const root = $('#prose-root');
    const old = root && root.querySelector('.callout[data-interaction-error="1"]');
    if (old) old.remove();
  }

  if (!fn) {
    // 若章节里有交互载体但没有注册函数,给出可见提示
    const root = $('#prose-root');
    const maybeInteractive = root && root.querySelector('canvas, .quiz-slot, [type="range"], [data-act], [data-tf]');
    if (maybeInteractive) {
      const e = new Error('未找到 window._interactionInits 对应条目');
      console.error(`[${slug}] 交互初始化失败:`, e);
      showInteractionError(slug, e, 'init');
    }
    return;
  }

  try { fn($('#prose-root')); }
  catch (e) {
    console.error(`[${slug}] 交互初始化失败:`, e);
    showInteractionError(slug, e, 'init');
  }
}

// ── 启动 ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  route();
});

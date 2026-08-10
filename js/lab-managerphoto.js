/* ============================================================
   👔 FM TOUCH LAB — MANAGER PHOTO LAB
   Foto própria → treinador de futebol com IA (identidade preservada).
   IA roda SÓ no backend (Edge Function do Supabase) — chave nunca aqui!
   Export: 260×310 PNG (padrão Football Manager).
   ============================================================ */
(function () {
window.LAB = window.LAB || {};
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ---------- conf ---------- */
var OUT_W = 260, OUT_H = 310;              /* 📐 saída FM (NÃO mexer!) */
var VIEW_W = 238, VIEW_H = 284;            /* moldura na tela (~mesma proporção) */
var ROLES = [
  { id: 'manager',    n: 'Manager',            ic: '👔' },
  { id: 'assistente', n: 'Assistant Manager',  ic: '🧠' },
  { id: 'coach',      n: 'Coach',              ic: '🎯' },
  { id: 'goleiros',   n: 'Goalkeeping Coach',  ic: '🧤' },
  { id: 'preparador', n: 'Fitness Coach',      ic: '🏋️' },
  { id: 'olheiro',    n: 'Scout',              ic: '🔎' }
];
var STYLES = [
  { id: 'oficial',  n: 'Roupa oficial', ic: '👔' },
  { id: 'agasalho', n: 'Agasalho',      ic: '🧥' },
  { id: 'polo',     n: 'Polo do clube', ic: '👕' },
  { id: 'treino',   n: 'Treino',        ic: '🧢' },
  { id: 'comissao', n: 'Comissão técnica', ic: '⚽' }
];
var DAILY_LIMIT = 10; /* por aparelho (proteção de custo) */

/* ---------- estado ---------- */
var sb = null;
var photo = { orig: null, send: null };    /* orig p/ prévia; send = jpeg ≤1024 p/ IA */
var club = null;                            /* objeto da base LAB.CLUBES */
var role = 'manager', style = 'oficial', bg = 'neutro';
var gen = { url: null, title: '' };         /* resultado da IA */
var busy = false;
var crop = { on: false, x: 0, y: 0, z: 1 }; /* enquadramento manual */
var ROOT = null;

/* ---------- CSS ---------- */
var CSS = '' +
'.mpcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:15px 13px;margin-bottom:12px}' +
'.mpcard h3{font-size:15px;margin-bottom:8px}' +
'.mplab{display:block;font-size:12px;color:var(--sub);font-weight:800;margin:0 2px 8px;letter-spacing:.4px}' +
'.mpup{border:2px dashed var(--line);border-radius:14px;padding:22px 10px;text-align:center;cursor:pointer;transition:.15s}' +
'.mpup:hover{border-color:var(--neon)}' +
'.mpup .ic{font-size:34px}' +
'.mpprev{display:none;margin-top:10px;max-height:240px;border-radius:12px;border:1px solid var(--line);object-fit:contain;background:#000;margin-left:auto;margin-right:auto}' +
'.mptips{font-size:11.5px;color:var(--sub);line-height:1.6;margin-top:8px;background:#0d1526;border:1px solid var(--line);border-radius:10px;padding:9px 11px}' +
'.mpops{display:flex;flex-wrap:wrap;gap:7px}' +
'.mpop{background:#0d1526;border:1.5px solid var(--line);color:var(--sub);border-radius:99px;padding:8px 13px;font-size:12.5px;font-weight:800;cursor:pointer}' +
'.mpop.sel{border-color:var(--neon);color:var(--txt);background:#2eff8f10}' +
'.mpgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;max-height:190px;overflow-y:auto;padding-right:2px}' +
'.mpclub{display:flex;align-items:center;gap:8px;background:#0d1526;border:1.5px solid var(--line);border-radius:11px;padding:8px 9px;cursor:pointer;font-size:12.5px;font-weight:700;text-align:left;color:var(--txt)}' +
'.mpclub.sel{border-color:var(--neon);background:#2eff8f12}' +
'.mpclub .lbcrest{width:22px;height:22px;border:none;flex:none}' +
'.mpclub span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
'.mpsel{display:flex;align-items:center;gap:10px;background:#0d1526;border:1.5px dashed var(--neon);border-radius:12px;padding:9px 11px;margin-bottom:8px;font-weight:800;font-size:13.5px}' +
'.mpbtn{background:var(--neon);color:#04160c;border:none;border-radius:12px;padding:13px 16px;font-size:15px;font-weight:900;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px}' +
'.mpbtn:disabled{opacity:.55;cursor:wait}' +
'.mpbtn.ghost{background:var(--card);border:1px solid var(--line);color:var(--txt);font-weight:800}' +
'.mpbtn.mini{padding:9px 11px;font-size:12.5px;border-radius:10px;width:auto;flex:1}' +
'.mpstatus{text-align:center;font-size:13.5px;font-weight:800;color:var(--neon2);padding:10px 4px;animation:mpblink 1.2s infinite}' +
'@keyframes mpblink{50%{opacity:.45}}' +
'.mperr{background:#2b1218;border:1px solid var(--bad);color:#ffd7dc;border-radius:12px;padding:11px 12px;font-size:13px;line-height:1.5;margin-top:8px}' +
'.mpframe{position:relative;overflow:hidden;border-radius:14px;border:1.5px solid var(--neon2);margin:0 auto;touch-action:none;background:repeating-conic-gradient(#10182a 0% 25%,#0b1322 0% 50%) 0 0/20px 20px;user-select:none}' +
'.mpframe img{position:absolute;transform-origin:0 0;max-width:none;-webkit-user-drag:none}' +
'.mpmeta{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin:12px 0}' +
'.mpmeta i{font-style:normal;background:#0d1526;border:1px solid var(--line);border-radius:99px;padding:5px 11px;font-size:11.5px;font-weight:800}' +
'.mprow{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}' +
'.mpzoom{display:flex;align-items:center;gap:9px;margin-top:9px}' +
'.mpzoom input{flex:1;accent-color:var(--neon)}' +
'.mppriv{font-size:11px;color:var(--sub);text-align:center;margin-top:10px;line-height:1.55}' +
'.mpratio{text-align:center;font-size:11px;color:var(--sub);margin-top:6px;font-weight:800;letter-spacing:.5px}';

/* ---------- helpers ---------- */
function clubList() { return LAB.CLUBES || []; }
function roleOf(id) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].id === id) return ROLES[i]; return ROLES[0]; }
function styleOf(id) { for (var i = 0; i < STYLES.length; i++) if (STYLES[i].id === id) return STYLES[i]; return STYLES[0]; }
function dayCounter() {
  var today = new Date().toISOString().slice(0, 10), o;
  try { o = JSON.parse(localStorage.getItem('fmtl.mp_day') || '{}'); } catch (e) { o = {}; }
  if (o.d !== today) o = { d: today, n: 0 };
  return o;
}
function bumpCounter(o) { try { localStorage.setItem('fmtl.mp_day', JSON.stringify(o)); } catch (e) {} }

/* ---------- prepara foto p/ IA (≤1024px, jpeg — original NUNCA é alterada) ---------- */
function prepPhoto(file) {
  return new Promise(function (res, rej) {
    var rd = new FileReader();
    rd.onerror = rej;
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1024, w = img.width, h = img.height;
        var k = Math.min(1, max / Math.max(w, h));
        w = Math.round(w * k); h = Math.round(h * k);
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var cx = cv.getContext('2d'); cx.fillStyle = '#101418'; cx.fillRect(0, 0, w, h);
        cx.drawImage(img, 0, 0, w, h);
        res({ orig: rd.result, send: cv.toDataURL('image/jpeg', 0.86) });
      };
      img.onerror = rej;
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  });
}

/* ---------- render ---------- */
function gridHTML(q) {
  q = (q || '').toLowerCase().trim();
  return clubList().filter(function (c) { return !q || c.n.toLowerCase().indexOf(q) > -1; }).map(function (c) {
    return '<button class="mpclub' + (club && club.id === c.id ? ' sel' : '') + '" data-club="' + c.id + '">' + LAB.crest(c, 22) + '<span>' + esc(c.n) + '</span></button>';
  }).join('') || '<div style="grid-column:1/3;text-align:center;color:var(--sub);font-size:12.5px;padding:12px">Nenhum clube encontrado 😕</div>';
}

function paint() {
  if (!ROOT) return;
  var dc = dayCounter();
  ROOT.innerHTML =
  '<div class="uchero" style="margin-bottom:14px">👔<h2 style="font-size:22px;font-weight:900;letter-spacing:.5px">MANAGER PHOTO LAB</h2>' +
    '<div class="dt" style="color:var(--sub);font-size:12.5px;margin-top:3px;font-weight:700">Tua foto vira TREINADOR OFICIAL do clube · saída 260×310 p/ FM</div></div>' +

  /* 1 · FOTO */
  '<div class="mpcard"><h3>📷 1 · Sua foto</h3>' +
    '<div class="mpup" id="mpUp"><div class="ic">📸</div><div style="font-weight:900;margin-top:6px">Toca pra enviar a foto</div><div style="font-size:11.5px;color:var(--sub);margin-top:3px">JPG ou PNG · a foto original NÃO é alterada</div></div>' +
    '<input type="file" id="mpFile" accept="image/jpeg,image/jpg,image/png" style="display:none">' +
    '<img class="mpprev" id="mpPrev" alt="Prévia da foto enviada">' +
    '<div class="mptips">💡 Funciona melhor com: <b>rosto visível</b> · de frente ou levemente de lado · cabeça + parte de cima do corpo · boa luz</div>' +
  '</div>' +

  /* 2 · CLUBE */
  '<div class="mpcard"><h3>🏟️ 2 · Clube da comissão</h3>' +
    (club ? '<div class="mpsel">' + LAB.crest(club, 30) + '<div><div>' + esc(club.n) + '</div>' +
      '<div style="display:flex;gap:5px;margin-top:3px"><i style="width:15px;height:15px;border-radius:50%;background:' + club.c1 + ';border:1px solid #ffffff33;display:block"></i><i style="width:15px;height:15px;border-radius:50%;background:' + club.c2 + ';border:1px solid #ffffff33;display:block"></i></div></div>' +
      '<button class="mpbtn ghost mini" id="mpClubChg" style="flex:none;margin-left:auto">Trocar</button></div>' : '') +
    (club ? '' : '<input class="ucinp" id="mpQ" style="width:100%;margin-bottom:8px" placeholder="🔎 Pesquisar clube...">' +
    '<div class="mpgrid" id="mpGrid">' + gridHTML('') + '</div>') +
  '</div>' +

  /* 3 · FUNÇÃO */
  '<div class="mpcard"><h3>👔 3 · Função</h3><div class="mpops" id="mpRoles">' +
    ROLES.map(function (r) { return '<button class="mpop' + (role === r.id ? ' sel' : '') + '" data-role="' + r.id + '">' + r.ic + ' ' + r.n + '</button>'; }).join('') +
  '</div></div>' +

  /* 4 · ROUPA */
  '<div class="mpcard"><h3>🧥 4 · Estilo da roupa</h3><div class="mpops" id="mpStyles">' +
    STYLES.map(function (s) { return '<button class="mpop' + (style === s.id ? ' sel' : '') + '" data-style="' + s.id + '">' + s.ic + ' ' + s.n + '</button>'; }).join('') +
  '</div></div>' +

  /* 5 · FUNDO */
  '<div class="mpcard"><h3>🖼️ 5 · Fundo</h3><div class="mpops" id="mpBg">' +
    '<button class="mpop' + (bg === 'neutro' ? ' sel' : '') + '" data-bg="neutro">🌑 Neutro (padrão FM)</button>' +
    '<button class="mpop' + (bg === 'clube' ? ' sel' : '') + '" data-bg="clube">🏟️ Clima do clube</button>' +
  '</div></div>' +

  /* 6 · GERAR */
  '<button class="mpbtn" id="mpGo" ' + (busy ? 'disabled' : '') + '>✨ GERAR TREINADOR</button>' +
  '<div class="mppriv">🔒 Tua foto vai UMA VEZ pro servidor da IA gerar a imagem e não fica salva, não é publicada nem vai pro teu perfil. ' +
    'Hoje neste aparelho: <b>' + dc.n + '/' + DAILY_LIMIT + '</b> gerações usadas.</div>' +
  '<div id="mpStage"></div>' +

  /* 7 · RESULTADO */
  '<div id="mpResult"></div>';

  /* re-render não pode perder a foto já carregada */
  if (photo.orig) {
    var pv = $('mpPrev');
    if (pv) { pv.src = photo.orig; pv.style.display = 'block'; }
    var up = $('mpUp');
    if (up) {
      var lbl = up.querySelector('div:nth-child(2)');
      if (lbl) lbl.innerHTML = '✅ Foto carregada! <span style="color:var(--sub);font-weight:700">(toca pra trocar)</span>';
    }
  }

  bind();
}

function paintResult() {
  var box = $('mpResult'); if (!box) return;
  if (!gen.url) { box.innerHTML = ''; return; }
  box.innerHTML =
  '<div class="mpcard" style="margin-top:14px;border-color:var(--neon2)"><h3 style="text-align:center">🏆 TEU TREINADOR TÁ PRONTO!</h3>' +
    '<div class="mpframe" id="mpFrame" style="width:' + VIEW_W + 'px;height:' + VIEW_H + 'px"></div>' +
    '<div class="mpratio">📐 ' + OUT_W + ' × ' + OUT_H + ' — proporção oficial do FM</div>' +
    '<div class="mpzoom" id="mpZoomRow" style="display:' + (crop.on ? 'flex' : 'none') + '">🔍 <input type="range" id="mpZoom" min="100" max="320" value="' + Math.round(crop.z * 100) + '"></div>' +
    '<div class="mpmeta">' +
      '<i>🏟️ ' + esc(club ? club.n : '—') + '</i><i>' + roleOf(role).ic + ' ' + roleOf(role).n + '</i>' +
      '<i>' + styleOf(style).ic + ' ' + styleOf(style).n + '</i><i>🖼️ PNG</i>' +
    '</div>' +
    '<div class="mprow">' +
      '<button class="mpbtn ghost mini" id="mpAgain">🔄 Gerar novamente</button>' +
      '<button class="mpbtn ghost mini" id="mpCrop">' + (crop.on ? '✅ Aplicar enquadramento' : '✂️ Ajustar enquadramento') + '</button>' +
    '</div>' +
    '<div class="mprow">' +
      '<button class="mpbtn ghost mini" id="mpBgSw">🖼️ Fundo: ' + (bg === 'neutro' ? 'neutro' : 'clube') + '</button>' +
      '<button class="mpbtn mini" id="mpDl">⬇️ Exportar PNG (260×310)</button>' +
    '</div></div>';
  bindResult();
}

/* ---------- interações ---------- */
function bind() {
  $('mpUp').addEventListener('click', function () { $('mpFile').click(); });
  $('mpFile').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    if (!/^image\/(jpeg|jpg|png)$/.test(f.type)) { alert('Aceito só JPG e PNG! 😅'); return; }
    prepPhoto(f).then(function (p) {
      photo = p; gen.url = null;
      var pv = $('mpPrev'); pv.src = p.orig; pv.style.display = 'block';
      $('mpUp').querySelector('div:nth-child(2)').innerHTML = '✅ Foto carregada! <span style="color:var(--sub);font-weight:700">(toca pra trocar)</span>';
      paintResult();
    }).catch(function () { alert('Não consegui ler essa foto 😕 tenta outra!'); });
  });
  var q = $('mpQ');
  if (q) q.addEventListener('input', function () { $('mpGrid').innerHTML = gridHTML(this.value); bindGrid(); });
  bindGrid();
  var chg = $('mpClubChg');
  if (chg) chg.addEventListener('click', function () { club = null; paint(); });
  document.querySelectorAll('#mpRoles .mpop').forEach(function (b) {
    b.addEventListener('click', function () { role = b.dataset.role; paint(); paintResult(); });
  });
  document.querySelectorAll('#mpStyles .mpop').forEach(function (b) {
    b.addEventListener('click', function () { style = b.dataset.style; paint(); paintResult(); });
  });
  document.querySelectorAll('#mpBg .mpop').forEach(function (b) {
    b.addEventListener('click', function () { bg = b.dataset.bg; paint(); paintResult(); });
  });
  $('mpGo').addEventListener('click', generate);
}
function bindGrid() {
  document.querySelectorAll('#mpGrid .mpclub').forEach(function (b) {
    b.addEventListener('click', function () {
      var list = clubList();
      for (var i = 0; i < list.length; i++) if (list[i].id === b.dataset.club) { club = list[i]; break; }
      paint(); paintResult();
    });
  });
}

/* ---------- geração ---------- */
var STAGE_MSGS = ['🧠 Preparando seu Manager...', '🎨 Aplicando identidade do clube...', '📐 Finalizando imagem para FM...'];
var stageTimer = null, stageIx = 0;
function stageStart() {
  stageIx = 0;
  $('mpStage').innerHTML = '<div class="mpstatus">' + STAGE_MSGS[0] + '</div>';
  stageTimer = setInterval(function () {
    stageIx = (stageIx + 1) % STAGE_MSGS.length;
    var s = $('mpStage'); if (s) s.innerHTML = '<div class="mpstatus">' + STAGE_MSGS[stageIx] + '</div>';
  }, 3200);
}
function stageStop() { clearInterval(stageTimer); var s = $('mpStage'); if (s) s.innerHTML = ''; }

function generate() {
  if (busy) return;
  if (!photo.send) { alert('Primeiro envia tua foto 📷 (passo 1)!'); return; }
  if (!club) { alert('Escolhe o clube 🏟️ (passo 2)!'); return; }
  var dc = dayCounter();
  if (dc.n >= DAILY_LIMIT) { alert('Limite de hoje nesse aparelho (' + DAILY_LIMIT + ') 😴 amanhã libera de novo!'); return; }
  if (!sb) { alert('Sistema ainda inicializando… tenta de novo em 2 segundinhos!'); return; }

  busy = true; var btn = $('mpGo'); btn.disabled = true; btn.textContent = '⏳ GERANDO...';
  stageStart();

  sb.functions.invoke('manager-photo', {
    body: { image: photo.send, clubName: club.n, c1: club.c1, c2: club.c2, role: role, style: style, bg: bg }
  }).then(function (r) {
    stageStop(); busy = false;
    btn.disabled = false; btn.textContent = '✨ GERAR TREINADOR';
    if (r.error) {
      var m = (r.data && r.data.error) || r.error.message || 'erro desconhecido';
      $('mpStage').innerHTML = '<div class="mperr">😵 Deu ruim na geração:<br><b>' + esc(m) + '</b></div>';
      return;
    }
    if (!r.data || !r.data.image) {
      $('mpStage').innerHTML = '<div class="mperr">😵 A IA não devolveu imagem. Repete o pedido!</div>';
      return;
    }
    dc.n++; bumpCounter(dc);
    gen.url = r.data.image;
    gen.title = 'manager_' + club.id;
    crop = { on: false, x: 0, y: 0, z: 1 };
    paint(); paintResult();
    /* rola até o resultado */
    var el = $('mpResult'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }).catch(function (e) {
    stageStop(); busy = false;
    btn.disabled = false; btn.textContent = '✨ GERAR TREINADOR';
    $('mpStage').innerHTML = '<div class="mperr">😵 Falhou: ' + esc(e && e.message ? e.message : 'erro de rede') + '<br>Verifica a internet e tenta de novo.</div>';
  });
}

/* ---------- enquadramento (drag + zoom sobre a moldura 260×310) ---------- */
var imEl = null;
function bindResult() {
  var fr = $('mpFrame'); if (!fr || !gen.url) return;
  imEl = new Image();
  imEl.onload = function () {
    /* verta a imagem CENTRALIZADA por padrão (cabeça no meio do retrato) */
    if (crop.z === 1 && crop.x === 0 && crop.y === 0) {
      var s = coverScale();
      crop.x = (VIEW_W - imEl.naturalWidth * s) / 2;
      crop.y = (VIEW_H - imEl.naturalHeight * s) / 2;
    }
    clampCrop(); applyCrop();
  };
  imEl.src = gen.url;
  fr.appendChild(imEl);

  /* drag */
  var sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
  fr.addEventListener('pointerdown', function (e) {
    if (!crop.on) return;
    drag = true; sx = e.clientX; sy = e.clientY; ox = crop.x; oy = crop.y;
    fr.setPointerCapture(e.pointerId);
  });
  fr.addEventListener('pointermove', function (e) {
    if (!drag || !crop.on) return;
    crop.x = ox + (e.clientX - sx); crop.y = oy + (e.clientY - sy);
    clampCrop(); applyCrop();
  });
  fr.addEventListener('pointerup', function () { drag = false; });
  fr.addEventListener('pointercancel', function () { drag = false; });

  var zm = $('mpZoom');
  if (zm) zm.addEventListener('input', function () { crop.z = this.value / 100; clampCrop(); applyCrop(); });

  $('mpAgain').addEventListener('click', function () {
    crop = { on: false, x: 0, y: 0, z: 1 }; generate();
  });
  $('mpCrop').addEventListener('click', function () {
    crop.on = !crop.on;
    $('mpZoomRow').style.display = crop.on ? 'flex' : 'none';
    this.textContent = crop.on ? '✅ Aplicar enquadramento' : '✂️ Ajustar enquadramento';
  });
  $('mpBgSw').addEventListener('click', function () {
    bg = (bg === 'neutro') ? 'clube' : 'neutro';
    paint(); paintResult();
    crop = { on: false, x: 0, y: 0, z: 1 }; generate();
  });
  $('mpDl').addEventListener('click', exportPNG);
}

function coverScale() {
  if (!imEl || !imEl.naturalWidth) return 1;
  return Math.max(VIEW_W / imEl.naturalWidth, VIEW_H / imEl.naturalHeight);
}
function clampCrop() {
  if (!imEl || !imEl.naturalWidth) return;
  var s = coverScale() * crop.z;
  var w = imEl.naturalWidth * s, h = imEl.naturalHeight * s;
  crop.x = Math.min(0, Math.max(crop.x, VIEW_W - w));
  crop.y = Math.min(0, Math.max(crop.y, VIEW_H - h));
}
function applyCrop() {
  if (!imEl || !imEl.naturalWidth) return;
  var s = coverScale() * crop.z;
  imEl.style.transform = 'translate(' + crop.x + 'px,' + crop.y + 'px) scale(' + s + ')';
}
function placeCrop() { clampCrop(); applyCrop(); }

/* ---------- export PNG 260×310 ---------- */
function exportPNG() {
  if (!imEl || !imEl.naturalWidth || !gen.url) return;
  var k = OUT_W / VIEW_W;                 /* tela → 260px */
  var s = coverScale() * crop.z * k;
  var cv = document.createElement('canvas'); cv.width = OUT_W; cv.height = OUT_H;
  var cx = cv.getContext('2d');
  cx.fillStyle = '#11151d'; cx.fillRect(0, 0, OUT_W, OUT_H);
  cx.drawImage(imEl, crop.x * k, crop.y * k, imEl.naturalWidth * s, imEl.naturalHeight * s);
  var a = document.createElement('a');
  a.download = (gen.title || 'manager') + '.png';
  a.href = cv.toDataURL('image/png');
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- boot ---------- */
function bootPage() {
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  ROOT.innerHTML = '<div style="text-align:center;color:var(--sub);padding:30px 10px">⏳ Preparando o ateliê do treinador…</div>';
  LAB.auth.ready().then(function () {
    sb = window.LAB.sb || null;
    if (!window.labBackendOk || !window.labBackendOk() || !sb) {
      ROOT.innerHTML = '<div style="text-align:center;color:var(--sub);padding:26px 10px;line-height:1.7">🔧 O Manager Photo Lab tá sendo ligado pelo dono do site.<br>Volta já!</div>';
      return;
    }
    paint();
  });
}
function boot() {
  ROOT = $('mpRoot');
  if (ROOT) bootPage();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

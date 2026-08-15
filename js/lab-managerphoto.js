/* ============================================================
   👔 FM TOUCH LAB — MANAGER PHOTO LAB
   Foto própria → treinador de futebol com IA (identidade preservada).
   IA roda SÓ no backend (Edge Function do Supabase) — chave nunca aqui!
   Export: 260×310 PNG (padrão Football Manager).

   Integração com o sistema de clubes existente:
   - a fonte oficial do clube é LAB.getClub();
   - o escudo visual é sempre produzido por LAB.crest();
   - não existe uma segunda base nem uma segunda URL de escudos;
   - se o escudo externo não permitir canvas, a exportação usa monograma.
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
var club = null;                            /* SEMPRE o objeto retornado por LAB.getClub() */
var role = 'manager', style = 'oficial', bg = 'neutro';
var gen = { url: null, title: '' };         /* resultado da IA */
var busy = false;
var crop = { on: false, x: 0, y: 0, z: 1 }; /* enquadramento manual */
var ROOT = null;
var clubWatchTimer = null;
var imEl = null;
var crestCanvasAsset = { clubId: '', image: null, ready: false, token: 0 };

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
'.mpclubempty{display:flex;align-items:center;gap:10px;background:#0d1526;border:1.5px dashed var(--line);border-radius:12px;padding:12px 11px;margin-bottom:2px}' +
'.mpclubempty .mpclubemptytext{flex:1;min-width:0}' +
'.mpclubempty .mpclubemptytext strong{display:block;color:var(--txt);font-size:13.5px}' +
'.mpclubempty .mpclubemptytext span{display:block;color:var(--sub);font-size:11.5px;line-height:1.4;margin-top:3px}' +
'.mpbtn{background:var(--neon);color:#04160c;border:none;border-radius:12px;padding:13px 16px;font-size:15px;font-weight:900;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px}' +
'.mpbtn:disabled{opacity:.55;cursor:wait}' +
'.mpbtn.ghost{background:var(--card);border:1px solid var(--line);color:var(--txt);font-weight:800}' +
'.mpbtn.mini{padding:9px 11px;font-size:12.5px;border-radius:10px;width:auto;flex:1}' +
'.mpstatus{text-align:center;font-size:13.5px;font-weight:800;color:var(--neon2);padding:10px 4px;animation:mpblink 1.2s infinite}' +
'@keyframes mpblink{50%{opacity:.45}}' +
'.mperr{background:#2b1218;border:1px solid var(--bad);color:#ffd7dc;border-radius:12px;padding:11px 12px;font-size:13px;line-height:1.5;margin-top:8px}' +
'.mpframe{position:relative;overflow:hidden;border-radius:14px;border:1.5px solid var(--neon2);margin:0 auto;touch-action:none;background:repeating-conic-gradient(#10182a 0% 25%,#0b1322 0% 50%) 0 0/20px 20px;user-select:none}' +
'.mpframe>img{position:absolute;z-index:1;transform-origin:0 0;max-width:none;-webkit-user-drag:none}' +
'.mpcrest-overlay{position:absolute;z-index:5;right:15%;top:61%;width:52px;height:52px;padding:4px;display:flex;align-items:center;justify-content:center;pointer-events:none;border-radius:34%;background:linear-gradient(145deg,var(--mpc1,#2eff8f),var(--mpc2,#111827));border:1px solid #ffffff80;box-shadow:0 3px 12px #000b,0 0 0 2px #0005}' +
'.mpcrest-overlay:after{content:"";position:absolute;inset:3px;border-radius:29%;border:1px solid #ffffff44;pointer-events:none}' +
'.mpcrest-overlay .lbcrest{position:relative;z-index:1;width:42px!important;height:42px!important;border:1px solid #ffffff70;box-shadow:0 1px 4px #0007}' +
'.mpcrest-overlay .lbcrest img{position:relative;width:78%;height:78%;max-width:none;object-fit:contain}' +
'.mpcrest-overlay .lbcrest .cbg{position:absolute}' +
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
function clubKey(c) { return c && c.id ? String(c.id) : ''; }
function safeColor(v, fallback) { return /^#[0-9a-f]{6}$/i.test(v || '') ? v : fallback; }
function getLabClub() {
  try { return typeof LAB.getClub === 'function' ? LAB.getClub() : null; } catch (e) { return null; }
}
function resetGenerated() {
  gen.url = null;
  gen.title = '';
  crop = { on: false, x: 0, y: 0, z: 1 };
  imEl = null;
  crestCanvasAsset = { clubId: '', image: null, ready: false, token: crestCanvasAsset.token + 1 };
}
function syncClubFromLab(redraw) {
  var next = getLabClub();
  if (clubKey(next) === clubKey(club)) return false;
  club = next;
  /* resultado antigo não pode continuar identificado como o clube novo */
  resetGenerated();
  if (redraw && ROOT && !busy) { paint(); paintResult(); }
  return true;
}

/*
   LAB.crest() é a única fonte do escudo. Como a API existente devolve o HTML
   pronto, estes helpers apenas leem as URLs que a própria LAB.crest() gerou;
   nenhuma URL é inventada aqui.
*/
function crestSources(c) {
  var out = { primary: '', fallback: '' };
  if (!c || typeof LAB.crest !== 'function') return out;
  try {
    var holder = document.createElement('div');
    holder.innerHTML = LAB.crest(c, 48);
    var img = holder.querySelector('img');
    if (!img) return out;
    out.primary = img.getAttribute('src') || img.src || '';
    var handler = img.getAttribute('onerror') || '';
    var match = handler.match(/this\.src\s*=\s*'([^']+)'/);
    if (match) out.fallback = match[1];
  } catch (e) {}
  return out;
}
function crestMarkup(c, size, extra) {
  if (!c || typeof LAB.crest !== 'function') return '';
  try { return LAB.crest(c, size, extra || ''); } catch (e) { return ''; }
}
function initials(c) {
  var words = (c && c.n ? c.n : '').replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean);
  return ((words[0] || '?').charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();
}
function openClubPicker() {
  if (typeof LAB.openClubPicker !== 'function') {
    alert('O seletor oficial de clubes ainda está carregando. Tenta novamente em um instante.');
    return;
  }
  LAB.openClubPicker(function () {
    /* LAB.setClub() já salvou o clube; a leitura oficial continua sendo LAB.getClub(). */
    syncClubFromLab(true);
  });
}
function startClubWatcher() {
  if (clubWatchTimer) return;
  clubWatchTimer = setInterval(function () {
    if (ROOT) syncClubFromLab(true);
  }, 500);
  if (window.addEventListener) {
    window.addEventListener('storage', function (e) {
      if (!e || e.key === 'fmtl.club') syncClubFromLab(true);
    });
    window.addEventListener('focus', function () { syncClubFromLab(true); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) syncClubFromLab(true);
    });
  }
}

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
function clubPanelHTML() {
  if (club) {
    return '<div class="mpsel">' + crestMarkup(club, 30) + '<div style="min-width:0"><div>' + esc(club.n) + '</div>' +
      '<div style="display:flex;gap:5px;margin-top:3px"><i style="width:15px;height:15px;border-radius:50%;background:' + safeColor(club.c1, '#2eff8f') + ';border:1px solid #ffffff33;display:block"></i><i style="width:15px;height:15px;border-radius:50%;background:' + safeColor(club.c2, '#f2f2f2') + ';border:1px solid #ffffff33;display:block"></i></div></div>' +
      '<button class="mpbtn ghost mini" id="mpClubChg" style="flex:none;margin-left:auto">Trocar</button></div>';
  }
  return '<div class="mpclubempty"><div class="mpclubemptytext"><strong>Nenhum clube selecionado</strong><span>Opcional: sem clube também dá para gerar a foto normalmente.</span></div><button class="mpbtn ghost mini" id="mpClubPick" style="flex:none">Escolher</button></div>';
}
function paint() {
  if (!ROOT) return;
  syncClubFromLab(false);
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

  /* 2 · CLUBE — usa o mesmo seletor do sistema principal */
  '<div class="mpcard"><h3>🏟️ 2 · Meu Clube</h3>' +
    clubPanelHTML() +
    '<div style="font-size:11.5px;color:var(--sub);line-height:1.45;margin-top:7px">A seleção é compartilhada com o Meu Clube do Lab e atualiza na hora.</div>' +
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
  if (!gen.url) { box.innerHTML = ''; crestCanvasAsset = { clubId: '', image: null, ready: false, token: crestCanvasAsset.token + 1 }; return; }
  var badge = club ?
    '<div class="mpcrest-overlay" id="mpCrestOverlay" aria-label="Escudo de ' + esc(club.n) + '" style="--mpc1:' + safeColor(club.c1, '#2eff8f') + ';--mpc2:' + safeColor(club.c2, '#111827') + '">' + crestMarkup(club, 42, ' mp-result-crest') + '</div>' : '';
  box.innerHTML =
  '<div class="mpcard" style="margin-top:14px;border-color:var(--neon2)"><h3 style="text-align:center">🏆 TEU TREINADOR TÁ PRONTO!</h3>' +
    '<div class="mpframe" id="mpFrame" style="width:' + VIEW_W + 'px;height:' + VIEW_H + 'px">' + badge + '</div>' +
    '<div class="mpratio">📐 ' + OUT_W + ' × ' + OUT_H + ' — proporção oficial do FM' + (club ? ' · escudo real do clube' : '') + '</div>' +
    '<div class="mpzoom" id="mpZoomRow" style="display:' + (crop.on ? 'flex' : 'none') + '">🔍 <input type="range" id="mpZoom" min="100" max="320" value="' + Math.round(crop.z * 100) + '"></div>' +
    '<div class="mpmeta">' +
      '<i>🏟️ ' + esc(club ? club.n : 'Sem clube') + '</i><i>' + roleOf(role).ic + ' ' + roleOf(role).n + '</i>' +
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
  var up = $('mpUp');
  var fileInput = $('mpFile');
  if (up && fileInput) {
    up.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      if (!/^image\/(jpeg|jpg|png)$/.test(f.type)) { alert('Aceito só JPG e PNG! 😅'); return; }
      prepPhoto(f).then(function (p) {
        photo = p; gen.url = null; gen.title = '';
        var pv = $('mpPrev'); if (pv) { pv.src = p.orig; pv.style.display = 'block'; }
        var label = $('mpUp') && $('mpUp').querySelector('div:nth-child(2)');
        if (label) label.innerHTML = '✅ Foto carregada! <span style="color:var(--sub);font-weight:700">(toca pra trocar)</span>';
        paintResult();
      }).catch(function () { alert('Não consegui ler essa foto 😕 tenta outra!'); });
    });
  }

  var chg = $('mpClubChg');
  if (chg) chg.addEventListener('click', openClubPicker);
  var pick = $('mpClubPick');
  if (pick) pick.addEventListener('click', openClubPicker);

  document.querySelectorAll('#mpRoles .mpop').forEach(function (b) {
    b.addEventListener('click', function () { role = b.dataset.role; paint(); paintResult(); });
  });
  document.querySelectorAll('#mpStyles .mpop').forEach(function (b) {
    b.addEventListener('click', function () { style = b.dataset.style; paint(); paintResult(); });
  });
  document.querySelectorAll('#mpBg .mpop').forEach(function (b) {
    b.addEventListener('click', function () { bg = b.dataset.bg; paint(); paintResult(); });
  });
  var go = $('mpGo');
  if (go) go.addEventListener('click', generate);
}

/* ---------- geração ---------- */
var STAGE_MSGS = ['🧠 Preparando seu Manager...', '🎨 Aplicando identidade do clube...', '📐 Finalizando imagem para FM...'];
var stageTimer = null, stageIx = 0;
function stageStart() {
  var stage = $('mpStage');
  if (!stage) return;
  stageIx = 0;
  stage.innerHTML = '<div class="mpstatus">' + STAGE_MSGS[0] + '</div>';
  stageTimer = setInterval(function () {
    stageIx = (stageIx + 1) % STAGE_MSGS.length;
    var s = $('mpStage'); if (s) s.innerHTML = '<div class="mpstatus">' + STAGE_MSGS[stageIx] + '</div>';
  }, 3200);
}
function stageStop() { clearInterval(stageTimer); var s = $('mpStage'); if (s) s.innerHTML = ''; }
function clubPayload(c) {
  var src = c ? crestSources(c) : { primary: '' };
  var c1 = c ? safeColor(c.c1, '') : '';
  var c2 = c ? safeColor(c.c2, '') : '';
  return {
    image: photo.send,
     /* campos novos, com os nomes solicitados */
    clubId: c ? c.id : null,
    clubName: c ? c.n : '',
    crestUrl: c ? (src.primary || '') : '',
    clubColor1: c1,
    clubColor2: c2,
    /* aliases antigos: mantêm compatibilidade com qualquer backend/cache antigo */
    c1: c1,
    c2: c2,
    role: role,
    style: style,
    bg: bg
  };
}
function showGenerationError(m) {
  var stage = $('mpStage');
  if (stage) stage.innerHTML = '<div class="mperr">😵 Deu ruim na geração:<br><b>' + esc(m || 'erro desconhecido') + '</b><br><span style="font-size:11.5px;opacity:.8">Tenta de novo — se repetir, fala com o chefe no Update Center 📰</span></div>';
}
function generate() {
  if (busy) return;
  if (!photo.send) { alert('Primeiro envia tua foto 📷 (passo 1)!'); return; }
  /* clube é opcional: sem seleção a IA continua funcionando sem escudo */
  syncClubFromLab(false);
  var requestClub = club;
  var requestClubId = clubKey(requestClub);
  var dc = dayCounter();
  if (dc.n >= DAILY_LIMIT) { alert('Limite de hoje nesse aparelho (' + DAILY_LIMIT + ') 😴 amanhã libera de novo!'); return; }
  if (!sb) { alert('Sistema ainda inicializando… tenta de novo em 2 segundinhos!'); return; }

  busy = true;
  var btn = $('mpGo');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ GERANDO...'; }
  stageStart();

  sb.functions.invoke('super-worker', {
    body: clubPayload(requestClub)
  }).then(function (r) {
    stageStop();
    busy = false;
    if (btn) { btn.disabled = false; btn.textContent = '✨ GERAR TREINADOR'; }

    /* Se o usuário trocou de clube durante a IA, não etiqueta a imagem velha com o novo clube. */
    var liveClub = getLabClub();
    if (clubKey(liveClub) !== requestClubId) club = liveClub;
    if (clubKey(club) !== requestClubId) {
      resetGenerated();
      paint(); paintResult();
      return;
    }

    if (r.error) {
      if (r.data && r.data.error) { showGenerationError(r.data.error); return; }
      /* erro HTTP genérico: tenta ler a MENSAGEM REAL do corpo da resposta */
      if (r.error && r.error.context && r.error.context.json) {
        r.error.context.json()
          .then(function (t) { showGenerationError((t && t.error) || r.error.message); })
          .catch(function () { showGenerationError(r.error.message); });
        return;
      }
      showGenerationError(r.error && r.error.message); return;
    }
    if (!r.data || !r.data.image) {
      var stage = $('mpStage');
      if (stage) stage.innerHTML = '<div class="mperr">😵 A IA não devolveu imagem. Repete o pedido!</div>';
      return;
    }
    dc.n++; bumpCounter(dc);
    gen.url = r.data.image;
    gen.title = 'manager' + (requestClub ? '_' + requestClub.id : '');
           crop = { on: false, x: 0, y: 0, z: 1 };
    paint(); paintResult();
    /* rola até o resultado */
    var el = $('mpResult'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }).catch(function (e) {
    stageStop(); busy = false;
    if (btn) { btn.disabled = false; btn.textContent = '✨ GERAR TREINADOR'; }
    var stage = $('mpStage');
    if (stage) stage.innerHTML = '<div class="mperr">😵 Falhou: ' + esc(e && e.message ? e.message : 'erro de rede') + '<br>Verifica a internet e tenta de novo.</div>';
  });
}

/* ---------- escudo para exportação ---------- */
function prepareCrestForCanvas(c) {
  var token = crestCanvasAsset.token + 1;
  crestCanvasAsset = { clubId: clubKey(c), image: null, ready: false, token: token };
  if (!c) return;
  var sources = crestSources(c);
  if (!sources.primary) return;
  var img = new Image();
  var triedFallback = false;
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    if (crestCanvasAsset.token !== token) return;
    crestCanvasAsset.image = img;
    crestCanvasAsset.ready = true;
  };
  img.onerror = function () {
    if (!triedFallback && sources.fallback) {
      triedFallback = true;
      img.src = sources.fallback;
      return;
    }
    if (crestCanvasAsset.token === token) {
      crestCanvasAsset.image = null;
      crestCanvasAsset.ready = false;
    }
  };
  img.src = sources.primary;
}

/* ---------- enquadramento (drag + zoom sobre a moldura 260×310) ---------- */
function bindResult() {
  var fr = $('mpFrame'); if (!fr || !gen.url) return;
  prepareCrestForCanvas(club);

  imEl = new Image();
  imEl.crossOrigin = 'anonymous';
  imEl.onload = function () {
    /* centraliza a imagem por padrão */
    if (crop.z === 1 && crop.x === 0 && crop.y === 0) {
      var s = coverScale();
      crop.x = (VIEW_W - imEl.naturalWidth * s) / 2;
      crop.y = (VIEW_H - imEl.naturalHeight * s) / 2;
    }
    clampCrop(); applyCrop();
  };
  imEl.onerror = function () {
    /* backend normalmente devolve data URL; este aviso evita imagem quebrada se uma integração antiga devolver URL inválida */
    var stage = $('mpStage');
    if (stage) stage.innerHTML = '<div class="mperr">😵 A imagem do resultado não pôde ser carregada. Tenta gerar novamente.</div>';
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

  var again = $('mpAgain');
  if (again) again.addEventListener('click', function () {
    crop = { on: false, x: 0, y: 0, z: 1 }; generate();
  });
     var cropBtn = $('mpCrop');
  if (cropBtn) cropBtn.addEventListener('click', function () {
    crop.on = !crop.on;
    var row = $('mpZoomRow'); if (row) row.style.display = crop.on ? 'flex' : 'none';
    this.textContent = crop.on ? '✅ Aplicar enquadramento' : '✂️ Ajustar enquadramento';
  });
  var bgSw = $('mpBgSw');
  if (bgSw) bgSw.addEventListener('click', function () {
    bg = (bg === 'neutro') ? 'clube' : 'neutro';
    paint(); paintResult();
    crop = { on: false, x: 0, y: 0, z: 1 }; generate();
  });
  var dl = $('mpDl');
  if (dl) dl.addEventListener('click', exportPNG);
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

/* ---------- desenho seguro do escudo/fallback no canvas ---------- */
function roundedPath(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
function crestExportBox() {
  var overlay = $('mpCrestOverlay'), frame = $('mpFrame');
  if (!overlay || !frame || !club) return null;
  var fr = frame.getBoundingClientRect();
  var b = overlay.getBoundingClientRect();
  var k = OUT_W / VIEW_W;
  return { x: (b.left - fr.left) * k, y: (b.top - fr.top) * k, w: b.width * k, h: b.height * k };
}
function drawCrestOnCanvas(ctx, c, box) {
  if (!c || !box) return;
  var c1 = safeColor(c.c1, '#2eff8f');
  var c2 = safeColor(c.c2, '#111827');
  var radius = Math.min(box.w, box.h) * .26;
  ctx.save();
  roundedPath(ctx, box.x, box.y, box.w, box.h, radius);
  var grad = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.50)'; ctx.lineWidth = Math.max(1, box.w * .018); ctx.stroke();

  var inset = Math.max(4, box.w * .11);
  var ix = box.x + inset, iy = box.y + inset, iw = box.w - inset * 2, ih = box.h - inset * 2;
  roundedPath(ctx, ix, iy, iw, ih, radius * .78);
  ctx.fillStyle = '#f4f6f9'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.stroke();

  var drawn = false;
  if (crestCanvasAsset.clubId === clubKey(c) && crestCanvasAsset.ready && crestCanvasAsset.image) {
    try {
      ctx.drawImage(crestCanvasAsset.image, ix + iw * .11, iy + ih * .11, iw * .78, ih * .78);
      drawn = true;
    } catch (e) { drawn = false; }
  }
  if (!drawn) {
    ctx.fillStyle = c1;
    ctx.font = '900 ' + Math.max(10, Math.round(Math.min(iw, ih) * .34)) + 'px Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(initials(c), ix + iw / 2, iy + ih / 2);
  }
  ctx.restore();
}
function drawExportFallback(ctx, c) {
  ctx.fillStyle = '#11151d'; ctx.fillRect(0, 0, OUT_W, OUT_H);
  ctx.strokeStyle = safeColor(c && c.c1, '#2eff8f'); ctx.lineWidth = 2; ctx.strokeRect(9, 9, OUT_W - 18, OUT_H - 18);
  ctx.fillStyle = '#dce6f3'; ctx.font = '900 15px Arial, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('MANAGER PHOTO', OUT_W / 2, OUT_H / 2 - 10);
  ctx.fillStyle = '#8fa0b8'; ctx.font = '12px Arial, sans-serif';
  ctx.fillText('imagem indisponível para canvas', OUT_W / 2, OUT_H / 2 + 12);
}

/* ---------- export PNG 260×310 ---------- */
function exportPNG() {
  if (!imEl || !imEl.naturalWidth || !gen.url) return;
  var k = OUT_W / VIEW_W;
  var s = coverScale() * crop.z * k;
  var cv = document.createElement('canvas'); cv.width = OUT_W; cv.height = OUT_H;
  var cx = cv.getContext('2d');
  var mainDrawn = true;
  cx.fillStyle = '#11151d'; cx.fillRect(0, 0, OUT_W, OUT_H);
  try {
    cx.drawImage(imEl, crop.x * k, crop.y * k, imEl.naturalWidth * s, imEl.naturalHeight * s);
  } catch (e) {
    mainDrawn = false;
    drawExportFallback(cx, club);
  }
  if (club) drawCrestOnCanvas(cx, club, crestExportBox());

  var href = '';
  try { href = cv.toDataURL('image/png'); } catch (e) {
    /* origem sem CORS: gera um PNG limpo de fallback para o botão nunca quebrar */
    var clean = document.createElement('canvas'); clean.width = OUT_W; clean.height = OUT_H;
    var cleanCx = clean.getContext('2d');
    drawExportFallback(cleanCx, club);
    if (club) drawCrestOnCanvas(cleanCx, club, { x: OUT_W - 68, y: 22, w: 48, h: 48 });
    try { href = clean.toDataURL('image/png'); } catch (ignore) { href = ''; }
  }
  if (!href) { alert('Não consegui preparar o PNG agora. Tenta novamente.'); return; }
  var a = document.createElement('a');
  a.download = (gen.title || 'manager') + '.png';
  a.href = href;
  document.body.appendChild(a); a.click(); a.remove();
  /* evita lint/alerta de variável não usada em browsers antigos */
  if (!mainDrawn) { /* fallback já foi exportado */ }
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
    club = getLabClub();
    paint();
    startClubWatcher();
  }).catch(function () {
    ROOT.innerHTML = '<div style="text-align:center;color:var(--sub);padding:26px 10px;line-height:1.7">🔧 Não consegui inicializar o Manager Photo Lab agora.<br>Atualiza a página e tenta novamente.</div>';
  });
}
function boot() {
                                       ROOT = $('mpRoot');
  if (ROOT) bootPage();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

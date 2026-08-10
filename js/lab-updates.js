/* ============================================================
   📰 FM TOUCH LAB — MÓDULO UPDATE CENTER
   Público: lista, filtra ⭐ Meus clubes / 🌎 Todos, pesquisa, imagens
   Admin (is_admin no banco — sem credencial no JS): criar/editar/
   excluir updates, itens e imagens.
   Visitante: funciona 100% sem conta (favoritos no navegador).
   ============================================================ */
(function () {
window.LAB = window.LAB || {};
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ---------- CATEGORIAS (futuro: adicionar aqui) ---------- */
var CATS = [
  { id: 'transferencias', n: 'Transferências', ic: '🔄' },
  { id: 'jogadores',      n: 'Jogadores',      ic: '👤' },
  { id: 'clubes',         n: 'Clubes',         ic: '🛡️' },
  { id: 'competicoes',    n: 'Competições',    ic: '🏆' },
  { id: 'atributos',      n: 'Atributos',      ic: '📊' },
  { id: 'outros',         n: 'Outros',         ic: '📝' }
];
function catOf(id) {
  for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i];
  return CATS[CATS.length - 1];
}
function clubById(id) {
  if (!id || !LAB.CLUBES) return null;
  for (var i = 0; i < LAB.CLUBES.length; i++) if (LAB.CLUBES[i].id === id) return LAB.CLUBES[i];
  return null;
}

/* ---------- clubes: achar por texto + fallback p/ clube fora da base ---------- */
function squish(s) { return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); }
/* casa um nome digitado com a base — ex: "boca" → Boca Juniors (com escudo) */
function matchClub(q) {
  var s = squish(q);
  if (!s) return null;
  var list = LAB.CLUBES || [], i, c, n;
  for (i = 0; i < list.length; i++) { c = list[i]; if (squish(c.n) === s || squish(c.id) === s) return c; }
  for (i = 0; i < list.length; i++) { c = list[i]; n = squish(c.n);
    if ((s.length >= 3 && n.indexOf(s) > -1) || (n.length >= 3 && s.indexOf(n) > -1)) return c; }
  return null;
}
/* resolve O QUE ESTIVER SALVO: id da base → texto que bate com a base → texto cru (🏳️) */
function anyClub(v) {
  if (!v) return null;
  var c = clubById(v) || matchClub(v);
  return { c: c, n: c ? c.n : v };
}
function sideHTML(v, cls) {
  var a = anyClub(v);
  if (!a) return '<span class="utliv">💼 livre</span>';
  if (!a.c) return '<span class="utside ' + cls + '" style="opacity:.85">🏳️ ' + esc(a.n) + '</span>';
  return '<span class="utside ' + cls + '">' + LAB.crest(a.c, 22) + '<span style="overflow:hidden;text-overflow:ellipsis">' + esc(a.n) + '</span></span>';
}
/* "Enner valência ➡️ boca" · "Filip jorgensen ex Chelsea ➡️ Strasbourg" → {jog,org,dst} */
var ARROW = /\s*(?:➡️|➡|→|↦|›|»|->|=>|—>)\s*/;
function parseTransferLine(ln) {
  ln = (ln || '').trim();
  if (!ln) return null;
  var parts = ln.split(ARROW);
  if (parts.length < 2) return null;
  var dst = (parts[parts.length - 1] || '').trim();
  var left = parts.slice(0, parts.length - 1).join(' ').trim();
  if (!dst || !left) return null;
  var jog = left, org = null, m = left.match(/^(.*?)\s+ex\s+(.+)$/i);
  if (m) { jog = m[1].trim(); org = m[2].trim(); }
  return { jog: jog, org: org, dst: dst };
}

/* ---------- FAVORITOS (⭐ Meus clubes) ---------- */
function favsLocalGet() { try { var a = JSON.parse(localStorage.getItem('fmtl.favclubes') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function favsLocalSet(a) { try { localStorage.setItem('fmtl.favclubes', JSON.stringify(a)); } catch (e) {} }
function favIdsOfProfile(p) {
  var f = p && p.fav_clubes;
  if (typeof f === 'string') { try { f = JSON.parse(f); } catch (e) { return []; } }
  return Array.isArray(f) ? f : [];
}

/* ---------- estado da página ---------- */
var sb = null, me = null, prof = null, isAdmin = false;
var editions = [], ed = null, items = [];         /* ed = edição atual */
var favs = [];                                     /* ids resolvidos (perfil ou local) */
var ui = { mode: 'all', q: '', cat: 'all' };       /* filtros */
var ROOT = null;                                   /* #ucRoot quando existir */

/* ---------- CSS próprio (auto-injetado) ---------- */
var CSS = '' +
'.ucov{position:fixed;inset:0;background:#060b14ee;z-index:600;display:none;align-items:flex-start;justify-content:center;padding:18px 14px;overflow-y:auto}' +
'.ucov.on{display:flex}' +
'.uccard{width:100%;max-width:430px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px 16px;margin:auto;position:relative}' +
'.uclb{position:fixed;inset:0;background:#05080fd9;z-index:700;display:none;align-items:center;justify-content:center;padding:22px;cursor:pointer}' +
'.uclb.on{display:flex}' +
'.uclb img{max-width:100%;max-height:82vh;border-radius:14px;border:1px solid #ffffff2e;object-fit:contain;background:#000}' +
'.ucnew{background:var(--bad);color:#fff;font-size:9px;font-weight:900;border-radius:8px;padding:2px 6px;margin-left:6px;vertical-align:2px;letter-spacing:.5px}' +
'.uchero{position:relative;text-align:center;border-radius:20px;overflow:hidden;padding:20px 14px 14px;border:1px solid #ffb64855;background:radial-gradient(300px 120px at 50% -20%,#ffb64826,transparent 60%),linear-gradient(165deg,#141a2c,#0e1526)}' +
'.uchero h2{font-size:24px;font-weight:900;letter-spacing:.6px}' +
'.uchero .dt{color:var(--sub);font-size:12.5px;margin-top:3px;font-weight:700}' +
'.ucstats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}' +
'.ucstat{background:#060a12b8;border:1px solid #ffffff1c;border-radius:12px;padding:8px 4px;text-align:center}' +
'.ucstat b{display:block;font-size:17px}' +
'.ucstat span{font-size:9.5px;font-weight:800;letter-spacing:.8px;color:#ffffffb0}' +
'.ucseg{display:flex;gap:8px;margin:14px 0 10px}' +
'.ucseg button{flex:1;background:var(--card);border:1.5px solid var(--line);color:var(--sub);border-radius:12px;padding:11px 6px;font-size:13px;font-weight:800;cursor:pointer}' +
'.ucseg button.sel{border-color:var(--neon);color:var(--txt);background:#2eff8f10}' +
'.ucbar{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}' +
'.ucinp{flex:1;min-width:170px;background:#0d1526;border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:12px 14px;font-size:15px}' +
'.ucinp:focus{outline:none;border-color:var(--neon)}' +
'.ucfav{background:#0d1526;border:1.5px solid var(--warn);color:var(--warn);border-radius:12px;padding:11px 13px;font-size:13px;font-weight:900;cursor:pointer;white-space:nowrap}' +
'.ucfavchips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}' +
'.ucfavchip{display:inline-flex;align-items:center;gap:6px;background:#0d1526;border:1px solid var(--line);border-radius:99px;padding:5px 11px 5px 6px;font-size:12px;font-weight:800}' +
'.ucfavchip .lbcrest{width:18px;height:18px;border:none}' +
'.uccats{display:flex;gap:7px;overflow-x:auto;padding-bottom:8px;margin-bottom:6px;-webkit-overflow-scrolling:touch}' +
'.uccatb{flex:none;background:#0d1526;border:1.5px solid var(--line);color:var(--sub);border-radius:99px;padding:8px 13px;font-size:12.5px;font-weight:800;cursor:pointer;white-space:nowrap}' +
'.uccatb.sel{border-color:var(--neon);color:var(--txt);background:#2eff8f0e}' +
'.ucard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 13px;margin-bottom:11px;animation:ucin .25s ease}' +
'@keyframes ucin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
'.uchead{display:flex;align-items:center;gap:8px;margin-bottom:7px;flex-wrap:wrap}' +
'.ucbadge{font-size:10px;font-weight:900;letter-spacing:.8px;border:1px solid var(--neon2);color:var(--neon2);border-radius:99px;padding:3px 9px}' +
'.ucclub{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;background:#0d1526;border:1px solid var(--line);border-radius:99px;padding:4px 10px 4px 5px}' +
'.ucclub .lbcrest{width:18px;height:18px;border:none}' +
'.ucname{font-size:15.5px;font-weight:900;line-height:1.35}' +
'.ucdesc{font-size:13px;color:var(--sub);margin-top:4px;line-height:1.55}' +
'.ucjog{font-size:12px;color:var(--warn);font-weight:800;margin-top:5px}' +
'.ucfoot{font-size:11px;color:var(--sub);margin-top:9px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
'.ucthumb{margin-top:9px;max-height:150px;width:100%;object-fit:cover;border-radius:12px;border:1px solid var(--line);cursor:pointer;display:block;background:#000}' +
'.uadm{margin-left:auto;display:flex;gap:6px}' +
'.uadm button{background:#ffffff0d;border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:5px 9px;font-size:13px;cursor:pointer}' +
'.ucempty{text-align:center;color:var(--sub);font-size:13.5px;padding:26px 10px;line-height:1.7}' +
'.ucbtn{background:var(--neon);color:#04160c;border:none;border-radius:12px;padding:12px 16px;font-size:14px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;justify-content:center}' +
'.ucbtn.ghost{background:var(--card);border:1px solid var(--line);color:var(--txt);font-weight:800}' +
'.ucbtn.mini{padding:8px 12px;font-size:12.5px;border-radius:10px}' +
'.ucf{margin-bottom:12px}' +
'.uclab{display:block;font-size:12px;color:var(--sub);font-weight:800;margin:0 2px 6px;letter-spacing:.4px}' +
'.ucsel{width:100%;background:#0d1526;border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:12px;font-size:15px}' +
'.ucta{width:100%;background:#0d1526;border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:12px;font-size:14px;font-family:inherit;min-height:80px}' +
'.ucprev{margin-top:8px;max-height:120px;border-radius:10px;border:1px solid var(--line);display:none}' +
'.ucgrid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:260px;overflow-y:auto;padding-right:2px;margin-bottom:12px}' +
'.ucopt{display:flex;align-items:center;gap:8px;background:#0d1526;border:1.5px solid var(--line);border-radius:11px;padding:8px 9px;cursor:pointer;font-size:12.5px;font-weight:700;text-align:left;color:var(--txt)}' +
'.ucopt.sel{border-color:var(--warn);background:#ffb64814}' +
'.ucopt .lbcrest{width:20px;height:20px;border:none}' +
/* 🛬 faixa de transferência (origem ➡ destino) */
'.utp{font-size:18px;font-weight:900;letter-spacing:.3px;margin:2px 0 10px;line-height:1.2}' +
'.utband{display:flex;align-items:center;gap:9px;flex-wrap:wrap}' +
'.utside{display:inline-flex;align-items:center;gap:7px;background:#0d1526;border:1.5px solid var(--line);border-radius:99px;padding:6px 12px 6px 7px;font-size:13px;font-weight:800;max-width:150px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
'.utside .lbcrest{width:22px;height:22px;border:none;flex:none}' +
'.utside.dst{border-color:var(--neon);background:#2eff8f12;box-shadow:0 0 14px #2eff8f1f}' +
'.utarrow{color:var(--neon);font-size:16px;font-weight:900;letter-spacing:1px}' +
'.utliv{color:var(--sub);font-size:12px;font-weight:800;border:1.5px dashed var(--line);border-radius:99px;padding:6px 12px}' +
'.ucbulk{width:100%;background:#0d1526;border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:12px;font-size:14px;font-family:inherit;min-height:150px}' +
'.ucblrow{display:flex;align-items:center;gap:6px;font-size:12.5px;padding:7px 4px;border-bottom:1px dashed #ffffff14;flex-wrap:wrap}' +
'.ucblrow .lbcrest{width:18px;height:18px;border:none}';

/* ---------- overlays (favoritos + lightbox) ---------- */
function ensureOverlays() {
  if ($('ucFavOv')) return;
  var d = document.createElement('div');
  d.innerHTML =
    '<div class="ucov" id="ucFavOv"><div class="uccard">' +
      '<button class="mclose" id="ucFavClose">✕</button>' +
      '<h3 style="text-align:center;margin-bottom:4px">⭐ Meus clubes</h3>' +
      '<p style="text-align:center;color:var(--sub);font-size:12.5px;margin-bottom:12px">Escolha os clubes que você quer acompanhar no Update Center</p>' +
      '<input class="ucinp" id="ucFavSearch" style="width:100%;margin-bottom:10px" placeholder="🔎 Pesquisar clube...">' +
      '<div class="ucgrid2" id="ucFavGrid"></div>' +
      '<button class="ucbtn" id="ucFavSave" style="width:100%">SALVAR CLUBES</button>' +
    '</div></div>' +
    '<div class="uclb" id="ucLight"><img id="ucLightImg" alt="Print ampliado"></div>';
  while (d.firstChild) document.body.appendChild(d.firstChild);
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  $('ucLight').addEventListener('click', function () { this.classList.remove('on'); });
  $('ucFavClose').addEventListener('click', function () { $('ucFavOv').classList.remove('on'); });
  $('ucFavSearch').addEventListener('input', function () { favGrid(this.value); });
  $('ucFavSave').addEventListener('click', function () {
    var sel = [];
    document.querySelectorAll('#ucFavGrid .ucopt.sel').forEach(function (b) { sel.push(b.dataset.cid); });
    setFavs(sel);
    $('ucFavOv').classList.remove('on');
  });
}
var favTmp = [];
function favGrid(q) {
  q = (q || '').toLowerCase().trim();
  var list = (LAB.CLUBES || []).filter(function (c) { return !q || c.n.toLowerCase().indexOf(q) > -1; });
  $('ucFavGrid').innerHTML = list.map(function (c) {
    return '<button class="ucopt' + (favTmp.indexOf(c.id) > -1 ? ' sel' : '') + '" data-cid="' + c.id + '">' + LAB.crest(c, 20) + '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.n + '</span></button>';
  }).join('');
  document.querySelectorAll('#ucFavGrid .ucopt').forEach(function (b) {
    b.addEventListener('click', function () {
      b.classList.toggle('sel');
      var i = favTmp.indexOf(b.dataset.cid);
      if (b.classList.contains('sel')) { if (i < 0) favTmp.push(b.dataset.cid); }
      else if (i > -1) favTmp.splice(i, 1);
    });
  });
}
function openFavPicker() {
  ensureOverlays();
  favTmp = favs.slice();
  $('ucFavSearch').value = '';
  favGrid('');
  $('ucFavOv').classList.add('on');
}
function setFavs(sel) {
  favs = sel.slice();
  favsLocalSet(favs);
  if (me) { sb.from('profiles').update({ fav_clubes: favs }).eq('id', me.id).then(function () { paint(); }); }
  paint(true);
}
function lightbox(url) {
  ensureOverlays();
  $('ucLightImg').src = url;
  $('ucLight').classList.add('on');
}

/* ---------- estatísticas automáticas ---------- */
function updStats(list) {
  var clubs = {}, jogadores = {}, trans = 0;
  list.forEach(function (it) {
    if (it.club_id) clubs[it.club_id] = 1;
    if (it.clube_origem) clubs[it.clube_origem] = 1;
    if (it.jogador) jogadores[it.jogador.toLowerCase()] = 1;
    if (it.categoria === 'transferencias') trans++;
  });
  return { n: list.length, clubes: Object.keys(clubs).length, jogadores: Object.keys(jogadores).length, trans: trans };
}
function matchesQ(it, q) {
  if (!q) return true;
  var c = anyClub(it.club_id), o = anyClub(it.clube_origem), cat = catOf(it.categoria);
  var hay = ((it.titulo || '') + ' ' + (it.descricao || '') + ' ' + (it.jogador || '') + ' ' + (c ? c.n : '') + ' ' + (o ? o.n : '') + ' ' + cat.n).toLowerCase();
  return hay.indexOf(q.toLowerCase()) > -1;
}
function filtered() {
  return items.filter(function (it) {
    if (ui.mode === 'mine' && favs.indexOf(it.club_id) < 0 && favs.indexOf(it.clube_origem) < 0) return false;
    if (ui.cat !== 'all' && it.categoria !== ui.cat) return false;
    return matchesQ(it, ui.q);
  });
}

/* ---------- render ---------- */
function heroHTML(s) {
  if (!ed) {
    /* sem edição cadastrada ainda — página tem que abrir mesmo assim! */
    return '<div class="uchero">📰<h2>UPDATE CENTER</h2>' +
      '<div class="dt">' + (isAdmin ? 'Nenhuma edição criada ainda — cria o primeiro update ali embaixo (🆕)! 👇' : 'O chefe tá preparando o primeiro update. 🌱 Volta já!') + '</div></div>';
  }
  var dt = new Date(ed.publicado + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  return '<div class="uchero">🔥<h2>UPDATE ' + ed.numero + '</h2>' +
    '<div class="dt">Última atualização · ' + dt + '</div>' +
    '<div class="ucstats">' +
      '<div class="ucstat"><b>' + s.n + '</b><span>📝 ALTERAÇÕES</span></div>' +
      '<div class="ucstat"><b>' + s.clubes + '</b><span>🛡️ CLUBES</span></div>' +
      '<div class="ucstat"><b>' + s.trans + '</b><span>🔄 TRANSF.</span></div>' +
    '</div></div>';
}
function itemAdminBtns(it) {
  return isAdmin ? '<div class="uadm" style="margin-top:8px"><button data-uedit="' + it.id + '">✏️ editar</button><button data-udel="' + it.id + '">🗑</button></div>' : '';
}
function itemThumb(it) {
  return it.imagem ? '<img class="ucthumb" data-img="' + esc(it.imagem) + '" src="' + esc(it.imagem) + '" loading="lazy" alt="Print da alteração">' : '';
}
/* 🔄 card especial de transferência: JOGADOR + faixa origem ➡ destino */
function itemTransHTML(it, cat) {
  var dst = anyClub(it.club_id);
  return '<div class="ucard">' +
    '<div class="uchead"><span class="ucbadge">' + cat.ic + ' ' + cat.n.toUpperCase() + '</span></div>' +
    '<div class="utp">👤 ' + esc(it.jogador || it.titulo) + '</div>' +
    '<div class="utband">' + sideHTML(it.clube_origem, '') +
      '<span class="utarrow">➡</span>' +
      (dst ? sideHTML(it.club_id, 'dst') : '<span class="utliv">❓ sem destino</span>') + '</div>' +
    (it.descricao ? '<div class="ucdesc">' + esc(it.descricao) + '</div>' : '') +
    itemThumb(it) +
    '<div class="ucfoot">🗞️ Update ' + ed.numero + ' · mercado da bola 🔁</div>' +
    itemAdminBtns(it) +
  '</div>';
}
function itemHTML(it) {
  var cat = catOf(it.categoria), c = clubById(it.club_id);
  if (it.categoria === 'transferencias') return itemTransHTML(it, cat);
  return '<div class="ucard">' +
    '<div class="uchead"><span class="ucbadge">' + cat.ic + ' ' + cat.n.toUpperCase() + '</span>' +
    (c ? '<span class="ucclub">' + LAB.crest(c, 18) + esc(c.n) + '</span>' : '') + '</div>' +
    '<div class="ucname">' + esc(it.titulo) + '</div>' +
    (it.descricao ? '<div class="ucdesc">' + esc(it.descricao) + '</div>' : '') +
    (it.jogador ? '<div class="ucjog">👤 ' + esc(it.jogador) + '</div>' : '') +
    itemThumb(it) +
    '<div class="ucfoot">🗞️ Update ' + ed.numero + '</div>' +
    itemAdminBtns(it) +
  '</div>';
}
function listHTML() {
  var list = filtered();
  if (!ed) return ''; /* sem edição: o herói já explica tudo */
  if (!items.length) {
    return isAdmin ?
      '<div class="ucempty">O Update ' + ed.numero + ' ainda não tem alterações cadastradas.<br>Cadastra a primeira ali embaixo! 👇</div>' :
      '<div class="ucempty">O chefe tá montando o Update ' + ed.numero + ' agora mesmo. 🌱<br>Volta daqui a pouco pra conferir as novidades!</div>';
  }
  if (!list.length) return '<div class="ucempty">Nada encontrado com esses filtros. 🔍<br>Tenta "🌎 Todos os clubes" ou limpa a pesquisa!</div>';
  return list.map(itemHTML).join('');
}
function favAreaHTML() {
  if (!favs.length) return '';
  return '<div class="ucfavchips">' + favs.map(function (id) {
    var c = clubById(id);
    return c ? '<span class="ucfavchip">' + LAB.crest(c, 18) + esc(c.n) + '</span>' : '';
  }).join('') + '</div>' +
  '<div style="font-size:11.5px;color:var(--sub);margin-bottom:10px">Você acompanha <b style="color:var(--warn)">' + favs.length + ' clube' + (favs.length > 1 ? 's' : '') + '</b></div>';
}
function adminHTML() {
  if (!isAdmin) return '';
  return '<div style="background:var(--card);border:1.5px dashed var(--warn);border-radius:16px;padding:14px;margin-top:16px">' +
    '<div style="font-size:12px;font-weight:900;color:var(--warn);letter-spacing:1px;margin-bottom:10px">👑 ÁREA DO ADMIN</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="ucbtn mini" id="ucAddItem">+ Nova alteração</button>' +
      '<button class="ucbtn mini ghost" id="ucBulk">⚡ Colar lista</button>' +
      '<button class="ucbtn mini ghost" id="ucNewEd">🆕 Novo update (edição)</button>' +
    '</div></div>';
}
function paint(keepScroll) {
  if (!ROOT) return;
  var sy = window.pageYOffset;
  var s = updStats(items);
  ROOT.innerHTML =
    (s.n || items.length ? heroHTML(s) : heroHTML(s)) +
    '<div class="ucseg">' +
      '<button id="ucModeMine" class="' + (ui.mode === 'mine' ? 'sel' : '') + '">⭐ Meus clubes</button>' +
      '<button id="ucModeAll" class="' + (ui.mode === 'all' ? 'sel' : '') + '">🌎 Todos os clubes</button></div>' +
    '<div class="ucbar"><input class="ucinp" id="ucQ" value="' + esc(ui.q) + '" placeholder="🔎 Pesquisar alteração...">' +
      '<button class="ucfav" id="ucFavBtn">⭐ MEUS CLUBES (' + favs.length + ')</button></div>' +
    favAreaHTML() +
    '<div class="uccats">' + '<button class="uccatb' + (ui.cat === 'all' ? ' sel' : '') + '" data-cat="all">TODOS</button>' +
      CATS.map(function (c) { return '<button class="uccatb' + (ui.cat === c.id ? ' sel' : '') + '" data-cat="' + c.id + '">' + c.ic + ' ' + c.n.toUpperCase() + '</button>'; }).join('') + '</div>' +
    '<div id="ucList">' + listHTML() + '</div>' +
    adminHTML();
  bindPublic();
  if (isAdmin) bindAdmin();
  if (keepScroll) window.scrollTo(0, sy);
}
function bindPublic() {
  $('ucModeMine').addEventListener('click', function () { ui.mode = 'mine'; paint(true); });
  $('ucModeAll').addEventListener('click', function () { ui.mode = 'all'; paint(true); });
  $('ucQ').addEventListener('input', function () { ui.q = this.value; paint(true); var q = $('ucQ'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); });
  $('ucFavBtn').addEventListener('click', openFavPicker);
  document.querySelectorAll('.uccatb').forEach(function (b) {
    b.addEventListener('click', function () { ui.cat = b.dataset.cat; paint(true); });
  });
  document.querySelectorAll('.ucthumb').forEach(function (im) {
    im.addEventListener('click', function () { lightbox(im.dataset.img); });
  });
}

/* ---------- ADMIN: formulário de alteração ---------- */
var editId = null;
function itemModal(it) {
  var o = $('ucItemOv'); if (o) o.remove();
  editId = it ? it.id : null;
  var d = document.createElement('div');
  d.innerHTML =
    '<div class="ucov on" id="ucItemOv"><div class="uccard">' +
      '<button class="mclose" id="ucItemClose">✕</button>' +
      '<h3 style="margin-bottom:12px">' + (it ? '✏️ Editar alteração' : '➕ Nova alteração') + ' — Update ' + ed.numero + '</h3>' +
      '<div class="ucf"><label class="uclab">CATEGORIA</label><select class="ucsel" id="aiCat">' +
        CATS.map(function (c) { return '<option value="' + c.id + '"' + (it && it.categoria === c.id ? ' selected' : '') + '>' + c.ic + ' ' + c.n + '</option>'; }).join('') + '</select></div>' +
      /* 🔄 modo transferência: origem ➡ destino com prévia ao vivo */
      '<div class="ucf tronly" style="display:none"><label class="uclab">🛫 CLUBE DE ORIGEM (ex — opcional)</label><select class="ucsel" id="aiOrg"><option value="">— livre / não informado —</option>' +
        (LAB.CLUBES || []).map(function (c) { return '<option value="' + c.id + '"' + (it && it.clube_origem === c.id ? ' selected' : '') + '>' + c.n + '</option>'; }).join('') + '</select></div>' +
      '<div class="ucf"><label class="uclab" id="aiClubLab">CLUBE RELACIONADO</label><select class="ucsel" id="aiClub"><option value="">— nenhum —</option>' +
        (LAB.CLUBES || []).map(function (c) { return '<option value="' + c.id + '"' + (it && it.club_id === c.id ? ' selected' : '') + '>' + c.n + '</option>'; }).join('') + '</select></div>' +
      '<div class="trprev"></div>' +
      '<div class="ucf"><label class="uclab">TÍTULO</label><input class="ucinp" id="aiTit" style="width:100%" maxlength="90" value="' + esc(it ? it.titulo : '') + '" placeholder="ex: Jogador X → Corinthians"></div>' +
      '<div class="ucf"><label class="uclab">JOGADOR (opcional)</label><input class="ucinp" id="aiJog" style="width:100%" maxlength="50" value="' + esc(it && it.jogador ? it.jogador : '') + '" placeholder="ex: Endrick"></div>' +
      '<div class="ucf"><label class="uclab">DESCRIÇÃO</label><textarea class="ucta" id="aiDesc" maxlength="400" placeholder="Detalhes da mudança...">' + esc(it ? it.descricao : '') + '</textarea></div>' +
      '<div class="ucf"><label class="uclab">ORDEM (menor aparece primeiro)</label><input class="ucinp" id="aiOrd" type="number" style="width:110px" value="' + (it ? it.ordem : 0) + '"></div>' +
      '<div class="ucf"><label class="uclab">IMAGEM / PRINT (opcional)</label><input class="ucinp" id="aiImg" type="file" accept="image/*" style="width:100%">' +
        '<img class="ucprev" id="aiPrev" alt="Prévia"></div>' +
      '<button class="ucbtn" id="aiSave" style="width:100%">' + (it ? '💾 Salvar alteração' : '🚀 Cadastrar alteração') + '</button>' +
    '</div></div>';
  while (d.firstChild) document.body.appendChild(d.firstChild);
  $('ucItemClose').addEventListener('click', function () { $('ucItemOv').remove(); });
  var prevUrl = it && it.imagem ? it.imagem : null;
  if (prevUrl) { $('aiPrev').src = prevUrl; $('aiPrev').style.display = 'block'; }
  $('aiImg').addEventListener('change', function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { $('aiPrev').src = r.result; $('aiPrev').style.display = 'block'; prevUrl = '__new__'; };
    r.readAsDataURL(f);
  });
  /* 🔄 modo transferência: mostra origem + prévia ao vivo */
  var ov2 = $('ucItemOv');
  function isTr() { return $('aiCat').value === 'transferencias'; }
  function clubSelName(sel) { return sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : ''; }
  function syncTransUI() {
    var tr = isTr();
    ov2.querySelectorAll('.tronly').forEach(function (el) { el.style.display = tr ? '' : 'none'; });
    $('aiClubLab').textContent = tr ? '📍 CLUBE DE DESTINO' : 'CLUBE RELACIONADO';
    $('aiTit').placeholder = tr ? 'vazio = monto sozinho: Jogador ➡ Destino' : 'ex: Jogador X → Corinthians';
    var pv = ov2.querySelector('.trprev');
    if (!tr) { pv.innerHTML = ''; return; }
    var jog = $('aiJog').value.trim(), org = $('aiOrg').value, dst = $('aiClub').value;
    pv.innerHTML = '<div class="uclab" style="margin:8px 2px 6px;color:var(--neon)">👀 PRÉVIA (é assim que aparece no site)</div>' +
      '<div style="background:#0d1526;border:1.5px dashed var(--line);border-radius:14px;padding:12px 11px">' +
        '<div class="utp" style="margin:0 0 8px">👤 ' + esc(jog || 'Nome do jogador') + '</div>' +
        '<div class="utband">' + sideHTML(org, '') + '<span class="utarrow">➡</span>' + (dst ? sideHTML(dst, 'dst') : '<span class="utliv">escolhe o destino 👇</span>') + '</div></div>';
  }
  $('aiCat').addEventListener('change', syncTransUI);
  $('aiOrg').addEventListener('change', syncTransUI);
  $('aiClub').addEventListener('change', syncTransUI);
  $('aiJog').addEventListener('input', syncTransUI);
  syncTransUI();

  $('aiSave').addEventListener('click', function () {
    var tr = isTr();
    var jog = $('aiJog').value.trim(), org = $('aiOrg').value || null, dst = $('aiClub').value || null;
    var tit = $('aiTit').value.trim();
    if (tr) {
      /* transferência: monta o título sozinho se estiver vazio; exige jogador + destino */
      if (!jog) { alert('Cadê o nome do jogador? 😄'); $('aiJog').focus(); return; }
      if (!dst) { alert('Escolhe o clube de DESTINO! 📍'); $('aiClub').focus(); return; }
      if (!tit) tit = jog + ' ➡ ' + clubSelName($('aiClub'));
    }
    if (tit.length < 3) { $('aiTit').focus(); return; }
    var b = this; b.disabled = true; b.textContent = '⏳ salvando…';
    saveImage(it).then(function (imgUrl) {
      var row = { edition: ed.id, categoria: $('aiCat').value, club_id: dst,
        clube_origem: tr ? org : null,
        titulo: tit, jogador: jog || null, descricao: $('aiDesc').value.trim(),
        ordem: parseInt($('aiOrd').value, 10) || 0, imagem: imgUrl };
      return saveItemRow(row, editId);
    }).then(function (r) {
      b.disabled = false;
      if (r.error) { alert('Erro ao salvar: ' + r.error.message); b.textContent = editId ? '💾 Salvar alteração' : '🚀 Cadastrar alteração'; return; }
      var ov = $('ucItemOv'); if (ov) ov.remove();
      loadData();
    }).catch(function (e) { b.disabled = false; b.textContent = editId ? '💾 Salvar alteração' : '🚀 Cadastrar alteração'; alert('Falhou: ' + (e && e.message ? e.message : e)); });
  });
}
/* grava item; se o banco ainda não tiver a coluna clube_origem (SQL v4), tenta de novo sem ela */
function saveItemRow(row, id) {
  var q = id ? sb.from('update_items').update(row).eq('id', id) : sb.from('update_items').insert(row);
  return q.then(function (r) {
    if (r.error && /clube_origem/i.test(r.error.message || '')) {
      delete row.clube_origem;
      return id ? sb.from('update_items').update(row).eq('id', id) : sb.from('update_items').insert(row);
    }
    return r;
  });
}
/* sobe imagem (reduz tamanho p/ celular) — devolve a URL pública */
function prepImage(file) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onerror = rej;
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1100, w = img.width, h = img.height;
        if (w > max) { h = Math.round(h * max / w); w = max; }
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        cv.toBlob(function (bl) { res(bl || file); }, 'image/jpeg', 0.84);
      };
      img.onerror = rej;
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
function saveImage(it) {
  var f = $('aiImg').files && $('aiImg').files[0];
  if (!f) return Promise.resolve(it ? it.imagem : null);
  if (f.size === 0) return Promise.resolve(it ? it.imagem : null);
  return prepImage(f).then(function (blob) {
    var path = 'img/upd' + ed.numero + '_' + Date.now() + '.jpg';
    return sb.storage.from('update-images').upload(path, blob, { contentType: 'image/jpeg', upsert: true })
      .then(function (r) {
        if (r.error) throw new Error('imagem: ' + r.error.message);
        return sb.storage.from('update-images').getPublicUrl(path).data.publicUrl;
      });
  });
}
function imgPathOf(url) {
  var m = (url || '').match(/\/update-images\/(.+)$/);
  return m ? m[1] : null;
}
/* ⚡ importar lista colada (uma transferência por linha, estilo WhatsApp) */
function bulkModal() {
  var o = $('ucBulkOv'); if (o) o.remove();
  var d = document.createElement('div');
  d.innerHTML =
    '<div class="ucov on" id="ucBulkOv"><div class="uccard">' +
      '<button class="mclose" id="ucBulkClose">✕</button>' +
      '<h3 style="margin-bottom:6px">⚡ Colar lista do mercado</h3>' +
      '<p style="color:var(--sub);font-size:12.5px;margin-bottom:10px;line-height:1.55">Uma por linha, igual tu manda no WhatsApp:<br>' +
      '<b style="color:var(--txt)">Enner Valencia ➡️ Boca Juniors</b><br>' +
      '<b style="color:var(--txt)">Filip Jorgensen ex Chelsea ➡️ Strasbourg</b><br>' +
      'O site acha o clube e monta o card bonito sozinho. 😉</p>' +
      '<textarea class="ucbulk" id="bkTxt" placeholder="Jogador ➡ Clube&#10;Jogador ex ClubeDeOrigem ➡ ClubeDeDestino&#10;..."></textarea>' +
      '<div class="uclab" style="margin:10px 2px 6px">👀 PRÉVIA</div>' +
      '<div id="bkPrev" style="max-height:220px;overflow-y:auto;background:#0d1526;border:1px solid var(--line);border-radius:12px;padding:4px 10px"></div>' +
      '<button class="ucbtn" id="bkSave" style="width:100%;margin-top:12px">🚀 Cadastrar tudo no Update ' + ed.numero + '</button>' +
    '</div></div>';
  while (d.firstChild) document.body.appendChild(d.firstChild);
  $('ucBulkClose').addEventListener('click', function () { $('ucBulkOv').remove(); });

  var rows = []; /* {jog, orgTxt, orgId, dstTxt, dstId} */
  function refresh() {
    var lines = ($('bkTxt').value || '').split('\n');
    rows = [];
    var html = lines.map(function (ln) {
      var t = parseTransferLine(ln);
      if (!t) return ln.trim() ? '<div class="ucblrow" style="color:var(--bad)">⚠️ não entendi: "' + esc(ln.trim()) + '"</div>' : '';
      var oc = t.org ? matchClub(t.org) : null, dc = matchClub(t.dst);
      rows.push({ jog: t.jog, orgTxt: t.org, orgId: oc ? oc.id : null, dstTxt: t.dst, dstId: dc ? dc.id : null });
      return '<div class="ucblrow"><b>' + esc(t.jog) + '</b>' +
        '<span style="color:var(--sub)">' + (oc ? LAB.crest(oc, 18) + ' ' + esc(oc.n) : (t.org ? '🏳️ ' + esc(t.org) : '💼')) + '</span>' +
        '<span class="utarrow">➡</span>' +
        (dc ? LAB.crest(dc, 18) + ' <b style="color:var(--neon)">' + esc(dc.n) + '</b>' : '<span style="color:var(--warn)">🏳️ ' + esc(t.dst) + ' (sem escudo)</span>') +
      '</div>';
    }).join('');
    $('bkPrev').innerHTML = html || '<div style="color:var(--sub);font-size:12.5px;padding:10px 2px">Cola a lista ali em cima 👆</div>';
  }
  $('bkTxt').addEventListener('input', refresh);
  refresh();

  $('bkSave').addEventListener('click', function () {
    if (!rows.length) { $('bkTxt').focus(); return; }
    var b = this; b.disabled = true; b.textContent = '⏳ cadastrando ' + rows.length + ' itens…';
    var base = items.length ? Math.max.apply(null, items.map(function (i) { return i.ordem || 0; })) : 0;
    var batch = rows.map(function (r, i) {
      /* clube fora da base? guarda o texto mesmo — o card mostra 🏳️ + nome */
      var dstV = r.dstId || r.dstTxt, orgV = r.orgId || r.orgTxt || null;
      return { edition: ed.id, categoria: 'transferencias',
        club_id: dstV, clube_origem: orgV,
        titulo: r.jog + ' ➡ ' + (r.dstId ? clubById(r.dstId).n : r.dstTxt),
        jogador: r.jog, descricao: '',
        ordem: base + i + 1, imagem: null };
    });
    sb.from('update_items').insert(batch).then(function (r) {
      if (r.error && /clube_origem/i.test(r.error.message || '')) { /* banco sem SQL v4 → tenta sem a coluna */
        batch.forEach(function (x) { delete x.clube_origem; });
        return sb.from('update_items').insert(batch);
      }
      return r;
    }).then(function (r) {
      b.disabled = false; b.textContent = '🚀 Cadastrar tudo';
      if (r.error) { alert('Erro: ' + r.error.message); return; }
      var ov = $('ucBulkOv'); if (ov) ov.remove();
      loadData();
    });
  });
}
function bindAdmin() {
  $('ucAddItem').addEventListener('click', function () {
    if (!ed) { alert('Primeiro cria o update (edição) com o botão 🆕 Novo update — aí cadastras as alterações nele!'); return; }
    itemModal(null);
  });
  $('ucBulk').addEventListener('click', function () {
    if (!ed) { alert('Primeiro cria o update (edição) com o botão 🆕 Novo update — aí colas a lista nele!'); return; }
    bulkModal();
  });
  $('ucNewEd').addEventListener('click', function () {
    var n = prompt('Número do NOVO update (ex: 27):', (ed ? ed.numero + 1 : 1));
    if (!n) return;
    var num = parseInt(n, 10); if (!num || num < 1) return;
    var dt = prompt('Data (AAAA-MM-DD — hoje = só apertar OK):', '');
    var row = { numero: num, titulo: 'Update ' + num };
    if (dt && /^\d{4}-\d{2}-\d{2}$/.test(dt)) row.publicado = dt;
    sb.from('update_editions').insert(row).then(function (r) {
      if (r.error) { alert('Erro: ' + r.error.message); return; }
      loadData();
    });
  });
  document.querySelectorAll('[data-uedit]').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = null;
      items.forEach(function (x) { if (String(x.id) === b.dataset.uedit) it = x; });
      if (it) itemModal(it);
    });
  });
  document.querySelectorAll('[data-udel]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!confirm('Apagar essa alteração do update?')) return;
      var it = null;
      items.forEach(function (x) { if (String(x.id) === b.dataset.udel) it = x; });
      sb.from('update_items').delete().eq('id', b.dataset.udel).then(function (r) {
        if (r.error) { alert('Erro: ' + r.error.message); return; }
        if (it && it.imagem) { var p = imgPathOf(it.imagem); if (p) sb.storage.from('update-images').remove([p]); }
        loadData();
      });
    });
  });
}

/* ---------- dados ---------- */
function loadData() {
  return sb.from('update_editions').select('*').order('numero', { ascending: false }).limit(1)
    .then(function (r) {
      editions = r.data || [];
      ed = editions[0] || null;
      if (ed) { try { localStorage.setItem('fmtl.uc_seen', String(ed.numero)); } catch (e) {} }
      if (!ed) { items = []; paint(); return; }
      return sb.from('update_items').select('*').eq('edition', ed.id)
        .order('ordem', { ascending: true }).order('criado', { ascending: false })
        .then(function (r2) { items = r2.data || []; paint(); });
    });
}

/* ---------- boot da página updates.html ---------- */
function bootPage() {
  ensureOverlays();
  ROOT.innerHTML = '<div class="ucempty">⏳ Carregando o Update Center…</div>';
  LAB.auth.ready().then(function () {
    sb = window.LAB.sb;
    if (!window.labBackendOk || !window.labBackendOk() || !sb) {
      ROOT.innerHTML = '<div class="ucempty">🔧 O Update Center tá sendo preparado pelo dono do site.<br>Volta já!</div>';
      return;
    }
    me = LAB.auth.user();
    var favPromise;
    if (me) {
      favPromise = sb.from('profiles').select('*').eq('id', me.id).maybeSingle().then(function (r) {
        prof = r.data || null;
        isAdmin = !!(prof && prof.is_admin);
        favs = prof ? favIdsOfProfile(prof) : [];
        if (!favs.length) favs = favsLocalGet();
      });
    } else {
      favs = favsLocalGet();
      favPromise = Promise.resolve();
    }
    favPromise.then(loadData).then(function () {
      /* sync: logado + perfil sem favs + local com favs → oferece sync */
      if (me && prof && !favIdsOfProfile(prof).length && favsLocalGet().length) {
        var b = document.createElement('div');
        b.className = 'ucard sync';
        b.innerHTML = '⭐ Você acompanha <b>' + favsLocalGet().length + ' clubes</b> nesse aparelho.<br>Quer salvar isso na tua conta pra valer em qualquer celular? ' +
          '<div style="margin-top:8px"><button class="ucbtn mini" id="ucSyncYes">✅ Sincronizar</button></div>';
        ROOT.insertBefore(b, ROOT.firstChild);
        var y = $('ucSyncYes');
        if (y) y.addEventListener('click', function () { setFavs(favsLocalGet()); b.remove(); });
      }
    });
  });
}

/* ---------- badge "🔴 NOVO" no menu da home (index.html) ---------- */
function badgeInit() {
  if (!document.querySelector('[data-go="updates"]')) return;
  if (!window.labBackendOk || !window.labBackendOk()) return;
  LAB.auth.ready().then(function () {
    var c = window.LAB.sb; if (!c) return;
    c.from('update_editions').select('numero').order('numero', { ascending: false }).limit(1)
      .then(function (r) {
        var n = r.data && r.data[0] && r.data[0].numero; if (!n) return;
        var seen = 0; try { seen = parseInt(localStorage.getItem('fmtl.uc_seen') || '0', 10) || 0; } catch (e) {}
        if (n <= seen) return;
        var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
        document.querySelectorAll('[data-go="updates"]').forEach(function (el) {
          if (el.querySelector('.ucnew')) return;
          var b = document.createElement('span'); b.className = 'ucnew'; b.textContent = 'NOVO';
          el.appendChild(b);
        });
      }).catch(function () {});
  }).catch(function () {});
}

/* ---------- API ---------- */
window.LAB.updates = {
  CATS: CATS, catOf: catOf, updStats: updStats, matchesQ: matchesQ,
  favsLocalGet: favsLocalGet, favsLocalSet: favsLocalSet, favIdsOfProfile: favIdsOfProfile,
  matchClub: matchClub, anyClub: anyClub, parseTransferLine: parseTransferLine, squish: squish
};
function boot() {
  ROOT = $('ucRoot');
  if (ROOT) bootPage();
  else badgeInit();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

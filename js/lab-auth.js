/* ============================================================
   👤 FM TOUCH LAB — MÓDULO DE AUTENTICAÇÃO & PERFIL
   Backend: Supabase (Auth real + Postgres + RLS).
   Sem backend configurado → modo visitante (tudo local).
   API:  LAB.auth.ready() · signIn(e,p) · signUp(e,p) · signOut()
         LAB.auth.user() · LAB.auth.profile() · LAB.auth.saveProfile(d)
   ============================================================ */
(function () {
window.LAB = window.LAB || {};
var sbP = null, sess = undefined;

function lib() {
  if (sbP) return sbP;
  sbP = new Promise(function (res) {
    if (!window.labBackendOk || !window.labBackendOk()) return res(null);
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = function () {
      try { window.LAB.sb = window.supabase.createClient(window.LABCFG.SUPABASE_URL, window.LABCFG.SUPABASE_ANON_KEY); res(window.LAB.sb); }
      catch (e) { res(null); }
    };
    s.onerror = function () { res(null); };
    document.head.appendChild(s);
  });
  return sbP;
}
function needSb() {
  return lib().then(function (sb) {
    if (!sb) throw { code: 'nobackend', message: 'Plataforma em preparação: o banco de dados ainda não foi configurado (js/lab-config.js).' };
    return sb;
  });
}

var auth = {
  backendOk: function () { return window.labBackendOk && window.labBackendOk(); },
  ready: function () {
    return lib().then(function (sb) {
      if (!sb) { sess = null; return null; }
      return sb.auth.getSession().then(function (r) {
        sess = (r && r.data && r.data.session) || null;
        if (sb.auth && sb.auth.onAuthStateChange) sb.auth.onAuthStateChange(function (_e, s2) { sess = s2; auth.refreshProfileUI && auth.refreshProfileUI(); });
        return sess;
      });
    });
  },
  user: function () { return sess && sess.user; },
  session: function () { return sess; },
  signIn: function (email, pw) {
    return needSb().then(function (sb) {
      return sb.auth.signInWithPassword({ email: email, password: pw }).then(function (r) {
        if (r.error) throw r.error;
        sess = r.data.session; return sess;
      });
    });
  },
  signUp: function (email, pw) {
    return needSb().then(function (sb) {
      return sb.auth.signUp({ email: email, password: pw }).then(function (r) {
        if (r.error) throw r.error;
        sess = r.data.session; /* null se confirmação de e-mail estiver ligada */
        return r.data;
      });
    });
  },
  signOut: function () {
    return needSb().then(function (sb) { return sb.auth.signOut().then(function () { sess = null; }); });
  },
  /* ---------- perfil ---------- */
  profile: function () {
    if (!sess || !sess.user) return Promise.resolve(null);
    return window.LAB.sb.from('profiles').select('*').eq('id', sess.user.id).maybeSingle()
      .then(function (r) { return r.data || null; });
  },
  profileByUsername: function (u) {
    return needSb().then(function (sb) {
      return sb.from('profiles').select('*').ilike('username', u).maybeSingle().then(function (r) {
        if (r.error) throw r.error; return r.data || null;
      });
    });
  },
  saveProfile: function (row) {
    return needSb().then(function (sb) {
      if (!sess || !sess.user) throw new Error('Sessão expirada — entra de novo.');
      row.id = sess.user.id;
      return sb.from('profiles').upsert(row, { onConflict: 'id' }).select().single().then(function (r) {
        if (r.error) throw r.error; return r.data;
      });
    });
  },
  usernameFree: function (u, ignoreId) {
    return needSb().then(function (sb) {
      var q = sb.from('profiles').select('id', { count: 'exact', head: true }).ilike('username', u);
      return q.then(function (r) {
        if (r.error) return true; /* falhou a checagem → deixa o banco validar */
        if (!r.count) return true;
        if (ignoreId) {
          return sb.from('profiles').select('id').ilike('username', u).then(function (r2) {
            return !!(r2.data && r2.data.length === 1 && r2.data[0].id === ignoreId);
          });
        }
        return false;
      });
    });
  },
  slugify: function (txt) {
    return (txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_{2,}/g, '_').slice(0, 20);
  }
};

/* ---------- cartão de login na página personal (visitor-aware) ---------- */
auth.refreshProfileUI = function () {
  var box = document.getElementById('pProfileBody');
  if (!box) return;
  var u = auth.user();
  if (!auth.backendOk()) {
    box.innerHTML = '<div style="color:var(--sub);font-size:13.5px;line-height:1.6">A plataforma de perfis tá sendo preparada pelo dono do site. 🔧<br>Por enquanto dá pra escolher teu clube e personalizar tudo localmente — sem cadastro! 🎨</div>';
    return;
  }
  if (!u) {
    box.innerHTML =
      '<div style="color:var(--sub);font-size:13.5px;line-height:1.6;margin-bottom:12px">Cria teu <b style="color:var(--txt)">Perfil de Manager</b>: nome de técnico, cartão estilo FM, tuas táticas ranqueadas e sincronização em qualquer celular. 🪪</div>' +
      '<a class="btn p" style="justify-content:center;display:flex" href="entrar.html">👤 Criar meu perfil / Entrar</a>';
    return;
  }
  box.innerHTML = '<div style="color:var(--sub);font-size:13px">⏳ Carregando teu perfil…</div>';
  auth.profile().then(function (p) {
    if (!p) {
      box.innerHTML = '<div style="color:var(--sub);font-size:13.5px;margin-bottom:10px">Conta criada! Falta montar teu cartão de manager. 🪪</div><a class="btn p" style="justify-content:center;display:flex" href="manager.html">Completar meu perfil →</a>';
      return;
    }
    var clubHtml = '';
    if (p.club_id && window.LAB.CLUBES) {
      var c = window.LAB.CLUBES.find(function (x) { return x.id === p.club_id; });
      if (c) clubHtml = window.LAB.crest(c, 32) + '<b style="margin-left:8px">' + p.club_nome + '</b>';
    }
    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;padding:4px 0 12px">' +
        '<div style="width:46px;height:46px;border-radius:50%;background:var(--neon);color:#04160c;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:19px">' + (p.nome || '?').charAt(0).toUpperCase() + '</div>' +
        '<div><div style="font-weight:900;font-size:16.5px">' + p.nome + '</div>' +
        '<div style="display:flex;align-items:center;font-size:13px;color:var(--sub)">' + clubHtml + '</div></div>' +
      '</div>' +
      '<a class="btn p" style="justify-content:center;display:flex;margin-bottom:8px" href="manager.html">🪪 Abrir meu Manager Card</a>' +
      '<button class="btn" style="width:100%;justify-content:center" id="pLogout">Sair da conta</button>';
    var lo = document.getElementById('pLogout');
    if (lo) lo.addEventListener('click', function () {
      auth.signOut().then(function () { auth.refreshProfileUI(); if (typeof toast === 'function') toast('👋 Saiu da conta — até logo, coach!'); });
    });
  });
};

window.LAB.auth = auth;
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-go="personal"]')) setTimeout(auth.refreshProfileUI, 60);
});
auth.ready().then(function () { auth.refreshProfileUI(); });
})();
        

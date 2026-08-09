/* ============================================================
   ⚙️ CONFIGURAÇÃO DA PLATAFORMA — FM TOUCH LAB
   ------------------------------------------------------------
   Siga o guia passo a passo no arquivo GUIA-PERFIL.md

   1) Crie o projeto grátis no Supabase
   2) Rode o script supabase-setup.sql no SQL Editor
   3) Cole aqui a URL e a ANON KEY do seu projeto

   👉 A "anon key" é PÚBLICA por natureza e SEGURA para sites:
      a proteção real é feita no banco via Row Level Security (RLS).
   ⛔ NUNCA cole aqui a "service_role key" — essa sim é secreta!
   ============================================================ */
window.LABCFG = {
  SUPABASE_URL: 'https://dpxcqfwcodcvujngebcy.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_SLWmdVUs36N-h6J41u_tZQ_cd4Upbdf'
};

/* não edite abaixo */
window.labBackendOk = function () {
  var c = window.LABCFG || {};
  var k = c.SUPABASE_ANON_KEY || '';
  /* 🚨 TRAVA DE SEGURANÇA: se alguém colar a SECRET key por engano, o site NÃO liga o backend */
  if (k.indexOf('sb_secret') === 0) {
    if (window.console && console.error) console.error('⛔ FM TOUCH LAB: você colou a CHAVE SECRETA no site! Apague e use a PUBLISHABLE key (sb_publishable_...). Gere uma secret nova no Supabase, essa vazou.');
    return false;
  }
  return !!(c.SUPABASE_URL && k.length > 40 &&
            /^https:\/\/.+\.supabase\.co/.test(c.SUPABASE_URL));
};

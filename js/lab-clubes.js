/* ============================================================
   🛡️ FM TOUCH LAB — MÓDULO CLUBES & PERSONALIZAÇÃO
   Funciona 100% local (visitante) — sem cadastro necessário.
   API:  LAB.CLUBES · LAB.getClub() · LAB.setClub(c|null)
         LAB.openClubPicker(cb) · LAB.crest(c,size) · LAB.fit(hex)
   ============================================================ */
(function () {
window.LAB = window.LAB || {};

/* ---------- BASE DE CLUBES (c1 = primária, c2 = secundária, d = domínio p/ escudo) ---------- */
var CLUBES = [
  /* 🇧🇷 Brasil */
  {id:'flamengo',n:'Flamengo',c1:'#c8102e',c2:'#0b0b0b',d:'flamengo.com.br'},
  {id:'palmeiras',n:'Palmeiras',c1:'#006437',c2:'#f2f2f2',d:'palmeiras.com.br'},
  {id:'corinthians',n:'Corinthians',c1:'#131313',c2:'#f2f2f2',d:'corinthians.com.br'},
  {id:'saopaulo',n:'São Paulo',c1:'#e21b23',c2:'#101010',d:'saopaulofc.net'},
  {id:'santos',n:'Santos',c1:'#141414',c2:'#f2f2f2',d:'santosfc.com.br'},
  {id:'gremio',n:'Grêmio',c1:'#0d80bf',c2:'#101010',d:'gremio.net'},
  {id:'inter-sc',n:'Internacional',c1:'#c8102e',c2:'#f2f2f2',d:'internacional.com.br'},
  {id:'atleticomg',n:'Atlético-MG',c1:'#141414',c2:'#f2f2f2',d:'atletico.com.br'},
  {id:'cruzeiro',n:'Cruzeiro',c1:'#003a94',c2:'#f2f2f2',d:'cruzeiro.com.br'},
  {id:'botafogo',n:'Botafogo',c1:'#141414',c2:'#f2f2f2',d:'botafogo.com.br'},
  {id:'fluminense',n:'Fluminense',c1:'#8e1130',c2:'#006437',d:'fluminense.com.br'},
  {id:'vasco',n:'Vasco',c1:'#141414',c2:'#f2f2f2',d:'vasco.com.br'},
  {id:'athleticopr',n:'Athletico-PR',c1:'#cc0000',c2:'#0a0a0a',d:'athletico.com.br'},
  {id:'bahia',n:'Bahia',c1:'#004a9f',c2:'#d00d25',d:'esporteclubebahia.com.br'},
  {id:'fortaleza',n:'Fortaleza',c1:'#0052a5',c2:'#e31837',d:'fortalezaec.net'},
  {id:'sport',n:'Sport',c1:'#c8102e',c2:'#0a0a0a',d:'sportrecife.com.br'},
  {id:'vitoria',n:'Vitória',c1:'#c8102e',c2:'#0a0a0a',d:'ecvitoria.com.br'},
  {id:'ceara',n:'Ceará',c1:'#141414',c2:'#f2f2f2',d:'cearasc.com'},
  {id:'americamg',n:'América-MG',c1:'#006437',c2:'#f2f2f2',d:'americamineiro.com.br'},
  {id:'juventude',n:'Juventude',c1:'#006437',c2:'#f2f2f2',d:'juventude.com.br'},
  {id:'criciuma',n:'Criciúma',c1:'#ffd200',c2:'#0a0a0a',d:'criciuma.com.br'},
  {id:'bragantino',n:'RB Bragantino',c1:'#c8102e',c2:'#f2f2f2',d:'redbullbragantino.com.br'},
  {id:'coritiba',n:'Coritiba',c1:'#00553f',c2:'#f2f2f2',d:'coritiba.com.br'},
  {id:'chapecoense',n:'Chapecoense',c1:'#00844d',c2:'#f2f2f2',d:'chapecoense.com'},
  {id:'avai',n:'Avaí',c1:'#005ca9',c2:'#f2f2f2',d:'avai.com.br'},
  {id:'goias',n:'Goiás',c1:'#006437',c2:'#f2f2f2',d:'goiasesporteclube.com.br'},
  {id:'nautico',n:'Náutico',c1:'#d00d25',c2:'#f2f2f2',d:'nautico.com.br'},
  {id:'pontepreta',n:'Ponte Preta',c1:'#141414',c2:'#f2f2f2',d:'pontepreta.com.br'},
  {id:'guarani',n:'Guarani',c1:'#12643c',c2:'#f2f2f2',d:'guarani.com.br'},
  /* 🌎 América do Sul */
  {id:'boca',n:'Boca Juniors',c1:'#00309a',c2:'#f2b705',d:'bocajuniors.com.ar'},
  {id:'river',n:'River Plate',c1:'#e8e8e8',c2:'#c8102e',d:'riverplate.com.ar'},
  {id:'racing',n:'Racing',c1:'#79b6e0',c2:'#f2f2f2',d:'racingclub.com.ar'},
  {id:'unionespanola',n:'Unión Española',c1:'#e2001a',c2:'#ffd200',d:'unionespanola.cl'},
  {id:'colocolo',n:'Colo-Colo',c1:'#141414',c2:'#f2f2f2',d:'colocolo.cl'},
  {id:'udechile',n:'U. de Chile',c1:'#173f8a',c2:'#f2f2f2',d:'udechile.cl'},
  {id:'santacruz',n:'Santa Cruz',c1:'#111111',c2:'#e51937',d:'santacruzpe.com.br'},
  {id:'medellin',n:'Ind. Medellín',c1:'#d0102a',c2:'#122e5f',d:'dimoficial.com'},
  {id:'nacionalcol',n:'Atl. Nacional',c1:'#00a54f',c2:'#f2f2f2',d:'atlnacional.com.co'},
  {id:'newells',n:"Newell's Old Boys",c1:'#e2001a',c2:'#0a0a0a',d:'newellsoldboys.com.ar'},
  {id:'estudiantes',n:'Estudiantes',c1:'#e2001a',c2:'#f2f2f2',d:'edelplata.com'},
  {id:'velez',n:'Vélez Sarsfield',c1:'#0a4d9e',c2:'#f2f2f2',d:'velez.com.ar'},
  {id:'penarol',n:'Peñarol',c1:'#ffd200',c2:'#0a0a0a',d:'penarol.uy'},
  {id:'nacionaluy',n:'Nacional-URU',c1:'#f2f2f2',c2:'#002f6c',d:'nacional.uy'},
  /* 🇺🇸 América do Norte / MLS+MEX */
  {id:'lagalaxy',n:'LA Galaxy',c1:'#00245d',c2:'#ffd200',d:'lagalaxy.com'},
  {id:'intermiami',n:'Inter Miami',c1:'#f4b6cd',c2:'#0a0a0a',d:'intermiamicf.com'},
  {id:'atlutd',n:'Atlanta United',c1:'#80000a',c2:'#0a0a0a',d:'atlutd.com'},
  {id:'pachuca',n:'Pachuca',c1:'#002d62',c2:'#f2f2f2',d:'tuzos.com.mx'},
  {id:'tigres',n:'Tigres',c1:'#fdbd13',c2:'#00559f',d:'tigres.com.mx'},
  {id:'americamx',n:'América-MEX',c1:'#fce000',c2:'#00275d',d:'clubamerica.com.mx'},
  /* 🇪🇺 Europa */
  {id:'westham',n:'West Ham',c1:'#7a263a',c2:'#1bb1e7',d:'whufc.com'},
  {id:'forest',n:'Nottm Forest',c1:'#e51937',c2:'#f2f2f2',d:'nottinghamforest.co.uk'},
  {id:'ipswich',n:'Ipswich Town',c1:'#0e63ad',c2:'#e51937',d:'itfc.co.uk'},
  {id:'fulham',n:'Fulham',c1:'#101010',c2:'#f2f2f2',d:'fulhamfc.com'},
  {id:'everton',n:'Everton',c1:'#003399',c2:'#f2f2f2',d:'evertonfc.com'},
  {id:'wolves',n:'Wolves',c1:'#fdb913',c2:'#231f20',d:'wolves.co.uk'},
  {id:'leicester',n:'Leicester',c1:'#003090',c2:'#fdbe11',d:'lcfc.com'},
  {id:'brentford',n:'Brentford',c1:'#e30613',c2:'#f2f2f2',d:'brentfordfc.com'},
  {id:'brighton',n:'Brighton',c1:'#0057b8',c2:'#f2f2f2',d:'brightonandhovealbion.com'},
  {id:'crystalpalace',n:'Crystal Palace',c1:'#1b458f',c2:'#c4122e',d:'cpfc.co.uk'},
  {id:'newcastle',n:'Newcastle',c1:'#241f20',c2:'#f2f2f2',d:'newcastleunited.com'},
  {id:'astonvilla',n:'Aston Villa',c1:'#670e36',c2:'#95bfe5',d:'avfc.co.uk'},
  {id:'bournemouth',n:'Bournemouth',c1:'#da291c',c2:'#0a0a0a',d:'afcb.co.uk'},
  {id:'leeds',n:'Leeds United',c1:'#ffcd00',c2:'#1d428a',d:'leedsunited.com'},
  {id:'sunderland',n:'Sunderland',c1:'#eb172b',c2:'#f2f2f2',d:'safc.com'},
  {id:'burnley',n:'Burnley',c1:'#6c1d45',c2:'#99d6ea',d:'burnleyfootballclub.com'},
  {id:'sporting',n:'Sporting CP',c1:'#006437',c2:'#f2f2f2',d:'sporting.pt'},
  {id:'realsociedad',n:'Real Sociedad',c1:'#0067b1',c2:'#f2f2f2',d:'realsociedad.eus'},
  {id:'villarreal',n:'Villarreal',c1:'#ffe667',c2:'#005187',d:'villarrealcf.es'},
  {id:'sevilla',n:'Sevilla',c1:'#d70000',c2:'#f2f2f2',d:'sevillafc.es'},
  {id:'valencia',n:'Valencia',c1:'#f2f2f2',c2:'#ee3524',d:'valenciacf.com'},
  {id:'betis',n:'Real Betis',c1:'#00954c',c2:'#f2f2f2',d:'realbetisbalompie.es'},
  {id:'athleticclub',n:'Athletic Club',c1:'#ee2523',c2:'#f2f2f2',d:'athletic-club.eus'},
  {id:'strasbourg',n:'Strasbourg',c1:'#009fe3',c2:'#f2f2f2',d:'rcstrasbourgalsace.fr'},
  {id:'lyon',n:'Lyon',c1:'#123a6d',c2:'#da001a',d:'ol.fr'},
  {id:'marseille',n:'Marseille',c1:'#2faee0',c2:'#f2f2f2',d:'om.fr'},
  {id:'monaco',n:'Monaco',c1:'#e63312',c2:'#f2f2f2',d:'asmonaco.com'},
  {id:'lille',n:'Lille',c1:'#e01e13',c2:'#0a0a0a',d:'losc.fr'},
  {id:'rbleipzig',n:'RB Leipzig',c1:'#dd0141',c2:'#f2f2f2',d:'rbleipzig.com'},
  {id:'eintracht',n:'E. Frankfurt',c1:'#e1000f',c2:'#0a0a0a',d:'eintracht.de'},
  {id:'lazio',n:'Lazio',c1:'#87d8f7',c2:'#122e5f',d:'sslazio.it'},
  {id:'atalanta',n:'Atalanta',c1:'#1e71b8',c2:'#0a0a0a',d:'atalanta.it'},
  {id:'torino',n:'Torino',c1:'#7b1b26',c2:'#f2f2f2',d:'torinofc.it'},
  {id:'feyenoord',n:'Feyenoord',c1:'#e2001a',c2:'#f2f2f2',d:'feyenoord.com'},
  {id:'psv',n:'PSV',c1:'#ed1c24',c2:'#f2f2f2',d:'psv.nl'},
  {id:'fenerbahce',n:'Fenerbahçe',c1:'#ffed00',c2:'#003366',d:'fenerbahce.org'},
  {id:'galatasaray',n:'Galatasaray',c1:'#fdbb30',c2:'#a90432',d:'galatasaray.org'},
  {id:'alhilal',n:'Al-Hilal',c1:'#0050a4',c2:'#f2f2f2',d:'alhilal.com'},
  {id:'alnassr',n:'Al-Nassr',c1:'#f6d311',c2:'#1a2a5e',d:'alnassrfc.com'},
  /* 🇪🇺 Europa (gigantes) */
  {id:'realmadrid',n:'Real Madrid',c1:'#e8e8e8',c2:'#2a3580',d:'realmadrid.com'},
  {id:'barcelona',n:'Barcelona',c1:'#a50044',c2:'#004d98',d:'fcbarcelona.com'},
  {id:'atlmadrid',n:'Atlético de Madrid',c1:'#cb3524',c2:'#f2f2f2',d:'atleticodemadrid.com'},
  {id:'mancity',n:'Man City',c1:'#6cabdd',c2:'#0a2a5e',d:'mancity.com'},
  {id:'liverpool',n:'Liverpool',c1:'#c8102e',c2:'#00b2a9',d:'liverpoolfc.com'},
  {id:'arsenal',n:'Arsenal',c1:'#ef0107',c2:'#f2f2f2',d:'arsenal.com'},
  {id:'chelsea',n:'Chelsea',c1:'#034694',c2:'#f2f2f2',d:'chelseafc.com'},
  {id:'manunited',n:'Man United',c1:'#da291c',c2:'#ffd200',d:'manutd.com'},
  {id:'tottenham',n:'Tottenham',c1:'#e8e8e8',c2:'#132257',d:'tottenhamhotspur.com'},
  {id:'bayern',n:'Bayern',c1:'#dc052d',c2:'#0a2a5e',d:'fcbayern.com'},
  {id:'dortmund',n:'Borussia Dortmund',c1:'#ffd200',c2:'#0a0a0a',d:'bvb.de'},
  {id:'leverkusen',n:'Bayer Leverkusen',c1:'#e30613',c2:'#0a0a0a',d:'bayer04.de'},
  {id:'psg',n:'PSG',c1:'#004170',c2:'#da291c',d:'psg.fr'},
  {id:'juventus',n:'Juventus',c1:'#141414',c2:'#f2f2f2',d:'juventus.com'},
  {id:'intermilan',n:'Inter de Milão',c1:'#003399',c2:'#0a0a0a',d:'inter.it'},
  {id:'milan',n:'Milan',c1:'#fb090b',c2:'#0a0a0a',d:'acmilan.com'},
  {id:'napoli',n:'Napoli',c1:'#0a76be',c2:'#f2f2f2',d:'sscnapoli.it'},
  {id:'roma',n:'Roma',c1:'#8e1f2f',c2:'#f0bc42',d:'asroma.com'},
  {id:'benfica',n:'Benfica',c1:'#e30613',c2:'#f2f2f2',d:'slbenfica.pt'},
  {id:'porto',n:'Porto',c1:'#00428c',c2:'#f2f2f2',d:'fcporto.pt'},
  {id:'ajax',n:'Ajax',c1:'#d2122e',c2:'#f2f2f2',d:'ajax.nl'},
  {id:'celtic',n:'Celtic',c1:'#018749',c2:'#f2f2f2',d:'celticfc.com'},
  /* 🌍 Seleções */
  {id:'brasil',n:'Seleção Brasileira',c1:'#ffd200',c2:'#009a44',d:'cbf.com.br'}
];

function escUrl(c){ return 'https://www.google.com/s2/favicons?domain='+c.d+'&sz=128'; }

/* ---------- cor: utilidades de contraste ---------- */
function hx2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(function(x){return x+x;}).join('');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;var M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2,h=0,s=0;if(M!==m){var d=M-m;s=l>0.5?d/(2-M-m):d/(M+m);if(M===r)h=(g-b)/d+(g<b?6:0);else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;h/=6;}return {h:h,s:s,l:l};}
function hsl2rgb(h,s,l){function f(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}var r,g,b;if(s===0){r=g=b=l;}else{var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3);}return [Math.round(r*255),Math.round(g*255),Math.round(b*255)];}
function rgb2hx(a){return '#'+a.map(function(v){return v.toString(16).padStart(2,'0');}).join('');}
function hx2hsl(hex){var c=hx2rgb(hex);return rgb2hsl(c[0],c[1],c[2]);}
function fit(hex){ /* cor de destaque legível sobre fundo escuro */
  if(!hex)return '#2eff8f';
  var o;
  try{o=hx2hsl(hex);}catch(e){return '#2eff8f';}
  var L=o.l,S=o.s;
  if(S<0.09&&L>=0.62)return '#e8eef7';   /* quase branco → cinza claro */
  if(S<0.09)return '#8fa0b8';            /* quase preto → cinza médio */
  if(L<0.30)L=0.34;
  if(L>0.72)L=0.66;
  if(S>0.62&&L<0.42)L=0.46;              /* vermelhos/verdes muito fechados */
  return rgb2hx(hsl2rgb(o.h,S,L));
}
function textOn(hex){var c=hx2rgb(hex),lum=(0.299*c[0]+0.587*c[1]+0.114*c[2])/255;return lum>0.55?'#0a1020':'#f4f8fc';}

/* ---------- storage ---------- */
function getClub(){
  try{
    var id=localStorage.getItem('fmtl.club');if(!id)return null;
    for(var i=0;i<CLUBES.length;i++)if(CLUBES[i].id===id)return CLUBES[i];
  }catch(e){}
  return null;
}
function themeOn(){try{return localStorage.getItem('fmtl.themeoff')!=='1';}catch(e){return true;}}
function setThemeOn(v){try{localStorage.setItem('fmtl.themeoff',v?'':'1');}catch(e){}applyTheme(v?getClub():null);}
function setClub(c){
  try{if(c){localStorage.setItem('fmtl.club',c.id);localStorage.setItem('fmtl.skip','1');}else localStorage.removeItem('fmtl.club');}catch(e){}
  applyTheme(themeOn()?c:null);fillChip();refreshNow();
}
function applyTheme(c){
  var st=document.documentElement.style;
  if(!c){st.removeProperty('--neon');st.removeProperty('--clubA');st.removeProperty('--clubB');document.body.classList.remove('hasclub');return;}
  st.setProperty('--neon',fit(c.c1));
  st.setProperty('--clubA',c.c1);
  st.setProperty('--clubB',c.c2||'#131a28');
  document.body.classList.add('hasclub');
}

/* ---------- escudo com monograma de reserva ---------- */
function initials(n){var w=(n||'').replace(/[^A-Za-zÀ-ÿ ]/g,'').split(' ').filter(Boolean);var s=((w[0]||'?')[0]+(w[1]?w[1][0]:''));return s.toUpperCase();}
function crest(c,size,extra){
  size=size||26;
  return '<span class="lbcrest'+(extra||'')+'" data-i="'+initials(c.n)+'" style="width:'+size+'px;height:'+size+'px;background:'+c.c1+';color:'+textOn(c.c1)+'"><img alt="" loading="lazy" src="'+escUrl(c)+'" onerror="this.parentNode.classList.add(\'noi\');this.remove()"></span>';
}

/* ---------- CSS do módulo ---------- */
var CSS=''+
'.lbcrest{display:inline-flex;align-items:center;justify-content:center;border-radius:32%;overflow:hidden;border:1.5px solid #ffffff2e;flex:none;position:relative}'+
'.lbcrest img{width:78%;height:78%;object-fit:contain}'+
'.lbcrest.noi::before{content:attr(data-i);font-weight:900;font-size:.62em}'+
'.labchip{display:inline-flex;align-items:center;gap:7px;margin-left:4px;padding:4px 10px 4px 5px;border:1px solid var(--line);border-radius:99px;background:#ffffff08;cursor:pointer;max-width:170px;overflow:hidden}'+
'.labchip:hover{border-color:var(--neon)}'+
'.labchip-n{font-size:11.5px;font-weight:800;color:var(--txt);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}'+
'.labchip .lbcrest{border:none}'+
/* overlay genérico */
'.lbov{position:fixed;inset:0;background:#060b14ee;z-index:500;display:none;align-items:flex-start;justify-content:center;padding:18px 14px;overflow-y:auto}'+
'.lbov.on{display:flex}'+
'.lbcard{width:100%;max-width:430px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px 18px;margin:auto;box-shadow:0 18px 60px #000a;position:relative}'+
'.lbttl{text-align:center;font-weight:900;font-size:21px;letter-spacing:.5px;line-height:1.3}'+
'.lbttl b{color:var(--neon)}'+
'.lbsub{text-align:center;color:var(--sub);font-size:13px;margin:8px 0 14px}'+
'.lbinp{width:100%;background:#0d1526;border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:12px 14px;font-size:15px;margin-bottom:12px}'+
'.lbinp:focus{outline:none;border-color:var(--neon)}'+
'.lbgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;max-height:250px;overflow-y:auto;margin-bottom:12px;padding-right:2px}'+
'.lbopt{display:flex;align-items:center;gap:9px;background:#0d1526;border:1.5px solid var(--line);border-radius:12px;padding:9px 10px;cursor:pointer;text-align:left;color:var(--txt);font-weight:700;font-size:13px;width:100%}'+
'.lbopt:hover{border-color:#ffffff44}'+
'.lbopt.sel{border-color:var(--neon);background:#2eff8f12}'+
'.lbopt span.t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.lbsel{display:flex;align-items:center;gap:12px;background:#0d1526;border:1px dashed var(--neon);border-radius:14px;padding:12px;margin-bottom:14px;min-height:66px}'+
'.lbsel .nm{font-weight:900;font-size:16px}'+
'.lbsel .sw{display:flex;gap:5px;margin-top:3px}'+
'.lbsel .sw i{width:16px;height:16px;border-radius:50%;border:1px solid #ffffff33;display:block}'+
'.lbskip{display:block;width:100%;background:none;border:none;color:var(--sub);font-size:13px;font-weight:700;padding:12px 0 4px;cursor:pointer;text-decoration:underline}'+
'.lbclose{position:absolute;top:10px;right:12px;background:none;border:none;color:var(--sub);font-size:22px;cursor:pointer;padding:4px}'+
'.lbbig{width:100%;margin-top:4px}';

/* ---------- estado interno dos modais ---------- */
var selTmp=null, pickerCb=null, pickerMode=false;

function gridHTML(list,withNone){
  var h='';
  if(withNone)h+='<button class="lbopt" data-cid=""><span style="width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center">🚫</span><span class="t">Sem clube</span></button>';
  list.forEach(function(c){h+='<button class="lbopt" data-cid="'+c.id+'">'+crest(c,26)+'<span class="t">'+c.n+'</span></button>';});
  return h||'<div style="grid-column:1/3;text-align:center;color:var(--sub);font-size:13px;padding:14px">Nenhum clube encontrado 😕</div>';
}
function bindGrid(grid,onSel){
  grid.addEventListener('click',function(e){
    var b=e.target.closest('.lbopt');if(!b)return;
    grid.querySelectorAll('.lbopt').forEach(function(x){x.classList.remove('sel');});
    b.classList.add('sel');
    onSel(b.dataset.cid||null);
  });
}
function byId(id){return document.getElementById(id);}
function ensureModals(){
  if(byId('lbWelcome'))return;
  var w=document.createElement('div');
  w.innerHTML=
  '<div class="lbov" id="lbWelcome"><div class="lbcard">'+
    '<div class="lbttl">BEM-VINDO AO<br><b>FM TOUCH LAB ⚽</b></div>'+
    '<p class="lbsub">Escolha seu clube do coração — o Lab inteiro fica com as cores dele! 🎨</p>'+
    '<input class="lbinp" id="lbwSearch" placeholder="🔎 Pesquisar clube...">'+
    '<div class="lbgrid" id="lbwGrid"></div>'+
    '<div class="lbsel" id="lbwSel" style="justify-content:center;color:var(--sub);font-size:13px">👆 toca num clube acima</div>'+
    '<button class="btn p lbbig" id="lbwGo" style="width:100%;justify-content:center;opacity:.5" disabled>Continuar →</button>'+
    '<button class="lbskip" id="lbwSkip">Pular por enquanto</button>'+
  '</div></div>'+
  '<div class="lbov" id="lbPicker"><div class="lbcard">'+
    '<button class="lbclose" id="lbpClose">✕</button>'+
    '<div class="lbttl">🛡️ <b>MEU CLUBE</b></div>'+
    '<p class="lbsub">Troca quando quiser — o visual atualiza na hora!</p>'+
    '<input class="lbinp" id="lbpSearch" placeholder="🔎 Pesquisar clube...">'+
    '<div class="lbgrid" id="lbpGrid"></div>'+
  '</div></div>';
  while(w.firstChild)document.body.appendChild(w.firstChild);

  var g1=byId('lbwGrid');g1.innerHTML=gridHTML(CLUBES,false);
  byId('lbwSearch').addEventListener('input',function(){
    var q=this.value.toLowerCase().trim();
    g1.innerHTML=gridHTML(CLUBES.filter(function(c){return c.n.toLowerCase().indexOf(q)>-1;}),false);
  });
  bindGrid(g1,function(cid){
    selTmp=cid?CLUBES.find(function(c){return c.id===cid;}):null;
    var s=byId('lbwSel');
    if(selTmp){
      s.style.borderStyle='solid';s.style.justifyContent='flex-start';
      s.innerHTML=crest(selTmp,44)+'<div><div class="nm">'+selTmp.n+'</div><div class="sw"><i style="background:'+selTmp.c1+'"></i><i style="background:'+selTmp.c2+'"></i></div></div>';
      var go=byId('lbwGo');go.disabled=false;go.style.opacity=1;
    }
  });
  byId('lbwGo').addEventListener('click',function(){
    if(!selTmp)return;
    setClub(selTmp);
    byId('lbWelcome').classList.remove('on');
    if(typeof toast==='function')toast('🛡️ '+selTmp.n+' agora é o MEU CLUBE! 🎨');
  });
  byId('lbwSkip').addEventListener('click',function(){
    try{localStorage.setItem('fmtl.skip','1');}catch(e){}
    byId('lbWelcome').classList.remove('on');
  });

  var g2=byId('lbpGrid');g2.innerHTML=gridHTML(CLUBES,true);
  byId('lbpSearch').addEventListener('input',function(){
    var q=this.value.toLowerCase().trim();
    g2.innerHTML=gridHTML(CLUBES.filter(function(c){return c.n.toLowerCase().indexOf(q)>-1;}),true);
  });
  bindGrid(g2,function(cid){
    var c=cid?CLUBES.find(function(x){return x.id===cid;}):null;
    setClub(c);
    byId('lbPicker').classList.remove('on');
    if(pickerCb)pickerCb(c);
  });
  byId('lbpClose').addEventListener('click',function(){byId('lbPicker').classList.remove('on');if(pickerCb)pickerCb(undefined);});
}

/* ---------- chip do cabeçalho ---------- */
function fillChip(){
  var el=byId('labChip');if(!el)return;
  var c=getClub();
  if(!c){el.style.display='none';return;}
  el.style.display='inline-flex';
  el.innerHTML=crest(c,20)+'<span class="labchip-n">'+c.n+'</span>';
}

/* ---------- página ⚙️ Clube & Perfil (se existir) ---------- */
function refreshNow(){
  var box=byId('pClubNow');if(!box)return;
  var c=getClub();
  if(!c){
    box.innerHTML='<div style="text-align:center;color:var(--sub);font-size:13.5px;padding:16px 4px">Nenhum clube escolhido ainda.<br>Escolhe o teu e o Lab fica com a tua cara! 🎨</div>';
  }else{
    box.innerHTML='<div style="display:flex;align-items:center;gap:14px;padding:6px 2px 14px">'+crest(c,54)+'<div><div style="font-weight:900;font-size:18px">'+c.n+'</div><div style="display:flex;gap:6px;margin-top:5px"><i style="width:18px;height:18px;border-radius:50%;background:'+c.c1+';border:1px solid #ffffff33;display:block"></i><i style="width:18px;height:18px;border-radius:50%;background:'+c.c2+';border:1px solid #ffffff33;display:block"></i></div></div></div>';
  }
  var rm=byId('pClubRemove');if(rm)rm.style.display=c?'':'none';
  var tog=byId('pThemeState');if(tog)tog.textContent=themeOn()?'🎨 cores do clube ATIVAS':'🌿 tema padrão do Lab';
}

/* ---------- API ---------- */
window.LAB.CLUBES=CLUBES;
window.LAB.getClub=getClub;
window.LAB.setClub=setClub;
window.LAB.crest=crest;
window.LAB.fit=fit;
window.LAB.textOn=textOn;
window.LAB.applyTheme=function(c){applyTheme(c);};
window.LAB.themeOn=themeOn;
window.LAB.setThemeOn=function(v){setThemeOn(v);refreshNow();};
window.LAB.openClubPicker=function(cb){
  ensureModals();
  pickerCb=cb;
  byId('lbpSearch').value='';byId('lbpGrid').innerHTML=gridHTML(CLUBES,true);
  byId('lbPicker').classList.add('on');
};
window.LAB.openWelcome=function(){
  ensureModals();selTmp=null;
  byId('lbwGo').disabled=true;byId('lbwGo').style.opacity='.5';
  byId('lbwSel').style.borderStyle='dashed';
  byId('lbwSel').innerHTML='👆 toca num clube acima';
  byId('lbWelcome').classList.add('on');
};
window.LAB.refreshClubUI=function(){fillChip();refreshNow();};

/* ---------- boot ---------- */
function boot(){
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  ensureModals();
  fillChip();refreshNow();
  applyTheme(themeOn()?getClub():null);
  /* primeira visita → boas-vindas (suprimida em páginas com window.LAB_NO_WELCOME, ex.: entrar/manager) */
  var skip='';try{skip=localStorage.getItem('fmtl.skip')||'';}catch(e){}
  if(!getClub()&&skip!=='1'&&!window.LAB_NO_WELCOME)setTimeout(function(){window.LAB.openWelcome();},450);
  /* botões da página personal */
  document.addEventListener('click',function(e){
    if(e.target.closest('#pClubChange'))window.LAB.openClubPicker(function(){});
    if(e.target.closest('#pClubRemove')){window.LAB.setClub(null);if(typeof toast==='function')toast('🚫 Clube removido — voltou o tema clássico');}
    if(e.target.closest('[data-go="personal"]'))setTimeout(refreshNow,60);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

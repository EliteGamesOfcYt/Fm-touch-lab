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
  {id:'flamengo',n:'Flamengo',c1:'#c8102e',c2:'#0b0b0b',d:'flamengo.com.br',e:'819'},
  {id:'palmeiras',n:'Palmeiras',c1:'#006437',c2:'#f2f2f2',d:'palmeiras.com.br',e:'2029'},
  {id:'corinthians',n:'Corinthians',c1:'#131313',c2:'#f2f2f2',d:'corinthians.com.br',e:'874'},
  {id:'saopaulo',n:'São Paulo',c1:'#e21b23',c2:'#101010',d:'saopaulofc.net',e:'2026'},
  {id:'santos',n:'Santos',c1:'#141414',c2:'#f2f2f2',d:'santosfc.com.br',e:'2674'},
  {id:'gremio',n:'Grêmio',c1:'#0d80bf',c2:'#101010',d:'gremio.net',e:'6273'},
  {id:'inter-sc',n:'Internacional',c1:'#c8102e',c2:'#f2f2f2',d:'internacional.com.br',e:'1936'},
  {id:'atleticomg',n:'Atlético-MG',c1:'#141414',c2:'#f2f2f2',d:'atletico.com.br',e:'7632'},
  {id:'cruzeiro',n:'Cruzeiro',c1:'#003a94',c2:'#f2f2f2',d:'cruzeiro.com.br',e:'2022'},
  {id:'botafogo',n:'Botafogo',c1:'#141414',c2:'#f2f2f2',d:'botafogo.com.br',e:'6086'},
  {id:'fluminense',n:'Fluminense',c1:'#8e1130',c2:'#006437',d:'fluminense.com.br',e:'3445'},
  {id:'vasco',n:'Vasco',c1:'#141414',c2:'#f2f2f2',d:'vasco.com.br',e:'3454'},
  {id:'athleticopr',n:'Athletico-PR',c1:'#cc0000',c2:'#0a0a0a',d:'athletico.com.br',e:'3458'},
  {id:'bahia',n:'Bahia',c1:'#004a9f',c2:'#d00d25',d:'esporteclubebahia.com.br',e:'9967'},
  {id:'fortaleza',n:'Fortaleza',c1:'#0052a5',c2:'#e31837',d:'fortalezaec.net',e:'6272'},
  {id:'sport',n:'Sport',c1:'#c8102e',c2:'#0a0a0a',d:'sportrecife.com.br',e:'7635'},
  {id:'vitoria',n:'Vitória',c1:'#c8102e',c2:'#0a0a0a',d:'ecvitoria.com.br',e:'3457'},
  {id:'ceara',n:'Ceará',c1:'#141414',c2:'#f2f2f2',d:'cearasc.com',e:'9969'},
  {id:'americamg',n:'América-MG',c1:'#006437',c2:'#f2f2f2',d:'americamineiro.com.br',e:'18551'},
  {id:'juventude',n:'Juventude',c1:'#006437',c2:'#f2f2f2',d:'juventude.com.br',e:'6270'},
  {id:'criciuma',n:'Criciúma',c1:'#ffd200',c2:'#0a0a0a',d:'criciuma.com.br',e:'9971'},
  {id:'bragantino',n:'RB Bragantino',c1:'#c8102e',c2:'#f2f2f2',d:'redbullbragantino.com.br',e:'6079'},
  {id:'coritiba',n:'Coritiba',c1:'#00553f',c2:'#f2f2f2',d:'coritiba.com.br',e:'3456'},
  {id:'chapecoense',n:'Chapecoense',c1:'#00844d',c2:'#f2f2f2',d:'chapecoense.com',e:'9318'},
  {id:'avai',n:'Avaí',c1:'#005ca9',c2:'#f2f2f2',d:'avai.com.br',e:'9966'},
  {id:'goias',n:'Goiás',c1:'#006437',c2:'#f2f2f2',d:'goiasesporteclube.com.br',e:'3395'},
  {id:'nautico',n:'Náutico',c1:'#d00d25',c2:'#f2f2f2',d:'nautico.com.br',e:'7633'},
  {id:'pontepreta',n:'Ponte Preta',c1:'#141414',c2:'#f2f2f2',d:'pontepreta.com.br',e:'3459'},
  {id:'guarani',n:'Guarani',c1:'#12643c',c2:'#f2f2f2',d:'guarani.com.br',e:'3448'},
  /* 🌎 América do Sul */
  {id:'boca',n:'Boca Juniors',c1:'#00309a',c2:'#f2b705',d:'bocajuniors.com.ar',e:'5'},
  {id:'river',n:'River Plate',c1:'#e8e8e8',c2:'#c8102e',d:'riverplate.com.ar',e:'16'},
  {id:'racing',n:'Racing',c1:'#79b6e0',c2:'#f2f2f2',d:'racingclub.com.ar',e:'15'},
  {id:'unionespanola',n:'Unión Española',c1:'#e2001a',c2:'#ffd200',d:'unionespanola.cl',e:'4132'},
  {id:'colocolo',n:'Colo-Colo',c1:'#141414',c2:'#f2f2f2',d:'colocolo.cl',e:'2688'},
  {id:'udechile',n:'U. de Chile',c1:'#173f8a',c2:'#f2f2f2',d:'udechile.cl',e:'4139'},
  {id:'santacruz',n:'Santa Cruz',c1:'#111111',c2:'#e51937',d:'santacruzpe.com.br',e:'4929'},
  {id:'medellin',n:'Independiente Medellín',c1:'#d0102a',c2:'#122e5f',d:'dimoficial.com',e:'2690'},
  {id:'nacionalcol',n:'Atl. Nacional',c1:'#00a54f',c2:'#f2f2f2',d:'atlnacional.com.co',e:'5264'},
  {id:'newells',n:"Newell's Old Boys",c1:'#e2001a',c2:'#0a0a0a',d:'newellsoldboys.com.ar',e:'14'},
  {id:'estudiantes',n:'Estudiantes',c1:'#e2001a',c2:'#f2f2f2',d:'edelplata.com',e:'8'},
  {id:'velez',n:'Vélez Sarsfield',c1:'#0a4d9e',c2:'#f2f2f2',d:'velez.com.ar',e:'21'},
  {id:'penarol',n:'Peñarol',c1:'#ffd200',c2:'#0a0a0a',d:'penarol.uy',e:'2683'},
  {id:'nacionaluy',n:'Nacional-URU',c1:'#f2f2f2',c2:'#002f6c',d:'nacional.uy',e:'2684'},
  /* 🇺🇸 América do Norte / MLS+MEX */
  {id:'lagalaxy',n:'LA Galaxy',c1:'#00245d',c2:'#ffd200',d:'lagalaxy.com',e:'187'},
  {id:'intermiami',n:'Inter Miami',c1:'#f4b6cd',c2:'#0a0a0a',d:'intermiamicf.com',e:'20232'},
  {id:'atlutd',n:'Atlanta United',c1:'#80000a',c2:'#0a0a0a',d:'atlutd.com',e:'18418'},
  {id:'pachuca',n:'Pachuca',c1:'#002d62',c2:'#f2f2f2',d:'tuzos.com.mx',e:'234'},
  {id:'tigres',n:'Tigres',c1:'#fdbd13',c2:'#00559f',d:'tigres.com.mx',e:'9770'},
  {id:'americamx',n:'América-MEX',c1:'#fce000',c2:'#00275d',d:'clubamerica.com.mx',e:'227'},
  /* 🇪🇺 Europa */
  {id:'westham',n:'West Ham',c1:'#7a263a',c2:'#1bb1e7',d:'whufc.com',e:'371'},
  {id:'forest',n:'Nottm Forest',c1:'#e51937',c2:'#f2f2f2',d:'nottinghamforest.co.uk',e:'393'},
  {id:'ipswich',n:'Ipswich Town',c1:'#0e63ad',c2:'#e51937',d:'itfc.co.uk',e:'373'},
  {id:'fulham',n:'Fulham',c1:'#101010',c2:'#f2f2f2',d:'fulhamfc.com',e:'370'},
  {id:'everton',n:'Everton',c1:'#003399',c2:'#f2f2f2',d:'evertonfc.com',e:'368'},
  {id:'wolves',n:'Wolves',c1:'#fdb913',c2:'#231f20',d:'wolves.co.uk',e:'20000'},
  {id:'leicester',n:'Leicester',c1:'#003090',c2:'#fdbe11',d:'lcfc.com',e:'375'},
  {id:'brentford',n:'Brentford',c1:'#e30613',c2:'#f2f2f2',d:'brentfordfc.com',e:'337'},
  {id:'brighton',n:'Brighton',c1:'#0057b8',c2:'#f2f2f2',d:'brightonandhovealbion.com',e:'331'},
  {id:'crystalpalace',n:'Crystal Palace',c1:'#1b458f',c2:'#c4122e',d:'cpfc.co.uk',e:'384'},
  {id:'newcastle',n:'Newcastle',c1:'#241f20',c2:'#f2f2f2',d:'newcastleunited.com',e:'361'},
  {id:'astonvilla',n:'Aston Villa',c1:'#670e36',c2:'#95bfe5',d:'avfc.co.uk',e:'362'},
  {id:'bournemouth',n:'Bournemouth',c1:'#da291c',c2:'#0a0a0a',d:'afcb.co.uk',e:'349'},
  {id:'leeds',n:'Leeds United',c1:'#ffcd00',c2:'#1d428a',d:'leedsunited.com',e:'357'},
  {id:'sunderland',n:'Sunderland',c1:'#eb172b',c2:'#f2f2f2',d:'safc.com',e:'366'},
  {id:'burnley',n:'Burnley',c1:'#6c1d45',c2:'#99d6ea',d:'burnleyfootballclub.com',e:'379'},
  {id:'sporting',n:'Sporting CP',c1:'#006437',c2:'#f2f2f2',d:'sporting.pt',e:'2250'},
  {id:'realsociedad',n:'Real Sociedad',c1:'#0067b1',c2:'#f2f2f2',d:'realsociedad.eus',e:'89'},
  {id:'villarreal',n:'Villarreal',c1:'#ffe667',c2:'#005187',d:'villarrealcf.es',e:'102'},
  {id:'sevilla',n:'Sevilla',c1:'#d70000',c2:'#f2f2f2',d:'sevillafc.es',e:'243'},
  {id:'valencia',n:'Valencia',c1:'#f2f2f2',c2:'#ee3524',d:'valenciacf.com',e:'94'},
  {id:'betis',n:'Real Betis',c1:'#00954c',c2:'#f2f2f2',d:'realbetisbalompie.es',e:'244'},
  {id:'athleticclub',n:'Athletic Club',c1:'#ee2523',c2:'#f2f2f2',d:'athletic-club.eus',e:'93'},
  {id:'strasbourg',n:'Strasbourg',c1:'#009fe3',c2:'#f2f2f2',d:'rcstrasbourgalsace.fr',e:'180'},
  {id:'lyon',n:'Lyon',c1:'#123a6d',c2:'#da001a',d:'ol.fr',e:'167'},
  {id:'marseille',n:'Marseille',c1:'#2faee0',c2:'#f2f2f2',d:'om.fr',e:'176'},
  {id:'monaco',n:'Monaco',c1:'#e63312',c2:'#f2f2f2',d:'asmonaco.com',e:'174'},
  {id:'lille',n:'Lille',c1:'#e01e13',c2:'#0a0a0a',d:'losc.fr',e:'166'},
  {id:'rbleipzig',n:'RB Leipzig',c1:'#dd0141',c2:'#f2f2f2',d:'rbleipzig.com',e:'11420'},
  {id:'eintracht',n:'E. Frankfurt',c1:'#e1000f',c2:'#0a0a0a',d:'eintracht.de',e:'125'},
  {id:'lazio',n:'Lazio',c1:'#87d8f7',c2:'#122e5f',d:'sslazio.it',e:'112'},
  {id:'atalanta',n:'Atalanta',c1:'#1e71b8',c2:'#0a0a0a',d:'atalanta.it',e:'105'},
  {id:'torino',n:'Torino',c1:'#7b1b26',c2:'#f2f2f2',d:'torinofc.it',e:'239'},
  {id:'feyenoord',n:'Feyenoord',c1:'#e2001a',c2:'#f2f2f2',d:'feyenoord.com',e:'142'},
  {id:'psv',n:'PSV',c1:'#ed1c24',c2:'#f2f2f2',d:'psv.nl',e:'148'},
  {id:'fenerbahce',n:'Fenerbahçe',c1:'#ffed00',c2:'#003366',d:'fenerbahce.org',e:'436'},
  {id:'galatasaray',n:'Galatasaray',c1:'#fdbb30',c2:'#a90432',d:'galatasaray.org',e:'432'},
  {id:'alhilal',n:'Al-Hilal',c1:'#0050a4',c2:'#f2f2f2',d:'alhilal.com',e:'929'},
  {id:'alnassr',n:'Al-Nassr',c1:'#f6d311',c2:'#1a2a5e',d:'alnassrfc.com',e:'817'},
  /* 🇪🇺 Europa (gigantes) */
  {id:'realmadrid',n:'Real Madrid',c1:'#e8e8e8',c2:'#2a3580',d:'realmadrid.com',e:'86'},
  {id:'barcelona',n:'Barcelona',c1:'#a50044',c2:'#004d98',d:'fcbarcelona.com',e:'83'},
  {id:'atlmadrid',n:'Atlético de Madrid',c1:'#cb3524',c2:'#f2f2f2',d:'atleticodemadrid.com',e:'1068'},
  {id:'mancity',n:'Man City',c1:'#6cabdd',c2:'#0a2a5e',d:'mancity.com',e:'382'},
  {id:'liverpool',n:'Liverpool',c1:'#c8102e',c2:'#00b2a9',d:'liverpoolfc.com',e:'364'},
  {id:'arsenal',n:'Arsenal',c1:'#ef0107',c2:'#f2f2f2',d:'arsenal.com',e:'359'},
  {id:'chelsea',n:'Chelsea',c1:'#034694',c2:'#f2f2f2',d:'chelseafc.com',e:'363'},
  {id:'manunited',n:'Man United',c1:'#da291c',c2:'#ffd200',d:'manutd.com',e:'360'},
  {id:'tottenham',n:'Tottenham',c1:'#e8e8e8',c2:'#132257',d:'tottenhamhotspur.com',e:'367'},
  {id:'bayern',n:'Bayern',c1:'#dc052d',c2:'#0a2a5e',d:'fcbayern.com',e:'132'},
  {id:'dortmund',n:'Borussia Dortmund',c1:'#ffd200',c2:'#0a0a0a',d:'bvb.de',e:'124'},
  {id:'leverkusen',n:'Bayer Leverkusen',c1:'#e30613',c2:'#0a0a0a',d:'bayer04.de',e:'131'},
  {id:'psg',n:'PSG',c1:'#004170',c2:'#da291c',d:'psg.fr',e:'160'},
  {id:'juventus',n:'Juventus',c1:'#141414',c2:'#f2f2f2',d:'juventus.com',e:'111'},
  {id:'intermilan',n:'Inter de Milão',c1:'#003399',c2:'#0a0a0a',d:'inter.it',e:'110'},
  {id:'milan',n:'Milan',c1:'#fb090b',c2:'#0a0a0a',d:'acmilan.com',e:'103'},
  {id:'napoli',n:'Napoli',c1:'#0a76be',c2:'#f2f2f2',d:'sscnapoli.it',e:'114'},
  {id:'roma',n:'Roma',c1:'#8e1f2f',c2:'#f0bc42',d:'asroma.com',e:'104'},
  {id:'benfica',n:'Benfica',c1:'#e30613',c2:'#f2f2f2',d:'slbenfica.pt',e:'1929'},
  {id:'porto',n:'Porto',c1:'#00428c',c2:'#f2f2f2',d:'fcporto.pt',e:'437'},
  {id:'ajax',n:'Ajax',c1:'#d2122e',c2:'#f2f2f2',d:'ajax.nl',e:'139'},
  {id:'celtic',n:'Celtic',c1:'#018749',c2:'#f2f2f2',d:'celticfc.com',e:'256'},
  /* 🇪🇸 La Liga */
  {id:'girona',n:'Girona',c1:'#e2001a',c2:'#f2f2f2',d:'gironafc.cat',e:'9812'},
  {id:'getafe',n:'Getafe',c1:'#005bac',c2:'#f2f2f2',d:'getafecf.com',e:'2922'},
  {id:'osasuna',n:'Osasuna',c1:'#d21034',c2:'#0a2a5e',d:'osasuna.es',e:'97'},
  {id:'celta',n:'Celta Vigo',c1:'#8ac3ee',c2:'#d7182a',d:'rccelta.es',e:'85'},
  {id:'rayo',n:'Rayo Vallecano',c1:'#e30613',c2:'#f2f2f2',d:'rayovallecano.es',e:'101'},
  {id:'mallorca',n:'Mallorca',c1:'#e30613',c2:'#0a0a0a',d:'rcdmallorca.es',e:'84'},
  {id:'alaves',n:'Alavés',c1:'#003da5',c2:'#f2f2f2',d:'deportivoalaves.com',e:'96'},
  {id:'espanyol',n:'Espanyol',c1:'#0067b1',c2:'#f2f2f2',d:'rcdespanyol.com',e:'88'},
  {id:'leganes',n:'Leganés',c1:'#0053a0',c2:'#f2f2f2',d:'cdleganes.com',e:'17534'},
  {id:'laspalmas',n:'Las Palmas',c1:'#ffed00',c2:'#0050a4',d:'udlaspalmas.es',e:'98'},
  {id:'levante',n:'Levante',c1:'#a50044',c2:'#0a2a5e',d:'levanteud.com',e:'1538'},
  {id:'oviedo',n:'Real Oviedo',c1:'#002f6c',c2:'#f2f2f2',d:'realoviedo.es',e:'92'},
  {id:'elche',n:'Elche',c1:'#007a33',c2:'#ffed00',d:'elchecf.es',e:'3751'},
  /* 🇮🇹 Serie A */
  {id:'fiorentina',n:'Fiorentina',c1:'#582c83',c2:'#f2f2f2',d:'acffiorentina.com',e:'109'},
  {id:'bologna',n:'Bologna',c1:'#a21c26',c2:'#0a2a5e',d:'bolognafc.it',e:'107'},
  {id:'sassuolo',n:'Sassuolo',c1:'#009444',c2:'#0a0a0a',d:'sassuolocalcio.it',e:'3997'},
  {id:'genoa',n:'Genoa',c1:'#e2001a',c2:'#00235d',d:'genoacfc.it',e:'3263'},
  {id:'udinese',n:'Udinese',c1:'#141414',c2:'#f2f2f2',d:'udinese.it',e:'118'},
  {id:'verona',n:'Hellas Verona',c1:'#ffdd00',c2:'#00316e',d:'hellasverona.it',e:'119'},
  {id:'cagliari',n:'Cagliari',c1:'#d2002e',c2:'#0a2a5e',d:'cagliaricalcio.com',e:'2925'},
  {id:'parma',n:'Parma',c1:'#ffdd00',c2:'#00539f',d:'parmacalcio1913.com',e:'115'},
  {id:'lecce',n:'Lecce',c1:'#ffd200',c2:'#d40000',d:'uslecce.it',e:'113'},
  {id:'como',n:'Como',c1:'#0072bc',c2:'#f2f2f2',d:'comofootball.com',e:'2572'},
  {id:'empoli',n:'Empoli',c1:'#005eb8',c2:'#f2f2f2',d:'empolifc.com',e:'2574'},
  {id:'venezia',n:'Venezia',c1:'#f5842a',c2:'#0a0a0a',d:'veneziafc.it',e:'17530'},
  {id:'monza',n:'Monza',c1:'#e2001a',c2:'#f2f2f2',d:'acmonza.com',e:'4007'},
  {id:'pisa',n:'Pisa',c1:'#0a4ea2',c2:'#ffd200',d:'pisasportingclub.com',e:'3956'},
  /* 🇩🇪 Bundesliga */
  {id:'stuttgart',n:'Stuttgart',c1:'#e32219',c2:'#f2f2f2',d:'vfb.de',e:'134'},
  {id:'wolfsburg',n:'Wolfsburg',c1:'#65b32e',c2:'#003d7d',d:'vfl-wolfsburg.de',e:'20107'},
  {id:'gladbach',n:"B. M'gladbach",c1:'#141414',c2:'#00944d',d:'borussia.de',e:'268'},
  {id:'freiburg',n:'Freiburg',c1:'#e2001a',c2:'#f2f2f2',d:'scfreiburg.com',e:'126'},
  {id:'hoffenheim',n:'Hoffenheim',c1:'#1c63b7',c2:'#f2f2f2',d:'achtzehn99.de',e:'7911'},
  {id:'mainz',n:'Mainz',c1:'#ed1c24',c2:'#f2f2f2',d:'mainz05.de',e:'2950'},
  {id:'augsburg',n:'Augsburg',c1:'#ba3733',c2:'#f2f2f2',d:'fcaugsburg.de',e:'3841'},
  {id:'unionberlin',n:'Union Berlin',c1:'#e2001a',c2:'#ffd200',d:'fc-union-berlin.de',e:'598'},
  {id:'werder',n:'Werder Bremen',c1:'#009a44',c2:'#f2f2f2',d:'werder.de',e:'137'},
  {id:'bochum',n:'Bochum',c1:'#005ca9',c2:'#f2f2f2',d:'vfl-bochum.de',e:'121'},
  {id:'hamburg',n:'Hamburger SV',c1:'#1b5fad',c2:'#f2f2f2',d:'hsv.de',e:'127'},
  {id:'koln',n:'FC Köln',c1:'#e2001a',c2:'#f2f2f2',d:'fc.de',e:'122'},
  {id:'stpauli',n:'St. Pauli',c1:'#4b2e20',c2:'#f2f2f2',d:'fcstpauli.com',e:'270'},
  {id:'heidenheim',n:'Heidenheim',c1:'#e2001a',c2:'#0a2a5e',d:'fc-heidenheim.de',e:'6418'},
  /* 🇫🇷 Ligue 1 */
  {id:'lens',n:'Lens',c1:'#ffd200',c2:'#e2001a',d:'rclens.fr',e:'175'},
  {id:'rennes',n:'Rennes',c1:'#e2001a',c2:'#141414',d:'staderennais.com',e:'169'},
  {id:'nice',n:'Nice',c1:'#0a0a0a',c2:'#e30613',d:'ogcnice.com',e:'2502'},
  {id:'toulouse',n:'Toulouse',c1:'#5f259f',c2:'#f2f2f2',d:'toulousefc.com',e:'179'},
  {id:'nantes',n:'Nantes',c1:'#ffd800',c2:'#00794c',d:'fcnantes.com',e:'165'},
  {id:'montpellier',n:'Montpellier',c1:'#f39200',c2:'#0057a8',d:'mhscfoot.com',e:'21638'},
  {id:'brest',n:'Stade Brestois',c1:'#e30613',c2:'#f2f2f2',d:'sb29.bzh',e:'6997'},
  {id:'auxerre',n:'Auxerre',c1:'#0e94d2',c2:'#f2f2f2',d:'aja.fr',e:'172'},
  {id:'lorient',n:'Lorient',c1:'#f58020',c2:'#0a0a0a',d:'fclorient.bzh',e:'273'},
  {id:'angers',n:'Angers',c1:'#141414',c2:'#f2f2f2',d:'angers-sco.fr',e:'7868'},
  {id:'lehavre',n:'Le Havre',c1:'#00a0d2',c2:'#0a2a5e',d:'hac-foot.com',e:'3236'},
  {id:'metz',n:'FC Metz',c1:'#6f1d2a',c2:'#f2f2f2',d:'fcmetz.com',e:'177'},
  {id:'reims',n:'Reims',c1:'#e2001a',c2:'#f2f2f2',d:'stade-de-reims.com',e:'3243'},
  {id:'parisfc',n:'Paris FC',c1:'#0a3d91',c2:'#f2f2f2',d:'parisfc.fr',e:'6851'},
  /* 🇵🇹 Portugal */
  {id:'braga',n:'Sp. Braga',c1:'#e30613',c2:'#f2f2f2',d:'scbraga.pt',e:'2994'},
  {id:'vguimaraes',n:'V. Guimarães',c1:'#e8e8e8',c2:'#141414',d:'vitoriasc.pt',e:'5309'},
  {id:'boavista',n:'Boavista',c1:'#141414',c2:'#f2f2f2',d:'boavistafc.pt',e:'900'},
  {id:'famalicao',n:'Famalicão',c1:'#0a4ea2',c2:'#f2f2f2',d:'fcfamalicao.pt',e:'12698'},
  {id:'gilvicente',n:'Gil Vicente',c1:'#e30613',c2:'#0052a5',d:'gilvicentefc.pt',e:'3699'},
  {id:'moreirense',n:'Moreirense',c1:'#009a44',c2:'#f2f2f2',d:'moreirensefc.pt',e:'3696'},
  {id:'estoril',n:'Estoril',c1:'#ffd200',c2:'#0052a5',d:'estorilpraia.pt',e:'12216'},
  /* 🇳🇱 Holanda */
  {id:'azalkmaar',n:'AZ Alkmaar',c1:'#e2001a',c2:'#141414',d:'az.nl',e:'140'},
  {id:'twente',n:'Twente',c1:'#e2001a',c2:'#f2f2f2',d:'fctwente.nl',e:'152'},
  {id:'utrecht',n:'FC Utrecht',c1:'#e2001a',c2:'#ffd200',d:'fcutrecht.nl',e:'153'},
  {id:'heerenveen',n:'Heerenveen',c1:'#005cab',c2:'#f2f2f2',d:'sc-heerenveen.nl',e:'146'},
  {id:'sparta',n:'Sparta Rotterdam',c1:'#d40000',c2:'#f2f2f2',d:'sparta-rotterdam.nl',e:'151'},
  {id:'nec',n:'NEC Nijmegen',c1:'#009a44',c2:'#e30613',d:'nec-nijmegen.com',e:'147'},
  {id:'goahead',n:'Go Ahead Eagles',c1:'#e2001a',c2:'#ffd200',d:'ga-eagles.nl',e:'3706'},
  {id:'groningen',n:'Groningen',c1:'#006b3f',c2:'#f2f2f2',d:'fcgroningen.nl',e:'145'},
  /* 🇧🇪 Bélgica · 🇹🇷 Turquia · 🇬🇷 Grécia · outros 🇪🇺 */
  {id:'clubbrugge',n:'Club Brugge',c1:'#0033a1',c2:'#141414',d:'clubbrugge.be',e:'570'},
  {id:'anderlecht',n:'Anderlecht',c1:'#5b2d82',c2:'#f2f2f2',d:'rsca.be',e:'441'},
  {id:'genk',n:'Genk',c1:'#003da5',c2:'#f2f2f2',d:'krcgenk.be',e:'938'},
  {id:'gent',n:'Gent',c1:'#005ca9',c2:'#f2f2f2',d:'kaagent.be',e:'3611'},
  {id:'standard',n:'Standard Liège',c1:'#e2001a',c2:'#f2f2f2',d:'standard.be',e:'559'},
  {id:'unionsg',n:'Union SG',c1:'#ffd200',c2:'#0a2a5e',d:'rusg.brussels',e:'5807'},
  {id:'trabzonspor',n:'Trabzonspor',c1:'#6e1737',c2:'#4fa3d1',d:'trabzonspor.org.tr',e:'997'},
  {id:'basaksehir',n:'Başakşehir',c1:'#f5842a',c2:'#0a2a5e',d:'ibfk.com.tr',e:'7914'},
  {id:'besiktas',n:'Beşiktaş',c1:'#0a0a0a',c2:'#f2f2f2',d:'bjk.com.tr',e:'1895'},
  {id:'olympiacos',n:'Olympiacos',c1:'#e2001a',c2:'#f2f2f2',d:'olympiacos.org',e:'435'},
  {id:'paok',n:'PAOK',c1:'#141414',c2:'#f2f2f2',d:'paokfc.gr',e:'605'},
  {id:'aek',n:'AEK Atenas',c1:'#ffd200',c2:'#141414',d:'aekfc.gr',e:'887'},
  {id:'panathinaikos',n:'Panathinaikos',c1:'#00693e',c2:'#f2f2f2',d:'pao.gr',e:'443'},
  {id:'rangers',n:'Rangers',c1:'#1b458f',c2:'#e30613',d:'rangers.co.uk',e:'257'},
  {id:'salzburg',n:'RB Salzburg',c1:'#e2001a',c2:'#f2f2f2',d:'redbullsalzburg.com',e:'2790'},
  {id:'youngboys',n:'Young Boys',c1:'#ffdd00',c2:'#141414',d:'bscyb.ch',e:'2722'},
  {id:'basel',n:'Basel',c1:'#e2001a',c2:'#0052a5',d:'fcb.ch',e:'989'},
  {id:'copenhagen',n:'Copenhagen',c1:'#0f4c92',c2:'#f2f2f2',d:'fck.dk',e:'909'},
  {id:'midtjylland',n:'Midtjylland',c1:'#141414',c2:'#e30613',d:'fcm.dk',e:'572'},
  {id:'bodo',n:'Bodø/Glimt',c1:'#ffd200',c2:'#141414',d:'glimt.no',e:'2980'},
  {id:'malmo',n:'Malmö FF',c1:'#8ac3ee',c2:'#0a2a5e',d:'mff.se',e:'2720'},
  {id:'dinamo',n:'Dinamo Zagreb',c1:'#004b9b',c2:'#f2f2f2',d:'gnkdinamo.hr',e:'597'},
  {id:'czvezda',n:'Estrela Vermelha',c1:'#e2001a',c2:'#f2f2f2',d:'crvenazvezdafk.com',e:'2290'},
  {id:'shakhtar',n:'Shakhtar',c1:'#f5842a',c2:'#141414',d:'shakhtar.com',e:'493'},
  /* 🇦🇷 Argentina */
  {id:'independiente',n:'Independiente',c1:'#e2001a',c2:'#f2f2f2',d:'independiente.com.ar',e:'11'},
  {id:'sanlorenzo',n:'San Lorenzo',c1:'#0033a1',c2:'#e30613',d:'sanlorenzo.com.ar',e:'18'},
  {id:'talleres',n:'Talleres',c1:'#0033a1',c2:'#f2f2f2',d:'talleres.org.ar',e:'19'},
  {id:'rosariocentral',n:'Rosario Central',c1:'#ffdd00',c2:'#0033a1',d:'rosariocentral.com',e:'17'},
  {id:'lanus',n:'Lanús',c1:'#7b1c27',c2:'#f2f2f2',d:'clublanus.com',e:'12'},
  {id:'argentinos',n:'Argentinos Jrs',c1:'#e2001a',c2:'#f2f2f2',d:'aaaj.com.ar',e:'3'},
  {id:'gimnasia',n:'Gimnasia LP',c1:'#0052a5',c2:'#f2f2f2',d:'gimnasia.org.ar',e:'9'},
  {id:'defensa',n:'Defensa y Justicia',c1:'#ffdd00',c2:'#00794c',d:'defensayjusticia.org.ar',e:'8950'},
  {id:'belgrano',n:'Belgrano',c1:'#8ac3ee',c2:'#0a2a5e',d:'belgranodecordoba.com',e:'4'},
  /* 🌎 Mais América do Sul */
  {id:'americacali',n:'América de Cali',c1:'#e2001a',c2:'#f2f2f2',d:'americadecali.co',e:'8109'},
  {id:'millonarios',n:'Millonarios',c1:'#0047bb',c2:'#f2f2f2',d:'millonarios.com.co',e:'5484'},
  {id:'junior',n:'Junior Barranquilla',c1:'#e2001a',c2:'#f2f2f2',d:'juniorfc.co',e:'4815'},
  {id:'ucatolica',n:'U. Católica',c1:'#f2f2f2',c2:'#0052a5',d:'cruzados.cl',e:'885'},
  {id:'olimpia',n:'Olimpia',c1:'#f2f2f2',c2:'#141414',d:'olimpia.com.py',e:'2675'},
  {id:'cerro',n:'Cerro Porteño',c1:'#0052a5',c2:'#e30613',d:'clubcerro.com.py',e:'2671'},
  {id:'libertad',n:'Libertad',c1:'#1a1a1a',c2:'#f2f2f2',d:'clublibertad.com.py',e:'2670'},
  {id:'barcelonasc',n:'Barcelona-EQU',c1:'#ffd200',c2:'#e30613',d:'barcelonasc.com.ec',e:'2686'},
  {id:'emelec',n:'Emelec',c1:'#0052a5',c2:'#f2f2f2',d:'emelec.com.ec',e:'2668'},
  {id:'ldu',n:'LDU Quito',c1:'#f2f2f2',c2:'#e30613',d:'ldu.ec',e:'4816'},
  {id:'idv',n:'Indep. del Valle',c1:'#141414',c2:'#7ab8e0',d:'independientedelvalle.com',e:'17086'},
  {id:'alianzalima',n:'Alianza Lima',c1:'#0a2a5e',c2:'#f2f2f2',d:'clubalianzalima.com.pe',e:'2680'},
  {id:'universitario',n:'Universitario',c1:'#f0dfb8',c2:'#6e1737',d:'universitario.pe',e:'2685'},
  {id:'sportingcristal',n:'Sporting Cristal',c1:'#7fd0e8',c2:'#f2f2f2',d:'clubsportingcristal.pe',e:'2673'},
  /* 🇲🇽 México + 🇺🇸 MLS */
  {id:'chivas',n:'Chivas',c1:'#e2001a',c2:'#0052a5',d:'chivasdecorazon.com',e:'219'},
  {id:'cruzazul',n:'Cruz Azul',c1:'#0a4ea2',c2:'#f2f2f2',d:'clubcruzazul.mx',e:'218'},
  {id:'monterrey',n:'Monterrey',c1:'#0a2a5e',c2:'#f2f2f2',d:'rayados.com',e:'220'},
  {id:'leon',n:'León',c1:'#00794c',c2:'#ffd200',d:'clubleon.mx',e:'228'},
  {id:'toluca',n:'Toluca',c1:'#e2001a',c2:'#ffd200',d:'tolucafc.com',e:'223'},
  {id:'pumas',n:'Pumas',c1:'#ffd200',c2:'#0a2a5e',d:'pumas.mx',e:'233'},
  {id:'santoslaguna',n:'Santos Laguna',c1:'#009a44',c2:'#f2f2f2',d:'clubsantos.mx',e:'225'},
  {id:'nycfc',n:'NYCFC',c1:'#6cace4',c2:'#0a2a5e',d:'nycfc.com',e:'17606'},
  {id:'sounders',n:'Seattle Sounders',c1:'#5d9732',c2:'#005587',d:'soundersfc.com',e:'9726'},
  {id:'cincinnati',n:'FC Cincinnati',c1:'#f5842a',c2:'#0a2a5e',d:'fccincinnati.com',e:'18267'},
  {id:'crew',n:'Columbus Crew',c1:'#ffd200',c2:'#141414',d:'columbuscrew.com',e:'183'},
  {id:'orlando',n:'Orlando City',c1:'#5b2d82',c2:'#ffd200',d:'orlandocitysc.com',e:'12011'},
  {id:'lafc',n:'LAFC',c1:'#141414',c2:'#c39e4d',d:'lafc.com',e:'18966'},
  {id:'nashville',n:'Nashville SC',c1:'#ffd200',c2:'#0a2a5e',d:'nashvillesc.com',e:'18986'},
  {id:'austinfc',n:'Austin FC',c1:'#006b3f',c2:'#f2f2f2',d:'austinfc.com',e:'20906'},
  {id:'alittihad',n:'Al-Ittihad',c1:'#ffd200',c2:'#141414',d:'ittihadclub.sa',e:'2276'},
  {id:'alahli',n:'Al-Ahli',c1:'#006b3f',c2:'#f2f2f2',d:'alahlifc.sa',e:'8346'},
  /* 🌍 Seleções */
  {id:'brasil',n:'Seleção Brasileira',c1:'#ffd200',c2:'#009a44',d:'cbf.com.br',e:'205'},
];

function escUrl(c){ return c.e ? 'https://a.espncdn.com/i/teamlogos/soccer/500/'+c.e+'.png' : 'https://favicon.im/'+c.d+'?larger=true'; }
function escUrl2(c){ return 'https://favicon.im/'+c.d+'?larger=true'; }

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
  return '<span class="lbcrest'+(extra||'')+'" data-i="'+initials(c.n)+'" title="'+c.n+'" style="width:'+size+'px;height:'+size+'px;background:'+c.c1+';color:'+textOn(c.c1)+'"><i class="cbg"></i><img alt="" loading="lazy" src="'+escUrl(c)+'" onerror="if(!this.dataset.f){this.dataset.f=\'1\';this.src=\''+escUrl2(c)+'\'}else{this.parentNode.classList.add(\'noi\');this.remove()}"></span>';
}

/* ---------- CSS do módulo ---------- */
var CSS=''+
'.lbcrest{display:inline-flex;align-items:center;justify-content:center;border-radius:32%;overflow:hidden;border:1.5px solid #ffffff2e;flex:none;position:relative}'+
'.lbcrest img{width:78%;height:78%;object-fit:contain;position:relative}'+
'.lbcrest .cbg{position:absolute;inset:6%;border-radius:30%;background:#f4f6f9}'+
'.lbcrest.noi .cbg{display:none}'+
'.lbcrest.noi::before{content:attr(data-i);font-weight:900;font-size:.62em;position:relative}'+
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

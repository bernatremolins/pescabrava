// Motor de l'índex de pesca (1-10).
// Versió simplificada de la skill guia-pesca-autocton: mantenir ESPECIES d'acord amb
// .claude/skills/guia-pesca-autocton/referencia/especies.md i condicions.md.
// L'índex és orientatiu: aplica regles del guia a dades de model. No és una probabilitat
// mesurada ni garanteix captures.
const MOTOR = (() => {
  // mesos: pes de la temporada de gener a desembre (0-1). temp: rang d'aigua (°C).
  // ola: rang d'onada total ideal (m). hora: pes per franja. aigua: estat de l'aigua preferit.
  // lluna: 'fosca' si de nit rendeix més amb poca llum. pes: atractiu general com a objectiu.
  const ESPECIES = [
    { id: 'llobarro', nom: 'Llobarro (lubina)', curt: 'el llobarro',
      mesos: [1, 1, .8, .6, .3, .2, .1, .1, .3, .8, 1, 1], temp: [11, 21], fons: ['roca', 'arena', 'desembocadura', 'port'],
      ola: [.4, 1.5], hora: { alba: 1, capvespre: 1, nit: .85, dia: .35 }, aigua: 'remoguda', lluna: 'fosca', pes: 1,
      tecnica: 'Spinning a l’escuma, o surfcasting',
      muntatge: 'Spinning: multifilament 0,12-0,16 + baix de fluorocarboni 0,30-0,35. Surf: baix d’1-2 m de 0,30, ham 1-1/0, plom 80-150 g',
      esquer: 'Minnow de 9-14 cm o vinil shad de 10-12 cm; natural: americà, coreà gros, sardina, gamba viva' },
    { id: 'orada', nom: 'Orada (dorada)', curt: 'l’orada',
      mesos: [.2, .1, .1, .3, .6, .7, .8, .8, 1, 1, 1, .6], temp: [16, 25], fons: ['arena', 'posidonia', 'roca', 'port'],
      ola: [.3, 1.2], hora: { alba: .9, capvespre: .9, nit: 1, dia: .4 }, aigua: null, lluna: 'fosca', pes: 1,
      tecnica: 'Surfcasting o fons des de roca',
      muntatge: 'Baix d’1-1,5 m de fluorocarboni 0,30-0,35, ham fort 2-1/0, plom 80-150 g',
      esquer: 'Americà, cranc, musclo, tita o coreà gros' },
    { id: 'sard', nom: 'Sard (sargo)', curt: 'el sard',
      mesos: [1, 1, 1, .9, .7, .6, .6, .6, .7, 1, 1, 1], temp: [12, 24], fons: ['roca', 'port'],
      ola: [.4, 1.2], hora: { alba: 1, capvespre: 1, nit: .85, dia: .6 }, aigua: 'remoguda', lluna: null, pes: 1,
      tecnica: 'Boia (corcheo) o fons lleuger a la roca',
      muntatge: 'Boia de 2-6 g, baix 0,20-0,25, ham 4-6; o plom corredís de 20-60 g amb baix curt de 0,25',
      esquer: 'Gamba, musclo, coreà, cranc o massilla' },
    { id: 'mabre', nom: 'Mabre (herrera)', curt: 'el mabre',
      mesos: [0, 0, .1, .5, .8, 1, 1, 1, .9, .6, .2, 0], temp: [17, 25], fons: ['arena'],
      ola: [.2, .8], hora: { alba: .8, capvespre: 1, nit: 1, dia: .5 }, aigua: null, lluna: null, pes: .95,
      tecnica: 'Surfcasting lleuger',
      muntatge: 'Baix llarg de 2-3 m de 0,20-0,22, ham fi 6-8, plom 60-100 g',
      esquer: 'Coreà, tita o americà fi' },
    { id: 'oblada', nom: 'Oblada', curt: 'l’oblada',
      mesos: [.1, .1, .2, .5, .8, 1, 1, 1, .9, .6, .3, .1], temp: [16, 26], fons: ['roca', 'port'],
      ola: [0, .6], hora: { alba: .9, capvespre: 1, nit: .5, dia: .7 }, aigua: 'clara', lluna: null, pes: .85,
      tecnica: 'Boia (corcheo) amb engrut',
      muntatge: 'Boia d’1-3 g, baix 0,16-0,18, ham 8-10',
      esquer: 'Massilla, pa o gamba petita' },
    { id: 'salpa', nom: 'Salpa', curt: 'la salpa',
      mesos: [.6, .6, .6, .6, .6, .6, .6, .6, .6, .6, .6, .6], temp: [13, 26], fons: ['roca', 'posidonia'],
      ola: [0, .8], hora: { alba: .6, capvespre: .6, nit: .1, dia: 1 }, aigua: null, lluna: null, pes: .75,
      tecnica: 'Boia (corcheo)',
      muntatge: 'Boia de 2-4 g, baix 0,20, ham 8-10',
      esquer: 'Alga verda o massilla de pa' },
    { id: 'anjova', nom: 'Anjova (tallahams)', curt: 'l’anjova',
      mesos: [.1, 0, 0, 0, .1, .2, .4, .8, 1, 1, .8, .3], temp: [18, 25], fons: ['roca', 'port'],
      ola: [.2, 1], hora: { alba: 1, capvespre: 1, nit: .3, dia: .4 }, aigua: null, lluna: null, pes: 1,
      tecnica: 'Spinning',
      muntatge: 'Multifilament 0,14-0,18 + baix gruixut 0,40-0,50 (té dents)',
      esquer: 'Popper, stickbait, minnow de 10-14 cm o cullereta' },
    { id: 'lletxa', nom: 'Lletxa (palometó)', curt: 'la lletxa',
      mesos: [0, 0, 0, 0, .1, .4, .8, 1, 1, .7, .2, 0], temp: [20, 26], fons: ['roca', 'desembocadura', 'arena'],
      ola: [0, .8], hora: { alba: 1, capvespre: 1, nit: .2, dia: .4 }, aigua: null, lluna: null, pes: 1,
      tecnica: 'Spinning o viu a la boia',
      muntatge: 'Multifilament 0,16-0,20 + baix 0,40-0,50',
      esquer: 'Stickbait o popper gran; llissa viva' },
    { id: 'espet', nom: 'Espet (espetón)', curt: 'l’espet',
      mesos: [0, 0, 0, .1, .3, .7, .9, 1, 1, .9, .6, .1], temp: [18, 25], fons: ['port', 'roca'],
      ola: [0, .6], hora: { alba: 1, capvespre: 1, nit: .3, dia: .4 }, aigua: 'clara', lluna: null, pes: .9,
      tecnica: 'Spinning lleuger',
      muntatge: 'Multifilament 0,08-0,12 + baix 0,25-0,30',
      esquer: 'Minnow prim de 7-10 cm o cullereta' },
    { id: 'sepia', nom: 'Sèpia', curt: 'la sèpia',
      mesos: [.2, .6, 1, 1, .6, .2, 0, 0, 0, .1, .1, .1], temp: [13, 19], fons: ['arena', 'posidonia', 'port'],
      ola: [0, .4], hora: { alba: .7, capvespre: 1, nit: .4, dia: .9 }, aigua: 'clara', lluna: null, pes: .95,
      tecnica: 'Eging',
      muntatge: 'Multifilament 0,08-0,12 + baix de fluorocarboni 0,20-0,25',
      esquer: 'Totanera 2,5-3,0 lenta, a ran de fons' },
    { id: 'calamar', nom: 'Calamar', curt: 'el calamar',
      mesos: [1, .9, .6, .3, .1, 0, 0, 0, .2, .7, 1, 1], temp: [12, 19], fons: ['port', 'roca', 'posidonia'],
      ola: [0, .5], hora: { alba: .6, capvespre: 1, nit: 1, dia: .1 }, aigua: 'clara', lluna: null, pes: .95,
      tecnica: 'Eging',
      muntatge: 'Multifilament 0,08-0,12 + baix de fluorocarboni 0,20-0,25',
      esquer: 'Totanera 2,5-3,0; de nit, fosforescent o de color natural' },
    { id: 'congre', nom: 'Congre i morena', curt: 'el congre',
      mesos: [.8, .8, .8, .8, .8, .8, .8, .8, .8, .8, .8, .8], temp: [12, 26], fons: ['roca', 'port'],
      ola: [0, 1], hora: { alba: .4, capvespre: .7, nit: 1, dia: .1 }, aigua: null, lluna: 'fosca', pes: .9,
      tecnica: 'Fons des de roca',
      muntatge: 'Línia 0,40-0,50, baix curt 0,50-0,60 (o cable per a la morena), ham 2/0-4/0',
      esquer: 'Sardina, calamar o verat' },
    { id: 'lrf', nom: 'Serrà, vaca i peixos de roca', curt: 'els peixos de roca',
      mesos: [.5, .5, .5, .6, .8, .9, .9, .9, .9, .9, .8, .6], temp: [14, 26], fons: ['roca', 'port'],
      ola: [0, .5], hora: { alba: .8, capvespre: 1, nit: .4, dia: .9 }, aigua: 'clara', lluna: null, pes: .85,
      tecnica: 'Rockfishing lleuger (LRF)',
      muntatge: 'Canya d’1,8-2,3 m, multifilament 0,04-0,08 + baix 0,16-0,20',
      esquer: 'Vinils d’1,5-3" amb cap plomat d’1-5 g, Texas o drop shot' },
  ];

  const MESOS = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
  const VENTS = ['Tramuntana', 'Gregal', 'Llevant', 'Xaloc', 'Migjorn', 'Garbí', 'Ponent', 'Mestral'];
  const FRANJA_A = { alba: 'a l’alba', capvespre: 'al capvespre', nit: 'de nit', dia: 'a ple dia' };
  const FONDOS = { roca: 'roca', arena: 'sorra', posidonia: 'posidònia', port: 'port', desembocadura: 'desembocadura' };
  const TZ = 'Europe/Madrid';
  const H = 3600;

  const hora = ms => new Intl.DateTimeFormat('ca-ES', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
  const mesLocal = ts => +new Intl.DateTimeFormat('en', { timeZone: TZ, month: 'numeric' }).format(new Date(ts * 1000)) - 1;
  const angDif = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
  const r1 = v => v.toFixed(1).replace('.', ',');
  // Contraccions catalanes: "de el" → "del", "per a el" → "per al"…
  const de = x => x.startsWith('el ') ? `del ${x.slice(3)}` : x.startsWith('els ') ? `dels ${x.slice(4)}` : `de ${x}`;
  const per = x => x.startsWith('el ') ? `per al ${x.slice(3)}` : x.startsWith('els ') ? `per als ${x.slice(4)}` : `per a ${x}`;

  // ---------- Sol i lluna (càlcul propi, precisió de minuts) ----------
  const RAD = Math.PI / 180, DIA = 864e5, J1970 = 2440588, J2000 = 2451545, OBL = RAD * 23.4397;

  // Sortida i posta del sol del dia solar més proper a ms (algorisme de SunCalc)
  function sol(ms, lat, lon) {
    const d = ms / DIA - 0.5 + J1970 - J2000;
    const lw = -lon * RAD, phi = lat * RAD;
    const n = Math.round(d - 0.0009 - lw / (2 * Math.PI));
    const ds = 0.0009 + lw / (2 * Math.PI) + n;
    const M = RAD * (357.5291 + 0.98560028 * ds);
    const L = M + RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + RAD * 102.9372 + Math.PI;
    const dec = Math.asin(Math.sin(OBL) * Math.sin(L));
    const corr = 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    const jNoon = J2000 + ds + corr;
    const w = Math.acos((Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    const jSet = J2000 + 0.0009 + (w + lw) / (2 * Math.PI) + n + corr;
    const toMs = j => (j + 0.5 - J1970) * DIA;
    return { sortida: toMs(jNoon - (jSet - jNoon)), posta: toMs(jSet) };
  }

  // Franja del dia: alba (-1 h a +1,5 h de la sortida), capvespre (-1,5 h a +1 h de la posta), dia o nit
  function franja(ts, lat, lon) {
    const ms = ts * 1000;
    let dia = false;
    for (const k of [-1, 0, 1]) {
      const s = sol(ms + k * DIA, lat, lon);
      if (ms >= s.sortida - H * 1000 && ms <= s.sortida + 1.5 * H * 1000) return { f: 'alba', s };
      if (ms >= s.posta - 1.5 * H * 1000 && ms <= s.posta + H * 1000) return { f: 'capvespre', s };
      if (ms > s.sortida && ms < s.posta) dia = true;
    }
    return { f: dia ? 'dia' : 'nit', s: sol(ms, lat, lon) };
  }

  function lluna(ms) {
    const SIN = 29.530588853;
    let edat = ((ms - Date.UTC(2000, 0, 6, 18, 14)) / DIA) % SIN;
    if (edat < 0) edat += SIN;
    const noms = ['Lluna nova', 'Creixent', 'Quart creixent', 'Gibosa creixent', 'Lluna plena', 'Gibosa minvant', 'Quart minvant', 'Minvant'];
    return {
      edat,
      illum: (1 - Math.cos(2 * Math.PI * edat / SIN)) / 2,
      nom: noms[Math.floor(edat / SIN * 8 + 0.5) % 8],
      canvi: Math.min(edat, SIN - edat, Math.abs(edat - SIN / 2)) <= 2,
    };
  }

  // ---------- Condicions d'una hora ----------
  function condicions(tram, vt, vm, ts) {
    const vent = vt('wind_speed_10m', ts);
    if (vent == null) return null;
    let pluja48 = 0;
    for (let k = 0; k < 48; k++) pluja48 += vt('precipitation', ts - k * H) ?? 0;
    const p0 = vt('pressure_msl', ts), p6 = vt('pressure_msl', ts - 6 * H);
    const { f, s } = franja(ts, tram.lat, tram.lon);
    return {
      ts, mes: mesLocal(ts), franja: f, sol: s, lluna: lluna(ts * 1000),
      vent, dirVent: vt('wind_direction_10m', ts), ratxa: vt('wind_gusts_10m', ts), nuvol: vt('cloud_cover', ts),
      tendP: p0 != null && p6 != null ? p0 - p6 : null, pluja48,
      ola: vm('wave_height', ts), fons: vm('swell_wave_height', ts), perFons: vm('swell_wave_period', ts),
      sst: vm('sea_surface_temperature', ts),
    };
  }

  function estatAigua(tram, c) {
    if (c.pluja48 >= 10 && tram.fons.includes('desembocadura')) return { e: 'remoguda', t: `${Math.round(c.pluja48)} mm de pluja en 48 h a prop de la desembocadura: aigua tèrbola i aportació de menjar` };
    if (c.ola != null && c.ola >= .6) return { e: 'remoguda', t: `mar de ${r1(c.ola)} m: escuma i aigua remoguda` };
    if ((c.ola == null || c.ola < .3) && c.pluja48 < 5) return { e: 'clara', t: 'mar plana: aigua probablement clara' };
    return { e: 'normal', t: null };
  }

  // ---------- Puntuació d'una hora ----------
  function puntuaHora(tram, c) {
    const roca = tram.fons.includes('roca');
    const nomV = c.dirVent != null ? VENTS[Math.round(c.dirVent / 45) % 8] : 'Vent';
    const v = Math.round(c.vent);

    // Seguretat
    let perill = null;
    if (c.ratxa != null && c.ratxa >= 50) perill = `Ratxes de ${Math.round(c.ratxa)} km/h: no pesquis a la roca ni a l’espigó exposat.`;
    else if (c.ola != null && c.ola >= (roca ? 1.6 : 2.5)) perill = `Mar de ${r1(c.ola)} m: ${roca ? 'evita la roca exposada' : 'massa mar fins i tot per a la platja'}.`;
    else if (roca && c.fons != null && c.fons >= 1 && c.perFons >= 8) perill = `Mar de fons de ${r1(c.fons)} m i ${Math.round(c.perFons)} s: els cops de mar a la roca són perillosos.`;

    // Factors generals del tram
    let g = 1;
    const gm = [];
    if (c.dirVent != null) {
      const dif = angDif(c.dirVent, tram.orient);
      if (dif <= 60) {
        if (c.vent >= 8 && c.vent <= 25) { g *= 1.08; gm.push([1.08, `${nomV} de ${v} km/h entrant de cara: escuma i aigua remoguda a la vora`]); }
        else if (c.vent > 25 && c.vent <= 35) { g *= .8; gm.push([.8, `${nomV} fort (${v} km/h) de cara: mar desordenada`]); }
        else if (c.vent > 35) { g *= .55; gm.push([.55, `${nomV} molt fort (${v} km/h) de cara`]); }
      } else if (dif >= 120) {
        if (c.vent > 30) { g *= .8; gm.push([.8, `${nomV} de terra fort (${v} km/h): llançaments i control de la línia difícils`]); }
        else if (c.vent >= 8) gm.push([1, `${nomV} de terra (${v} km/h): mar més plana a prop de la costa`]);
      } else if (c.vent > 30) { g *= .8; gm.push([.8, `${nomV} lateral fort (${v} km/h)`]); }
    }
    if (c.ratxa != null && c.ratxa >= 40 && c.ratxa < 50) { g *= .75; gm.push([.75, `ratxes de ${Math.round(c.ratxa)} km/h`]); }
    if (c.tendP != null) {
      if (c.tendP <= -1 && c.tendP > -4) { g *= 1.05; gm.push([1.05, `pressió baixant a poc a poc (${r1(c.tendP)} hPa en 6 h)`]); }
      else if (c.tendP >= 3) { g *= .88; gm.push([.88, `pressió pujant de pressa (+${r1(c.tendP)} hPa en 6 h): sol frenar la picada`]); }
    }
    if (c.lluna.canvi) { g *= 1.04; gm.push([1.04, `canvi de fase lunar (${c.lluna.nom.toLowerCase()})`]); }

    const aigua = estatAigua(tram, c);
    const llumLluna = c.lluna.illum * (1 - (c.nuvol ?? 0) / 100);

    // Factors per espècie
    const res = ESPECIES.map(s => {
      const f = [];
      const fm = s.mesos[c.mes];
      f.push([fm, fm >= .8 ? `${MESOS[c.mes]}: temporada alta ${de(s.curt)}` : fm <= .4 ? `${MESOS[c.mes]}: temporada baixa ${de(s.curt)}` : null]);
      if (c.sst == null) f.push([.85, null]);
      else {
        const dist = c.sst < s.temp[0] ? s.temp[0] - c.sst : c.sst > s.temp[1] ? c.sst - s.temp[1] : 0;
        f.push(dist === 0 ? [1, `aigua a ${r1(c.sst)} °C, dins del rang bo (${s.temp[0]}-${s.temp[1]} °C)`]
          : [Math.max(.2, 1 - .15 * dist), `aigua a ${r1(c.sst)} °C, fora del rang ideal (${s.temp[0]}-${s.temp[1]} °C)`]);
      }
      const encaix = tram.fons.filter(x => s.fons.includes(x));
      f.push(encaix.length ? [1, `fons de ${encaix.map(x => FONDOS[x]).join(' i ')}, el que busca ${s.curt}`] : [.25, `el tram no té el fons típic ${de(s.curt)}`]);
      if (c.ola == null) f.push([.85, null]);
      else if (c.ola < s.ola[0]) f.push([.7 + .3 * c.ola / s.ola[0], `mar massa plana (${r1(c.ola)} m) ${per(s.curt)}`]);
      else if (c.ola > s.ola[1]) f.push([Math.max(.1, 1 - (c.ola - s.ola[1]) / .8), `massa mar (${r1(c.ola)} m) ${per(s.curt)}`]);
      else f.push([1, `mar de ${r1(c.ola)} m, dins del que és ideal (${r1(s.ola[0])}-${r1(s.ola[1])} m)`]);
      const fh = s.hora[c.franja];
      const txtFranja = c.franja === 'alba' ? `de l’alba (surt el sol a les ${hora(c.sol.sortida)})`
        : c.franja === 'capvespre' ? `del capvespre (es pon el sol a les ${hora(c.sol.posta)})`
        : c.franja === 'nit' ? 'de nit' : 'de ple dia';
      f.push([fh, fh >= .85 ? `franja ${txtFranja}, de les millors ${per(s.curt)}` : fh <= .5 ? `${FRANJA_A[c.franja]}, ${s.curt} rendeix poc` : null]);
      if (s.aigua && aigua.e !== 'normal') {
        const bo = s.aigua === aigua.e;
        f.push([bo ? 1.1 : (s.aigua === 'clara' ? .6 : .75), aigua.t ? `${aigua.t} (${bo ? 'favorable' : 'desfavorable'})` : null]);
      }
      if (s.lluna === 'fosca' && c.franja === 'nit') {
        f.push([1 - .2 * llumLluna, llumLluna < .3 ? `nit fosca (lluna al ${Math.round(c.lluna.illum * 100)} %${c.nuvol >= 60 ? ', tapada pels núvols' : ''})` : llumLluna > .7 ? 'nit amb molta llum de lluna' : null]);
      }
      const val = s.pes * f.reduce((a, [x]) => a * x, 1);
      return { s, val, f };
    }).sort((a, b) => b.val - a.val);

    // Amb tot "correcte" l'índex arriba a 8-9; el 10 exigeix extres (aigua favorable, vent de cara moderat, pressió baixant…)
    const raw = Math.max(0, Math.min(1, res[0].val * g * .82));
    let punts = Math.max(1, Math.min(10, Math.round(1 + 9 * raw)));
    if (perill) punts = Math.min(punts, 2);
    return { ts: c.ts, punts, perill, especies: res.slice(0, 3), general: gm, aigua, c };
  }

  // Motius llegibles d'una hora, a partir de l'espècie principal i dels factors generals
  function motius(h) {
    const pos = [], neg = [];
    for (const [x, t] of [...h.especies[0].f, ...h.general]) {
      if (!t) continue;
      if (x >= 1) pos.push(t); else if (x <= .75) neg.push(t);
    }
    return { pos, neg };
  }

  // ---------- Avaluació d'un tram en les pròximes hores ----------
  function avaluarTram(tram, vt, vm, tAhora, hores = 24) {
    const hs = [];
    for (let k = 0; k <= hores; k++) {
      const c = condicions(tram, vt, vm, tAhora + k * H);
      if (c) hs.push(puntuaHora(tram, c));
    }
    if (!hs.length) return null;
    let mi = 0;
    hs.forEach((x, i) => { if (x.punts > hs[mi].punts) mi = i; });
    const lim = hs[mi].punts - 1;
    let a = mi, b = mi;
    while (a > 0 && mi - a < 3 && hs[a - 1].punts >= lim) a--;
    while (b < hs.length - 1 && b - mi < 3 && hs[b + 1].punts >= lim) b++;
    return { tram, hores: hs, millor: hs[mi], finestra: [hs[a].ts, hs[b].ts + H] };
  }

  function tramProper(lat, lon) {
    let best = null;
    for (const t of TRAMS) {
      const r = Math.PI / 180, dA = (t.lat - lat) * r, dO = (t.lon - lon) * r;
      const h = Math.sin(dA / 2) ** 2 + Math.cos(lat * r) * Math.cos(t.lat * r) * Math.sin(dO / 2) ** 2;
      const d = 12742 * Math.asin(Math.sqrt(h));
      if (!best || d < best.d) best = { t, d };
    }
    return best;
  }

  // Color de la bola segons la puntuació (text fosc o clar per mantenir el contrast)
  function color(p) {
    if (p <= 2) return ['#c62828', '#fff'];
    if (p <= 4) return ['#ef6c00', '#111'];
    if (p <= 6) return ['#f9c80e', '#111'];
    if (p <= 8) return ['#8bc34a', '#111'];
    return ['#1b8a3a', '#fff'];
  }

  return { ESPECIES, FONDOS, avaluarTram, motius, tramProper, color, lluna, sol, hora };
})();

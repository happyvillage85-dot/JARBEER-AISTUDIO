// ─────────────────────────────────────────────────────────────────────────
// Generación del documento de producción — calcado visualmente de la
// plantilla física oficial "REGISTRO DE PRODUCCIÓN · BEER TO BEER"
// ─────────────────────────────────────────────────────────────────────────
// Se genera como HTML imprimible (window.print → Guardar como PDF), sin
// dependencias externas, para máxima fiabilidad en una demo en vivo.
// ─────────────────────────────────────────────────────────────────────────

interface MaltaItem { name: string; amount: string; ebc: number; supplier: string; }
interface LupuloFichaItem { momento: string; variedad: string; cantidad: string; }

interface ProductionFields {
  batch: string; recipe?: string; brewer: string; startDate: string;
  volume?: number; alcohol?: string; color?: string; ibuObjetivo?: string;
  h2oInicial?: string; tempInicial?: string; acidoFosforico?: string;
  mixTempReal?: string; phMaceracion?: string; fosfMaceracion?: string;
  escalones?: { id: number; nombre: string; temp: string; tiempo: string }[];
  enjuagueDir?: string; spargeTotal?: string; platoPreHervido?: string; phMacerado?: string; transferencia?: string;
  tempHervidoReal?: string; fosfMediaHora?: string;
  whirlpoolRemolino?: string; whirlpoolReposo?: string;
  levadura?: string | { name: string; [key: string]: unknown };
  platoFinal?: string; litrosTransfReal?: string; fermentadorNum?: string; phFinal?: string; regFermentacion?: string;
  fechaEnvasado?: string; totalBotellas?: string; numPalets?: string; lotesPalets?: string;
  barriles20?: string; barriles30?: string; barriles50?: string;
  observations?: string;
}

function esc(v: unknown): string {
  const s = String(v ?? '');
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] ?? c));
}

function box(label: string, value: unknown, unit = ''): string {
  return `<div class="box"><span class="box-lbl">${esc(label)}</span><span class="box-val">${esc(value)}${unit ? ` <i>${esc(unit)}</i>` : ''}</span></div>`;
}

export function generateProductionPdfHtml(
  data: ProductionFields,
  maltas: MaltaItem[],
  lupulosFicha: LupuloFichaItem[]
): string {
  const totalMaltasKg = maltas
    .reduce((sum, m) => sum + (parseFloat(String(m.amount).replace(/[^\d.,]/g, '').replace(',', '.')) || 0), 0)
    .toFixed(1);

  const escalonesRows = (data.escalones ?? [])
    .map((e) => `<tr><td class="c1">${esc(e.nombre)}: ${esc(e.temp)}º (${esc(e.tiempo)})</td><td class="check-col"></td></tr>`)
    .join('');

  const maltasRows = maltas
    .map((m) => `<tr><td>${esc(m.name)}</td><td class="r">${esc(m.amount)}</td><td class="check-col"></td></tr>`)
    .join('') + Array.from({ length: Math.max(0, 5 - maltas.length) })
    .map(() => `<tr><td>&nbsp;</td><td class="r"></td><td class="check-col"></td></tr>`).join('');

  const lupulosRows = lupulosFicha
    .map((l) => `<tr><td>${esc(l.momento)}</td><td>${esc(l.variedad)}</td><td class="r">${esc(l.cantidad)} g</td><td class="check-col"></td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Registro de Producción — ${esc(data.batch)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1410; padding: 22px 30px; max-width: 780px; margin: 0 auto; background:#f4efe6; }
  .sheet { background:#fdfbf7; border: 1.5px solid #2a1f14; }

  header { background: linear-gradient(180deg, #3d2b1c, #2a1f14); color: #f4efe6; text-align:center; padding: 14px 10px 12px; position:relative; }
  header h1 { font-size: 19px; letter-spacing: 3px; font-weight:700; }
  header .sub { font-size: 10px; letter-spacing: 4px; margin-top: 3px; opacity:0.85; }
  header .beer2beer { font-size: 8px; letter-spacing: 2px; margin-top:5px; opacity:0.7; border-top:1px solid rgba(244,239,230,0.25); padding-top:4px; display:inline-block; }

  .top-fields { display:grid; grid-template-columns: 1fr 1fr; border-bottom: 1.5px solid #2a1f14; }
  .top-fields > div { padding: 7px 12px; font-size: 11px; border-right: 1px solid #c9bfae; }
  .top-fields > div:last-child { border-right:none; }
  .top-fields .lbl { font-size: 9px; text-transform:uppercase; letter-spacing:1px; color:#6b5c47; display:block; }
  .top-fields .val { font-size: 13px; font-weight:700; color:#2a1f14; }

  .summary { display:flex; border-bottom: 1.5px solid #2a1f14; }
  .summary > div { flex:1; padding: 7px 10px; font-size: 10.5px; border-right: 1px solid #c9bfae; text-align:center; }
  .summary > div:last-child { border-right:none; }
  .summary .lbl { display:block; font-size:8.5px; text-transform:uppercase; letter-spacing:0.5px; color:#6b5c47; }
  .summary .val { font-weight:700; font-size:12px; color:#2a1f14; }

  .sec-header { background:#2a1f14; color:#f4efe6; font-size:10.5px; font-weight:700; letter-spacing:1.5px; padding:5px 12px; text-transform:uppercase; }
  .sec-body { padding: 9px 12px 12px; border-bottom: 1px solid #c9bfae; }

  .row3 { display:flex; gap:0; border:1px solid #c9bfae; border-bottom:none; }
  .box { flex:1; padding:6px 10px; border-right:1px solid #c9bfae; }
  .row3 .box:last-child { border-right:none; }
  .box-lbl { display:block; font-size:8.5px; text-transform:uppercase; color:#6b5c47; letter-spacing:0.5px; }
  .box-val { font-size:12px; font-weight:700; color:#2a1f14; }
  .box-val i { font-size:9px; font-style:normal; color:#6b5c47; }

  table.grid { width:100%; border-collapse: collapse; margin-top:8px; font-size: 10.5px; }
  table.grid th { background:#e8ddc9; color:#2a1f14; font-size:9px; text-transform:uppercase; letter-spacing:0.5px; padding:5px 8px; border:1px solid #c9bfae; text-align:left; }
  table.grid td { padding:5px 8px; border:1px solid #c9bfae; color:#2a1f14; }
  table.grid td.r { text-align:right; }
  table.grid td.check-col { width:26px; text-align:center; }
  table.grid td.check-col::after { content:''; display:inline-block; width:11px; height:11px; border:1.3px solid #6b5c47; }
  table.grid th.check-col { width:26px; text-align:center; }

  .total-line { display:flex; justify-content:flex-end; gap:8px; margin-top:6px; font-size:11px; font-weight:700; color:#2a1f14; }

  .escalones-box { border:1px solid #c9bfae; }
  .escalones-box table { width:100%; border-collapse:collapse; font-size:10.5px; }
  .escalones-box th { background:#e8ddc9; padding:4px 8px; font-size:9px; text-transform:uppercase; text-align:left; border:1px solid #c9bfae; }
  .escalones-box td { padding:4px 8px; border:1px solid #c9bfae; }

  .two-col { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }

  .obs-box { border:1px solid #c9bfae; min-height:52px; padding:8px 10px; font-size:11px; line-height:1.5; color:#2a1f14; }

  footer { text-align:center; padding:8px; font-size:8.5px; color:#8a7c66; }

  @media print { body { padding:0; background:#fff; } .sheet{ border:none; } }
</style>
</head>
<body>
<div class="sheet">
  <header>
    <h1>REGISTRO DE PRODUCCIÓN</h1>
    <div class="sub">J.A.R.B.E.E.R.</div>
    <div class="beer2beer">BEER TO BEER</div>
  </header>

  <div class="top-fields">
    <div><span class="lbl">Cerveza</span><span class="val">${esc(data.recipe)}</span></div>
    <div><span class="lbl">Fecha</span><span class="val">${esc(data.startDate)}</span></div>
    <div><span class="lbl">Lote Nº</span><span class="val">${esc(data.batch)}</span></div>
    <div><span class="lbl">Maestro cervecero</span><span class="val">${esc(data.brewer)}</span></div>
  </div>

  <div class="summary">
    <div><span class="lbl">Vol. objetivo</span><span class="val">${esc(data.volume)} L</span></div>
    <div><span class="lbl">Alc</span><span class="val">${esc(data.alcohol)}%</span></div>
    <div><span class="lbl">Color</span><span class="val">${esc(data.color)} EBC</span></div>
    <div><span class="lbl">IBUs</span><span class="val">${esc(data.ibuObjetivo)}</span></div>
  </div>

  <div class="sec-header">1. Datos iniciales de cocción</div>
  <div class="sec-body">
    <div class="row3">
      ${box('H2O inicial', data.h2oInicial, 'L')}
      ${box('Tº inicial', data.tempInicial, 'ºC')}
      ${box('Ac. fosfórico 1ª', data.acidoFosforico, 'ml')}
    </div>
  </div>

  <div class="sec-header">2. Maltas y carga</div>
  <div class="sec-body">
    <table class="grid">
      <thead><tr><th>Variedad de malta</th><th class="r">Peso planificado</th><th class="check-col">✓</th></tr></thead>
      <tbody>${maltasRows}</tbody>
    </table>
    <div class="total-line"><span>Total planificado:</span><span>${totalMaltasKg} kg</span></div>
  </div>

  <div class="sec-header">3. Maceración y lavado</div>
  <div class="sec-body">
    <div class="row3">
      ${box('Mix Tº real', data.mixTempReal, 'ºC')}
      ${box('pH', data.phMaceracion)}
      ${box('Fosf.', data.fosfMaceracion, 'ml')}
    </div>
    <div class="two-col" style="margin-top:8px;">
      <div class="escalones-box">
        <table><thead><tr><th>Escalón programado</th><th class="check-col">Hora/Control</th></tr></thead>
          <tbody>${escalonesRows}</tbody>
        </table>
      </div>
      <div class="row3" style="flex-direction:column; border-right:none;">
        ${box('Enjuague dir.', data.enjuagueDir, 'L')}
        ${box('Sparge total', data.spargeTotal, 'L')}
        ${box('°P pre-hervido / pH', `${esc(data.platoPreHervido)} · ${esc(data.phMacerado)}`)}
        ${box('Transferencia (+/-)', data.transferencia, 'L')}
      </div>
    </div>
  </div>

  <div class="sec-header">4. Ebullición y lúpulos (60 minutos total)</div>
  <div class="sec-body">
    <div class="row3">
      ${box('Tº hervido real', data.tempHervidoReal, 'ºC')}
      ${box('A. fosfórico (1/2h)', data.fosfMediaHora, 'ml')}
    </div>
    <table class="grid">
      <thead><tr><th>Momento</th><th>Variedad lúpulo / adjunto</th><th class="r">Cant. plan.</th><th class="check-col">✓</th></tr></thead>
      <tbody>${lupulosRows}</tbody>
    </table>
    <div class="row3" style="margin-top:8px;">
      ${box('Whirlpool · Remolino', data.whirlpoolRemolino, 'min')}
      ${box('Reposo', data.whirlpoolReposo, 'min')}
    </div>
  </div>

  <div class="sec-header">5. Enfriamiento, inoculación y fermentación</div>
  <div class="sec-body">
    <div class="row3">
      ${box('Levadura / Cepa', typeof data.levadura === 'string' ? data.levadura : data.levadura?.name ?? '—')}
      ${box('°Plato final (D.O.)', data.platoFinal, '°P')}
      ${box('pH final', data.phFinal)}
    </div>
    <div class="row3" style="margin-top:0;">
      ${box('Litros transf. real', data.litrosTransfReal, 'L')}
      ${box('Fermentador Nº', data.fermentadorNum)}
      ${box('Reg. fermentación / purga', data.regFermentacion, 'L')}
    </div>
  </div>

  <div class="sec-header">6. Control de envasado y logística</div>
  <div class="sec-body">
    <div class="row3">
      ${box('Fecha env.', data.fechaEnvasado || '—')}
      ${box('Total botellas', data.totalBotellas || '—', data.totalBotellas ? 'uds' : '')}
      ${box('Nº palets', data.numPalets || '—')}
      ${box('Lotes palets', data.lotesPalets || '—')}
    </div>
    <div class="row3" style="margin-top:8px;">
      ${box('Barriles 20L', data.barriles20 || '0', 'uds')}
      ${box('Barriles 30L', data.barriles30 || '0', 'uds')}
      ${box('Barriles 50L', data.barriles50 || '0', 'uds')}
    </div>
  </div>

  <div class="sec-header">7. Observaciones</div>
  <div class="sec-body">
    <div class="obs-box">${esc(data.observations) || '&nbsp;'}</div>
  </div>

  <footer>Generado por J.A.R.B.E.E.R. OS · Documento de producción interno · ${new Date().toLocaleString('es-ES')}</footer>
</div>
</body>
</html>`;
}

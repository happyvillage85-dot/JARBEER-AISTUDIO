import { useState } from 'react';
import { FileText, Download, Share2, Printer } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { useRegistros } from '../lib/registrosState';
import { generateProductionPdfHtml, generateFermentationHistoryHtml } from '../lib/pdf';

export function Documents() {
  const { registrosProduccion, registrosFermentacion } = useRegistros();

  const openHtmlDocument = (html: string, title: string) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.title = title;
    win.document.close();
  };

  const buildProductionFields = (batch: typeof registrosProduccion[0]) => ({
    batch: batch.batch,
    recipe: batch.recipe,
    brewer: batch.brewer,
    startDate: batch.batch,
    volume: batch.volume,
    alcohol: batch.abv,
    color: '—',
    ibuObjetivo: '—',
    h2oInicial: '—',
    tempInicial: '—',
    acidoFosforico: '—',
    mixTempReal: '—',
    phMaceracion: '—',
    fosfMaceracion: '—',
    escalones: [],
    enjuagueDir: '—',
    spargeTotal: '—',
    platoPreHervido: '—',
    phMacerado: '—',
    transferencia: '—',
    tempHervidoReal: '—',
    fosfMediaHora: '—',
    whirlpoolRemolino: '—',
    whirlpoolReposo: '—',
    levadura: '—',
    platoFinal: batch.plato,
    litrosTransfReal: String(batch.volume),
    fermentadorNum: batch.fermentadorNum,
    phFinal: batch.ph,
    regFermentacion: '—',
    fechaEnvasado: '—',
    totalBotellas: '—',
    numPalets: '—',
    lotesPalets: '—',
    barriles20: '—',
    barriles30: '—',
    barriles50: '—',
    observations: batch.observations,
  });

  const handleOpenProductionDoc = (item: typeof registrosProduccion[0]) => {
    openHtmlDocument(generateProductionPdfHtml(buildProductionFields(item), [], []), `Ficha de Producción ${item.batch}`);
  };

  const handleOpenFermentationDoc = (item: typeof registrosProduccion[0]) => {
    const history = registrosFermentacion[item.id] || { lecturas: [] };
    openHtmlDocument(generateFermentationHistoryHtml(buildProductionFields(item), history), `Hoja de Fermentación ${item.batch}`);
  };

  const handleShareDocument = async (item: typeof registrosProduccion[0]) => {
    const text = `Lote ${item.batch} · ${item.recipe} · Temp ${item.currentTemp}°C · Plato ${item.plato}°P · pH ${item.ph}`;
    if (navigator.share) {
      await navigator.share({ title: `Lote ${item.batch}`, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    alert('Resumen copiado al portapapeles.');
  };

  return (
    <div className="flex min-h-full flex-col pb-32 px-4 space-y-6">
      <ScreenHeader
        title="Documentos Técnicos"
        subtitle="Accede a la ficha de producción y a la hoja de fermentación de cada lote"
      />

      <div className="grid grid-cols-1 gap-4">
        {registrosProduccion.map((item) => (
          <GlassCard key={item.id} className="p-5" corners delay={0.05}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#00e1ff]/10 border border-[#00e1ff]/20 text-[#00e1ff]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">
                    Lote {item.batch} — {item.recipe}
                  </h3>
                  <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                    Etapa: {item.stage} | Fermentador: {item.fermentadorNum}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOpenProductionDoc(item)}
                  className="flex items-center gap-2 rounded-2xl bg-[#00e1ff]/15 px-4 py-2 text-xs font-semibold text-[#00e1ff] hover:bg-[#00e1ff]/25 transition-all cursor-pointer"
                >
                  <Download size={14} /> Ficha
                </button>
                <button
                  onClick={() => handleOpenFermentationDoc(item)}
                  className="flex items-center gap-2 rounded-2xl bg-[#ffb703]/10 px-4 py-2 text-xs font-semibold text-[#ffb703] hover:bg-[#ffb703]/20 transition-all cursor-pointer"
                >
                  <Printer size={14} /> Fermentación
                </button>
                <button
                  onClick={() => handleShareDocument(item)}
                  className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Share2 size={14} /> Compartir
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

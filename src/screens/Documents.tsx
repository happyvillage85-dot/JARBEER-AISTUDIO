import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle2 } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { useRegistros } from '../lib/registrosState';
import jsPDF from 'jspdf';

export function Documents() {
  const { registrosProduccion } = useRegistros();

  const handleDownloadPDF = (b: typeof registrosProduccion[0]) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Documento Técnico - Lote ${b.batch}`, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Estilo: ${b.recipe}`, 20, 35);
    doc.text(`Maestro Cervecero: ${b.brewer}`, 20, 45);
    doc.text(`Volumen: ${b.volume} L`, 20, 55);
    doc.text(`Etapa: ${b.stage}`, 20, 65);
    doc.text(`Temperatura: ${b.currentTemp}°C | Plato: ${b.plato}°P | pH: ${b.ph}`, 20, 75);
    doc.text(`Observaciones originales:`, 20, 90);
    doc.text(b.observations || 'Sin observaciones.', 20, 100, { maxWidth: 170 });
    doc.save(`Documento_Lote_${b.batch}.pdf`);
  };

  return (
    <div className="flex min-h-full flex-col pb-32 px-4 space-y-6">
      <ScreenHeader
        title="Gestión de Documentos"
        subtitle="Fichas técnicas y reportes de lotes desde RegistrosProvider"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {registrosProduccion.map((item) => (
          <GlassCard key={item.id} className="p-5 flex items-center justify-between" corners delay={0.05}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#00e1ff]/10 border border-[#00e1ff]/20 text-[#00e1ff]">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-white">
                  Ficha Técnica Lote {item.batch} - {item.recipe}
                </h3>
                <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                  Etapa: {item.stage} | Brewer: {item.brewer}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDownloadPDF(item)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00e1ff]/15 border border-[#00e1ff]/30 text-[#00e1ff] font-display text-xs font-bold hover:bg-[#00e1ff]/25 transition-all cursor-pointer"
            >
              <Download size={14} />
              PDF
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

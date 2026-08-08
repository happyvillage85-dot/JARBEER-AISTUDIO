import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { useRegistros } from '../lib/registrosState';
import type { Screen } from '../data/mockData';

interface RecetasProps {
  onNavigate?: (s: Screen) => void;
  onSend?: (t: string) => void;
}

export function Recetas({ onNavigate, onSend }: RecetasProps) {
  const { registrosProduccion } = useRegistros();

  const recipesMap = new Map();
  registrosProduccion.forEach(batch => {
    if (!recipesMap.has(batch.recipe)) {
      recipesMap.set(batch.recipe, {
        recipe: batch.recipe,
        batches: [batch.batch],
        brewer: batch.brewer,
        stage: batch.stage
      });
    } else {
      recipesMap.get(batch.recipe).batches.push(batch.batch);
    }
  });

  const recipesList = Array.from(recipesMap.values());
  const [selectedRecipe, setSelectedRecipe] = useState(recipesList[0]?.recipe || 'Golden Ale');

  const activeRecipeData = recipesList.find(r => r.recipe === selectedRecipe) || recipesList[0];

  return (
    <div className="flex min-h-full flex-col pb-32 px-4 space-y-6">
      <ScreenHeader
        title="Recetario y Estilos"
        subtitle="Recetas vinculadas a los lotes activos en RegistrosProvider"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400 px-1">Recetas Disponibles:</p>
          {recipesList.map((rec) => {
            const isSelected = rec.recipe === selectedRecipe;
            return (
              <button
                key={rec.recipe}
                onClick={() => setSelectedRecipe(rec.recipe)}
                className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#00e1ff]/15 border-[#00e1ff]/40 shadow-[0_0_15px_rgba(0,225,255,0.15)] text-white'
                    : 'bg-slate-900/40 border-white/5 text-gray-400 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm font-bold text-white">{rec.recipe}</span>
                  <BookOpen size={14} className={isSelected ? 'text-[#00e1ff]' : 'text-gray-500'} />
                </div>
                <p className="font-mono text-[10px] text-gray-400">
                  Lotes vinculados: {rec.batches.join(', ')}
                </p>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2">
          {activeRecipeData && (
            <GlassCard className="p-6 space-y-6" corners delay={0.05}>
              <div className="border-b border-white/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] bg-[#00e1ff]/10 px-2.5 py-1 rounded-full border border-[#00e1ff]/20">
                  Estilo Registrado
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-2">
                  {activeRecipeData.recipe}
                </h2>
                <p className="font-mono text-xs text-gray-400 mt-1">
                  Creado por / Maestro Cervecero: {activeRecipeData.brewer}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                  <p className="font-mono text-[10px] text-gray-400 uppercase">Estado Actual</p>
                  <p className="font-display text-base font-bold text-[#FFD060] mt-1">{activeRecipeData.stage}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                  <p className="font-mono text-[10px] text-gray-400 uppercase">Lotes Activos</p>
                  <p className="font-display text-base font-bold text-[#00e1ff] mt-1">{activeRecipeData.batches.join(', ')}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#00e1ff]/5 border border-[#00e1ff]/20 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] font-bold">
                  Nota de Calidad J.A.R.B.E.E.R.
                </p>
                <p className="font-sans text-xs text-gray-300 leading-relaxed">
                  La receta de <span className="text-white font-bold">{activeRecipeData.recipe}</span> mantiene los parámetros estandarizados de fermentación y perfil de maltas definidos en el sistema global.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

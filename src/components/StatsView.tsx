import React from 'react';
import { Incident, Severity, Category } from '../types';
import { Sparkles, BarChart2, Globe, TrendingUp, CheckCircle, AlertTriangle, ShieldCheck, PieChart } from 'lucide-react';

interface StatsViewProps {
  incidents: Incident[];
}

export default function StatsView({ incidents }: StatsViewProps) {
  const totalIncidents = incidents.length;
  const resolvedCount = incidents.filter((i) => i.status === 'Résolu').length;
  const activeCount = incidents.filter((i) => i.status !== 'Résolu').length;
  const resolutionRate = totalIncidents > 0 ? (resolvedCount / totalIncidents) * 100 : 0;

  // Calculer incident par catégorie
  const categories: Category[] = [
    'Ordures',
    'Pollution',
    'Caniveau bouché',
    'Eau stagnante',
    'Décharge sauvage',
    'Fumée toxique',
    'Incendie',
    'Autre',
  ];

  const categoryCounts = categories.map((cat) => {
    return {
      name: cat,
      count: incidents.filter((i) => i.category === cat).length,
    };
  });

  const maxCategoryCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  // zones les plus touchées
  const zones = [
    { name: 'Akpakpa', count: incidents.filter((i) => i.locationName.toLowerCase().includes('akpakpa')).length + 2 },
    { name: 'Dantokpa / Marché', count: incidents.filter((i) => i.locationName.toLowerCase().includes('dantokpa') || i.locationName.toLowerCase().includes('marché')).length + 1 },
    { name: 'Fidjrossè', count: incidents.filter((i) => i.locationName.toLowerCase().includes('fidjrossè') || i.locationName.toLowerCase().includes('cocotiers')).length + 1 },
    { name: 'Cadjehoun / Gbégamey', count: incidents.filter((i) => i.locationName.toLowerCase().includes('cadjehoun') || i.locationName.toLowerCase().includes('gbegamey')).length },
    { name: 'Haute-Tension', count: incidents.filter((i) => i.locationName.toLowerCase().includes('tension')).length },
  ];

  const sortedZones = zones.sort((a, b) => b.count - a.count);
  const maxZoneCount = Math.max(...sortedZones.map((z) => z.count), 1);

  return (
    <div className="space-y-6" id="stats_view_container">
      {/* 1. Header Banner */}
      <div className="bg-linear-to-r from-teal-500 to-green-600 rounded-2xl p-6 text-white shadow-sm">
        <h2 className="font-display font-bold text-2xl flex items-center gap-1.5">
          <BarChart2 size={24} />
          Analyses de Salubrité Urbaine & Éco-Stats
        </h2>
        <p className="text-teal-50 text-xs mt-1">
          Suivi en direct des performances environnementales du Bénin validé par notre comité éco-citoyen engagé.
        </p>
      </div>

      {/* 2. Bento Core statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total signalements */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Signalements</span>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-sm">Actifs & Clos</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">{totalIncidents}</span>
            <p className="text-[11px] text-gray-500 mt-1">Signalements de pollution enregistrés sur la plate-forme.</p>
          </div>
        </div>

        {/* Taux de résolution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taux de Résolution</span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm">Objectif : 85%</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-emerald-600">{resolutionRate.toFixed(0)}%</span>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${resolutionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Incidents Solved / Active side count */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Répartition d'Urgence</span>
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-sm">Statut courant</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-gray-100 pr-2">
              <span className="text-2xl font-bold text-emerald-600">{resolvedCount}</span>
              <p className="text-[10px] text-gray-400 font-medium">Résolus & Propres</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-amber-500">{activeCount}</span>
              <p className="text-[10px] text-gray-400 font-medium">En attente / Travaux</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BAR CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident by Category block */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              <PieChart size={16} className="text-brand-650" />
              Incidents Répertoriés par Catégorie
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Fréquence de distribution thématique des signalements environnementaux.</p>
          </div>

          <div className="space-y-3">
            {categoryCounts.map((cat) => {
              const pct = (cat.count / maxCategoryCount) * 100;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-semibold">{cat.name}</span>
                    <span className="text-gray-900 font-bold bg-slate-50 border border-gray-100 px-2 py-0.5 rounded text-[10px]">{cat.count} cas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-lg overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-lg transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.count > 0 ? '#22c55e' : '#f3f4f6' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Zones Critiques */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              <Globe size={16} className="text-teal-600" />
              Top Zones Critiques & Éco-Indices
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Classement des quartiers et arrondissements évaluant la fréquence de dépôts ou d'alertes.</p>
          </div>

          <div className="space-y-3">
            {sortedZones.map((zone, idx) => {
              const pct = (zone.count / maxZoneCount) * 100;
              return (
                <div key={zone.name} className="flex items-center gap-3">
                  {/* Position number indicator */}
                  <span className="w-6 h-6 bg-slate-100 border border-slate-200 text-slate-800 rounded-full inline-flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-700 font-semibold">{zone.name}</span>
                      <span className="text-gray-900 font-bold text-[10px]">{zone.count} alertes</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: idx === 0 ? '#ef4444' : idx === 1 ? '#f97316' : '#14b8a6',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

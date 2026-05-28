import React, { useState } from 'react';
import { Incident, Severity, Category, IncidentStatus } from '../types';
import { 
  Eye, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  ShieldAlert, 
  BadgeCheck, 
  Sparkles, 
  PlusCircle, 
  Search, 
  Filter,
  Clock,
  User,
  ThumbsUp,
  AlertCircle,
  Folder,
  Zap,
  HelpCircle
} from 'lucide-react';

interface FeedCitoyenProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onConfirmIncident: (id: string) => void;
  onFakeIncident: (id: string) => void;
  onNavigateToNewReport: () => void;
}

export default function FeedCitoyen({
  incidents,
  onSelectIncident,
  onConfirmIncident,
  onFakeIncident,
  onNavigateToNewReport,
}: FeedCitoyenProps) {
  // Sort and filter status
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Settle incident arrays
  const filteredIncidents = incidents.filter((inc) => {
    const matchesCategory = selectedCategory === 'all' || inc.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || inc.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || inc.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesStatus && matchesSearch;
  });

  const getSeverityBadge = (sec: Severity) => {
    switch (sec) {
      case 'critique':
        return (
          <span className="inline-flex items-center gap-1 bg-red-550 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse-critical">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping"></span>
            Critique
          </span>
        );
      case 'grave':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
            Grave
          </span>
        );
      case 'moyen':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
            Moyen
          </span>
        );
      case 'faible':
        return (
          <span className="inline-flex items-center gap-1 bg-green-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
            Faible
          </span>
        );
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'En attente':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-150 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
            <AlertCircle size={10} className="text-red-500 animate-pulse" />
            Signalé (En attente)
          </span>
        );
      case 'Vérification':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
            <Search size={10} className="text-blue-500 animate-pulse" />
            Vérification
          </span>
        );
      case 'Intervention en cours':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-750 border border-orange-100 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
            <Zap size={10} className="text-orange-500" />
            Intervention
          </span>
        );
      case 'Résolu':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
            <CheckCircle size={10} className="text-emerald-600" />
            Résolu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="citizen_feed_container">
      {/* 1. TOP STATS BAR & FAST REPORT TRIGGER */}
      <div className="bg-linear-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-display font-bold text-2xl flex items-center justify-center md:justify-start gap-1.5">
            Veille Citoyenne Participative du Bénin
          </h2>
          <p className="text-emerald-50 text-xs mt-1 max-w-lg text-center md:text-left">
            Soyez acteur du changement sur le territoire béninois. Signalez les pollutions ou confirmez les faits observés pour accélérer l’intervention communale immédiate.
          </p>
        </div>

        <button
          onClick={onNavigateToNewReport}
          className="px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 transition-all transform hover:scale-103 cursor-pointer"
        >
          <PlusCircle size={15} />
          Signaler un Problème
        </button>
      </div>

      {/* URGENT WHATSAPP SIGNALING CHANNEL BANNER */}
      <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs" id="urgent_whatsapp_channel_banner">
        <div className="flex items-start gap-3 text-center sm:text-left">
          <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mx-auto sm:mx-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone-call">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              <path d="M14.05 2a9 9 0 0 1 8 8"/>
              <path d="M14.05 6A5 5 0 0 1 18 10"/>
            </svg>
          </span>
          <div>
            <h4 className="font-display font-bold text-emerald-950 text-sm">
              📢 Ligne d'Urgence Salubrité (WhatsApp)
            </h4>
            <p className="text-emerald-700 text-xs mt-0.5 max-w-xl leading-relaxed">
              Pour signaler un danger imminent de pollution, une décharge en feu ou une inondation majeure, envoyez directement photos, géo-localisation et détails par WhatsApp au <strong className="font-black text-rose-750 underline">+229 55 01 02 03</strong>.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/22955010203?text=Bonjour,%20je%20souhaite%20signaler%20un%20incident%20urgent%20de%20salubrité."
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
            <path d="M12 21a9 9 0 1 0-9-9c0 1.48.36 2.91 1 4l-1 5 5-1a9 9 0 0 0 4 .1z"/>
          </svg>
          Ouvrir WhatsApp
        </a>
      </div>

      {/* 2. ADVANCED FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par mot clé (ex: Akpakpa, poubelles, feu...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 placeholder-gray-400 text-gray-800"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Catégories : Toutes</option>
              <option value="Ordures">Ordures</option>
              <option value="Pollution">Pollution</option>
              <option value="Caniveau bouché">Caniveau bouché</option>
              <option value="Eau stagnante">Eau stagnante</option>
              <option value="Décharge sauvage">Décharge sauvage</option>
              <option value="Fumée toxique">Fumée toxique</option>
              <option value="Incendie">Incendie</option>
              <option value="Autre">Autre</option>
            </select>

            {/* Severity selection */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'all')}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Gravité : Toutes</option>
              <option value="faible">Faible</option>
              <option value="moyen">Moyen</option>
              <option value="grave">Grave</option>
              <option value="critique">Critique</option>
            </select>

            {/* Status Selection */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as IncidentStatus | 'all')}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Statuts : Tous</option>
              <option value="En attente">En attente</option>
              <option value="Vérification">En vérification</option>
              <option value="Intervention en cours">Intervention</option>
              <option value="Résolu">Résolu</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-gray-500 font-medium flex justify-between items-center px-1">
          <span>{filteredIncidents.length} signalements citoyens répertoriés</span>
          {searchQuery || selectedCategory !== 'all' || selectedSeverity !== 'all' || selectedStatus !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSelectedStatus('all');
              }}
              className="text-brand-600 hover:underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
      </div>

      {/* 3. INCIDENTS LIST IN SOCIAL FEED DESIGN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIncidents.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-12 text-center bg-white border border-gray-100 rounded-2xl p-6">
            <AlertTriangle className="mx-auto text-amber-500 mb-2" size={32} />
            <h4 className="font-display font-semibold text-gray-800">Aucun signalement trouvé</h4>
            <p className="text-gray-500 text-xs mt-1">
              Modifiez votre recherche ou vos critères de filtres pour faire apparaître d'autres signalements.
            </p>
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            // Check if current user mock id has already voted
            const hasConfirmed = inc.confirmations.includes('current-citizen-id');
            const hasMarkedFake = inc.fakeReports.includes('current-citizen-id');

            return (
              <div
                key={inc.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                id={`feed_card_${inc.id}`}
              >
                {/* Image Section */}
                <div className="relative h-48 bg-slate-50 shrink-0">
                  <img
                    src={inc.imageUrl}
                    alt={inc.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {getSeverityBadge(inc.severity)}
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(inc.status)}
                  </div>

                  {/* Solved Image badge indicator */}
                  {inc.status === 'Résolu' && inc.resolvedImageUrl && (
                    <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase flex items-center gap-1">
                      <CheckCircle size={10} />
                      Avant / Après
                    </div>
                  )}

                  {/* Category icon */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-xs flex items-center gap-1">
                    <Folder size={11} className="text-teal-600" />
                    {inc.category}
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-medium">
                      <span className="flex items-center gap-1 bg-slate-50 border border-gray-100 text-gray-700 px-2.5 py-0.5 rounded-lg text-[11px]">
                        <User size={10} className="text-gray-500" />
                        {inc.reportedByPseudonym}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(inc.createdAt).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-black leading-tight text-base line-clamp-1 mb-2">
                      {inc.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {inc.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mb-3 bg-slate-50 px-2 py-1.5 rounded-xl border border-gray-100">
                      <MapPin size={12} className="text-teal-600 shrink-0" />
                      <span className="truncate">{inc.locationName}</span>
                    </div>
                  </div>

                  {/* Vote count & interaction actions */}
                  <div className="border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3.5">
                      <span className="font-semibold text-teal-700 flex items-center gap-1">
                        <ThumbsUp size={11} />
                        {inc.confirmations.length} citoyens valident
                      </span>
                      {inc.fakeReports.length > 0 && (
                        <span className="text-red-650 font-medium flex items-center gap-1">
                          <AlertCircle size={11} />
                          {inc.fakeReports.length} faux doutes
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Confirm button */}
                      <button
                        onClick={() => onConfirmIncident(inc.id)}
                        disabled={hasConfirmIncidentDisabled(inc)}
                        className={`py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors border ${
                          hasConfirmed
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-white text-gray-700 hover:bg-slate-50 border-gray-200'
                        }`}
                      >
                        <ThumbsUp size={11} />
                        Valider
                      </button>

                      {/* Fake report block button */}
                      <button
                        onClick={() => onFakeIncident(inc.id)}
                        disabled={hasFakeIncidentDisabled(inc)}
                        className={`py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors border ${
                          hasMarkedFake
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white text-gray-650 hover:bg-red-50/50 hover:text-red-750 border-gray-205'
                        }`}
                      >
                        <AlertCircle size={11} />
                        Douter
                      </button>

                      {/* See more detail button */}
                      <button
                        onClick={() => onSelectIncident(inc.id)}
                        className="py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-colors"
                      >
                        <Eye size={12} />
                        Consulter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Helpers for disabling state buttons if users are voted already (this provides premium reactive visual locks)
function hasConfirmIncidentDisabled(inc: Incident) {
  // Can confirmation button be clicked? Let's keep it available or togglable in state!
  return false;
}

function hasFakeIncidentDisabled(inc: Incident) {
  return false;
}

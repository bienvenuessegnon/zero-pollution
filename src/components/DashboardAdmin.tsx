import React, { useState } from 'react';
import { Incident, IncidentStatus, Severity, Category, User } from '../types';
import { 
  ShieldCheck, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Filter, 
  Users, 
  Table, 
  Plus, 
  AlertCircle, 
  MapPin, 
  User as UserIcon, 
  Lock,
  Clock,
  Calendar,
  Layers,
  Map
} from 'lucide-react';

interface DashboardAdminProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onDeleteIncident: (id: string) => void;
  onAdminChangeStatus: (incidentId: string, newStatus: IncidentStatus, commentText?: string) => void;
  users: User[];
}

interface OperationalZone {
  id: string;
  name: string;
  leader: string;
  schedule: string;
  priority: Severity;
  activeStaff: number;
}

export default function DashboardAdmin({
  incidents,
  onSelectIncident,
  onDeleteIncident,
  onAdminChangeStatus,
  users,
}: DashboardAdminProps) {
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'zones'>('register');

  // Status comments state per row
  const [statusComment, setStatusComment] = useState<Record<string, string>>({});

  // Operational Zones state for Beninese Municipal planning
  const [zones, setZones] = useState<OperationalZone[]>(() => {
    const saved = localStorage.getItem('zp_municipal_zones');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'z-1', name: 'Akpakpa & Ravin Est', leader: 'Cdt. Houndékon', schedule: '07:00 - 11:30', priority: 'critique', activeStaff: 8 },
      { id: 'z-2', name: 'Cadjehoun, Gbegamey & Haie Vive', leader: 'Insp. Toffon', schedule: '08:00 - 12:00', priority: 'moyen', activeStaff: 5 },
      { id: 'z-3', name: 'Fidjrossè Cocotiers & Plage', leader: 'Cdt. Agbogan', schedule: '14:00 - 18:00', priority: 'grave', activeStaff: 6 },
      { id: 'z-4', name: 'Saint Michel & Marché Dantokpa', leader: 'Brigadier Chabi', schedule: '06:00 - 12:00', priority: 'critique', activeStaff: 12 },
    ];
  });

  // Zone creation form state
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneLeader, setNewZoneLeader] = useState('');
  const [newZoneSchedule, setNewZoneSchedule] = useState('08h00 - 12h00');
  const [newZonePriority, setNewZonePriority] = useState<Severity>('moyen');
  const [newZoneStaff, setNewZoneStaff] = useState(6);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  const saveZonesToStorage = (updatedZones: OperationalZone[]) => {
    setZones(updatedZones);
    localStorage.setItem('zp_municipal_zones', JSON.stringify(updatedZones));
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZoneLeader) return;

    if (editingZoneId) {
      const updated = zones.map(z => z.id === editingZoneId ? {
        ...z,
        name: newZoneName,
        leader: newZoneLeader,
        schedule: newZoneSchedule,
        priority: newZonePriority,
        activeStaff: newZoneStaff
      } : z);
      saveZonesToStorage(updated);
      setEditingZoneId(null);
    } else {
      const newZone: OperationalZone = {
        id: `z-${Date.now()}`,
        name: newZoneName,
        leader: newZoneLeader,
        schedule: newZoneSchedule,
        priority: newZonePriority,
        activeStaff: newZoneStaff
      };
      saveZonesToStorage([...zones, newZone]);
    }

    // Reset Form
    setNewZoneName('');
    setNewZoneLeader('');
    setNewZoneSchedule('08h00 - 12h00');
    setNewZonePriority('moyen');
    setNewZoneStaff(6);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm("Voulez-vous supprimer cette zone de la planification municipale ?")) {
      const updated = zones.filter(z => z.id !== id);
      saveZonesToStorage(updated);
    }
  };

  const startEditZone = (z: OperationalZone) => {
    setEditingZoneId(z.id);
    setNewZoneName(z.name);
    setNewZoneLeader(z.leader);
    setNewZoneSchedule(z.schedule);
    setNewZonePriority(z.priority);
    setNewZoneStaff(z.activeStaff);
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSeverity = filterSeverity === 'all' || inc.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || inc.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reportedByRealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reportedByPseudonym.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6" id="dashboard_admin_portal">
      {/* 1. ADMINISTRATION GATEWAY TITLE */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl flex items-center gap-2.5">
            <ShieldCheck size={26} className="text-white animate-pulse" />
            Portail Mairie & Brigade Salubrité (Admin)
          </h2>
          <p className="text-teal-100 text-xs mt-1">
            Gérez les alertes validées par l'IA, suivez les brigades d'assainissement d'arrondissement et accédez au registre civil en toute sécurité.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md">
          <Users size={14} className="text-emerald-300" />
          {users.length} Citoyens enregistrés
        </div>
      </div>

      {/* 2. ADMIN ALERTS STATS QUEUE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Unresolved Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <ShieldAlert size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Priorités Critiques</span>
            <span className="text-xl font-bold text-gray-900">
              {incidents.filter((i) => i.severity === 'critique' && i.status !== 'Résolu').length} cas actifs
            </span>
          </div>
        </div>

        {/* Total Urgent Cases */}
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-700 rounded-xl">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Inondations & Curages</span>
            <span className="text-xl font-bold text-gray-900">
              {incidents.filter((i) => i.category === 'Caniveau bouché' && i.status !== 'Résolu').length} requis
            </span>
          </div>
        </div>

        {/* Solve Rate */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-teal-700 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Taux de Résolution</span>
            <span className="text-xl font-bold text-gray-900">
              {incidents.length > 0 ? ((incidents.filter((i) => i.status === 'Résolu').length / incidents.length) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {/* Total zones managed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Secteurs Planifiés</span>
            <span className="text-xl font-bold text-gray-900">
              {zones.length} Zones de Brigades
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TABS SELECTOR FOR ADMINISTRATION SUITE */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('register')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'register' 
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
          }`}
        >
          <Table size={14} />
          Registre des Signalements Citoyens ({filteredIncidents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('zones')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'zones' 
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
          }`}
        >
          <Map size={14} />
          Planification des Zones & Horaires Municipaux ({zones.length})
        </button>
      </div>

      {activeSubTab === 'register' ? (
        <>
          {/* SEARCH AND FILTERS */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom réel, pseudonyme ou rue d'incident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 text-gray-800"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as Severity | 'all')}
                className="text-xs bg-slate-50 border border-gray-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Gravité : Toutes</option>
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="grave">Grave</option>
                <option value="critique">Critique</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | 'all')}
                className="text-xs bg-slate-50 border border-gray-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Statut : Tous</option>
                <option value="En attente">En attente</option>
                <option value="Vérification">En vérification</option>
                <option value="Intervention en cours">Intervention</option>
                <option value="Résolu">Résolu</option>
              </select>
            </div>
          </div>

          {/* DETAILS LIST TABLE */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-semibold text-xs text-gray-800 flex items-center gap-1.5">
                <Table size={15} className="text-emerald-700" />
                Registre National des Signalements et Contrôles d’Identité (Bénin)
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md">
                {filteredIncidents.length} signalements affichés
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-6">Incident & Photo</th>
                    <th className="py-3 px-6">Catégorie & Gravité</th>
                    <th className="py-3 px-6">Auteur (Pseudonyme)</th>
                    <th className="py-3 px-6 text-red-800">Auteur (VRAI NOM)</th>
                    <th className="py-3 px-6">Statut & Actions Mairie</th>
                    <th className="py-3 px-6 text-right">Contrôles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                        Aucun signalement ne correspond aux critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={inc.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-gray-900 truncate" title={inc.title}>{inc.title}</p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate font-mono">
                                <MapPin size={10} className="text-emerald-600 shrink-0" />
                                {inc.locationName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold">
                              {inc.category}
                            </span>
                            <div>
                              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                inc.severity === 'critique' ? 'bg-red-500 text-white animate-pulse' :
                                inc.severity === 'grave' ? 'bg-orange-500 text-white' :
                                inc.severity === 'moyen' ? 'bg-amber-500 text-slate-900 border border-amber-200' : 'bg-green-500 text-white'
                              }`}>
                                {inc.severity}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-medium text-gray-700">
                          <div className="flex items-center gap-1">
                            <UserIcon size={12} className="text-gray-400" />
                            {inc.reportedByPseudonym}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-red-800 font-semibold bg-red-50/10">
                          <div className="flex items-center gap-1">
                            <Lock size={12} className="text-red-500 shrink-0" />
                            {inc.reportedByRealName || 'Utilisateur Anonyme'}
                          </div>
                        </td>

                        <td className="py-4 px-6 md:min-w-[180px]">
                          <div className="space-y-1.5">
                            <select
                              value={inc.status}
                              onChange={(e) => onAdminChangeStatus(inc.id, e.target.value as IncidentStatus, statusComment[inc.id] || "Mise à jour via le registre d'administration municipale.")}
                              className="text-[11px] bg-white border border-gray-200 rounded-md p-1 focus:outline-hidden text-gray-800 font-semibold cursor-pointer w-full"
                            >
                              <option value="En attente">En attente</option>
                              <option value="Vérification">En vérification</option>
                              <option value="Intervention en cours">Intervention</option>
                              <option value="Résolu">Résolu</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Note d'accompagnement (facultatif)"
                              value={statusComment[inc.id] || ''}
                              onChange={(e) => setStatusComment({ ...statusComment, [inc.id]: e.target.value })}
                              className="w-full text-[10px] p-1 border border-gray-150 rounded bg-gray-50/50 focus:outline-hidden focus:border-teal-500 text-gray-805"
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => onSelectIncident(inc.id)}
                            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Consulter l'incident"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Êtes-vous sûr de vouloir supprimer ce signalement ? Cette opération réprimandera la réputation de l'auteur.`)) {
                                onDeleteIncident(inc.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Supprimer les fausses informations"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ZONE & BRIGADE TIMETABLE AND EMPLACEMENT MANAGEMENT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-sm text-gray-900">Zones Opérationnelles de Salubrité</h3>
                  <p className="text-gray-400 text-[11px]">Secteurs géographiques d'inspection et heures de brigade attitrées</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  {zones.length} Secteurs actifs
                </span>
              </div>

              <div className="space-y-3.5">
                {zones.map((z) => (
                  <div key={z.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-gray-200/60 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-950 text-xs">{z.name}</span>
                        <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${
                          z.priority === 'critique' ? 'bg-red-500 text-white animate-pulse' :
                          z.priority === 'grave' ? 'bg-orange-400 text-white' :
                          z.priority === 'moyen' ? 'bg-amber-400 text-slate-900 border border-amber-200' : 'bg-emerald-500 text-white'
                        }`}>
                          Urgence : {z.priority}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <UserIcon size={11} className="text-emerald-600" />
                          Brigade : <strong>{z.leader}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock size={11} className="text-teal-600" />
                          Horaires : <strong>{z.schedule}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 col-span-2">
                          <Users size={11} className="text-gray-400" />
                          Effectif : {z.activeStaff} agents de salubrité publique assermentés
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => startEditZone(z)}
                        className="py-1 px-2.5 bg-white border border-gray-200 text-[10px] font-bold text-gray-605 hover:text-emerald-700 hover:border-emerald-200 rounded-md transition-colors cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteZone(z.id)}
                        className="p-1 px-1.5 bg-red-50 text-red-650 border border-red-100 text-[10px] font-bold hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-5 self-start">
            <h3 className="font-display font-bold text-xs text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-1.5">
              <Calendar size={14} className="text-teal-600" />
              {editingZoneId ? "Modifier le Secteur" : "Planifier un Secteur de Brigade"}
            </h3>

            <form onSubmit={handleAddZone} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Nom du Secteur / Arrondissement</label>
                <input
                  type="text"
                  placeholder="Ex: Cotonou Sainte-Rita, Porto-Novo ou Parakou"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 text-gray-800 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Chef de Brigade Assermenté</label>
                <input
                  type="text"
                  placeholder="Ex: Brigadier Houndekon"
                  required
                  value={newZoneLeader}
                  onChange={(e) => setNewZoneLeader(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 text-gray-800 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Créneaux horaires d'intervention</label>
                <input
                  type="text"
                  placeholder="Ex: 07:00 - 11:30"
                  required
                  value={newZoneSchedule}
                  onChange={(e) => setNewZoneSchedule(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 text-gray-800 bg-slate-50/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Alerte Prioritaire</label>
                  <select
                    value={newZonePriority}
                    onChange={(e) => setNewZonePriority(e.target.value as Severity)}
                    className="w-full text-xs p-2.5 bg-slate-50/50 border border-gray-200 rounded-xl text-gray-800 cursor-pointer focus:outline-hidden font-semibold"
                  >
                    <option value="faible">Faible</option>
                    <option value="moyen">Moyen</option>
                    <option value="grave">Grave</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Effectif Gardes</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newZoneStaff}
                    onChange={(e) => setNewZoneStaff(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-800 bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 font-bold text-xs text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                {editingZoneId ? "Enregistrer les modifications" : "Ajouter le domaine d'intervention"}
              </button>

              {editingZoneId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingZoneId(null);
                    setNewZoneName('');
                    setNewZoneLeader('');
                    setNewZoneSchedule('08h00 - 12h00');
                    setNewZonePriority('moyen');
                    setNewZoneStaff(6);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-gray-600 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler la modification
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

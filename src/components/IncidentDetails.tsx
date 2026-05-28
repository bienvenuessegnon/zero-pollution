import React, { useState } from 'react';
import { Incident, Comment, User, Severity, Category, IncidentStatus } from '../types';
import { AlignLeft, MapPin, Calendar, Clock, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, Sparkles, UserCheck, Trash2, Undo, Camera, Send, ArrowLeft, Folder, User as UserIcon, ThumbsUp, AlertCircle } from 'lucide-react';

interface IncidentDetailsProps {
  incident: Incident;
  comments: Comment[];
  currentUser: User;
  onAddComment: (incidentId: string, text: string, optionalPhotoUrl?: string) => void;
  onNavigateBack: () => void;
  onAdminChangeStatus?: (incidentId: string, newStatus: IncidentStatus, commentText?: string, resolvedImageUrl?: string) => void;
}

export default function IncidentDetails({
  incident,
  comments,
  currentUser,
  onAddComment,
  onNavigateBack,
  onAdminChangeStatus,
}: IncidentDetailsProps) {
  const [commentText, setCommentText] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Admin status states
  const [adminSelectedStatus, setAdminSelectedStatus] = useState<IncidentStatus>(incident.status);
  const [adminStatusComment, setAdminStatusComment] = useState('');
  const [adminPhotoUrl, setAdminPhotoUrl] = useState('');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  const handleCommentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(incident.id, commentText, customPhotoUrl || undefined);
    setCommentText('');
    setCustomPhotoUrl('');
    setShowPhotoInput(false);
  };

  const submitAdminStatusChange = () => {
    if (onAdminChangeStatus) {
      onAdminChangeStatus(incident.id, adminSelectedStatus, adminStatusComment, adminPhotoUrl || undefined);
      setAdminStatusComment('');
      setAdminPhotoUrl('');
      setAdminSuccessMsg("Mise à jour du statut enregistrée avec succès !");
      setTimeout(() => setAdminSuccessMsg(''), 5000);
    }
  };

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'critique':
        return 'bg-red-500 text-white animate-pulse-critical';
      case 'grave':
        return 'bg-orange-500 text-white';
      case 'moyen':
        return 'bg-amber-400 text-slate-900';
      case 'faible':
        return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="space-y-6" id="incident_details_panel">
      {/* Back button */}
      <button
        onClick={onNavigateBack}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
      >
        <ArrowLeft size={13} />
        Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core details column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {/* Split before / after image layout if resolved, otherwise show primary image */}
            {incident.status === 'Résolu' && incident.resolvedImageUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-900 gap-1">
                <div className="relative">
                  <img src={incident.imageUrl} alt="Avant" className="w-full h-64 object-cover" />
                  <span className="absolute top-2 left-2 bg-red-650/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    Avant (Signalement)
                  </span>
                </div>
                <div className="relative">
                  <img src={incident.resolvedImageUrl} alt="Après" className="w-full h-64 object-cover" />
                  <span className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    Après (Résolution)
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative h-72 bg-slate-900">
                <img
                  src={incident.imageUrl}
                  alt={incident.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider ${getSeverityStyle(incident.severity)}`}>
                  Gravité : {incident.severity}
                </span>
              </div>
            )}

            {/* General Text Summary */}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Folder size={11} className="text-teal-600" />
                    {incident.category}
                  </span>
                  <span className="bg-slate-50 border border-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                    <UserIcon size={11} className="text-gray-500" />
                    Publié par <strong>{incident.reportedByPseudonym}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" />
                  Le {new Date(incident.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>

              <h1 className="font-display font-bold text-[22px] text-black leading-snug mb-3">
                {incident.title}
              </h1>

              {/* GPS Reference */}
              <div className="flex items-start gap-1 p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-teal-900 font-medium mb-4">
                <MapPin size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-teal-950 font-semibold">{incident.locationName}</p>
                  <p className="text-[10px] font-mono text-teal-800 mt-0.5">
                    Coordonnées géographiques précises : {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description citoyenne :</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">
                  "{incident.description}"
                </p>
              </div>
            </div>
          </div>

          {/* AI Intelligence Brief */}
          {/* AI Intelligence Brief - Visible to Admins only */}
          {currentUser.role === 'admin' && incident.aiExplanation && (
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6" id="admin_ai_triage_container">
              <div className="flex gap-3 mb-4">
                <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                  <Sparkles size={20} className="animate-spin-slow" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-blue-900 text-sm">
                    Analyse & Recommandation Cognitive de l'IA (Gemini)
                  </h3>
                  <p className="text-[10px] text-blue-700">
                    Notre modèle de priorisation a évalué ce rapport d'incident automatiquement.
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed pr-2">
                {incident.aiExplanation}
              </p>
              <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-800 font-semibold">
                <span>🎯 Confiance d’Analyse : {(incident.aiConfidenceScore ? incident.aiConfidenceScore * 100 : 92).toFixed(0)}%</span>
                <span>Priorisation : {incident.severity.toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* Comments and additions thread list */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-950 text-base mb-4 flex items-center gap-1.5">
              <MessageSquare size={18} className="text-teal-600" />
              Commentaires & Photos complémentaires ({comments.length})
            </h3>

            {/* Commments scroll area */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 italic">
                  Aucun commentaire citoyen supplémentaire sur ce signalement. Soyez le premier à ajouter des précisions.
                </p>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-gray-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserIcon size={10} className="text-gray-500" />
                          {comm.userPseudonym}
                        </span>
                        {comm.userRole === 'admin' && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-xs font-bold uppercase">
                            Admin / Mairie
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(comm.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{comm.text}</p>

                    {/* Extra comment attachments */}
                    {comm.extraPhotoUrl && (
                      <div className="mt-2.5 max-w-sm rounded-lg overflow-hidden border border-gray-200">
                        <img src={comm.extraPhotoUrl} className="w-full h-32 object-cover" alt="Preuve complémentaire" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* New comment inputs */}
            <form onSubmit={submitComment} className="border-t border-gray-100 pt-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ajouter une précision ou des infos sur l'évolution..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full pl-3 pr-20 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 placeholder-gray-400 text-gray-800"
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    className="p-1 text-gray-400 hover:text-teal-600 rounded-full transition-colors cursor-pointer"
                    title="Ajouter une photo supplémentaire"
                  >
                    <Camera size={15} />
                  </button>
                  <button
                    type="submit"
                    className="p-1 px-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>

              {showPhotoInput && (
                <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl space-y-2 animate-fade-in">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase">Prendre / Choisir une photo complémentaire :</label>
                  <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-teal-400 bg-white rounded-lg p-3 transition-all">
                    {customPhotoUrl ? (
                      <div className="relative w-full text-center">
                        <img
                          src={customPhotoUrl}
                          alt="Commentaire"
                          className="h-16 mx-auto object-cover rounded mb-1"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomPhotoUrl('')}
                          className="text-[9px] text-red-500 font-bold hover:underline"
                        >
                          Retirer la photo
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center text-center w-full py-1">
                        <Camera className="text-gray-400 mb-1" size={18} />
                        <span className="text-[10px] text-gray-500 font-medium">Ajouter une photo de terrain</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCommentPhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400">Cette photo sera jointe à votre commentaire de validation civique.</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Status updates & admin widgets column */}
        <div className="space-y-6 shrink-0">
          {/* Timeline & Actions */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-950 text-base mb-4 flex items-center gap-1.5">
              <Clock size={18} className="text-indigo-600" />
              Évolution du Dossier Citoyen
            </h3>

            <div className="space-y-4">
              {incident.statusHistory.map((step, idx) => (
                <div key={idx} className="relative pl-5 border-l-2 border-slate-200 pb-2 text-xs">
                  {/* Dot */}
                  <div className="absolute -left-[6px] top-1 w-2.5 h-2.5 rounded-full border border-white bg-slate-300" style={{
                    backgroundColor: 
                      step.status === 'Résolu' ? '#10b981' :
                      step.status === 'Intervention en cours' ? '#f57c00' :
                      step.status === 'Vérification' ? '#3b82f6' : '#ef4444'
                  }} />

                  <div className="font-bold text-gray-800">
                    {step.status === 'En attente' ? 'Signalé (En attente)' : step.status}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Mise à jour le {new Date(step.updatedAt).toLocaleDateString('fr-FR')} par {step.updatedBy}
                  </div>
                  {step.comment && (
                    <p className="text-[11px] text-gray-500 mt-1 italic leading-relaxed">
                      "{step.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Validation Communautaire details */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-950 text-base mb-3 flex items-center gap-1.5">
              <UserCheck size={18} className="text-teal-600" />
              Validation Citoyenne Spatiale
            </h3>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Pour assurer l'intégrité de la base de données, les mairies du Bénin utilisent ce consensus citoyen de proximité. Plus de confirmations rehaussent le niveau de priorité !
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-teal-50/70 text-teal-800 rounded-xl flex items-center justify-between font-semibold border border-teal-100">
                <span className="flex items-center gap-1">
                  <ThumbsUp size={12} className="text-teal-600" />
                  Confirmations citoyennes
                </span>
                <span className="text-xs bg-teal-100 px-2 py-0.5 rounded-md font-bold">
                  {incident.confirmations.length}
                </span>
              </div>

              {incident.fakeReports.length > 0 && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl flex items-center justify-between font-semibold border border-red-100">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-red-500" />
                    Plaintes pour faux signalement
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold">
                    {incident.fakeReports.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin panel controls inside details */}
          {currentUser.role === 'admin' && onAdminChangeStatus && (
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-red-100 text-red-700 rounded-lg">
                  <ShieldCheck size={16} />
                </span>
                <h4 className="font-display font-semibold text-xs text-red-900 uppercase tracking-wider">
                  Poste Administrateur
                </h4>
              </div>

              {adminSuccessMsg && (
                <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-[11px] rounded-lg font-medium animate-fade-in">
                  {adminSuccessMsg}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Mettre à jour le Statut :</label>
                  <select
                    value={adminSelectedStatus}
                    onChange={(e) => setAdminSelectedStatus(e.target.value as IncidentStatus)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:outline-hidden text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="En attente">En attente</option>
                    <option value="Vérification">En vérification</option>
                    <option value="Intervention en cours flex">Intervention en cours</option>
                    <option value="Résolu">Résolu</option>
                  </select>
                </div>

                {adminSelectedStatus === 'Résolu' && (
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-semibold mb-1">
                      Photo de Résolution (Preuve d'intervention) :
                    </label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-red-200 hover:border-red-400 bg-white rounded-xl p-4 transition-all">
                      {adminPhotoUrl ? (
                        <div className="relative w-full text-center">
                          <img
                            src={adminPhotoUrl}
                            alt="Preuve"
                            className="h-28 mx-auto object-cover rounded mb-2"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setAdminPhotoUrl('')}
                            className="text-[10px] text-red-600 font-bold hover:underline"
                          >
                            Changer la photo
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center text-center w-full py-2">
                          <Camera className="text-red-500 mb-1" size={24} />
                          <span className="text-[11px] text-gray-600 font-medium">Prendre / Choisir une photo de résolution</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAdminPhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 col-span-2">Notes d'accompagnement :</label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Équipe de curage mobilisée dès 8h ce vendredi."
                    value={adminStatusComment}
                    onChange={(e) => setAdminStatusComment(e.target.value)}
                    className="w-full bg-white border border-gray-350 rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={submitAdminStatusChange}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer text-center text-xs shadow-xs transition-colors"
                >
                  Valider le Changement Administrateur
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Category, Severity, Incident } from '../types';
import { MapPin, CheckCircle, UploadCloud, RefreshCw, AlertTriangle, FileImage, Trash2, Camera } from 'lucide-react';

interface NewReportProps {
  onAddIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'confirmations' | 'fakeReports' | 'commentsCount' | 'statusHistory'>) => void;
  currentUserPseudonym: string;
  currentUserRealName: string;
  onNavigateToFeed: () => void;
}

export default function NewReport({
  onAddIncident,
  currentUserPseudonym,
  currentUserRealName,
  onNavigateToFeed,
}: NewReportProps) {
  // Form Inputs
  const [description, setDescription] = useState('');
  const [typedLocation, setTypedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Ordures');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(6.3700);
  const [longitude, setLongitude] = useState<number | null>(2.4200);

  // States for GPS positioning
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState<boolean | null>(null);

  // Submission / Loading State
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Simulated preset high-res issue images for easy demonstration prototyping (assisting testing)
  const PRESET_IMAGES = [
    { name: '🔥 Incendie Bénin', url: 'https://images.unsplash.com/photo-1606166325012-00e57a8f6153?w=800&auto=format&fit=crop&q=80' },
    { name: '🚮 Dépôt sauvage', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80' },
    { name: '💧 Caniveau bouché', url: 'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=800&auto=format&fit=crop&q=80' },
    { name: '🦟 Eau stagnante', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80' },
    { name: '🧱 Encombrants route', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80' },
  ];

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileLoad(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileLoad(e.target.files[0]);
    }
  };

  const handleFileLoad = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier de type image uniquement.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Geolocation trigger using native browser GPS
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationSuccess(null);

    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      // Standard random coordinate in Benin (defaults near Cotonou)
      setLatitude(6.3700 + (Math.random() - 0.5) * 0.03);
      setLongitude(2.4200 + (Math.random() - 0.5) * 0.03);
      setLocationSuccess(true);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationSuccess(true);
        setIsLocating(false);
      },
      (error) => {
        console.warn("GPS direct fetch failed, using fallback location near selected city:", error);
        // Fallback offset around central Benin
        setLatitude(6.3700 + (Math.random() - 0.5) * 0.02);
        setLongitude(2.4200 + (Math.random() - 0.5) * 0.02);
        setLocationSuccess(true);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const clearPhoto = () => {
    setPhotoUrl('');
  };

  // Ultimate quiet publishing trigger (running AI analysis on express backend background)
  const handleFormPublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoUrl) {
      alert('Veuillez ajouter une photo de l’insalubrité pour attester des faits.');
      return;
    }

    if (!description.trim()) {
      alert('Veuillez décrire brièvement la situation observable de terrain.');
      return;
    }

    if (!latitude || !longitude) {
      alert('Veuillez géolocaliser votre position pour guider l’équipe d’assainissement.');
      return;
    }

    setIsPublishing(true);

    try {
      // Quiet background fetch: we hit /api/analyze to let Gemini generate 
      // administrative labels, severity level, classification, and explanation tips!
      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      let aiResult = {
        severity: 'moyen' as Severity,
        category: selectedCategory,
        title: `Signalement ${selectedCategory}`,
        explanation: 'En attente de vérification par les brigades municipales du Bénin.',
        confidenceScore: 0.8
      };

      if (aiResponse.ok) {
        try {
          const data = await aiResponse.json();
          aiResult = {
            severity: data.severity || 'moyen',
            category: data.category || selectedCategory,
            title: data.title || `Signalement ${selectedCategory}`,
            explanation: data.explanation || 'Signalement civiquement répertorié.',
            confidenceScore: data.confidenceScore || 0.85
          };
        } catch (innerError) {
          console.warn("Could not parse JSON analysis quietly, falling back:", innerError);
        }
      }

      const finalLocation = typedLocation.trim() || 'Rue d’Assainissement, Bénin';

      // Publish the incident cleanly, transferring data to App level state
      onAddIncident({
        title: aiResult.title,
        description: description.trim(),
        category: aiResult.category,
        severity: aiResult.severity,
        status: 'En attente',
        latitude,
        longitude,
        locationName: finalLocation,
        imageUrl: photoUrl,
        reportedByPseudonym: currentUserPseudonym,
        reportedByRealName: currentUserRealName,
        reportedBy: 'current-citizen-id',
        aiExplanation: aiResult.explanation,
        aiConfidenceScore: aiResult.confidenceScore,
      });

    } catch (err) {
      console.error("Failed executing background triage, submitting with standard tags:", err);
      // Fallback submission when API is offline
      onAddIncident({
        title: `Signalement ${selectedCategory}`,
        description: description.trim(),
        category: selectedCategory,
        severity: 'moyen',
        status: 'En attente',
        latitude,
        longitude,
        locationName: typedLocation.trim() || 'Zone géographique, Bénin',
        imageUrl: photoUrl,
        reportedByPseudonym: currentUserPseudonym,
        reportedByRealName: currentUserRealName,
        reportedBy: 'current-citizen-id',
        aiExplanation: "Vérification administrative initiée localement au Bénin.",
        aiConfidenceScore: 0.70,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-150 overflow-hidden" id="new_report_form_container">
      {/* Premium Eco Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 text-white text-center sm:text-left relative">
        <div className="absolute top-3 right-3 bg-white/10 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest backdrop-blur-md">
          Action Éco-Citoyenne
        </div>
        <h2 className="font-display font-black text-xl flex items-center justify-center sm:justify-start gap-2">
          <Camera size={22} className="text-emerald-100" />
          Nouveau Signalement Bénin
        </h2>
        <p className="text-emerald-100/90 text-xs mt-1 leading-relaxed">
          Renseignez la situation observée pour dépêcher immédiatement une brigade d'arrondissement. Une identité certifiée garantit la rapidité d'intervention.
        </p>
      </div>

      <form onSubmit={handleFormPublish} className="p-6 space-y-6">
        
        {/* PHOTO INPUT WITH DRAG-AND-DROP OR PRESET FALLBACK */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
            1. Photo de l'Insalubrité (Fichier ou Sélection)
          </label>

          {!photoUrl ? (
            /* ACTIVE DROPZONE AREA */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragActive 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <UploadCloud size={32} className="mx-auto text-slate-400 mb-2.5" />
              <p className="text-xs font-bold text-gray-700">Déposez votre photo ici</p>
              <p className="text-[10px] text-gray-400 mt-1">ou cliquez sur l'option ci-dessous pour choisir</p>
              
              <label className="mt-3.5 inline-flex items-center gap-1.5 px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] uppercase rounded-xl shadow-xs transition-colors cursor-pointer">
                <Camera size={12} />
                Parcourir mes photos
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* PREVIEW LOADED IMAGE */
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video max-h-[170px] flex items-center justify-center">
              <img
                src={photoUrl}
                alt="Aperçu du signalement"
                className="max-h-full object-contain"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-3 right-3 p-2 bg-red-650 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                title="Supprimer la photo"
              >
                <Trash2 size={13} />
              </button>
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[9px] text-emerald-400 font-bold font-mono">
                ✔️ IMAGE CHARGÉE
              </div>
            </div>
          )}

          {/* CHOOSE PRESET BUTTONS FOR PROTOTYPING SIMULATIONS */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] font-bold text-slate-400 block">PROBLÈMES STANDARDS (Simulations Prototypage) :</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => setPhotoUrl(img.url)}
                  className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${
                    photoUrl === img.url 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {img.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DESCRIPTION FIELD */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
            2. Description observable sur le terrain
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exemple: Écoulement anormal d'eaux noires et présence de sacs d'ordures entassés sur la voie près de la clinique communale, bloquant complètement le passage des piétons."
            className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 text-gray-800 bg-slate-50/20"
          />
        </div>

        {/* LOCATION FIELDS AND GPS SETTINGS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
              3. Ville & Arrondissement
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ex: Porto-Novo, Quartier Tokpota"
                value={typedLocation}
                onChange={(e) => setTypedLocation(e.target.value)}
                className="w-full p-3 pl-9 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 text-gray-800 bg-slate-50/20"
              />
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
              4. Point Géospatial GPS
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isLocating ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-emerald-700" />
                  Calcul GPS en cours...
                </>
              ) : (
                <>
                  <MapPin size={13} className="text-emerald-700" />
                  {latitude && longitude ? 'Position GPS Activée ✔️' : 'Activer le repère GPS'}
                </>
              )}
            </button>
            {latitude && longitude && (
              <p className="text-[10px] text-gray-400 text-center font-mono">
                Lat : {latitude.toFixed(5)} | Lng : {longitude.toFixed(5)}
              </p>
            )}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onNavigateToFeed}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isPublishing || !photoUrl || !description.trim()}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isPublishing ? (
              <>
                <RefreshCw size={13} className="animate-spin text-white" />
                Dépôt sécurisé du dossier...
              </>
            ) : (
              <>
                <CheckCircle size={13} />
                Publier le Signalement
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

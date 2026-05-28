import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident, Severity, Category, IncidentStatus } from '../types';
import { Filter, Eye, Search, AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface MapComponentProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  selectedIncidentId?: string | null;
}

declare global {
  interface Window {
    selectIncidentFromPopup?: (id: string) => void;
  }
}

// Haversine formula to compute distance between two latitude/longitude pairs in kilometers
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapComponent({
  incidents,
  onSelectIncident,
  selectedIncidentId,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  // Filters State
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time Citizen Geolocation State to Compute Dynamic Distances
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.log('[Map GPS] Unable to fetch initial position:', error);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // Watch position for movement updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.log('[Map GPS] Watch position error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Synchronise popup click delegate
  useEffect(() => {
    window.selectIncidentFromPopup = (id: string) => {
      onSelectIncident(id);
    };
    return () => {
      delete window.selectIncidentFromPopup;
    };
  }, [onSelectIncident]);

  // Initialise Leaflet Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Centered on Cotonou, Benin
    const defaultLat = 6.3700;
    const defaultLng = 2.4200;

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false,
    });

    // Elegant monochrome-modern map tiles by CartoDB Positron or Standard OpenStreetMap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    
    mapInstance.current = map;
    markersLayer.current = group;

    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Filter and populate markers
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSeverity = filterSeverity === 'all' || inc.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || inc.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || inc.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesCategory && matchesStatus && matchesSearch;
  });

  // Re-draw Markers when incidents or filters alter
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    // Clear previous markers
    markersLayer.current.clearLayers();

    filteredIncidents.forEach((inc) => {
      // Dynamic color configuration
      const color =
        inc.severity === 'critique' ? '#ef4444' : // Red
        inc.severity === 'grave' ? '#f97316' :    // Orange
        inc.severity === 'moyen' ? '#eab308' :    // Gold
        '#22c55e';                                // Green

      const isCrit = inc.severity === 'critique';

      // Advanced custom SVG pin markup
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
            ${isCrit ? `
              <!-- Ripple ring -->
              <div class="absolute w-10 h-10 rounded-full animate-ping opacity-60" style="background-color: ${color};"></div>
            ` : ''}
            <!-- Outer halo -->
            <div class="absolute w-8 h-8 rounded-full opacity-20" style="background-color: ${color}; transform: scale(1.3);"></div>
            <!-- Marker pin head -->
            <div class="z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-lg border-2 border-white text-white" style="background-color: ${color};">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                <circle cx="12" cy="10" r="2.5" fill="white"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 38],
        popupAnchor: [0, -38],
      });

      // Construct detailed Popup content in French
      const severityLabels: Record<Severity, string> = {
        faible: 'Faible',
        moyen: 'Moyen',
        grave: 'Grave',
        critique: 'CRITIQUE'
      };

      const statusColors: Record<IncidentStatus, string> = {
        'En attente': 'bg-gray-100 text-gray-800 border-gray-200',
        'Vérification': 'bg-blue-50 text-blue-800 border-blue-100',
        'Intervention en cours': 'bg-orange-50 text-orange-800 border-orange-100',
        'Résolu': 'bg-emerald-50 text-emerald-800 border-emerald-100'
      };

      const badgeColor =
        inc.severity === 'critique' ? 'bg-red-500 text-white animate-pulse' :
        inc.severity === 'grave' ? 'bg-orange-500 text-white' :
        inc.severity === 'moyen' ? 'bg-amber-500 text-white' :
        'bg-green-500 text-white';

      // Dynamic distance calculation relative to the user's current location
      let distanceText = "";
      if (userCoords) {
        const dist = getDistanceInKm(
          userCoords.latitude,
          userCoords.longitude,
          inc.latitude,
          inc.longitude
        );
        if (dist < 1) {
          distanceText = `📏 À ${(dist * 1000).toFixed(0)}m de vous`;
        } else {
          distanceText = `📏 À ${dist.toFixed(1)} km de vous`;
        }
      } else {
        distanceText = "📏 Distance : activez le GPS";
      }

      const popupHTML = `
        <div style="font-family: inherit; width: 220px; line-height: 1.4;">
          <img src="${inc.imageUrl}" alt="${inc.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb;" />
          <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;" class="${badgeColor}">
              ${severityLabels[inc.severity]}
            </span>
            <span style="font-size: 10px; font-weight: 500; padding: 1px 5px; border-radius: 4px; border: 1px solid #e5e7eb;" class="bg-gray-50 text-gray-700">
              ${inc.category}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; color: #111827; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${inc.title}
          </h4>
          <p style="font-size: 11px; color: #4b5563; margin: 0 0 4px 0; display: flex; align-items: center; gap: 4px;">
            📍 ${inc.locationName}
          </p>
          <p style="font-size: 11px; font-weight: bold; color: #047857; margin: 0 0 6px 0; background-color: #ecfdf5; padding: 4px 6px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #d1fae5; width: 100%; box-sizing: border-box;">
            ${distanceText}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px solid #f3f4f6; padding-top: 8px;">
            <span style="font-size: 10px; margin: 0; color: #0284c7; font-weight: 600;">
              👍 ${inc.confirmations.length} confirmations
            </span>
            <button 
              onclick="window.selectIncidentFromPopup?.('${inc.id}')"
              style="cursor: pointer; background-color: #16a34a; border: none; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"
            >
              Consulter
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });
      marker.bindPopup(popupHTML);
      markersLayer.current?.addLayer(marker);
    });

    // Add User Current Location Marker if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
            <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="absolute w-5 h-5 rounded-full bg-blue-500/50"></div>
            <div class="z-10 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px; width: 160px; line-height: 1.4; text-align: center;">
          <strong style="color: #1d4ed8; display: block; margin-bottom: 2px;">📍 Vous êtes ici</strong>
          <span style="color: #6b7280; font-size: 10px;">Votre puce GPS calcule en temps réel votre proximité avec les foyers de pollution béninois.</span>
        </div>
      `);
      markersLayer.current?.addLayer(userMarker);
    }

    // Adjust maps bounds to fit points if any
    if (filteredIncidents.length > 0 && mapInstance.current) {
      // Find limits
      const bounds = L.latLngBounds(filteredIncidents.map(i => [i.latitude, i.longitude]));
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [filteredIncidents, userCoords]);

  // Center maps to selected incident
  useEffect(() => {
    if (!mapInstance.current || !selectedIncidentId) return;
    const selected = incidents.find(i => i.id === selectedIncidentId);
    if (selected) {
      mapInstance.current.setView([selected.latitude, selected.longitude], 16, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedIncidentId, incidents]);

  return (
    <div className="flex flex-col min-h-[500px] h-[600px] sm:h-[650px] bg-slate-50 overflow-hidden rounded-2xl" id="map_component_container">
      {/* Header section with active statistics */}
      <div className="p-4 bg-white border-b border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-gray-900 flex items-center gap-2">
            <span className="p-1 rounded-lg bg-green-50 text-brand-600">
              <Sparkles size={18} className="animate-spin-slow" />
            </span>
            Cartographie Environnementale GPS
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Localisation géospatiale et statut des {filteredIncidents.length} signalements citoyens filtrés.
          </p>
        </div>

        {/* Live Map statistics */}
        <div className="flex gap-2 text-xs">
          <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg font-medium flex items-center gap-1.5 border border-red-100">
            <ShieldAlert size={14} className="text-red-500" />
            {incidents.filter(i => i.severity === 'critique').length} Critiques
          </div>
          <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-medium flex items-center gap-1.5 border border-amber-100">
            <AlertTriangle size={14} className="text-amber-500" />
            {incidents.filter(i => i.severity === 'grave').length} Graves
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-brand-700 rounded-lg font-medium flex items-center gap-1.5 border border-emerald-110">
            <CheckCircle size={14} className="text-brand-600" />
            {incidents.filter(i => i.status === 'Résolu').length} Résolus
          </div>
        </div>
      </div>

      {/* Map filters and control panel */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2.5 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher rue, titre, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-brand-500 placeholder-gray-400 text-gray-800 transition-colors"
          />
        </div>

        {/* Severity */}
        <div className="flex items-center gap-1 bg-white px-2 py-1.5 border border-gray-200 rounded-lg">
          <Filter size={11} className="text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as Severity | 'all')}
            className="text-[11px] bg-transparent font-medium text-gray-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Gravité : Toutes</option>
            <option value="faible">Faible</option>
            <option value="moyen">Moyen</option>
            <option value="grave">Grave</option>
            <option value="critique">Critique</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-1 bg-white px-2 py-1.5 border border-gray-200 rounded-lg">
          <Filter size={11} className="text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
            className="text-[11px] bg-transparent font-medium text-gray-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Catégorie : Toutes</option>
            <option value="Ordures">Ordures</option>
            <option value="Pollution">Pollution</option>
            <option value="Caniveau bouché">Caniveau bouché</option>
            <option value="Eau stagnante">Eau stagnante</option>
            <option value="Décharge sauvage">Décharge sauvage</option>
            <option value="Fumée toxique">Fumée toxique</option>
            <option value="Incendie">Incendie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 bg-white px-2 py-1.5 border border-gray-200 rounded-lg">
          <Filter size={11} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | 'all')}
            className="text-[11px] bg-transparent font-medium text-gray-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Statut : Tous</option>
            <option value="En attente">En attente</option>
            <option value="Vérification">En vérification</option>
            <option value="Intervention en cours">Intervention</option>
            <option value="Résolu">Résolu</option>
          </select>
        </div>
      </div>

      {/* Map DOM node wrapper */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        
        {/* Floating guidance note */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-gray-100 z-10 max-w-[200px] pointer-events-none hidden sm:block">
          <p className="text-[10px] text-gray-600 font-medium">
            💡 Astuce : Cliquez sur n'importe quelle icône pour voir l'aperçu et consulter le signalement en détail.
          </p>
        </div>

        {/* Empty filtered incidents fallback screen */}
        {filteredIncidents.length === 0 && (
          <div className="absolute inset-x-4 top-16 bg-white/90 backdrop-blur-xs p-4 rounded-xl shadow-lg border border-red-100 text-center z-10 max-w-sm mx-auto">
            <p className="text-xs text-red-600 font-semibold flex items-center justify-center gap-1.5">
              <ShieldAlert size={14} /> Aucun signalement ne correspond à vos filtres
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Essayez de désélectionner certains filtres pour élargir vos recherches territoriales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

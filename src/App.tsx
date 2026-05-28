import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, Comment, User, NotificationAlert, IncidentStatus, Severity, Category } from './types';
import {
  INITIAL_USERS,
  INITIAL_INCIDENTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
} from './utils/sampleData';

import {
  listenIncidents,
  listenComments,
  saveIncident,
  saveComment,
  deleteIncidentFromFirestore
} from './utils/firebase';

import FeedCitoyen from './components/FeedCitoyen';
import MapComponent from './components/MapComponent';
import NewReport from './components/NewReport';
import IncidentDetails from './components/IncidentDetails';
import DashboardAdmin from './components/DashboardAdmin';
import StatsView from './components/StatsView';
import AdminLockGate from './components/AdminLockGate';
import PhoneVerificationGate from './components/PhoneVerificationGate';
import PWAInstallBanner from './components/PWAInstallBanner';
import SplashLoader from './components/SplashLoader';

const onboardingSteps = [
  {
    title: "Bénin Propre & Durable",
    subtitle: "Un partenariat éco-citoyen",
    description: "Zéro Pollution connecte directement les citoyens du Bénin aux mairies d'arrondissements pour repérer et signaler en temps réel l'insalubrité urbaine sur tout le territoire.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    badge: "🌱 ASSAINISSEMENT",
    color: "from-emerald-600 to-green-500"
  },
  {
    title: "Vigilance Citoyenne Immédiate",
    subtitle: "Signalement et secours accélérés",
    description: "Prenez une photo de l'insalubrité sur le terrain. Les brigades d'assainissement communales reçoivent instantanément l'alerte pour planifier les opérations de nettoyage.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80",
    badge: "⚡ INTERVENTION DIRECTE",
    color: "from-teal-600 to-cyan-500"
  },
  {
    title: "Honneur & Points Éco-Citoyens",
    subtitle: "La communauté valide ensemble",
    description: "Gagnez des points XP en signalant de vraies menaces ou en réfutant les fausses alertes. Devenez un citoyen d'honneur certifié de votre quartier !",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    badge: "🏅 XP & RÉCOMPENSES",
    color: "from-amber-600 to-orange-500"
  }
];


import {
  ShieldAlert,
  Bell,
  MapPin,
  Flame,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Phone,
  Check,
  Award,
  Rss,
  Map,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export default function App() {
  // 1. Core State Initialisation (backed by localStorage)
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('zp_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('zp_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => {
    const saved = localStorage.getItem('zp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Default currentUser starts as verified citizen user, but can trigger admin role switch after unlocking
  const [isCitizenVerified, setIsCitizenVerified] = useState<boolean>(() => {
    return localStorage.getItem('zp_citizen_verified') === 'true';
  });

  const [verifiedCitizenUser, setVerifiedCitizenUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zp_verified_citizen_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isUnlockedAdmin, setIsUnlockedAdmin] = useState<boolean>(() => {
    return localStorage.getItem('zp_admin_unlocked') === 'true';
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('zp_admin_unlocked') === 'true';
  });
  const currentUser: User = isAdminMode 
    ? INITIAL_USERS[0] 
    : (verifiedCitizenUser || INITIAL_USERS[1]);

  // Citizen onboarding setup (at least 3 screens)
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    // Si le citoyen n'est pas encore vérifié/connecté, on affiche d'office les pages de présentation de l'application
    if (localStorage.getItem('zp_citizen_verified') !== 'true') {
      return false;
    }
    return localStorage.getItem('zp_onboarded') === 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  // Router State
  const [currentTab, setCurrentTab] = useState<'feed' | 'map' | 'new-report' | 'stats' | 'admin'>('feed');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // App Initial Entrance Splash Loader
  const [isAppStarting, setIsAppStarting] = useState<boolean>(true);

  // Notification Toast popups
  const [toastNotification, setToastNotification] = useState<NotificationAlert | null>(null);

  // Connection State for PWA Mobile Optimisation
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToastNotification({
        id: 'pwa-online',
        title: 'Connexion rétablie ⚡',
        message: 'Votre appareil est de nouveau connecté. La synchronisation en temps réel avec la base Bénin est active.',
        type: 'info',
        createdAt: new Date().toISOString(),
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastNotification({
        id: 'pwa-offline',
        title: 'Mode Hors-Ligne activé 📡',
        message: 'Connexion mobile perdue ou instable. L\'application utilise le cache local haute performance pour rester fluide.',
        type: 'critical',
        createdAt: new Date().toISOString(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  // Real-time Firestore sync and database auto-seeding
  useEffect(() => {
    let unsubIncidents: (() => void) | undefined;
    let unsubComments: (() => void) | undefined;

    try {
      unsubIncidents = listenIncidents((firestoreIncidents) => {
        if (firestoreIncidents && firestoreIncidents.length > 0) {
          setIncidents(firestoreIncidents);
          // Auto-seed any missing default incidents (e.g. up to 10)
          if (firestoreIncidents.length < INITIAL_INCIDENTS.length) {
            INITIAL_INCIDENTS.forEach((inc) => {
              const exists = firestoreIncidents.some(f => f.id === inc.id);
              if (!exists) {
                saveIncident(inc).catch(err => console.error("Error seeding missing incident:", err));
              }
            });
          }
        } else {
          // Empty DB: Seeding default incidents
          INITIAL_INCIDENTS.forEach((inc) => {
            saveIncident(inc).catch(err => console.error("Error seeding incident:", err));
          });
        }
      });

      unsubComments = listenComments((firestoreComments) => {
        if (firestoreComments && firestoreComments.length > 0) {
          setComments(firestoreComments);
        } else {
          // Empty DB: Seeding default comments
          INITIAL_COMMENTS.forEach((comm) => {
            saveComment(comm).catch(err => console.error("Error seeding comment:", err));
          });
        }
      });
    } catch (err) {
      console.warn("Could not start Firebase live listeners, using local storage fallback:", err);
    }

    return () => {
      if (unsubIncidents) unsubIncidents();
      if (unsubComments) unsubComments();
    };
  }, []);

  // Synchronise state changes to localStorage as a robust local backup
  useEffect(() => {
    localStorage.setItem('zp_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('zp_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('zp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Clean obsolete toasts
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 7000); // 7 seconds toast presence
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Read URL and automatically mount administrative view if requested via /admin or #admin
  useEffect(() => {
    const handleUrlRoute = () => {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin');
      const isHashAdmin = window.location.hash === '#admin';
      if (isPathAdmin || isHashAdmin) {
        setSelectedIncidentId(null);
        setCurrentTab('admin');
      }
    };
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Trigger real-time simulations
  const triggerIncidentToast = (newAlert: NotificationAlert) => {
    setToastNotification(newAlert);
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // 2. Interaction callbacks
  // Citizen submits brand new incident (AI-parsed step 2)
  const handleAddNewIncident = (
    newIncidentData: Omit<Incident, 'id' | 'createdAt' | 'confirmations' | 'fakeReports' | 'commentsCount' | 'statusHistory'>
  ) => {
    const newId = `inc-${Date.now()}`;
    const newIncident: Incident = {
      ...newIncidentData,
      id: newId,
      createdAt: new Date().toISOString(),
      confirmations: ['confirm-auto-1'], // starter self-check
      fakeReports: [],
      commentsCount: 0,
      statusHistory: [
        {
          status: 'En attente',
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.pseudonym,
          comment: 'Signalement éco-citoyen initié sur l’application Zéro Pollution.',
        },
      ],
    };

    setIncidents((prev) => [newIncident, ...prev]);
    saveIncident(newIncident).catch((err) => console.error("Firebase save error:", err));
    setCurrentTab('feed');

    // award point to creator
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, reputationPoints: u.reputationPoints + 50 } : u))
    );

    // Create a simulation WhatsApp Notification alert
    const isCritical = newIncident.severity === 'critique';
    const alertTitle = isCritical ? '⚠️ ALERTE INCIDENT CRITIQUE' : '💬 Nouveau signalement publié !';
    const cleanMessage = isCritical
      ? `🚨 INCIDENT CRITIQUE détecté à ${newIncident.locationName}. En attente de l'intervention de salubrité : ${newIncident.title}`
      : `📢 ${newIncident.reportedByPseudonym} a signalé un problème : ${newIncident.title} à ${newIncident.locationName}`;

    const newAlert: NotificationAlert = {
      id: `not-${Date.now()}`,
      type: isCritical ? 'critical' : 'whatsapp_simulation',
      title: alertTitle,
      message: cleanMessage,
      time: new Date().toISOString(),
      read: false,
      incidentId: newId,
    };

    // Delay the toast slightly to let user exit form
    setTimeout(() => {
      triggerIncidentToast(newAlert);
    }, 1500);
  };

  // Citizen confirms (votes) existing incident
  const handleConfirmIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const alreadyConfirmed = inc.confirmations.includes(currentUser.id);
          const nextConfirmations = alreadyConfirmed
            ? inc.confirmations.filter((uid) => uid !== currentUser.id) // pull vote
            : [...inc.confirmations, currentUser.id];

          // Award points for community validation checks
          if (!alreadyConfirmed) {
            setUsers((uList) =>
              uList.map((u) => (u.id === currentUser.id ? { ...u, reputationPoints: u.reputationPoints + 15 } : u))
            );
          }

          const updated = { ...inc, confirmations: nextConfirmations };
          saveIncident(updated).catch((err) => console.error("Firebase vote confirm error:", err));
          return updated;
        }
        return inc;
      })
    );
  };

  // Citizen flags incident as Fake/Spam
  const handleFakeIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const alreadyFake = inc.fakeReports.includes(currentUser.id);
          const nextFakes = alreadyFake
            ? inc.fakeReports.filter((uid) => uid !== currentUser.id)
            : [...inc.fakeReports, currentUser.id];

          const updated = { ...inc, fakeReports: nextFakes };
          saveIncident(updated).catch((err) => console.error("Firebase fake vote error:", err));
          return updated;
        }
        return inc;
      })
    );
  };

  // Admin deletes reported incident (Marked as total fake or spam)
  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    deleteIncidentFromFirestore(id).catch((err) => console.error("Firebase delete error:", err));
    setComments((prev) => prev.filter((c) => c.incidentId !== id));
    if (selectedIncidentId === id) setSelectedIncidentId(null);
  };

  // Admin updates incident status or attaches resolution picture
  const handleAdminStatusChange = (incidentId: string, newStatus: IncidentStatus, commentText?: string, resolvedImageUrl?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const isResolving = newStatus === 'Résolu';
          const resolvedImg = resolvedImageUrl || (isResolving
            ? 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=800&auto=format&fit=crop&q=80' // Beautiful cleaned lagune park/quay
            : undefined);

          const updatedHist = [
            ...inc.statusHistory,
            {
              status: newStatus,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser.pseudonym,
              comment: commentText || `Statut mis à jour administrativement en ${newStatus}.`,
            },
          ];

          // Notify community
          const alertTitle = isResolving ? '🎉 PROBLÈME RÉSOLU !' : '🔍 STATUT ACTUALISÉ';
          const alertMessage = `Le signalement "${inc.title}" est passé au statut [${newStatus}] par l'autorité municipale béninoise.`;
          
          setTimeout(() => {
            triggerIncidentToast({
              id: `not-${Date.now()}`,
              type: isResolving ? 'status_change' : 'citizen_validation',
              title: alertTitle,
              message: alertMessage,
              time: new Date().toISOString(),
              read: false,
              incidentId: inc.id,
            });
          }, 1000);

          const updated = {
            ...inc,
            status: newStatus,
            resolvedImageUrl: resolvedImg,
            statusHistory: updatedHist,
          };
          saveIncident(updated).catch((err) => console.error("Firebase admin status update error:", err));
          return updated;
        }
        return inc;
      })
    );
  };

  // Add review comment
  const handleAddComment = (incidentId: string, text: string, optionalPhotoUrl?: string) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      incidentId,
      userId: currentUser.id,
      userPseudonym: currentUser.pseudonym,
      userRole: currentUser.role,
      text,
      createdAt: new Date().toISOString(),
      extraPhotoUrl: optionalPhotoUrl,
    };

    setComments((prev) => [...prev, newComment]);
    saveComment(newComment).catch((err) => console.error("Firebase comment error:", err));

    // update inc summary count
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updated = { ...inc, commentsCount: inc.commentsCount + 1 };
          saveIncident(updated).catch((err) => console.error("Firebase save count error:", err));
          return updated;
        }
        return inc;
      })
    );

    // Reward points for interaction
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, reputationPoints: u.reputationPoints + 10 } : u))
    );
  };

  const getActiveView = () => {
    if (selectedIncidentId) {
      const activeInc = incidents.find((i) => i.id === selectedIncidentId);
      if (activeInc) {
        return (
          <IncidentDetails
            incident={activeInc}
            comments={comments.filter((c) => c.incidentId === selectedIncidentId)}
            currentUser={currentUser}
            onAddComment={handleAddComment}
            onNavigateBack={() => setSelectedIncidentId(null)}
            onAdminChangeStatus={handleAdminStatusChange}
          />
        );
      }
    }

    switch (currentTab) {
      case 'feed':
        return (
          <FeedCitoyen
            incidents={incidents}
            onSelectIncident={(id) => setSelectedIncidentId(id)}
            onConfirmIncident={handleConfirmIncident}
            onFakeIncident={handleFakeIncident}
            onNavigateToNewReport={() => setCurrentTab('new-report')}
          />
        );
      case 'map':
        return (
          <MapComponent
            incidents={incidents}
            onSelectIncident={(id) => setSelectedIncidentId(id)}
            selectedIncidentId={selectedIncidentId}
          />
        );
      case 'new-report':
        return (
          <NewReport
            onAddIncident={handleAddNewIncident}
            currentUserPseudonym={currentUser.pseudonym}
            currentUserRealName={currentUser.realName}
            onNavigateToFeed={() => setCurrentTab('feed')}
          />
        );
      case 'stats':
        return <StatsView incidents={incidents} />;
      case 'admin':
        if (!isUnlockedAdmin) {
          return (
            <AdminLockGate
              onSuccess={() => {
                setIsUnlockedAdmin(true);
                setIsAdminMode(true);
                localStorage.setItem('zp_admin_unlocked', 'true');
              }}
            />
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex justify-end animate-fade-in">
              <button
                onClick={() => {
                  setIsUnlockedAdmin(false);
                  setIsAdminMode(false);
                  localStorage.removeItem('zp_admin_unlocked');
                }}
                className="text-[10px] bg-red-50 hover:bg-red-100 text-red-650 font-extrabold uppercase px-3 py-1.5 rounded-lg border border-red-100 transition-all cursor-pointer flex items-center gap-1.5"
                id="btn_admin_logout"
              >
                🔐 Verrouiller / Déconnexion Mairie
              </button>
            </div>
            <DashboardAdmin
              incidents={incidents}
              onSelectIncident={(id) => setSelectedIncidentId(id)}
              onDeleteIncident={handleDeleteIncident}
              onAdminChangeStatus={handleAdminStatusChange}
              users={users}
            />
          </div>
        );
    }
  };

  if (isAppStarting) {
    return <SplashLoader onComplete={() => setIsAppStarting(false)} />;
  }

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans text-slate-800 selection:bg-emerald-100" id="onboarding_universe">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden flex flex-col h-[585px] justify-between animate-fade-in">
          
          {/* Cover Illustration */}
          <div className="relative h-[250px] bg-slate-900 overflow-hidden flex items-end p-6">
            <img 
              src={onboardingSteps[onboardingStep].image} 
              alt={onboardingSteps[onboardingStep].title}
              className="absolute inset-0 w-full h-full object-cover opacity-75 shadow-inner"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${onboardingSteps[onboardingStep].color === 'from-emerald-600 to-green-500' ? 'from-emerald-950/90' : 'from-teal-950/90'} to-slate-900/30`}></div>
            
            <div className="relative z-10 w-full">
              <span className="inline-block px-2.5 py-0.5 text-[9px] font-black tracking-widest text-emerald-300 bg-white/15 rounded-md uppercase backdrop-blur-md mb-2">
                {onboardingSteps[onboardingStep].badge}
              </span>
              <h1 className="text-white font-display font-black text-xl tracking-tight leading-none uppercase">
                ZÉRO POLLUTION BÉNIN
              </h1>
            </div>
          </div>

          {/* Core presentation slides */}
          <div className="px-6 py-4 flex-1 flex flex-col justify-center text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 block mb-1">
              {onboardingSteps[onboardingStep].subtitle}
            </span>
            <h2 className="text-gray-950 font-display font-black text-xl tracking-tight mb-2.5 leading-tight">
              {onboardingSteps[onboardingStep].title}
            </h2>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
              {onboardingSteps[onboardingStep].description}
            </p>
          </div>

          {/* Control navigation panel */}
          <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-4 font-semibold">
            {/* Dot bullets to track status */}
            <div className="flex gap-1.5">
              {onboardingSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setOnboardingStep(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${onboardingStep === idx ? 'w-5.5 bg-emerald-700' : 'w-2.5 bg-gray-250 hover:bg-gray-350 bg-gray-200'}`}
                  aria-label={`slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Pagination keys */}
            <div className="flex gap-1.5">
              {onboardingStep < 2 ? (
                <>
                  <button
                    onClick={() => {
                      localStorage.setItem('zp_onboarded', 'true');
                      setIsOnboarded(true);
                    }}
                    className="text-[10px] uppercase font-black text-gray-400 hover:text-gray-650 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Ignorer
                  </button>
                  <button
                    onClick={() => setOnboardingStep(prev => prev + 1)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-extrabold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-all uppercase tracking-wide"
                  >
                    Suivant ➔
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    localStorage.setItem('zp_onboarded', 'true');
                    setIsOnboarded(true);
                  }}
                  className="bg-gradient-to-r from-emerald-700 to-green-600 hover:opacity-95 text-white text-[10px] font-black px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider animate-pulse"
                >
                  Démarrer l'App !
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Enforce Phone verification Account safety gate to reduce fake alerts
  if (!isCitizenVerified && !isAdminMode) {
    return (
      <PhoneVerificationGate
        onSuccess={(newUser) => {
          localStorage.setItem('zp_citizen_verified', 'true');
          localStorage.setItem('zp_verified_citizen_user', JSON.stringify(newUser));
          setIsCitizenVerified(true);
          setVerifiedCitizenUser(newUser);
          // Auto add to users registry
          setUsers((prev) => [...prev, newUser]);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800" id="main_app_wrapper">
      {/* 1. FLUSH TOAST NOTIFICATION OVERLAY (WHATSAPP/ALERT SIMULATOR) */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 inset-x-4 z-50 max-w-md mx-auto"
          >
            <div className={`p-4 rounded-xl shadow-xl border backdrop-blur-xs flex gap-3.5 ${
              toastNotification.type === 'critical'
                ? 'bg-red-500/95 border-red-500 text-white shadow-red-200'
                : toastNotification.type === 'whatsapp_simulation'
                ? 'bg-emerald-600/95 border-emerald-600 text-white shadow-emerald-100'
                : 'bg-white/95 border-teal-100 text-teal-950 shadow-slate-200'
            }`}>
              <div className="shrink-0 pt-0.5">
                {toastNotification.type === 'critical' ? (
                  <Flame size={20} className="text-white animate-bounce" />
                ) : (
                  <Bell size={20} className="text-emerald-100" />
                )}
              </div>
              
              <div className="flex-1">
                <span className="text-[10px] uppercase font-black tracking-wider block opacity-75">
                  {toastNotification.title}
                </span>
                <p className="text-xs font-medium mt-1 leading-relaxed">
                  {toastNotification.message}
                </p>
                {toastNotification.incidentId && (
                  <button
                    onClick={() => {
                      setSelectedIncidentId(toastNotification.incidentId!);
                      setToastNotification(null);
                    }}
                    className="text-[10px] font-bold underline text-white hover:opacity-90 mt-2 block"
                  >
                    Consulter le ticket & coordonnées GPS 📍
                  </button>
                )}
              </div>

              <button
                onClick={() => setToastNotification(null)}
                className="text-xs font-bold leading-none select-none opacity-60 hover:opacity-100 pb-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TOP BANNER & DEMONSTRATION SWITCHER */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setSelectedIncidentId(null); setCurrentTab('feed'); }}>
            <img 
              src="/logo_pwa.png" 
              alt="Logo Zéro Pollution" 
              className="w-9 h-9 rounded-xl object-cover shadow-sm border border-emerald-100 animate-spin-slow" 
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-display font-black text-base text-gray-950 block tracking-tight leading-none bg-linear-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                ZÉRO POLLUTION
              </span>
              <span className={`text-[8px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5 ${isOnline ? 'text-teal-600' : 'text-rose-600 animate-pulse'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOnline ? 'bg-emerald-550 bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                {isOnline ? 'Plateforme Citoyenne Bénin' : 'Hors-Ligne (Cache Actif)'}
              </span>
            </div>
          </div>

          {/* Citizen / Admin Security Sandbox Badge (Admin Access hidden from standard UI) */}
          {isUnlockedAdmin ? (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-150 p-1.5 rounded-xl animate-fade-in shadow-xs">
              <div className="text-right pl-1.5">
                <span className="relative flex h-2 w-2 ml-auto mb-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[8px] font-extrabold text-rose-500 uppercase tracking-widest leading-none block">SESSION BRIGADE</span>
              </div>
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setIsUnlockedAdmin(false);
                  setCurrentTab('feed');
                  localStorage.removeItem('zp_admin_unlocked');
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Quitter l’administration
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-150 pl-3.5 pr-2.5 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">ÉCO-CITOYEN CONNECTÉ</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-black text-slate-800">{currentUser?.pseudonym}</span>
                  <span className="text-[9px] font-bold font-mono px-1 py-0.1 bg-emerald-100 text-emerald-800 rounded">{currentUser?.reputationPoints} XP</span>
                </div>
              </div>
              <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
              <button
                onClick={() => {
                  localStorage.removeItem('zp_citizen_verified');
                  localStorage.removeItem('zp_verified_citizen_user');
                  localStorage.removeItem('zp_onboarded');
                  setIsCitizenVerified(false);
                  setVerifiedCitizenUser(null);
                  setIsOnboarded(false);
                  setOnboardingStep(0);
                  setCurrentTab('feed');
                  setToastNotification({
                    id: 'logout-success',
                    title: 'Déconnexion réussie 👋',
                    message: 'Vous avez quitté votre session éco-citoyenne avec succès et retourné à l\'accueil.',
                    type: 'info',
                    createdAt: new Date().toISOString()
                  });
                }}
                className="p-1 text-slate-455 hover:text-rose-600 rounded-lg bg-slate-100/30 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:shadow-xs transition-all cursor-pointer flex items-center justify-center"
                title="Quitter le compte (Se déconnecter)"
              >
                <LogOut size={13} className="shrink-0" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* PWA Performance Banner and Installation Notification */}
      <PWAInstallBanner />

      {/* 3. CENTRAL MAIN CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + (selectedIncidentId || 'list')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {getActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. MULTIPLEX MOBILE-FIRST BOTTOM INTERACTIVE TAB BAR */}
      <footer className="bg-white border-t border-gray-150 sticky bottom-0 z-40 py-2.5 shadow-md">
        <div className="max-w-md mx-auto px-6 flex items-center justify-between text-center">
          {/* TAB 1 : FEED */}
          <button
            onClick={() => { setSelectedIncidentId(null); setCurrentTab('feed'); }}
            className={`flex flex-col items-center gap-1.5 p-1 flex-1 transition-colors group cursor-pointer ${
              currentTab === 'feed' && !selectedIncidentId ? 'text-emerald-700 font-semibold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`p-1.5 rounded-xl transition-all group-hover:scale-105 ${currentTab === 'feed' && !selectedIncidentId ? 'bg-emerald-50 text-emerald-700' : 'bg-transparent text-gray-400'}`}>
              <Rss size={17} />
            </span>
            <span className="text-[10px] tracking-tight font-medium truncate block">Activités</span>
          </button>

          {/* TAB 2 : MAP */}
          <button
            onClick={() => { setSelectedIncidentId(null); setCurrentTab('map'); }}
            className={`flex flex-col items-center gap-1.5 p-1 flex-1 transition-colors group cursor-pointer ${
              currentTab === 'map' ? 'text-emerald-700 font-semibold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`p-1.5 rounded-xl transition-all group-hover:scale-105 ${currentTab === 'map' ? 'bg-emerald-50 text-emerald-700' : 'bg-transparent text-gray-400'}`}>
              <Map size={17} />
            </span>
            <span className="text-[10px] tracking-tight font-medium truncate block">Carte GPS</span>
          </button>

          {/* TAB 3 : REPORT */}
          <button
            onClick={() => { setSelectedIncidentId(null); setCurrentTab('new-report'); }}
            className={`flex flex-col items-center gap-1.5 p-1 flex-1 transition-colors group cursor-pointer ${
              currentTab === 'new-report' ? 'text-emerald-700 font-semibold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`p-1.5 rounded-xl transition-all group-hover:scale-105 ${currentTab === 'new-report' ? 'bg-emerald-50 text-emerald-700 animate-pulse' : 'bg-transparent text-gray-400'}`}>
              <PlusCircle size={17} />
            </span>
            <span className="text-[10px] tracking-tight font-medium truncate block">Signaler</span>
          </button>

          {/* TAB 4 : STATS */}
          <button
            onClick={() => { setSelectedIncidentId(null); setCurrentTab('stats'); }}
            className={`flex flex-col items-center gap-1.5 p-1 flex-1 transition-colors group cursor-pointer ${
              currentTab === 'stats' ? 'text-emerald-700 font-semibold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`p-1.5 rounded-xl transition-all group-hover:scale-105 ${currentTab === 'stats' ? 'bg-emerald-50 text-emerald-700' : 'bg-transparent text-gray-400'}`}>
              <BarChart3 size={17} />
            </span>
            <span className="text-[10px] tracking-tight font-medium truncate block">Stats</span>
          </button>

          {/* TAB 5 : ADMIN PORTAL (Only visible when admin is unlocked) */}
          {isUnlockedAdmin && (
            <button
              onClick={() => { setSelectedIncidentId(null); setCurrentTab('admin'); }}
              className={`flex flex-col items-center gap-1.5 p-1 flex-1 transition-colors group cursor-pointer ${
                currentTab === 'admin' ? 'text-red-650 font-semibold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={`p-1.5 rounded-xl transition-all group-hover:scale-105 ${currentTab === 'admin' ? 'bg-red-50 text-red-600' : 'bg-transparent text-gray-400'}`}>
                <ShieldCheck size={17} />
              </span>
              <span className="text-[10px] tracking-tight font-medium truncate block">Mairie</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

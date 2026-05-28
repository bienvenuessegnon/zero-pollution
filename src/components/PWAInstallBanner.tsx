import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share2, Smartphone, Zap, Sparkles } from 'lucide-react';

interface PWAInstallBannerProps {
  onInstallSuccess?: () => void;
}

export default function PWAInstallBanner({ onInstallSuccess }: PWAInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('zp_pwa_banner_dismissed') === 'true';
  });
  const [showiOSHelp, setShowiOSHelp] = useState(false);

  // Auto-dismiss after 8 seconds of showing up to keep the interface perfectly clean
  useEffect(() => {
    if (isDismissed || showiOSHelp) return;

    const timer = setTimeout(() => {
      dismissBanner();
    }, 8000);

    return () => clearTimeout(timer);
  }, [isDismissed, showiOSHelp]);

  useEffect(() => {
    // Detect standalone display mode (already installed with shortcut)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Detect iOS
    const detectIOS = () => {
      const platform = navigator.userAgent;
      const isaPhoneOrPad = /iPad|iPhone|iPod/.test(platform) && !(window as any).MSStream;
      setIsIOS(isaPhoneOrPad);
    };

    detectIOS();

    // Handle standard PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsReadyToInstall(true);
      console.log('[PWA] beforeinstallprompt event fired and captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app installed successfully
    const handleAppInstalled = () => {
      console.log('[PWA] App was successfully installed');
      setIsReadyToInstall(false);
      setDeferredPrompt(null);
      if (onInstallSuccess) onInstallSuccess();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstallSuccess]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Installation outcome: ${outcome}`);

    if (outcome === 'accepted') {
      setIsReadyToInstall(false);
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('zp_pwa_banner_dismissed', 'true');
  };

  // Reset dismissal (allows manual check/re-enable for audit testing)
  const forceShowBanner = () => {
    setIsDismissed(false);
    localStorage.removeItem('zp_pwa_banner_dismissed');
  };

  // Do not render anything if running inside the standalone app shell
  if (isStandalone) {
    return null;
  }

  // If dismissed, render a small quiet trigger in the corner of the app, ensuring the user can always access it
  if (isDismissed) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <button 
          onClick={forceShowBanner}
          className="p-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-full shadow-lg hover:scale-105 transition-all text-xs font-bold leading-none flex items-center gap-1 cursor-pointer"
          title="Installer l'application hors-ligne"
        >
          <Smartphone size={15} className="animate-bounce" />
          <span className="text-[10px] hidden md:inline">Installer l'App</span>
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        className="mx-auto w-full max-w-5xl px-4 pt-4"
        id="pwa_install_container"
      >
        <div className="bg-linear-to-r from-emerald-900 via-emerald-950 to-green-950 border border-emerald-800 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden">
          {/* Ambient eco light effects */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full -mr-10 -mt-10" />
          <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-green-500/10 blur-xl rounded-full" />

          {/* Dismiss button */}
          <button 
            onClick={dismissBanner}
            className="absolute top-3 right-3 text-emerald-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Fermer la notification"
          >
            <X size={15} />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono leading-none rounded-sm uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Zap size={10} className="fill-emerald-400" />
                  PWA Haute Performance
                </span>
                <span className="px-2 py-0.5 bg-emerald-100/10 text-white text-[9px] font-mono leading-none rounded-sm flex items-center gap-1 font-semibold">
                  Mise en cache mobile active ⚡
                </span>
              </div>
              <h3 className="font-display font-medium text-base tracking-tight text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-400 fill-amber-400 shrink-0" />
                Installer Zéro Pollution Bénin sur votre téléphone
              </h3>
              <p className="text-emerald-250 text-xs leading-relaxed max-w-3xl">
                L'application s'installe instantanément sans passer par l'App Store ou Play Store. 
                Profitez d'un temps de chargement <strong>3x plus rapide</strong>, de l'envoi de signalements fluides 
                même avec une faible connexion mobile Edge/GPRS, et d'un mode hors-ligne disponible en direct du Bénin.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
              {isIOS ? (
                <div className="flex flex-col items-stretch w-full">
                  <button
                    onClick={() => setShowiOSHelp(!showiOSHelp)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 size={14} />
                    Installer sur iPhone / iPad
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  disabled={!isReadyToInstall && !deferredPrompt}
                  className={`px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:text-emerald-500 disabled:cursor-not-allowed text-emerald-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isReadyToInstall ? 'animate-pulse' : ''
                  }`}
                >
                  <Download size={14} className="stroke-[3]" />
                  {isReadyToInstall ? "Installer l'Application" : "Démarrage automatique d'installation"}
                </button>
              )}
            </div>
          </div>

          {/* Expanded iOS/Safari instructions */}
          <AnimatePresence>
            {isIOS && showiOSHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-emerald-800 text-xs space-y-2.5 text-emerald-100"
              >
                <p className="font-bold text-yellow-400">📲 Comment installer sur iOS (Safari) :</p>
                <ol className="list-decimal list-inside pl-1 space-y-1 text-emerald-200">
                  <li>
                    Ouvrez ce site dans le navigateur <strong className="text-white">Safari</strong> de votre iPhone/iPad.
                  </li>
                  <li>
                    Appuyez sur le bouton de <strong className="text-white flex inline-flex items-center gap-1 bg-white/10 px-1 py-0.5 rounded">partage <Share2 size={12} /></strong> en bas de l'écran.
                  </li>
                  <li>
                    Faites défiler vers le bas et sélectionnez l'option <strong className="text-yellow-300">« Sur l'écran d'accueil »</strong>.
                  </li>
                  <li>
                    Appuyez sur <strong className="text-white">« Ajouter »</strong> en haut à droite. L'icône apparaîtra à côté de vos autres applications !
                  </li>
                </ol>
                <div className="p-2.5 bg-emerald-900/30 border border-emerald-800/50 rounded-lg text-emerald-300 text-[11px] leading-relaxed">
                  <strong>💡 Info :</strong> Une fois ajoutée, l'application fonctionnera en plein écran, masquera la barre de navigation du navigateur, et utilisera notre système d'accélération de cache pour économiser vos mégaoctets de données mobiles béninoises.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

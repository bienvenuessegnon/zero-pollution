import React, { useState, useEffect } from 'react';
import { Phone, User, Lock, CheckCircle, Smartphone, Key, AlertCircle, Sparkles, ShieldCheck, Award } from 'lucide-react';
import { User as UserType } from '../types';
import { findUserProfileByPhone, saveUserProfile } from '../utils/firebase';

interface PhoneVerificationGateProps {
  onSuccess: (newUser: UserType) => void;
}

export default function PhoneVerificationGate({ onSuccess }: PhoneVerificationGateProps) {
  const [pseudonym, setPseudonym] = useState('');
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<UserType | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Auto-detect returning user profile on complete phone number types
  useEffect(() => {
    let active = true;
    const lookupPhone = async () => {
      const clean = phone.replace(/[\s\-()]+/g, '');
      if (clean.length === 10 && clean.startsWith('01')) {
        if (active) setSearchFeedback("Recherche de votre compte citoyen...");
        try {
          const profile = await findUserProfileByPhone(clean);
          if (active) {
            if (profile) {
              setExistingUser(profile);
              setPseudonym(profile.pseudonym);
              setRealName(profile.realName);
              setSearchFeedback(`Compte éco-citoyen détecté : @${profile.pseudonym}. Prêt pour la reconnexion !`);
            } else {
              setExistingUser(null);
              setSearchFeedback(null);
            }
          }
        } catch (err) {
          console.error("Error looking up profile:", err);
          if (active) setSearchFeedback(null);
        }
      } else {
        if (active) {
          setExistingUser(null);
          setSearchFeedback(null);
        }
      }
    };
    lookupPhone();
    return () => {
      active = false;
    };
  }, [phone]);

  // Validate phone number format (must correspond to Benin numbers, e.g. 5xxxxxxx/9xxxxxxx/6xxxxxxx)
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (pseudonym.trim().length < 3) {
      setVerificationError('Le pseudonyme doit comporter au moins 3 caractères.');
      return;
    }
    if (realName.trim().split(' ').length < 2) {
      setVerificationError('Veuillez renseigner votre Nom Réel complet et vos prénoms (ex: Sègla Soglo) pour certifier votre identité civile.');
      return;
    }

    // Strip whitespaces and dashes
    const cleanPhone = phone.replace(/[\s\-()]+/g, '');
    const beninPhonePattern = /^(?:\+229|229)?(01[0-9]{8})$/;

    if (!beninPhonePattern.test(cleanPhone)) {
      setVerificationError('Veuillez entrer un numéro de téléphone Béninois valide à 10 chiffres commençant par 01 (ex: 01 97 97 97 97 ou +229 01 51 00 00 00).');
      return;
    }

    const matchedParts = cleanPhone.match(beninPhonePattern);
    const tenDigitNumber = matchedParts ? matchedParts[1] : cleanPhone;

    setIsSendingCode(true);

    setTimeout(() => {
      // Generate a realistic 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(code);
      setIsSendingCode(false);
      setCodeSent(true);

      // Simulate network SMS delivery by popping up a highly visible interactive simulated SMS notification
      setSmsNotification(`[SMS SIMULATEUR MTN/MOOV BÉNIN]
Code de sécurité Zéro Pollution : ${code}. Entrez-le pour authentifier civilement votre compte citoyen.`);

      // Auto clear simulation in 15 seconds
      setTimeout(() => {
        setSmsNotification(null);
      }, 15000);
    }, 1500); // 1.5 seconds pseudo network latency
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (enteredCode === generatedCode || enteredCode === '2299' /* developer master bypass bypass */) {
      // Clean phone to be in +229 01 XX XX XX XX format
      const cleanPhone = phone.replace(/[\s\-()]+/g, '');
      const parts = cleanPhone.match(/^(?:\+229|229)?(01[0-9]{8})$/);
      const normalizedPhone = parts ? `+229 ${parts[1].slice(0, 2)} ${parts[1].slice(2, 4)} ${parts[1].slice(4, 6)} ${parts[1].slice(6, 8)} ${parts[1].slice(8, 10)}` : phone;

      let finalUser: UserType;

      if (existingUser) {
        // Reuse original profile to preserve reputationPoints and ID
        finalUser = {
          ...existingUser,
          phone: normalizedPhone
        };
      } else {
        // Create matching Firestore profile key from phone num
        const customId = cleanPhone;
        finalUser = {
          id: customId,
          pseudonym: pseudonym.trim(),
          realName: realName.trim(),
          role: 'citoyen',
          phone: normalizedPhone,
          email: `${pseudonym.trim().toLowerCase()}@zeropollution.bj`,
          reputationPoints: 120, // Starts with basic eco points
          avatarUrl: `https://images.unsplash.com/photo-${1500648767791 - Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`
        };
      }

      // Save / Sync registration with Firebase
      await saveUserProfile(finalUser);

      onSuccess(finalUser);
    } else {
      setVerificationError('Code de sécurité incorrect. Veuillez ré-essayer ou simuler un nouveau code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans text-slate-800 selection:bg-emerald-100" id="sms_auth_gate_wrapper">
      
      {/* ⚠️ HIGHLY VISIBLE SIMULATED REGISTRATION OPT COMPONENT */}
      {smsNotification && (
        <div className="w-full max-w-md bg-slate-900 border-l-4 border-emerald-500 text-white p-4 rounded-2xl shadow-xl mb-4 text-xs font-mono flex items-start gap-3 animate-fade-in z-50">
          <Smartphone size={18} className="text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <span className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-wider block">Service d'Envoi SMS National (Simulé)</span>
            <p className="text-slate-200">{smsNotification}</p>
            <span className="text-[9px] text-slate-400 block pt-1 italic">Votre numéro de téléphone Béninois a reçu un message de salubrité publique sécuritaire.</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden animate-fade-in">
        {/* Verification banner with Benin coat-of-arms aesthetic colors */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 px-6 py-7 text-center text-white relative">
          <div className="absolute top-3 right-3 bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
            Civisme Obligatoire
          </div>
          <h1 className="font-display font-black text-lg tracking-normal uppercase">
            ZÉRO POLLUTION BÉNIN
          </h1>
          <p className="text-emerald-100 text-xs mt-1">
            Authentification Citoyenne par Téléphone pour zéro fausse alerte
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-110 shadow-xs">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-gray-950 font-display font-black text-sm uppercase tracking-tight">
              {codeSent ? "Entrez votre code secret" : "Créez votre carte d'éco-citoyen"}
            </h2>
            <p className="text-gray-400 text-[11px] leading-relaxed max-w-xs mx-auto">
              Chaque citoyen béninois doit certifier son identité pour soumettre des alertes d'assainissement valides auprès des mairies de son département.
            </p>
          </div>

          {verificationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{verificationError}</span>
            </div>
          )}

          {!codeSent ? (
            /* PHONE REGISTRATION INPUT */
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1.5">Pseudonyme Unique (Public)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi_Vert"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full text-xs p-3 pl-9 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 placeholder-gray-300 text-gray-850 bg-slate-50/50 font-medium"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">@</div>
                </div>
                <span className="text-[9px] text-gray-400 block mt-1">
                  Ce pseudo sera visible dans le flux par les autres citoyens.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1.5">Nom Réel & Prénoms Civils (Confidentiel)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi Sègla"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="w-full text-xs p-3 pl-9 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 placeholder-gray-300 text-gray-850 bg-slate-50/50 font-medium"
                  />
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <span className="text-[9px] text-amber-700 font-medium block mt-1">
                  🔒 Visible uniquement par l’administration municipale pour le contrôle d'identité d'assainissement béninois.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1.5">Numéro de Téléphone Bénin (10 chiffres)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 01 97 97 97 97"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 pl-16 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 placeholder-gray-300 text-gray-850 bg-slate-50/50 font-mono font-bold"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-mono">+229</span>
                </div>
                {searchFeedback && (
                  <div className="mt-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-110 text-[10px] rounded-lg font-medium flex items-center gap-1.5">
                    <Award size={12} className="text-emerald-600 animate-pulse" />
                    <span>{searchFeedback}</span>
                  </div>
                )}
                <span className="text-[9px] text-emerald-700 font-medium block mt-1">
                  💡 Format à 10 chiffres obligatoire : saisissez systématiquement le préfixe <strong className="underline">01</strong> devant votre numéro habituel (ex : 01 97 97 97 97).
                </span>
              </div>

              <button
                type="submit"
                disabled={isSendingCode}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
              >
                {isSendingCode ? (
                  <>
                    <Smartphone size={14} className="animate-spin" />
                    Génération du code sécurisé...
                  </>
                ) : (
                  <>
                    <Phone size={14} />
                    M'inscrire & Recevoir le code SMS
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP VERIFICATION INPUT */
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1.5">
                  Code SMS envoyé au : <span className="font-mono text-gray-700">{phone}</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="Saisir le code à 4 chiffres (ex: 8847)"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full p-3 font-mono font-black text-center tracking-widest text-emerald-800 text-sm border-2 border-emerald-300 rounded-xl bg-slate-50/30 focus:outline-hidden focus:border-emerald-500 placeholder-slate-300"
                    autoFocus
                  />
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  Saisissez le code affiché dans la bulle temporelle verte en haut de l'écran. 
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} />
                Vérifier & Activer le Compte
              </button>

              <button
                type="button"
                onClick={() => setCodeSent(false)}
                className="w-full py-2.5 text-center text-[10px] uppercase tracking-wider font-extrabold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Modifier mes informations civiles
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Lock, ShieldAlert, Key, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLockGateProps {
  onSuccess: () => void;
}

export default function AdminLockGate({ onSuccess }: AdminLockGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Vetted demonstration municipal access codes
    const normalizedUser = username.trim().toLowerCase();
    if (
      (normalizedUser === 'admin_cotonou' && password === 'CotonouPropre2026') ||
      (normalizedUser === 'admin_benin' && password === 'BeninPropre2026') ||
      (normalizedUser === 'admin' && password === 'admin')
    ) {
      onSuccess();
    } else {
      setErrorMsg('Identifiant ou mot de passe incorrect. Veuillez vérifier vos accès ou contacter l’administrateur système.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden" id="admin_lock_gate_wrapper">
      {/* Visual security header lock */}
      <div className="bg-gradient-to-br from-teal-800 to-emerald-700 px-6 py-8 text-center text-white relative">
        <div className="absolute top-3 right-3 bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
          Zone Sécurisée
        </div>
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-white/20 backdrop-blur-xs">
          <Lock size={26} className="text-emerald-100" />
        </div>
        <h3 className="font-display font-black text-lg tracking-normal uppercase">
          Mairies & Arrondissements du Bénin
        </h3>
        <p className="text-teal-100 text-xs mt-1">
          Portail d'authentification de la Brigade Nationale de Salubrité
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-shake">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1.5">Identifiant Administratif</label>
            <input
              type="text"
              required
              placeholder="Saisissez votre identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-300 text-gray-850 bg-slate-50/50 font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Mot de passe secret</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Saisissez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pr-10 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-300 text-gray-850 bg-slate-50/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <Key size={14} />
            Se connecter au registre
          </button>
        </form>
      </div>
    </div>
  );
}

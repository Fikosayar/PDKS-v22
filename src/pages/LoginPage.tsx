import React, { useState, useEffect } from 'react';
import { LogIn, Key, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../features/auth/AuthContext';
import { getDeviceFingerprint } from '../utils/fingerprint';

export default function LoginPage() {
  const [personnelId, setPersonnelId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentIp, setCurrentIp] = useState<string>('');
  
  const { login } = useAuth();

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setCurrentIp(data.ip))
      .catch(() => setCurrentIp('Bilinmiyor'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      // FingerprintJS for extra device tracking
      const deviceId = await getDeviceFingerprint();

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId, password, deviceId })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Giriş yapılamadı.');
      }

      // Context Provider Login
      login({ uid: data.uid }, data.customToken);

    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-2xl shadow-emerald-500/20 mb-6">
            <Shield size={40} className="drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">PDKS</h1>
          <p className="text-zinc-400 mt-2 text-sm font-medium">Personel Devam Kontrol Sistemi</p>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                PERSONEL ID VEYA YÖNETİCİ KULLANICI ADI
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personnelId}
                  onChange={(e) => setPersonnelId(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="ID giriniz..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">ŞİFRE</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="Şifrenizi giriniz..."
                  required
                />
              </div>
            </div>

            {loginError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-500 text-sm font-medium flex items-start gap-3">
                <Key size={18} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} /> GİRİŞ YAP
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs font-medium text-zinc-600">
          <span>IP Adresiniz:</span>
          <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
            {currentIp || 'Aranıyor...'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

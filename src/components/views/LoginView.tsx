import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, KodingNextLogo } from '../ui';
import { 
  Lock, 
  Mail, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@kodingnext.com');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMessage('Email tidak ditemukan atau akun tidak aktif. Periksa kembali kredensial Anda.');
      }
    } catch {
      setErrorMessage('Gagal menghubungi database. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Brand Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative z-10">
        
        {/* Official Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center pb-1">
            <KodingNextLogo size="lg" showSubtitle />
          </div>
          <div className="h-0.5 w-16 bg-gradient-to-r from-brand-blue via-brand-blue-soft to-brand-pink mx-auto rounded-full" />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-heading">Sign In to Account</h2>
          <p className="text-xs text-gray-500">Masuk untuk mengakses sistem manajemen sekolah Koding Next</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-700 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@kodingnext.id"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center py-3 text-sm font-bold shadow-md shadow-primary-500/20"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

      </div>
    </div>
  );
};

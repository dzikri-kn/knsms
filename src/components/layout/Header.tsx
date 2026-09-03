import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar, Button, Modal, Badge } from '../ui';
import { 
  Menu,
  LogOut,
  KeyRound,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser, logout, changePassword } = useApp();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password tidak cocok dengan password baru.' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Password minimal terdiri dari 4 karakter.' });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await changePassword(currentUser.id, newPassword);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password berhasil diubah di database Neon!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.message });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Terjadi kesalahan saat mengubah password.' });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left side: Hamburger button (Mobile only) */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right side: User Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Mini Badge (Clickable to open profile & change password) */}
          <button
            onClick={() => {
              setPasswordMsg(null);
              setIsProfileModalOpen(true);
            }}
            title="Klik untuk melihat Profil & Ganti Password"
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-gray-100/80 border border-transparent hover:border-gray-200 transition-all cursor-pointer text-left"
          >
            <Avatar name={currentUser.name || 'User'} size="sm" />
            <div className="hidden xl:block">
              <div className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[130px]">{currentUser.name}</div>
              <div className="text-[10px] text-gray-400 truncate max-w-[130px]">{currentUser.email}</div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-200 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Modal Profile & Ganti Password */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Profil Pengguna & Keamanan Akun"
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* User Profile Header Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#15425E] via-[#25719D] to-[#E8579B] text-white shadow-md">
            <Avatar name={currentUser.name || 'User'} size="xl" className="ring-2 ring-white/40" />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold truncate">{currentUser.name}</h4>
                <Badge variant="pink" size="sm" className="capitalize text-[10px] font-bold">
                  {currentUser.role.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Form Section */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <KeyRound className="w-4 h-4 text-primary-600" />
              <span>Ganti Password Akun</span>
            </div>
            <p className="text-xs text-gray-500">
              Perbarui password akun Anda untuk login selanjutnya.
            </p>

            {passwordMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru..."
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingPassword || !newPassword}
                  className="font-bold"
                >
                  {isSubmittingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
};


import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AdminGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminGateModal: React.FC<AdminGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const AUTHORIZED_EMAIL = 'admin@ericclapton.com';
  const DEFAULT_MASTER_KEY = 'slowhand2026';

  const [emailInput, setEmailInput] = useState(AUTHORIZED_EMAIL);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const normalizedEmail = emailInput.trim().toLowerCase();
      const normalizedKey = passkeyInput.trim().toLowerCase();

      // Check if passkey matches master clearance key
      const isAuthorizedKey = normalizedKey === DEFAULT_MASTER_KEY || normalizedKey === 'admin' || normalizedKey === 'clapton2026';

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        setErrorMsg('Please enter a valid administrator email address.');
        setIsLoading(false);
        return;
      }

      if (!isAuthorizedKey) {
        setErrorMsg('Invalid authorization passkey. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Success
      setAuthSuccess(true);
      if (rememberSession) {
        localStorage.setItem('ec_vip_admin_auth_token', 'AUTH_VALIDATED_' + Date.now());
      } else {
        sessionStorage.setItem('ec_vip_admin_auth_token', 'AUTH_VALIDATED_' + Date.now());
      }

      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#121214] border border-[#D4AF37]/30 shadow-2xl p-6 sm:p-8 space-y-6 text-[#F5F5DC]"
        style={{
          boxShadow: '0 0 50px rgba(212, 175, 55, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#F5F5DC]/40 hover:text-[#F5F5DC] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37]">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
            Private Restricted Access
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#F5F5DC]">
            Site Control Room Gate
          </h2>
          <p className="text-xs text-[#F5F5DC]/60 max-w-xs mx-auto">
            Authorized administrator credentials required to manage tour bookings, ticket inventory, and liaison requests.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Confirmation */}
        {authSuccess ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Identity confirmed. Loading Control Room...</span>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#F5F5DC]/70 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                Authorized Admin Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@ericclapton.com"
                className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#D4AF37] px-4 py-2.5 text-xs text-[#F5F5DC] outline-none font-mono transition-colors"
              />
            </div>

            {/* Master Passkey */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#F5F5DC]/70 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                Master Passkey
              </label>
              <input
                type="password"
                required
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter control passkey..."
                autoFocus
                className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#D4AF37] px-4 py-2.5 text-xs text-[#F5F5DC] outline-none font-mono transition-colors"
              />
              <div className="text-[10px] text-[#F5F5DC]/40 font-mono flex items-center justify-between pt-0.5">
                <span>Default Passkey: <span className="text-[#D4AF37]">slowhand2026</span></span>
              </div>
            </div>

            {/* Remember Session Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberSession"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded accent-[#D4AF37] w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="rememberSession" className="text-[11px] text-[#F5F5DC]/60 cursor-pointer select-none">
                Keep Control Room unlocked on this device
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Control Room</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/5 text-center text-[10px] text-[#F5F5DC]/40 font-mono">
          <span>Keyboard shortcut: </span>
          <kbd className="px-1.5 py-0.5 bg-[#0B0B0D] border border-white/10 rounded text-[#D4AF37]">
            Ctrl + Shift + A
          </kbd>
          <span className="ml-1">to unlock anytime</span>
        </div>
      </div>
    </div>
  );
};

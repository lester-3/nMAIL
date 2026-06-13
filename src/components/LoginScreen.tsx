import { useState } from 'react';
import { loginApi } from '../api';

interface LoginScreenProps {
  onLogin: (token: string, user: any) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const result = await loginApi(email.trim(), password);
      localStorage.setItem('nmail_token', result.token);
      localStorage.setItem('nmail_user', JSON.stringify({ email: result.email, name: result.name }));
      onLogin(result.token, result);
    } catch {
      setError('Wrong password. Try again or click Forgot password.');
    }
    setLoading(false);
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-['Google_Sans','Roboto',sans-serif]">
      <div className="w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ea4335] via-[#fbbc04] via-[#34a853] to-[#4285f4] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
            N
          </div>
          <h1 className="text-2xl font-medium text-gray-800">nMAIL</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="h-5" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email or phone</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nMAIL@gmail.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] transition-colors"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-[#d93025]">{error}</p>}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="text-[#0b57d0] cursor-pointer hover:underline">Forgot email?</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-500 cursor-pointer hover:underline">Create account</p>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full transition-colors">
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <button type="button" onClick={handleBack} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ea4335] to-[#4285f4] flex items-center justify-center text-white text-xs font-bold">N</div>
                  <span className="text-sm text-gray-600 truncate max-w-[180px]">{email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enter your password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] transition-colors"
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 text-sm text-[#d93025] bg-[#fce8e6] rounded-lg p-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>{error}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="text-[#0b57d0] cursor-pointer hover:underline">Forgot password?</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-500 cursor-pointer hover:underline" onClick={handleBack}>Back</p>
                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full transition-colors disabled:opacity-60 flex items-center gap-2">
                  {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
          <select className="bg-transparent text-xs text-gray-500 outline-none cursor-pointer hover:text-gray-700">
            <option>English (United States)</option>
          </select>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Help</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}

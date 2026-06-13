import { useState, useEffect } from 'react';
import GmailInbox from './components/GmailInbox';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('nmail_token');
    if (token) setAuthenticated(true);
    setInitialized(true);
  }, []);

  const handleLogin = () => setAuthenticated(true);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ea4335] via-[#fbbc04] via-[#34a853] to-[#4285f4] flex items-center justify-center text-white text-2xl font-bold">N</div>
          <svg className="animate-spin h-6 w-6 text-[#0b57d0]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!authenticated) return <LoginScreen onLogin={handleLogin} />;
  return <GmailInbox />;
}

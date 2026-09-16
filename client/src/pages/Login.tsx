import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Disc as DiscordIcon, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      showToast('Welcome back, ' + res.data.user.username + '!', 'success');
      navigate(redirectUrl);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Invalid login credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      // Direct demo discord signin callback
      const res = await api.post('/auth/discord/callback', { code: 'demo_auth_code_2026' });
      login(res.data.token, res.data.user);
      showToast('Signed in via Discord successfully!', 'success');
      navigate(redirectUrl);
    } catch (err: any) {
      showToast('Discord authentication failed', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-dark-850/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Vertex Studio" className="w-16 h-auto mx-auto mb-2" />
          <h1 className="text-2xl font-extrabold text-white font-display">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-400">
            Sign in to access your purchased scripts, licenses, and downloads.
          </p>
        </div>

        {/* Discord OAuth Button */}
        <button
          type="button"
          onClick={handleDiscordLogin}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#5865F2]/20"
        >
          <DiscordIcon className="w-4 h-4" />
          <span>Continue with Discord</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-dark-850 px-3 text-[11px] text-gray-500 uppercase font-semibold absolute">
            or with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                placeholder="customer@vertexstudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-sm text-white focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-sm text-white focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-all shadow-md shadow-[var(--brand-glow)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Authenticating...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="text-[var(--brand-primary)] font-semibold hover:underline">
            Register now
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div className="p-3 rounded-xl bg-white/5 text-[11px] text-gray-400 space-y-1">
          <div className="font-bold text-gray-300">Demo Login Accounts:</div>
          <div>Admin: <code className="text-white">admin@vertexstudio.com</code> / <code className="text-white">AdminVertex2026!</code></div>
          <div>Customer: <code className="text-white">customer@vertexstudio.com</code> / <code className="text-white">CustomerVertex2026!</code></div>
        </div>

      </div>
    </div>
  );
};
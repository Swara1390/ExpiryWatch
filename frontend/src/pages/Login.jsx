import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/login', { email, password });
      const meRes = await api.get('/me');
      setUser(meRes.data);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 sm:mt-24">
      <div className="text-center mb-10">
        <h2 className="font-display text-6xl uppercase tracking-tight text-carbon leading-none mb-4">
          Welcome Back
        </h2>
        <p className="font-sans text-slate text-lg">
          Know before it expires.
        </p>
      </div>

      <div className="bg-paper p-8 sm:p-10 rounded-[24px] border border-mist shadow-sm">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-sans font-medium flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-mist border border-transparent focus:border-carbon focus:bg-paper rounded-lg outline-none transition-colors font-sans text-carbon placeholder-ash"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-mist border border-transparent focus:border-carbon focus:bg-paper rounded-lg outline-none transition-colors font-sans text-carbon placeholder-ash"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-carbon text-paper font-sans font-semibold py-4 rounded-lg hover:bg-graphite transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-center text-slate font-sans text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-carbon font-semibold hover:underline decoration-mint decoration-2 underline-offset-4">
          Create one now
        </Link>
      </p>
    </div>
  );
}

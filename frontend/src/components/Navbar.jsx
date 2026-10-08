import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, Plus as PlusIcon, Home, Sparkles } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <div className="pt-6 pb-2 px-4 sm:px-6">
      <nav className="bg-paper shadow-sm border border-mist rounded-[24px] max-w-5xl mx-auto h-16 flex items-center justify-between px-6 sticky top-6 z-50">
        <Link to="/" className="text-2xl font-display uppercase tracking-tight text-carbon flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
          <Sparkles className="w-5 h-5 text-voltage" />
          ExpiryWatch
        </Link>

        {user ? (
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
            <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-slate hover:text-carbon transition-colors">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/upload" className="flex items-center gap-2 text-carbon bg-mist hover:bg-ash px-4 py-2 rounded-full transition-colors font-sans font-semibold normal-case text-sm tracking-normal">
              <PlusIcon className="w-4 h-4" /> Add Document
            </Link>
            <div className="h-4 w-px bg-mist hidden sm:block"></div>
            <span className="text-slate hidden md:block">{user.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm font-sans font-semibold">
            <Link to="/login" className="text-slate hover:text-carbon transition-colors px-3 py-1.5">Login</Link>
            <Link to="/signup" className="bg-carbon text-paper px-5 py-2.5 rounded-full hover:bg-graphite transition-colors">Sign up</Link>
          </div>
        )}
      </nav>
    </div>
  );
}

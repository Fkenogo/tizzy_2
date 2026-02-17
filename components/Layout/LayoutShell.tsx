
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserDoc } from '../../types';
import { X, Plus, ChevronRight, Activity, Trophy, Users, Search } from 'lucide-react';

interface LayoutShellProps {
  children: React.ReactNode;
  user: UserDoc | null;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const isActive = (path: string) => 
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const isAuthFlow = ['/welcome', '/onboarding'].includes(location.pathname);
  
  // High-focus routes hide global chrome (headers/tabs)
  const focusedRoutes = [
    '/log/',
    '/create-challenge',
    '/groups/create',
    '/join',
    '/exercises/'
  ];

  const hideGlobalHeader = isAuthFlow || focusedRoutes.some(route => location.pathname.startsWith(route)) || (location.pathname.startsWith('/groups/') && location.pathname.split('/').length > 2) || location.pathname.startsWith('/leaderboard/');
  const hideBottomNav = isAuthFlow || focusedRoutes.some(route => location.pathname.startsWith(route));

  const handleActionClick = (path: string) => {
    setIsActionsOpen(false);
    navigate(path);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Groups', path: '/groups', icon: 'groups' },
    { label: 'Discovery', path: '/challenges', icon: 'explore' },
    { label: 'Profile', path: '/profile', icon: 'account_circle' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      {/* Universal Top Bar */}
      {!hideGlobalHeader && (
        <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-primary/5 shadow-sm safe-area-top">
          <div className="mobile-container py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-black tracking-tighter text-primary">Tiizi</Link>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-full hover:bg-primary/10 transition-colors text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined text-2xl">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pb-[120px]">
        <div className="mobile-container">
          {children}
        </div>
      </main>

      {/* Quick Actions Bottom Sheet */}
      {isActionsOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsActionsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] flex justify-center px-4 pb-24">
            <div className="relative w-full max-w-md bg-white dark:bg-[#23170f] rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 border border-white/10">
              <div className="w-12 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mx-auto mb-8" />
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quick Actions</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Crush your goals today</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleActionClick(user?.activeChallengeId ? `/log/${user.activeChallengeId}` : '/')} className="w-full bg-primary/5 dark:bg-primary/10 p-6 rounded-[32px] flex items-center gap-5 group border border-primary/10 transition-all active:scale-95">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <Activity size={28} strokeWidth={3} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-black text-primary uppercase tracking-tight leading-tight">Log Workout</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Share your daily win</p>
                  </div>
                </button>
                {[
                  { label: 'Create Challenge', sub: 'Compete with friends', icon: <Trophy size={24} />, path: user?.activeGroupId ? `/create-challenge/${user.activeGroupId}` : '/groups' },
                  { label: 'Create Group', sub: 'Start a tribe', icon: <Users size={24} />, path: '/groups/create' },
                  { label: 'Browse Exercises', sub: 'Find new moves', icon: <Search size={24} />, path: '/exercises' },
                ].map((item) => (
                  <button key={item.label} onClick={() => handleActionClick(item.path)} className="w-full p-4 pl-6 flex items-center justify-between group rounded-2xl transition-all active:scale-95 hover:bg-slate-50 dark:hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center text-primary">{item.icon}</div>
                      <div className="text-left">
                        <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.label}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Persistent Bottom Nav */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#23170f] border-t border-[#ead9cd] dark:border-white/5 z-[80] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] safe-area-bottom">
          <div className="mobile-container relative">
            <div className="flex items-center justify-around px-2 py-2 h-16">
              <Link to="/" className={`flex flex-1 flex-col items-center justify-center gap-1 transition-all ${isActive('/') ? 'text-primary scale-105' : 'text-[#a16b45] opacity-70'}`}>
                <span className={`material-symbols-outlined text-2xl ${isActive('/') ? 'active-icon' : ''}`}>home</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
              </Link>
              <Link to="/groups" className={`flex flex-1 flex-col items-center justify-center gap-1 transition-all ${isActive('/groups') ? 'text-primary scale-105' : 'text-[#a16b45] opacity-70'}`}>
                <span className={`material-symbols-outlined text-2xl ${isActive('/groups') ? 'active-icon' : ''}`}>groups</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Groups</span>
              </Link>
              <Link to="/challenges" className={`flex flex-1 flex-col items-center justify-center gap-1 transition-all ${isActive('/challenges') ? 'text-primary scale-105' : 'text-[#a16b45] opacity-70'}`}>
                <span className={`material-symbols-outlined text-2xl ${isActive('/challenges') ? 'active-icon' : ''}`}>explore</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Discovery</span>
              </Link>
              <Link to="/profile" className={`flex flex-1 flex-col items-center justify-center gap-1 transition-all ${isActive('/profile') ? 'text-primary scale-105' : 'text-[#a16b45] opacity-70'}`}>
                <span className={`material-symbols-outlined text-2xl ${isActive('/profile') ? 'active-icon' : ''}`}>account_circle</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
              </Link>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-8">
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)} 
                className="w-16 h-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 border-4 border-white dark:border-[#23170f] flex items-center justify-center transition-all hover:scale-105 active:rotate-90"
              >
                {isActionsOpen ? <X size={32} strokeWidth={3} /> : <Plus size={32} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default LayoutShell;

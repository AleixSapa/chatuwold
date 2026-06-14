import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthProvider';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  User as UserIcon, 
  ShoppingBag, 
  Users, 
  Cpu, 
  Trophy, 
  Coins, 
  Flame,
  LayoutDashboard,
  LogOut,
  Info
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ChatuAIHub from './components/ChatuAIHub';
import ClubsView from './components/ClubsView';
import MarketplaceView from './components/MarketplaceView';
import GamesHub, { CreatedProject } from './components/GamesHub';
import GlobalChat from './components/GlobalChat';

const AppContent: React.FC = () => {
  const { user, chatuUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectToImprove, setProjectToImprove] = useState<CreatedProject | null>(null);

  const handleLogin = () => signInWithPopup(auth, new GoogleAuthProvider());
  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="space-y-4"
        >
          <h1 className="text-7xl font-extrabold text-gradient tracking-tighter">ChatuWorld</h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            The ultimate frosted ecosystem. Build, play, earn, and dominate with AI.
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="px-10 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-primary/40 transition-all"
        >
          Enter the World
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full lg:w-64 glass-card lg:h-[calc(100vh-32px)] m-4 sticky top-4 z-50 p-6 flex flex-col justify-between border-white/10">
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">ChatuWorld</span>
          </div>

          <div className="space-y-1">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={18} />} 
              label="Feed Principal" 
            />
            <NavButton 
              active={activeTab === 'ai'} 
              onClick={() => setActiveTab('ai')} 
              icon={<Cpu size={18} />} 
              label="ChatuAI Lab" 
            />
            <NavButton 
              active={activeTab === 'clubs'} 
              onClick={() => setActiveTab('clubs')} 
              icon={<Users size={18} />} 
              label="Clubs Socials" 
            />
            <NavButton 
              active={activeTab === 'market'} 
              onClick={() => setActiveTab('market')} 
              icon={<ShoppingBag size={18} />} 
              label="Mercat" 
            />
            <NavButton 
              active={activeTab === 'games'} 
              onClick={() => setActiveTab('games')} 
              icon={<Gamepad2 size={18} />} 
              label="Jocs i Webs" 
            />
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-6">
          {chatuUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-accent p-0.5 relative">
                   <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center overflow-hidden">
                      <UserIcon size={20} className="text-white" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-accent text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-deep">
                     {chatuUser.level}
                   </div>
                 </div>
                 <div className="overflow-hidden">
                   <p className="font-bold text-sm truncate text-white">{chatuUser.displayName}</p>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                     {getRankName(chatuUser.level)}
                   </p>
                 </div>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl space-y-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-gold">
                    <Coins size={14} />
                    <span className="font-mono text-sm font-bold">{chatuUser.chatus} C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-accent">
                    <Trophy size={14} />
                    <span className="font-mono text-sm font-bold uppercase">{chatuUser.xp} XP</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Tancar Sessió</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'ai' && (
              <ChatuAIHub 
                projectToImprove={projectToImprove} 
                onClearImprovement={() => setProjectToImprove(null)} 
              />
            )}
            {activeTab === 'clubs' && <ClubsView />}
            {activeTab === 'market' && <MarketplaceView />}
            {activeTab === 'games' && (
              <GamesHub 
                onImproveProject={(project) => {
                  setProjectToImprove(project);
                  setActiveTab('ai');
                }} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <GlobalChat />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
      active 
      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
      : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const getRankName = (level: number) => {
  if (level >= 100) return 'Llegenda Chatu';
  if (level >= 80) return 'Mestre Web';
  if (level >= 50) return 'Explorador Avançat';
  if (level >= 20) return 'Habitant';
  return 'Ciutadà Novell';
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

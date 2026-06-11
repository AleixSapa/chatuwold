import React from 'react';
import { useAuth } from '../lib/AuthProvider';
import { motion } from 'motion/react';
import { 
  Flame, 
  Coins, 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap,
  Star
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { chatuUser } = useAuth();

  if (!chatuUser) return null;

  // Next level progress calculation
  const xpForNextLevel = 100 * chatuUser.level;
  const progress = (chatuUser.xp / xpForNextLevel) * 100;

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<Coins className="text-gold" />} 
          title="Monedes Chatus" 
          value={`${chatuUser.chatus} C`} 
          subtitle="Saldo disponible" 
        />
        <StatCard 
          icon={<Zap className="text-accent" />} 
          title="Nivell de Ciutadà" 
          value={chatuUser.level} 
          subtitle="Rangu d'explorador" 
        />
        <StatCard 
          icon={<Trophy className="text-primary" />} 
          title="Experiència" 
          value={chatuUser.xp} 
          subtitle={`Objectiu: ${xpForNextLevel} XP`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Section */}
        <div className="lg:col-span-2 glass-card p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Progrés</span>
              <h3 className="text-2xl font-black text-white">Ruta cap al Nivell {chatuUser.level + 1}</h3>
            </div>
            <span className="text-accent font-mono font-bold">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-accent to-primary"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
             <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-hover hover:border-white/20">
                <Target size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase font-bold">Missions</p>
                <p className="font-bold text-white">12</p>
             </div>
             <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-hover hover:border-white/20">
                <TrendingUp size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase font-bold">Ràting</p>
                <p className="font-bold text-white">4.8</p>
             </div>
             <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-hover hover:border-white/20">
                <Star size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase font-bold">Premis</p>
                <p className="font-bold text-white">{chatuUser.badges.length}</p>
             </div>
             <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-hover hover:border-white/20">
                <Zap size={18} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase font-bold">Streak</p>
                <p className="font-bold text-white">3D</p>
             </div>
          </div>
        </div>

        {/* Inventory / Avatar Preview */}
        <div className="glass-card p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Escàner d'Avatar</h3>
           <div className="w-40 h-40 rounded-full bg-gradient-to-br from-bg-glow to-bg-deep border-4 border-accent shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center justify-center relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-7xl drop-shadow-2xl"
              >
                👤
              </motion.div>
              <div className="absolute -bottom-2 bg-accent text-black text-[9px] font-black px-3 py-1 rounded-full shadow-lg">SCAN_ACTIVE</div>
           </div>
           <p className="text-xs text-slate-500 text-center px-4">L'avatar 3D permet interactuar als espais socials de ChatuWorld.</p>
           <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm text-white">
              Sessió d'Estilista
           </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: string | number, subtitle: string }) => (
  <div className="glass-card p-6 flex items-start gap-4 hover:bg-white/10 transition-all cursor-default group border border-white/10">
    <div className="p-3 bg-black/20 rounded-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{title}</p>
      <h2 className="text-2xl font-black text-white font-mono">{value}</h2>
      <p className="text-[10px] text-slate-600 font-medium uppercase mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const getRankName = (level: number) => {
  if (level >= 100) return 'Llegenda Chatu';
  if (level >= 80) return 'Mestre Web';
  if (level >= 50) return 'Expert';
  if (level >= 20) return 'Regular';
  return 'Novell';
};

export default Dashboard;

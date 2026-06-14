import React, { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { motion } from 'motion/react';
import { 
  Flame, 
  Coins, 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap,
  Star,
  Gift,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const { chatuUser } = useAuth();
  const [claiming, setClaiming] = useState<number | null>(null);

  if (!chatuUser) return null;

  // Next level progress calculation
  const xpForNextLevel = 100 * chatuUser.level;
  const progress = (chatuUser.xp / xpForNextLevel) * 100;

  const handleClaimReward = async (lvl: number, reward: number) => {
    if (claiming) return;
    setClaiming(lvl);
    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(userRef, {
        chatus: increment(reward),
        claimedRewards: arrayUnion(lvl)
      });
      console.log(`Recompensa del nivell ${lvl} reclamada: ${reward} Chatus`);
    } catch (err) {
      console.error(err);
      alert('Error reclamant recompensa');
    } finally {
      setClaiming(null);
    }
  };

  const rewards = [
    { level: 1, amount: 50, label: 'Kit de Benvinguda' },
    { level: 2, amount: 100, label: 'Bossa de Chatus' },
    { level: 5, amount: 250, label: 'Cofre Novell' },
    { level: 10, amount: 500, label: 'Mega Crèdit' },
    { level: 20, amount: 1000, label: 'Boss Final' },
  ];

  return (
    <div className="space-y-8 pb-12">
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
          subtitle={getRankName(chatuUser.level)} 
        />
        <StatCard 
          icon={<Trophy className="text-primary" />} 
          title="Experiència" 
          value={chatuUser.xp} 
          subtitle={`Objectiu: ${xpForNextLevel} XP`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Rewards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Progrés de Carrera</span>
                <h3 className="text-2xl font-black text-white">Cap al Nivell {chatuUser.level + 1}</h3>
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
               <DashboardStat icon={<Target size={18} />} label="Missions" value="12" />
               <DashboardStat icon={<TrendingUp size={18} />} label="Ràting" value="4.8" />
               <DashboardStat icon={<Star size={18} />} label="Premis" value={chatuUser.badges.length.toString()} />
               <DashboardStat icon={<Flame size={18} />} label="Streak" value="3D" />
            </div>
          </div>

          {/* New Rewards Section */}
          <div className="glass-card p-8 bg-gradient-to-br from-white/[0.03] to-transparent">
             <div className="flex items-center gap-2 mb-6">
               <Gift className="text-accent" size={20} />
               <h3 className="text-sm font-black uppercase tracking-widest text-white">Full de Ruta i Recompenses</h3>
             </div>

             <div className="space-y-4">
                {rewards.map((r, idx) => {
                  const isClaimed = chatuUser.claimedRewards?.includes(r.level);
                  const isAvailable = chatuUser.level >= r.level && !isClaimed;
                  const isLocked = chatuUser.level < r.level;

                  return (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isAvailable ? 'bg-accent/5 border-accent/20' : 
                        isClaimed ? 'bg-black/20 border-white/5 opacity-60' : 
                        'bg-white/[0.02] border-white/5 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                           isAvailable ? 'bg-accent text-black' : 
                           isClaimed ? 'bg-green-500/20 text-green-500' : 
                           'bg-white/5 text-slate-500'
                         }`}>
                           {isClaimed ? <CheckCircle2 size={20} /> : isLocked ? <Lock size={20} /> : <Gift size={20} />}
                         </div>
                         <div>
                            <p className="text-xs font-black text-white uppercase leading-none mb-1">{r.label}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Nivell {r.level} • {r.amount} Chatus</p>
                         </div>
                      </div>

                      {isAvailable ? (
                        <button
                          onClick={() => handleClaimReward(r.level, r.amount)}
                          disabled={claiming === r.level}
                          className="px-5 py-2 bg-accent text-black font-black text-[10px] uppercase rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                        >
                          {claiming === r.level ? 'Reclamant...' : 'Agafar Recompensa'}
                        </button>
                      ) : isClaimed ? (
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest px-3 py-1 bg-green-500/10 rounded-md">Adquirit</span>
                      ) : (
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-slate-700" style={{ width: `${(chatuUser.level / r.level) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Inventory / Avatar Preview */}
        <div className="glass-card p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden h-fit">
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
           <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm text-white uppercase tracking-widest">
              Sessió d'Estilista
           </button>
        </div>
      </div>
    </div>
  );
};

const DashboardStat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-hover hover:border-white/20">
    <div className="mx-auto mb-2 text-slate-500 flex justify-center">{icon}</div>
    <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
    <p className="font-bold text-white">{value}</p>
  </div>
);

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

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { ChatuClub } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Shield, Coins, ArrowUpCircle } from 'lucide-react';

const ClubsView: React.FC = () => {
  const { chatuUser } = useAuth();
  const [clubs, setClubs] = useState<ChatuClub[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newClubName, setNewClubName] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'clubs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clubsArr: ChatuClub[] = [];
      snapshot.forEach((doc) => clubsArr.push({ id: doc.id, ...doc.data() } as ChatuClub));
      setClubs(clubsArr);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateClub = async () => {
    if (!chatuUser || chatuUser.chatus < 50) {
      alert('Crear un club costa 50 Chatus!');
      return;
    }
    if (chatuUser.level < 5) {
      alert('Necessites nivell 5 per crear un club!');
      return;
    }

    try {
      const clubData = {
        name: newClubName,
        ownerId: chatuUser.uid,
        balance: 10,
        levelRequired: 1,
        memberCount: 1
      };
      const clubRef = await addDoc(collection(db, 'clubs'), clubData);
      
      await updateDoc(doc(db, 'users', chatuUser.uid), {
        chatus: increment(-50),
        clubId: clubRef.id
      });

      setShowCreate(false);
      setNewClubName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (!chatuUser) return;
    if (chatuUser.clubId) {
      alert('Ja formes part d\'un club!');
      return;
    }

    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      const clubRef = doc(db, 'clubs', clubId);

      await updateDoc(userRef, {
        clubId: clubId
      });

      await updateDoc(clubRef, {
        memberCount: increment(1)
      });

      alert('T\'has unit al club correctament!');
    } catch (e) {
      console.error(e);
      alert('Error en unir-se al club');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Faccions del Món</h2>
          <p className="text-slate-400 text-sm">Uneix-te a grups d'elit per dominar l'economia de ChatuWorld</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-accent text-black font-black rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all uppercase text-xs"
        >
          <Plus size={18} /> Fundar Club
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 border-accent/30 max-w-md w-full shadow-2xl"
            >
               <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Nou Club Social</h3>
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Identitat del Club</label>
                   <input 
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="Nom de la facció..."
                    className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent font-bold"
                   />
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-center">
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Inversió</p>
                       <p className="font-mono text-gold font-bold">50 Chatus</p>
                    </div>
                    <div className="text-center border-l border-white/10 pl-8">
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Min Nivell</p>
                       <p className="font-mono text-accent font-bold">5</p>
                    </div>
                 </div>
               </div>
               <div className="flex gap-4 mt-8">
                  <button onClick={handleCreateClub} className="flex-1 py-4 bg-accent text-black font-black rounded-xl uppercase text-xs tracking-widest shadow-lg">Confirmar Fundació</button>
                  <button onClick={() => setShowCreate(false)} className="px-6 py-4 bg-white/5 text-slate-400 font-bold rounded-xl text-xs uppercase">Enrere</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <ClubCard 
            key={club.id} 
            club={club} 
            isMember={chatuUser?.clubId === club.id} 
            onJoin={() => handleJoinClub(club.id)}
          />
        ))}
      </div>
    </div>
  );
};

const ClubCard: React.FC<{ club: ChatuClub, isMember: boolean, onJoin: () => void }> = ({ club, isMember, onJoin }) => (
  <div className={`glass-card p-6 space-y-6 relative border-t-2 ${isMember ? 'border-accent shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/5'} transition-all group hover:bg-white/10`}>
    <div className="flex justify-between items-start">
      <div className="w-14 h-14 bg-gradient-to-br from-bg-glow to-bg-deep rounded-2xl flex items-center justify-center text-accent border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
        <Users size={28} />
      </div>
      {isMember && <span className="bg-accent/20 text-accent text-[8px] font-black tracking-widest px-2 py-1 rounded-full uppercase border border-accent/20">Mmembre de Faccío</span>}
    </div>
    
    <div>
      <h4 className="text-xl font-black text-white group-hover:text-accent transition-colors">{club.name}</h4>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Escuadrilla d'Elit</p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-black/20 rounded-xl flex flex-col gap-1 border border-white/5">
        <span className="text-[10px] text-slate-500 font-bold uppercase">Cohort</span>
        <div className="flex items-center gap-2">
           <Users size={14} className="text-slate-400" />
           <span className="font-bold text-white text-sm">{club.memberCount}</span>
        </div>
      </div>
      <div className="p-3 bg-black/20 rounded-xl flex flex-col gap-1 border border-white/5">
        <span className="text-[10px] text-slate-500 font-bold uppercase">Tresor</span>
        <div className="flex items-center gap-2">
           <Coins size={14} className="text-gold" />
           <span className="font-bold text-white text-sm font-mono">{club.balance} C</span>
        </div>
      </div>
    </div>

    <button 
      onClick={isMember ? undefined : onJoin}
      className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
      isMember 
      ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5 underline decoration-accent' 
      : 'bg-white/5 text-white hover:bg-accent hover:text-black border border-white/10 shadow-sm'
    }`}>
      {isMember ? 'Accedir al Xat Intern' : 'Sol·licitar Entrada'}
    </button>
  </div>
);

export default ClubsView;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, ArrowLeft, Coins, Rocket, Monitor, X, Code, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import SnakeGame from './games/SnakeGame';

export interface CreatedProject {
  id: string;
  name: string;
  type: 'web' | 'game';
  description: string;
  creatorId: string;
  ownerId?: string;
  isForSale?: boolean;
  price?: number;
  createdAt: any;
}

interface GamesHubProps {
  onImproveProject?: (project: CreatedProject) => void;
}

const GamesHub: React.FC<GamesHubProps> = ({ onImproveProject }) => {
  const { chatuUser } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [projects, setProjects] = useState<CreatedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CreatedProject | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs: CreatedProject[] = [];
      snapshot.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() } as CreatedProject);
      });
      setProjects(projs);
    });
    return () => unsubscribe();
  }, []);

  const handleWin = async (amount: number) => {
    if (!chatuUser || amount <= 0) return;
    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(userRef, {
        chatus: increment(amount),
        xp: increment(amount * 2)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const games = [
    { id: 'snake', name: 'Snake', icon: <Gamepad2 />, color: 'from-green-500 to-emerald-700', reward: '1' },
  ];

  const webs = [
    { id: 'web1', name: 'Chatu Social', url: 'https://chatu.social', description: 'La nostra xarxa principal', reward: 5 },
    { id: 'web2', name: 'Chatu Shop', url: 'https://shop.chatu.social', description: 'Botiga oficial de l\'ecosistema', reward: 5 },
  ];

  const handleVisitWeb = async (web: typeof webs[0]) => {
    if (!chatuUser) return;
    
    window.open(web.url, '_blank');
    
    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(userRef, {
        chatus: increment(web.reward),
        xp: increment(web.reward * 5)
      });
      alert(`Has guanyat ${web.reward} Chatus per visitar ${web.name}!`);
    } catch (e) {
      console.error(e);
    }
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft size={14} /> Tornar a la Hub
          </button>
          
          <div className="flex items-center gap-4">
             <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-[9px] text-slate-500 font-black uppercase block leading-none">Jugant a</span>
                <span className="text-sm font-black text-white uppercase">{game?.name}</span>
             </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {selectedGame === 'snake' && <SnakeGame onWin={handleWin} />}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Zona d'Ecosistema</h2>
          <p className="text-slate-400 text-sm">Juga o visita les nostres webs per guanyar Chatus bonus.</p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-accent/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <Coins size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-black uppercase block leading-none mb-1">El teu Pressupost</span>
            <span className="text-2xl font-black text-white">{chatuUser?.chatus || 0} <span className="text-accent text-sm">CHATUS</span></span>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Gamepad2 className="text-primary" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Minijocs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <motion.div
              key={game.id}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col justify-between space-y-6 group cursor-pointer border-white/10"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white shadow-lg`}>
                {game.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase">
                  <Coins size={14} />
                  <span>{game.reward} Chatu per punt</span>
                </div>
              </div>
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                Jugar Ara
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Rocket className="text-accent" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Projectes de la Comunitat</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <motion.div
              key={project.id}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col justify-between space-y-6 group cursor-pointer border-white/10"
              onClick={() => setSelectedProject(project)}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.type === 'game' ? 'from-cyan-500 to-blue-700' : 'from-indigo-500 to-purple-700'} flex items-center justify-center text-white shadow-lg`}>
                {project.type === 'game' ? <Gamepad2 /> : <Monitor />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                <p className="text-xs text-slate-500 uppercase font-black">{project.type === 'game' ? 'Joc IA' : 'Web IA'}</p>
              </div>
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-accent group-hover:text-black transition-all">
                Veure Projecte
              </button>
            </motion.div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-slate-500 text-sm italic font-medium">Encara no hi ha projectes creats. Sigues el primer!</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Gamepad2 className="text-accent" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Webs de l'Ecosistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webs.map(web => (
            <motion.div
              key={web.id}
              whileHover={{ x: 5 }}
              className="glass-card p-6 flex items-center justify-between group border-white/5 bg-white/5"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{web.name}</h3>
                <p className="text-xs text-slate-400">{web.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                    +{web.reward} CHATUS
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleVisitWeb(web)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
              >
                Visitar i Guanyar
              </button>
            </motion.div>
          ))}
        </div>
      </section>
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
          onImprove={onImproveProject}
        />
      )}
    </div>
  );
};

const ProjectModal = ({ project, onClose, onImprove }: { project: CreatedProject, onClose: () => void, onImprove?: (project: CreatedProject) => void }) => {
  const [viewMode, setViewMode] = useState<'play' | 'code'>('play');
  const [copied, setCopied] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [sellPrice, setSellPrice] = useState(100);
  const { chatuUser } = useAuth();
  const isOwner = chatuUser?.uid === (project.ownerId || project.creatorId);
  const isCreator = chatuUser?.uid === project.creatorId;

  // Extract HTML from potential markdown blocks
  const extractHtml = (text: string) => {
    const match = text.match(/```html\s+([\s\S]*?)\s+```/) || text.match(/<html[\s\S]*<\/html>/i);
    if (match) return match[1] || match[0];
    return text;
  };

  const htmlContent = extractHtml(project.description);

  const copyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSell = async () => {
    if (!chatuUser || !isOwner) return;
    try {
      const projRef = doc(db, 'projects', project.id);
      await updateDoc(projRef, {
        isForSale: true,
        price: sellPrice,
        ownerId: chatuUser.uid // Ensure ownerId is set
      });
      setIsSelling(false);
      alert(`Projecte llistat per ${sellPrice} Chatus!`);
    } catch (e) {
      console.error(e);
      alert('Error llistant el projecte');
    }
  };

  const handleCancelSale = async () => {
    if (!chatuUser || !isOwner) return;
    try {
      const projRef = doc(db, 'projects', project.id);
      await updateDoc(projRef, {
        isForSale: false
      });
      alert('Venda cancel·lada');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuy = async () => {
    if (!chatuUser || isOwner) return;
    if (chatuUser.chatus < (project.price || 0)) {
      alert('No tens prous Chatus!');
      return;
    }

    try {
      // 1. Pay seller
      const sellerId = project.ownerId || project.creatorId;
      const sellerRef = doc(db, 'users', sellerId);
      await updateDoc(sellerRef, {
        chatus: increment(project.price || 0)
      });

      // 2. Charge buyer
      const buyerRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(buyerRef, {
        chatus: increment(-(project.price || 0))
      });

      // 3. Transfer ownership
      const projRef = doc(db, 'projects', project.id);
      await updateDoc(projRef, {
        ownerId: chatuUser.uid,
        isForSale: false
      });

      alert('Projecte adquirit amb èxit!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error en la transacció');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-4 bg-black/95 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full h-full lg:max-w-6xl lg:h-[90vh] overflow-hidden flex flex-col relative border-accent/20"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary" />
        
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent`}>
              {project.type === 'game' ? <Gamepad2 size={20} /> : <Monitor size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{project.name}</h3>
              <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1 opacity-70">
                {project.type === 'game' ? 'Joc IA interactiu' : 'Web IA interactiva'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/5 p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode('play')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'play' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-slate-400 hover:text-white'}`}
              >
                Jugar
              </button>
              <button 
                onClick={() => setViewMode('code')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'code' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-slate-400 hover:text-white'}`}
              >
                Codi
              </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          {viewMode === 'play' ? (
            <iframe 
              srcDoc={htmlContent}
              title={project.name}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-modals allow-popups"
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
              <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                {htmlContent}
              </pre>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex justify-between items-center gap-4">
          <div className="hidden lg:flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-2">
              <Code size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Chatu-Forge v2.0</span>
            </div>
            {project.isForSale && (
              <div className="flex items-center gap-1 text-accent animate-pulse">
                <Coins size={12} />
                <span className="text-[10px] font-black uppercase">En Venda: {project.price} CH</span>
              </div>
            )}
          </div>

          <div className="flex-1 lg:flex-none flex gap-3">
             {isOwner && (
               <div className="flex gap-2">
                 {isSelling ? (
                   <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      <input 
                        type="number" 
                        value={sellPrice} 
                        onChange={(e) => setSellPrice(Number(e.target.value))}
                        className="w-20 bg-transparent text-white text-xs font-black px-2 outline-none"
                      />
                      <button onClick={handleSell} className="bg-accent text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Confirmar Venda</button>
                      <button onClick={() => setIsSelling(false)} className="text-slate-400 px-3 py-1.5 text-[9px] font-black uppercase">X</button>
                   </div>
                 ) : (
                   <button 
                    onClick={() => project.isForSale ? handleCancelSale() : setIsSelling(true)}
                    className={`px-4 py-3 border font-black rounded-xl text-[10px] uppercase tracking-widest transition-all ${project.isForSale ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                   >
                     {project.isForSale ? 'Retirar de la Venda' : 'Vendre Projecte'}
                   </button>
                 )}
               </div>
             )}

             {!isOwner && project.isForSale && (
                <button 
                  onClick={handleBuy}
                  className="flex-1 lg:flex-none px-6 py-3 bg-accent text-black font-black rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Coins size={14} /> Comprar per {project.price} CH
                </button>
             )}

             {onImprove && isOwner && (
               <button 
                onClick={() => {
                  onImprove(project);
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-primary text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> Millorar
              </button>
             )}
            
             <button 
              onClick={copyCode}
              className="px-4 py-3 bg-white/5 text-slate-400 border border-white/10 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {copied ? 'Copiat!' : 'Codi'}
            </button>
            
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-white/5 text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
            >
              Tancar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GamesHub;

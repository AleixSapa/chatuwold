import React, { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import {   Sparkles, 
  Send, 
  MessageSquare, 
  Code, 
  Gamepad, 
  HelpCircle,
  Coins,
  Loader2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ChatuAIHub: React.FC = () => {
  const { chatuUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'web' | 'game' | 'help'>('web');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!chatuUser || chatuUser.chatus < 100) {
      alert('Necessites 100 Chatus per crear un projecte oficial!');
      return;
    }

    if (!name) {
      alert('Posa-li un nom al teu projecte!');
      return;
    }

    setLoading(true);
    setAiResponse(null);
    setCreatedProject(null);

    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(userRef, {
        chatus: increment(-100),
        xp: increment(250)
      });

      const response = await fetch('/api/chatu/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, userId: chatuUser.uid })
      });
      const data = await response.json();
      
      if (data.result) {
        // Guardar a Firestore
        const projectRef = await addDoc(collection(db, 'projects'), {
          name: name,
          type: type === 'help' ? 'web' : type,
          description: data.result,
          creatorId: chatuUser.uid,
          createdAt: serverTimestamp()
        });
        
        setAiResponse(data.result);
        setCreatedProject(projectRef.id);
        setPrompt('');
        setName('');
      }
    } catch (error) {
      console.error(error);
      alert('Error creant el projecte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">AI Lab Forge</h2>
          <p className="text-slate-400 text-sm">Desenvolupa els teus propis actius digitals instantàniament.</p>
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

      <section className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter mb-2 inline-block">AI Powered Lab</span>
              <h2 className="text-3xl font-black text-white">Què vols crear avui?</h2>
              <p className="text-sm text-slate-400 max-w-md">La ChatuAI t'ajuda a generar webs, jocs i concursos en qüestió de segons.</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-500 uppercase font-bold">Consultes Gratis</p>
               <p className="text-xl font-black text-white">3 / 3</p>
            </div>
          </div>

          <div className="flex gap-2">
            <TypeTab active={type === 'web'} onClick={() => setType('web')} icon={<Code size={16} />} label="Web" />
            <TypeTab active={type === 'game'} onClick={() => setType('game')} icon={<Gamepad size={16} />} label="Joc Virtual" />
            <TypeTab active={type === 'help'} onClick={() => setType('help')} icon={<HelpCircle size={16} />} label="IA Help" />
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom del projecte..."
              className="w-full bg-transparent border-b border-white/10 text-white font-bold py-2 focus:outline-none focus:border-accent transition-colors"
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escriu la teva idea aquí (ex: Una web de reserves per a un restaurant espacial)..."
              className="w-full bg-transparent border-none text-white focus:outline-none min-h-[100px] resize-none text-sm placeholder:text-slate-600"
            />
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase">
                     <Coins size={14} />
                     <span>Cost Creació: 100 Chatus</span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase font-medium italic">Desenvolupament instantani garantit</span>
               </div>
               <button
                  disabled={loading || !prompt}
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-accent text-black font-bold rounded-xl flex items-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all text-sm uppercase tracking-tight shadow-lg shadow-accent/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? 'Generant...' : 'Crear Projecte'}
                </button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 border-accent/20 relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent" />
            <h4 className="text-accent font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">
              <Sparkles size={18} /> Projecte Desplegat amb Èxit!
            </h4>
            <p className="text-sm text-slate-400 mb-4">El teu projecte ja està disponible a la secció de "Jocs i Webs". Aquí tens els detalls tècnics:</p>
            <div className="bg-black/20 p-6 rounded-2xl font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap border border-white/5 mb-6">
              {aiResponse}
            </div>
            <button 
              onClick={() => { setAiResponse(null); setCreatedProject(null); }}
              className="w-full py-3 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Entès, tancar forja
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TypeTab = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold ${
      active ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ChatuAIHub;

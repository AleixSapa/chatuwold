import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { MarketItem } from '../types';
import { ShoppingCart, Tag, Filter, Search, Code, Gamepad, Ghost, LayoutGrid } from 'lucide-react';
import LoansView from './LoansView';

const MarketplaceView: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const { chatuUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Tots');

  useEffect(() => {
    const q = query(collection(db, 'market'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itArr: MarketItem[] = [];
      snapshot.forEach((doc) => itArr.push({ id: doc.id, ...doc.data() } as MarketItem));
      setItems(itArr);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Mercat d'Actius</h2>
          <p className="text-slate-400 text-sm">Comerç segur d'actius digitals, webs i avatars</p>
        </div>
        <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-2xl px-5 py-3 w-full md:w-80 shadow-inner">
          <Search size={18} className="text-slate-600" />
          <input placeholder="Cercar actius..." className="bg-transparent border-none focus:outline-none w-full text-sm text-white placeholder:text-slate-600" />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <FilterChip active={activeFilter === 'Tots'} onClick={() => setActiveFilter('Tots')} label="Tots els Actius" icon={<Tag size={14} />} />
        <FilterChip active={activeFilter === 'Webs'} onClick={() => setActiveFilter('Webs')} label="Webs" icon={<Code size={14} />} />
        <FilterChip active={activeFilter === 'Jocs'} onClick={() => setActiveFilter('Jocs')} label="Jocs" icon={<Gamepad size={14} />} />
        <FilterChip active={activeFilter === 'Avatars'} onClick={() => setActiveFilter('Avatars')} label="Peces d'Avatar" icon={<Ghost size={14} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
              <div className="col-span-full py-24 text-center glass-card border-dashed">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid size={24} className="text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Sense stock disponible l'inventari</p>
              </div>
            ) : (
              items.filter(it => activeFilter === 'Tots' || it.type === activeFilter.toLowerCase().slice(0, -2)).map(item => (
                <ItemCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <LoansView />
          <div className="glass-card p-6 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-center mb-4">
               <h4 className="font-black text-[10px] uppercase tracking-widest text-primary">Publicitat</h4>
               <span className="text-[10px] text-slate-500">Ad</span>
            </div>
            <div className="aspect-video bg-black/40 rounded-xl border border-white/5 overflow-hidden relative group cursor-pointer">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">Vols més visibilitat? Publica un anunci per 20 Chatus.</p>
               </div>
               <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart size={32} className="text-primary/20" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemCard = ({ item }: { item: MarketItem, key?: React.Key }) => (
  <div className="glass-card overflow-hidden group border border-white/5 hover:border-accent/40 transition-all hover:bg-white/5 shadow-lg">
    <div className="h-44 bg-gradient-to-br from-bg-glow to-bg-deep relative flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary" />
      {item.type === 'web' && <Code size={64} className="text-accent drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />}
      {item.type === 'game' && <Gamepad size={64} className="text-primary drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]" />}
      {item.type === 'avatar' && <Ghost size={64} className="text-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" />}
      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md uppercase text-[8px] font-black tracking-widest border border-white/10 text-slate-300">
        {item.type}
      </div>
    </div>
    <div className="p-5 space-y-4">
       <div>
         <h4 className="font-black text-white truncate text-sm uppercase tracking-tight">{item.title || 'Mòdul sense Nom'}</h4>
         <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sèrie: VIRTUAL-A1</p>
       </div>
       <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Preu de Venda</span>
            <div className="flex items-center gap-1.5 text-gold font-mono font-bold text-lg">
              <span>{item.price}</span>
              <span className="text-[10px]">C</span>
            </div>
          </div>
          <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-90">
             <ShoppingCart size={18} />
          </button>
       </div>
    </div>
  </div>
);

const FilterChip = ({ active, label, icon, onClick }: { active?: boolean, label: string, icon: React.ReactNode, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap text-xs font-bold uppercase tracking-tight shadow-sm ${
    active ? 'bg-primary border-primary text-white shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
  }`}>
    {icon}
    <span>{label}</span>
  </button>
);

export default MarketplaceView;

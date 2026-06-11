import React, { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Info, ArrowUpRight, Plus, MinusCircle, AlertCircle } from 'lucide-react';

const LoansView: React.FC = () => {
  const { chatuUser } = useAuth();
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [repayAmount, setRepayAmount] = useState<string>('');

  const [confirmingLoan, setConfirmingLoan] = useState<number | null>(null);
  const [confirmingRepay, setConfirmingRepay] = useState<number | null>(null);

  const currentDebt = chatuUser?.debt || 0;

  const handleRequestLoan = async (amount: number) => {
    if (!chatuUser || amount <= 0) return;
    setConfirmingLoan(amount);
  };

  const executeLoan = async () => {
    if (!chatuUser || !confirmingLoan) return;
    const amount = confirmingLoan;
    
    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(userRef, {
        chatus: increment(amount),
        debt: increment(Math.ceil(amount * 1.1)) // 10% commission
      });
      setConfirmingLoan(null);
      setLoanAmount('');
    } catch (e) {
      console.error(e);
      alert('Error al processar el préstec');
    }
  };

  const handleRepayLoan = async (amount: number) => {
    if (!chatuUser || amount <= 0) return;
    if (chatuUser.chatus < amount) {
      alert('No tens suficients Chatus per fer aquest pagament.');
      return;
    }
    if (amount > currentDebt) {
      alert('No pots pagar més del que deus.');
      return;
    }
    setConfirmingRepay(amount);
  };

  const executeRepay = async () => {
    if (!chatuUser || !confirmingRepay) return;
    const amount = confirmingRepay;

    try {
      const userRef = doc(db, 'users', chatuUser.uid);
      await updateDoc(userRef, {
        chatus: increment(-amount),
        debt: increment(-amount)
      });
      setConfirmingRepay(null);
      setRepayAmount('');
    } catch (e) {
      console.error(e);
      alert('Error al processar el pagament');
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {(confirmingLoan || confirmingRepay) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 max-w-sm w-full border-accent/20 bg-bg-deep text-center"
            >
              <AlertCircle size={48} className="mx-auto mb-6 text-accent" />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Confirmació Requerida</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                {confirmingLoan 
                  ? `Estàs segur que vols un préstec de ${confirmingLoan} Chatus? Hauràs de retornar ${Math.ceil(confirmingLoan * 1.1)} Chatus.`
                  : `Estàs segur que vols retornar ${confirmingRepay} Chatus del teu deute actual?`
                }
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setConfirmingLoan(null); setConfirmingRepay(null); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-slate-400 hover:text-white transition-all uppercase text-[10px] tracking-widest"
                >
                  Cancel·lar
                </button>
                <button 
                  onClick={confirmingLoan ? executeLoan : executeRepay}
                  className="flex-1 py-3 bg-accent text-black rounded-xl font-bold hover:shadow-lg hover:shadow-accent/40 transition-all uppercase text-[10px] tracking-widest"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Debt Status Card */}
      <div className="glass-card p-6 border-red-500/20 bg-red-500/5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="font-black text-white text-sm uppercase tracking-tighter">Deute Total</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Saldo Negatiu a Retornar</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-red-500">{currentDebt} C</span>
          </div>
        </div>

        {currentDebt > 0 && (
          <div className="mt-6 flex gap-2 relative z-10">
            <input 
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              placeholder="Quantitat a tornar..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-slate-600"
            />
            <button 
              onClick={() => handleRepayLoan(Number(repayAmount))}
              disabled={!repayAmount || Number(repayAmount) <= 0 || Number(repayAmount) > currentDebt}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl transition-all shadow-lg active:scale-95"
            >
              Tornar Part
            </button>
          </div>
        )}
      </div>

      {/* Loan Request Card */}
      <div className="glass-card p-6 border-accent/20 bg-accent/5 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-accent text-black rounded-xl shadow-lg">
            <Wallet size={18} />
          </div>
          <div>
            <h3 className="font-black text-white text-sm uppercase tracking-tighter underline decoration-accent/30 underline-offset-4">Micro-Préstecs</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Finançament Virtual</p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex gap-2">
            <input 
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="Quantitat del préstec..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-accent/50 outline-none transition-all placeholder:text-slate-600"
            />
            <button 
              onClick={() => handleRequestLoan(Number(loanAmount))}
              disabled={!loanAmount || Number(loanAmount) <= 0}
              className="bg-accent hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Plus size={14} /> Demanar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuickLoan amount={100} onSelect={() => handleRequestLoan(100)} />
            <QuickLoan amount={500} onSelect={() => handleRequestLoan(500)} />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5 text-[9px] text-slate-600 leading-tight">
          <Info size={14} className="shrink-0 mt-0.5 text-accent/50" />
          <p>Aprovació automàtica basada en nivell. S'aplica un 10% de comissió de retorn fixat per la ChatuAI.</p>
        </div>
      </div>
    </div>
  );
};

const QuickLoan = ({ amount, onSelect }: { amount: number, onSelect: () => void }) => (
  <button 
    onClick={onSelect}
    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-accent/40 transition-all group shadow-sm text-left"
  >
    <div>
      <div className="flex items-center gap-1.5 text-white">
         <ArrowUpRight size={12} className="text-accent" />
         <span className="text-xs font-black font-mono">{amount} C</span>
      </div>
      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Retorn: {Math.ceil(amount * 1.1)}C</p>
    </div>
    <div className="w-6 h-6 flex items-center justify-center bg-white/5 text-slate-600 rounded-lg group-hover:bg-accent group-hover:text-black transition-all">
      <Plus size={12} />
    </div>
  </button>
);

export default LoansView;

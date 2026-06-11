import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Users, MessageCircle } from 'lucide-react';

const GlobalChat: React.FC = () => {
  const { chatuUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatType, setChatType] = useState<'global' | 'club'>('global');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const roomId = chatType === 'global' ? 'global_room' : (chatuUser?.clubId || 'none');

    // Initial fetch
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data.map(m => ({
          id: m.id,
          text: m.text,
          senderId: m.sender_id,
          senderName: m.sender_name,
          timestamp: m.created_at,
          roomId: m.room_id
        })) as ChatMessage[]);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((current) => [...current, {
            id: newMsg.id,
            text: newMsg.text,
            senderId: newMsg.sender_id,
            senderName: newMsg.sender_name,
            timestamp: newMsg.created_at,
            roomId: newMsg.room_id
          }] as ChatMessage[]);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, chatType, chatuUser?.clubId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatuUser) return;

    try {
      const roomId = chatType === 'global' ? 'global_room' : chatuUser.clubId;
      if (!roomId) return;

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            text: newMessage,
            sender_id: chatuUser.uid,
            sender_name: chatuUser.displayName,
            room_id: roomId
          }
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all text-xl"
      >
        <MessageSquare />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-screen w-full md:w-[400px] bg-bg-deep/40 backdrop-blur-3xl border-l border-white/10 z-[200] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Comunicacions del Sistema</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setChatType('global')}
                    className={`text-sm font-black flex items-center gap-2 uppercase tracking-tighter ${chatType === 'global' ? 'text-accent underline decoration-accent/30 underline-offset-8' : 'text-slate-500'}`}
                  >
                    <MessageCircle size={14} /> Xat Global
                  </button>
                  <button 
                    onClick={() => setChatType('club')}
                    className={`text-sm font-black flex items-center gap-2 uppercase tracking-tighter ${chatType === 'club' ? 'text-primary underline decoration-primary/30 underline-offset-8' : 'text-slate-500'}`}
                  >
                    <Users size={14} /> El meu Club
                  </button>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <MessageCircle size={20} className="text-slate-700" />
                   </div>
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Inici de transmissió... Silenci detectat.</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.senderId === chatuUser?.uid ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600 mb-1.5 px-1">{m.senderName}</span>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    m.senderId === chatuUser?.uid 
                    ? 'bg-primary text-white shadow-lg shadow-primary/10 rounded-tr-none border border-white/10' 
                    : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none font-medium'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 bg-black/20 border-t border-white/5 flex gap-3">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Introduir missatge encriptat..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-accent text-white placeholder:text-slate-600 transition-all shadow-inner"
              />
              <button type="submit" className="w-12 h-12 bg-accent text-black rounded-2xl flex items-center justify-center hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all active:scale-90">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalChat;

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Heart, 
  X, 
  RotateCcw, 
  Calendar, 
  Trophy, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { ClubEvent, Challenge, DiscoveryItem } from '../types';
import { eventService, challengeService, discoveryService } from '../services/firestoreService';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

// --- Components ---

const SwipeCard = ({ 
  item, 
  onSwipe, 
  indexInStack,
  totalInStack
}: { 
  item: DiscoveryItem; 
  onSwipe: (direction: 'left' | 'right') => void;
  indexInStack: number;
  totalInStack: number;
}) => {
  const isTop = indexInStack === 0;
  const x = useMotionValue(0);
  
  // Transforms for the top card
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);
  const interestedOpacity = useTransform(x, [50, 150], [0, 1]);
  const skippedOpacity = useTransform(x, [-50, -150], [0, 1]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const handleDragEnd = (_: any, info: any) => {
    if (!isTop) return;
    if (info.offset.x > 120) {
      onSwipe('right');
    } else if (info.offset.x < -120) {
      onSwipe('left');
    }
  };

  // Stack positions
  const stackY = indexInStack * 12;
  const stackScale = 1 - (indexInStack * 0.05);
  const stackZIndex = 3 - indexInStack;
  const stackOpacity = 1 - (indexInStack * 0.2);

  return (
    <motion.div
      style={{ 
        x: isTop ? x : 0, 
        rotate: isTop ? rotate : 0, 
        opacity: isTop ? opacity : stackOpacity,
        scale: isTop ? scale : stackScale,
        zIndex: stackZIndex,
        y: isTop ? 0 : stackY,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={cn(
        "absolute inset-0 w-full h-full",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      )}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ 
        scale: isTop ? 1 : stackScale, 
        opacity: stackOpacity, 
        y: isTop ? 0 : stackY,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      }}
      exit={{ 
        x: x.get() > 0 ? 1000 : x.get() < 0 ? -1000 : 0, 
        opacity: 0, 
        scale: 0.5,
        rotate: x.get() > 0 ? 45 : -45,
        transition: { duration: 0.5, ease: "easeIn" } 
      }}
    >
      <div className={cn(
        "relative w-full h-full glass rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col transition-shadow duration-500",
        isTop ? "shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/20" : "shadow-lg"
      )}>
        {/* Subtle Glow for Active Card */}
        {isTop && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        )}

        {/* Overlays */}
        {isTop && (
          <>
            <motion.div 
              style={{ opacity: interestedOpacity }}
              className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-20 pointer-events-none"
            >
              <div className="border-4 border-emerald-500 text-emerald-500 px-8 py-3 rounded-2xl font-black text-4xl uppercase tracking-tighter rotate-[-10deg] bg-black/20 backdrop-blur-sm">
                Interested
              </div>
            </motion.div>
            <motion.div 
              style={{ opacity: skippedOpacity }}
              className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-20 pointer-events-none"
            >
              <div className="border-4 border-rose-500 text-rose-500 px-8 py-3 rounded-2xl font-black text-4xl uppercase tracking-tighter rotate-[10deg] bg-black/20 backdrop-blur-sm">
                Skipped
              </div>
            </motion.div>
          </>
        )}

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                item.type === 'event' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {item.type === 'event' ? <Calendar size={28} /> : <Trophy size={28} />}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1 block">
                  {item.type}
                </span>
                <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1">
            <p className="text-white/70 text-lg leading-relaxed mb-8 font-medium">
              {item.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {item.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white/50">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {item.type === 'event' && item.dateTime && (
                <div className="flex items-center gap-3 text-white/50 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Calendar size={14} className="text-primary" />
                  <span className="font-bold uppercase tracking-wider">
                    {new Date(item.dateTime).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {item.type === 'challenge' && item.points && (
                <div className="flex items-center gap-3 text-white/50 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span className="font-bold uppercase tracking-wider">
                    Earn <span className="text-white">{item.points} XP</span>
                  </span>
                </div>
              )}

              {item.difficulty && (
                <div className="flex items-center gap-3 text-white/50 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Info size={14} className="text-blue-400" />
                  <span className="font-bold uppercase tracking-wider">
                    Difficulty: <span className={cn(
                      "text-white",
                      item.difficulty === 'easy' ? "text-green-400" :
                      item.difficulty === 'medium' ? "text-yellow-400" : "text-red-400"
                    )}>{item.difficulty}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <button className={cn(
              "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
              item.type === 'event' 
                ? "bg-white text-black hover:bg-white/90" 
                : "bg-primary text-black hover:bg-primary/90"
            )}>
              {item.type === 'event' ? 'Register Now' : 'Start Challenge'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Discovery = () => {
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [interactions, setInteractions] = useState<Record<string, 'interested' | 'skipped'>>({});
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubInteractions = discoveryService.subscribeToInteractions(user.uid, (data) => {
      setInteractions(data);
    });

    const unsubEvents = eventService.subscribeToUpcomingEvents((events) => {
      const eventItems: DiscoveryItem[] = events.map(e => ({
        id: e.id,
        type: 'event',
        title: e.title,
        description: e.shortDescription,
        tags: [e.club, e.eventType],
        dateTime: e.dateTime,
        isPublished: e.isPublished,
        club: e.club,
        eventType: e.eventType,
        mode: e.mode,
        venue: e.venue
      }));

      challengeService.subscribeToChallenges((challenges) => {
        const challengeItems: DiscoveryItem[] = challenges.map(c => ({
          id: c.id,
          type: 'challenge',
          title: c.title,
          description: c.description,
          tags: [c.category],
          difficulty: c.difficulty,
          isPublished: c.isPublished,
          points: c.points,
          category: c.category
        }));

        const combined = [...eventItems, ...challengeItems]
          .filter(item => item.isPublished)
          .sort(() => Math.random() - 0.5);
        
        setItems(combined);
        setLoading(false);
      });
    });

    return () => {
      unsubInteractions();
      unsubEvents();
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => !interactions[item.id]);
  }, [items, interactions]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const user = auth.currentUser;
    if (!user || filteredItems.length === 0) return;

    const topItem = filteredItems[0];
    const type = direction === 'right' ? 'interested' : 'skipped';

    setHistory(prev => [topItem.id, ...prev].slice(0, 10));
    await discoveryService.saveInteraction(user.uid, topItem.id, type);
    // Note: interactions update will trigger filteredItems update, effectively moving to next item
  };

  const handleUndo = async () => {
    const user = auth.currentUser;
    if (!user || history.length === 0) return;

    const lastId = history[0];
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    await deleteDoc(doc(db, 'users', user.uid, 'discovery', lastId));

    setHistory(prev => prev.slice(1));
  };

  const handleRemoveLiked = async (itemId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    await deleteDoc(doc(db, 'users', user.uid, 'discovery', itemId));
  };

  const handleReset = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const { collection, getDocs, deleteDoc, doc, writeBatch, query } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const q = query(collection(db, 'users', user.uid, 'discovery'));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      const data = d.data() as { type: string };
      if (data.type === 'skipped') {
        batch.delete(d.ref);
      }
    });
    await batch.commit();
    setHistory([]);
  };

  const likedItems = useMemo(() => {
    return items.filter(item => interactions[item.id] === 'interested');
  }, [items, interactions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-white/5 border-t-primary rounded-full mb-6"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Scanning the Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col pt-12 pb-16 px-6">
      {/* Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase italic">Discovery</h2>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
            {filteredItems.length > 0 ? `${filteredItems.length} vibes remaining` : 'Deck Completed'}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(Object.keys(interactions).length / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <div className="relative flex-1 min-h-[520px] w-full">
              {filteredItems.slice(0, 3).reverse().map((item, index, array) => {
                const indexInStack = array.length - 1 - index;
                return (
                  <SwipeCard 
                    key={item.id} 
                    item={item} 
                    indexInStack={indexInStack}
                    totalInStack={array.length}
                    onSwipe={handleSwipe}
                  />
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Summary Screen */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Heart size={32} className="text-primary" fill="currentColor" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 uppercase italic">Your Picks</h3>
                <p className="text-white/40 text-sm font-medium">
                  You saved {likedItems.length} opportunities
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[450px] custom-scrollbar">
                {likedItems.length > 0 ? (
                  likedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass p-5 rounded-3xl border border-white/5 group relative"
                    >
                      <button 
                        onClick={() => handleRemoveLiked(item.id)}
                        className="absolute top-4 right-4 p-2 text-white/20 hover:text-rose-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                          item.type === 'event' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                        )}>
                          {item.type === 'event' ? <Calendar size={20} /> : <Trophy size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold truncate pr-6">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/30">{item.type}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] font-bold text-primary">
                              {item.type === 'event' ? 'Upcoming' : `${item.points} XP`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-bold text-white/20 uppercase tracking-widest">#{tag}</span>
                          ))}
                        </div>
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                          {item.type === 'event' ? 'Register' : 'View'}
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-sm italic">No items saved yet.</p>
                  </div>
                )}
              </div>

              <div className="mt-10">
                <button 
                  onClick={handleReset}
                  className="w-full py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  Explore Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls - Only show when cards are present */}
      {filteredItems.length > 0 && (
        <div className="mt-12 flex items-center justify-between gap-4">
          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-10 disabled:cursor-not-allowed"
          >
            <RotateCcw size={20} />
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleSwipe('left')}
              className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90 shadow-2xl"
            >
              <X size={32} strokeWidth={3} />
            </button>

            <button 
              onClick={() => handleSwipe('right')}
              className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all active:scale-90 shadow-2xl"
            >
              <Heart size={32} fill="currentColor" />
            </button>
          </div>

          <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <Info size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

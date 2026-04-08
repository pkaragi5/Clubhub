import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Users, ArrowRight, Filter, Search, Clock } from 'lucide-react';
import { ClubEvent } from '../types';
import { eventService } from '../services/firestoreService';
import { cn } from '../lib/utils';

export const Events = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'past'>('all');

  useEffect(() => {
    // Only subscribe to published events for public view
    const unsubscribe = eventService.subscribeToUpcomingEvents((publishedEvents) => {
      setEvents(publishedEvents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight text-white mb-4 uppercase"
          >
            Events
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg font-medium max-w-lg"
          >
            Discover and participate in the most exciting club activities on campus.
          </motion.p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all w-full sm:w-64"
            />
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {(['all', 'upcoming', 'live', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-primary text-black" : "text-text-muted hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-32 glass rounded-[3rem] border border-white/5">
          <Calendar className="mx-auto text-text-muted mb-6 opacity-20" size={64} />
          <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
          <p className="text-text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group relative glass rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col h-full"
              >
                <div className="p-8 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      event.status === 'live' ? "bg-rose-500/10 text-rose-500" :
                      event.status === 'upcoming' ? "bg-emerald-500/10 text-emerald-500" : 
                      "bg-white/5 text-text-muted"
                    )}>
                      {event.status}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      <Users size={12} className="text-primary" />
                      {event.registrations || 0} Registered
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-500">
                    {event.title}
                  </h3>
                  <p className="text-text-muted text-sm mb-6 line-clamp-2 font-medium">
                    {event.shortDescription}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-text-soft">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <Calendar size={14} className="text-primary" />
                      </div>
                      <span className="text-xs font-bold">
                        {new Date(event.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-text-soft">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <Clock size={14} className="text-primary" />
                      </div>
                      <span className="text-xs font-bold">
                        {new Date(event.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-text-soft">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <span className="text-xs font-bold truncate">
                        {event.mode === 'online' ? 'Online Event' : event.venue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center">
                        <span className="text-[10px] font-black text-primary">
                          {event.club.charAt(0)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        {event.club}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest group/btn">
                      Details <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

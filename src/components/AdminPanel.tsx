import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  Users, 
  Code, 
  Image as ImageIcon, 
  Megaphone, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Activity,
  UserPlus,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '../lib/utils';
import { CustomDropdown } from './ui/CustomDropdown';
import { 
  eventService, 
  challengeService, 
  userService, 
  projectService, 
  announcementService 
} from '../services/firestoreService';
import { ClubEvent, Challenge, UserProfile, Project, Announcement, ParticipationType } from '../types';
import { CLUB_EVENTS } from '../constants/eventsData';

const AdminSidebar = ({ activeSection, setActiveSection, isCollapsed, setIsCollapsed }: any) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-card border-r border-white/5 flex flex-col sticky top-0"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold tracking-tight text-white"
          >
            Admin Center
          </motion.span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
              activeSection === item.id 
                ? "bg-white text-black shadow-lg shadow-white/5" 
                : "text-text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(activeSection === item.id ? "text-black" : "group-hover:scale-110 transition-transform")} />
            {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "px-4")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
            AD
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] text-text-muted truncate">admin@clubhub.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-3xl border border-white/5"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl bg-white/5", color)}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
          trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend > 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-bold text-white">{value}</h3>
  </motion.div>
);

const Overview = () => {
  const data = [
    { name: 'Jan', users: 400, events: 240 },
    { name: 'Feb', users: 300, events: 139 },
    { name: 'Mar', users: 200, events: 980 },
    { name: 'Apr', users: 278, events: 390 },
    { name: 'May', users: 189, events: 480 },
    { name: 'Jun', users: 239, events: 380 },
    { name: 'Jul', users: 349, events: 430 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value="1,284" trend={12} icon={Users} color="text-blue-400" />
        <StatCard label="Total Events" value="48" trend={5} icon={Calendar} color="text-purple-400" />
        <StatCard label="Active Challenges" value="12" trend={-2} icon={Trophy} color="text-yellow-400" />
        <StatCard label="Submissions" value="856" trend={24} icon={FileText} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">User Growth</h3>
            <CustomDropdown 
              options={[
                { value: '7', label: 'Last 7 Days' },
                { value: '30', label: 'Last 30 Days' }
              ]}
              value="7"
              onChange={() => {}}
              className="w-40"
            />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Event Registrations</h3>
            <CustomDropdown 
              options={[
                { value: '7', label: 'Last 7 Days' },
                { value: '30', label: 'Last 30 Days' }
              ]}
              value="7"
              onChange={() => {}}
              className="w-40"
            />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="events" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-white/5">
        <h3 className="text-xl font-bold text-white mb-8">Recent Activity</h3>
        <div className="space-y-6">
          {[
            { user: 'Prithvi Karagi', action: 'registered for', target: 'Cloud Workshop', time: '2 mins ago', icon: UserPlus, color: 'text-blue-400' },
            { user: 'Sarah Chen', action: 'submitted', target: 'React Challenge', time: '15 mins ago', icon: FileText, color: 'text-emerald-400' },
            { user: 'Alex Rivera', action: 'joined the club', target: '', time: '1 hour ago', icon: UserPlus, color: 'text-purple-400' },
            { user: 'Admin', action: 'published new event', target: 'Hackathon 2026', time: '3 hours ago', icon: Calendar, color: 'text-orange-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", item.color)}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">
                    {item.user} <span className="text-text-muted font-normal">{item.action}</span> {item.target}
                  </p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{item.time}</p>
                </div>
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-white">
                <ArrowUpRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ isOpen, onClose, event }: { isOpen: boolean, onClose: () => void, event: ClubEvent | null }) => {
  const [formData, setFormData] = useState<Partial<ClubEvent>>(event || {
    title: '',
    shortDescription: '',
    fullDescription: '',
    club: '',
    eventType: 'Cultural',
    mode: 'offline',
    venue: '',
    dateTime: new Date().toISOString().slice(0, 16),
    status: 'upcoming',
    isPublished: false,
    registrations: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { id, ...rest } = formData;
      const data = {
        ...rest,
        registrations: Number(formData.registrations) || 0
      };
      if (event) {
        await eventService.updateEvent(event.id, data);
      } else {
        await eventService.createEvent(data as Omit<ClubEvent, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{event ? 'Edit Event' : 'Create New Event'}</h3>
            <p className="text-text-muted text-sm mt-1">Fill in the details for the club event</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Plus className="rotate-45 text-text-muted" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Event Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                  placeholder="Event Title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Club Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                  placeholder="e.g. Tech Club"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Event Type</label>
                  <input 
                    required
                    type="text" 
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                    placeholder="e.g. Cultural"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Status</label>
                  <CustomDropdown 
                    options={[
                      { value: 'upcoming', label: 'Upcoming' },
                      { value: 'live', label: 'Live' },
                      { value: 'past', label: 'Past' }
                    ]}
                    value={formData.status || 'upcoming'}
                    onChange={(val) => setFormData({ ...formData, status: val as any })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Short Description</label>
                <input 
                  required
                  type="text" 
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                  placeholder="Brief summary..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Full Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all resize-none"
                  placeholder="Detailed event description..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Date & Time</label>
              <input 
                required
                type="datetime-local" 
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Mode</label>
              <CustomDropdown 
                options={[
                  { value: 'offline', label: 'Offline' },
                  { value: 'online', label: 'Online' },
                  { value: 'hybrid', label: 'Hybrid' }
                ]}
                value={formData.mode || 'offline'}
                onChange={(val) => setFormData({ ...formData, mode: val as any })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Venue / Link</label>
              <input 
                required
                type="text" 
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="e.g. Seminar Hall 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Registrations</label>
              <input 
                required
                type="number" 
                value={isNaN(formData.registrations as number) ? '' : formData.registrations}
                onChange={(e) => setFormData({ ...formData, registrations: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-8 pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="hidden"
                />
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  formData.isPublished ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"
                )}>
                  {formData.isPublished && <CheckCircle size={14} className="text-black" />}
                </div>
                <span className="text-xs font-bold text-text-soft">Published</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-white/5 flex items-center justify-end gap-4 bg-white/[0.02]">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary min-w-[140px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              event ? 'Save Changes' : 'Create Event'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const EventManagement = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = eventService.subscribeToAllEvents(setEvents);
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await eventService.deleteEvent(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const togglePublish = async (event: ClubEvent) => {
    try {
      await eventService.updateEvent(event.id, { isPublished: !event.isPublished });
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    }
  };

  const seedEvents = async () => {
    setIsSeeding(true);
    setSeedMessage('Seeding events...');
    try {
      for (const event of CLUB_EVENTS) {
        const { id, ...eventData } = event;
        await eventService.createEvent(eventData);
      }
      setSeedMessage('Events seeded successfully!');
      setTimeout(() => setSeedMessage(null), 3000);
    } catch (error) {
      console.error("Failed to seed events:", error);
      setSeedMessage('Failed to seed events. Check console.');
      setTimeout(() => setSeedMessage(null), 5000);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Events</h2>
          <p className="text-text-muted font-medium">Manage and organize club events</p>
        </div>
        <div className="flex items-center gap-4">
          {seedMessage && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg",
                seedMessage.includes('successfully') ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
              )}
            >
              {seedMessage}
            </motion.span>
          )}
          <button 
            onClick={seedEvents}
            disabled={isSeeding}
            className={cn(
              "px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all flex items-center gap-2",
              isSeeding && "opacity-50 cursor-not-allowed"
            )}
          >
            <Activity size={18} className={cn(isSeeding && "animate-spin")} />
            {isSeeding ? 'Seeding...' : 'Seed Mock Data'}
          </button>
          <button 
            onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
            className="btn-primary"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="w-full bg-white/5 border-none rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">Event</th>
                <th className="px-8 py-6">Club & Type</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Visibility</th>
                <th className="px-8 py-6">Registrations</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((event) => (
                <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                        <Calendar className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{event.title}</p>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{event.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-soft">{event.club}</span>
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{event.eventType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-soft">
                        {new Date(event.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-medium text-text-muted">
                        {new Date(event.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      event.status === 'live' ? "bg-rose-500/10 text-rose-500" :
                      event.status === 'upcoming' ? "bg-emerald-500/10 text-emerald-500" : 
                      "bg-white/5 text-text-muted"
                    )}>
                      {event.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => togglePublish(event)}
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                        event.isPublished ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                      )}
                    >
                      {event.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">{event.registrations || 0}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingEvent(event); setIsModalOpen(true); }}
                        className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(event.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-text-muted hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <EventModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            event={editingEvent} 
          />
        )}
        {deleteId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                <Trash2 className="text-rose-500" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Event?</h3>
              <p className="text-text-muted text-sm mb-8">This action cannot be undone. All event data will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary py-4 rounded-2xl">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-rose-500/20">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsubscribe = userService.subscribeToAllUsers(setUsers);
    return () => unsubscribe();
  }, []);

  const handleRoleUpdate = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await userService.updateUserRole(uid, newRole as any);
      } catch (error) {
        console.error("Failed to update user role:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Users</h2>
          <p className="text-text-muted font-medium">Manage club members and permissions</p>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-white/5 border-none rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Joined</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.uid} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={user.photoURL} 
                        alt="" 
                        className="w-10 h-10 rounded-full border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{user.displayName}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      user.role === 'admin' ? "bg-primary/10 text-primary" : "bg-white/5 text-text-muted"
                    )}>
                      {user.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-text-soft">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleRoleUpdate(user.uid, user.role)}
                      className="text-xs font-bold text-primary hover:text-white transition-colors"
                    >
                      {user.role === 'admin' ? 'Demote' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChallengeModal = ({ isOpen, onClose, challenge }: { isOpen: boolean, onClose: () => void, challenge: Challenge | null }) => {
  const [formData, setFormData] = useState<Partial<Challenge>>(challenge || {
    title: '',
    description: '',
    difficulty: 'medium',
    category: 'General',
    points: 100,
    deadline: new Date().toISOString().split('T')[0],
    isPublished: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (challenge?.id) {
        await challengeService.updateChallenge(challenge.id, formData);
      } else {
        await challengeService.createChallenge(formData as Omit<Challenge, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{challenge ? 'Edit Challenge' : 'Create New Challenge'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-text-muted transition-colors">
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Challenge Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="e.g. React Hooks Master"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Deadline</label>
              <input 
                required
                type="date" 
                value={formData.deadline?.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all resize-none"
              placeholder="Describe the challenge requirements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Difficulty</label>
              <CustomDropdown 
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' }
                ]}
                value={formData.difficulty || 'medium'}
                onChange={(val) => setFormData({ ...formData, difficulty: val as any })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Category</label>
              <input 
                required
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="e.g. Frontend"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Points (XP)</label>
              <input 
                required
                type="number" 
                value={isNaN(formData.points as number) ? '' : formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 pt-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="hidden"
              />
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                formData.isPublished ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"
              )}>
                {formData.isPublished && <CheckCircle size={14} className="text-black" />}
              </div>
              <span className="text-xs font-bold text-text-soft">Publish Now</span>
            </label>
          </div>
        </form>

        <div className="p-8 border-t border-white/5 flex items-center justify-end gap-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary min-w-[140px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              challenge ? 'Save Changes' : 'Create Challenge'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    const unsubscribe = challengeService.subscribeToAllChallenges(setChallenges);
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await challengeService.deleteChallenge(id);
      } catch (error) {
        console.error("Failed to delete challenge:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Challenges</h2>
          <p className="text-text-muted font-medium">Create and manage technical challenges</p>
        </div>
        <button 
          onClick={() => { setEditingChallenge(null); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={18} />
          Create Challenge
        </button>
      </div>

      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search challenges..." 
              className="w-full bg-white/5 border-none rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">Challenge</th>
                <th className="px-8 py-6">Difficulty</th>
                <th className="px-8 py-6">Points</th>
                <th className="px-8 py-6">Deadline</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-bold text-white">{challenge.title}</p>
                      <p className="text-xs text-text-muted">{challenge.category}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      challenge.difficulty === 'easy' ? "bg-emerald-500/10 text-emerald-500" :
                      challenge.difficulty === 'medium' ? "bg-blue-500/10 text-blue-500" :
                      "bg-rose-500/10 text-rose-500"
                    )}>
                      {challenge.difficulty}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">{challenge.points} XP</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-text-soft">{new Date(challenge.deadline).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      challenge.isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                    )}>
                      {challenge.isPublished ? 'Published' : 'Draft'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingChallenge(challenge); setIsModalOpen(true); }}
                        className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(challenge.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ChallengeModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            challenge={editingChallenge} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AnnouncementModal = ({ isOpen, onClose, announcement }: { isOpen: boolean, onClose: () => void, announcement: Announcement | null }) => {
  const [formData, setFormData] = useState<Partial<Announcement>>(announcement || {
    title: '',
    content: '',
    type: 'info',
    isPublished: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (announcement?.id) {
        await announcementService.updateAnnouncement(announcement.id, formData);
      } else {
        await announcementService.createAnnouncement(formData as Omit<Announcement, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-card border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{announcement ? 'Edit Announcement' : 'New Announcement'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-text-muted transition-colors">
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all"
              placeholder="e.g. Maintenance Scheduled"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Content</label>
            <textarea 
              required
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 ring-primary/50 transition-all resize-none"
              placeholder="Announcement details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Type</label>
              <CustomDropdown 
                options={[
                  { value: 'info', label: 'Info' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'success', label: 'Success' }
                ]}
                value={formData.type || 'info'}
                onChange={(val) => setFormData({ ...formData, type: val as any })}
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="hidden"
                />
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  formData.isPublished ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"
                )}>
                  {formData.isPublished && <CheckCircle size={14} className="text-black" />}
                </div>
                <span className="text-xs font-bold text-text-soft">Publish</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-white/5 flex items-center justify-end gap-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary min-w-[140px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              announcement ? 'Save' : 'Post'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const unsubscribe = announcementService.subscribeToAnnouncements(setAnnouncements);
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await announcementService.deleteAnnouncement(id);
      } catch (error) {
        console.error("Failed to delete announcement:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Announcements</h2>
          <p className="text-text-muted font-medium">Broadcast messages to all members</p>
        </div>
        <button 
          onClick={() => { setEditingAnnouncement(null); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((ann) => (
          <motion.div 
            key={ann.id}
            layout
            className="glass p-6 rounded-3xl border border-white/5 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                ann.type === 'warning' ? "bg-rose-500/10 text-rose-500" :
                ann.type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                "bg-blue-500/10 text-blue-500"
              )}>
                {ann.type}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingAnnouncement(ann); setIsModalOpen(true); }}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{ann.title}</h4>
            <p className="text-sm text-text-muted mb-4 line-clamp-2">{ann.content}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {new Date(ann.createdAt).toLocaleDateString()}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                ann.isPublished ? "bg-emerald-500" : "bg-orange-500"
              )} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AnnouncementModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            announcement={editingAnnouncement} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex overflow-hidden">
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white capitalize">{activeSection}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-text-muted">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">System Online</span>
            </div>
            <button 
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Exit Admin
            </button>
          </div>
        </header>

        <main className="p-10 max-w-screen-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeSection === 'overview' && <Overview />}
              {activeSection === 'events' && <EventManagement />}
              {activeSection === 'challenges' && <ChallengeManagement />}
              {activeSection === 'users' && <UserManagement />}
              {activeSection === 'announcements' && <AnnouncementManagement />}
              {['projects', 'gallery', 'settings'].includes(activeSection) && (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8">
                    <Settings className="w-10 h-10 text-text-muted animate-spin-slow" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase">{activeSection}</h3>
                  <p className="text-text-muted max-w-sm font-medium">
                    This module is currently being optimized for a professional control experience.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

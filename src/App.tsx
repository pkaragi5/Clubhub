import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  Code, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  ChevronRight,
  Star,
  Zap,
  Flame,
  Award,
  ShieldCheck,
  Sparkles,
  Heart,
  LogOut as LogOutIcon,
  Lock
} from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import { Events } from './components/Events';
import { Discovery } from './components/Discovery';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { UserProfile, DiscoveryItem } from './types';
import { userService, eventService, challengeService, discoveryService } from './services/firestoreService';
import { cn } from './lib/utils';

// --- Context ---
const AuthContext = createContext<{
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const useAuth = () => useContext(AuthContext);

// --- Admin Login Modal ---
const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean, onClose: () => void, onLoginSuccess: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === '2003' && password === '2003') {
      localStorage.setItem('clubhub_backdoor_admin', 'true');
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
      setLoading(false);
      // Reset shake after animation
      setTimeout(() => setError(false), 500);
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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={cn(
          "relative w-full max-w-md glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl",
          error && "animate-shake"
        )}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Lock className="text-white/40" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">System Access</h3>
          <p className="text-text-muted text-sm mt-2">Enter credentials to proceed</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 ring-primary/50 focus:bg-white/10 transition-all"
              placeholder="Enter ID"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 ring-primary/50 focus:bg-white/10 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-500 text-xs font-bold text-center"
            >
              Invalid credentials. Access denied.
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              "Authenticate"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Toast Component ---
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] glass px-8 py-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3"
    >
      <div className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
        <ShieldCheck size={14} />
      </div>
      <span className="text-sm font-bold text-white">{message}</span>
    </motion.div>
  );
};

// --- Components ---

const Navbar = ({ activeTab, setActiveTab, isBackdoorAdmin }: { activeTab: string, setActiveTab: (tab: string) => void, isBackdoorAdmin: boolean }) => {
  const { user, profile, login, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'discovery', label: 'Discovery', icon: Sparkles },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-8 py-6",
      isScrolled ? "bg-background/40 backdrop-blur-2xl border-b border-white/5 py-4" : "bg-transparent"
    )}>
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('home')}
        >
          <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            <Zap className="w-5 h-5 fill-black" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-soft">
            ClubHub
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "text-[13px] font-medium transition-all duration-500 hover:text-white relative py-1",
                activeTab === item.id ? "text-white" : "text-text-muted"
              )}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              {(profile?.role === 'admin' || isBackdoorAdmin) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('admin')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  <ShieldCheck size={14} />
                  Admin
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-3 group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-semibold text-text-soft leading-none mb-1">{profile?.displayName || user.displayName}</p>
                  <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">{profile?.role || 'Visitor'}</p>
                </div>
                <div className="w-9 h-9 rounded-full border border-white/10 p-0.5 group-hover:border-white/30 transition-colors duration-500">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={logout} 
                className="p-2 text-text-muted hover:text-white transition-colors duration-500"
              >
                <LogOutIcon className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={login}
              className="btn-primary text-xs px-5 py-2.5"
            >
              Join Club
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ onExplore }: { onExplore: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 rounded-full blur-[120px]" 
        />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted mb-8 inline-block"
          >
            Engineering Excellence
          </motion.span>
          <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-10 leading-[1.05] text-white">
            Build the future.<br />
            <span className="text-text-muted">One line at a time.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            A premium digital ecosystem for the next generation of developers. 
            Connect, compete, and showcase your innovation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExplore}
              className="btn-primary w-full sm:w-auto px-10"
            >
              Explore Events
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary w-full sm:w-auto px-10"
            >
              View Challenges
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12"
        >
          {[
            { label: 'Members', value: 500 },
            { label: 'Events', value: 45 },
            { label: 'Challenges', value: 12 },
            { label: 'Projects', value: 120 },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + (i * 0.1) }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-white mb-1">
                <CountUp end={stat.value} />+
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

  const Dashboard = () => {
  const { profile, user } = useAuth();
  const [interestedItems, setInterestedItems] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    const unsub = discoveryService.subscribeToInteractions(user.uid, (interactions) => {
      const interestedIds = Object.entries(interactions)
        .filter(([_, type]) => type === 'interested')
        .map(([id, _]) => id);

      if (interestedIds.length === 0) {
        setInterestedItems([]);
        setLoading(false);
        return;
      }

      // Fetch actual items
      // For now, we'll fetch all and filter to keep it simple, 
      // but in production we'd use a query with whereIn (limited to 10-30 items)
      eventService.subscribeToUpcomingEvents((events) => {
        const eventItems: DiscoveryItem[] = events
          .filter(e => interestedIds.includes(e.id))
          .map(e => ({
            id: e.id,
            type: 'event',
            title: e.title,
            description: e.shortDescription,
            tags: [e.club, e.eventType],
            dateTime: e.dateTime,
            isPublished: e.isPublished
          }));

        challengeService.subscribeToChallenges((challenges) => {
          const challengeItems: DiscoveryItem[] = challenges
            .filter(c => interestedIds.includes(c.id))
            .map(c => ({
              id: c.id,
              type: 'challenge',
              title: c.title,
              description: c.description,
              tags: [c.category],
              difficulty: c.difficulty,
              isPublished: c.isPublished,
              points: c.points
            }));

          setInterestedItems([...eventItems, ...challengeItems]);
          setLoading(false);
        });
      });
    });

    return () => unsub();
  }, [user]);

  const getMotivationalText = () => {
    if ((profile?.streak || 0) > 5) return "You're on fire! Keep the momentum going. 🔥";
    if ((profile?.totalScore || 0) > 1000) return "Legendary performance this week! 🚀";
    return "Ready to level up your skills today? ✨";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.23, 1, 0.32, 1] as any 
      } 
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-40">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Top Section: Greeting & Rank */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0]} 👋
            </h1>
            <p className="text-text-muted font-medium">{getMotivationalText()}</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass px-6 py-3 rounded-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Current Rank</p>
              <p className="text-sm font-bold text-white">{profile?.rank || 'Newbie'}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Key Stats Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { label: 'Total Score', value: profile?.totalScore || 0, icon: Star, color: 'text-yellow-400' },
            { label: 'Level', value: profile?.level || 1, icon: Zap, color: 'text-blue-400' },
            { label: 'Active Streak', value: profile?.streak || 0, icon: Flame, color: 'text-orange-500', highlight: true },
            { label: 'Challenges', value: 12, icon: Trophy, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "glass-floating p-6 rounded-[2rem] relative overflow-hidden group cursor-default",
                stat.highlight && "border-orange-500/20 bg-orange-500/[0.02]"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-6", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">
                <CountUp end={stat.value} />
                {stat.label === 'Active Streak' && <span className="ml-2 text-xl">🔥</span>}
              </p>
              {stat.highlight && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <motion.div 
              variants={itemVariants}
              className="glass-floating p-8 rounded-[2.5rem]"
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Level Progression</h3>
                  <p className="text-[11px] text-text-muted font-medium">Next Level: { (profile?.level || 1) + 1 }</p>
                </div>
                <p className="text-sm font-bold text-white">
                  {profile?.xp || 0} / 1000 <span className="text-text-muted ml-1">XP</span>
                </p>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((profile?.xp || 0) / 1000) * 100}%` }}
                  transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                />
              </div>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div 
              variants={itemVariants}
              className="glass-floating p-8 rounded-[2.5rem]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Activity Heatmap</h3>
                  <p className="text-[11px] text-text-muted font-medium">Your daily contribution streak</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  <span>Less</span>
                  <div className="flex gap-1.5">
                    {[0.05, 0.2, 0.4, 0.7, 1].map(o => (
                      <div key={o} className="w-3.5 h-3.5 rounded-[3px] bg-white" style={{ opacity: o }} />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
              <div className="grid grid-cols-7 md:grid-cols-14 lg:grid-cols-21 gap-2.5">
                {Array.from({ length: 42 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="aspect-square rounded-[3px] bg-white/10 hover:bg-white/30 transition-colors cursor-help relative group"
                    style={{ opacity: 0.1 + Math.random() * 0.9 }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 whitespace-nowrap pointer-events-none">
                      {Math.floor(Math.random() * 10)} contributions
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Saved from Discovery */}
            {interestedItems.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                      <Heart size={20} fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Saved from Discovery</h3>
                  </div>
                  <button className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">Manage All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interestedItems.slice(0, 4).map((item) => (
                    <motion.div 
                      key={item.id} 
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass p-6 rounded-[2rem] group hover:bg-white/[0.03] transition-all duration-500 border border-white/5 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          item.type === 'event' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {item.type}
                        </div>
                        {item.type === 'event' ? (
                          <Calendar size={14} className="text-text-muted" />
                        ) : (
                          <Trophy size={14} className="text-text-muted" />
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                      <p className="text-sm text-text-muted line-clamp-2 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-2">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] text-text-muted">#{tag}</span>
                          ))}
                        </div>
                        <ChevronRight size={16} className="text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recommended for you</h3>
                <button className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Advanced React Patterns', category: 'Frontend', points: 250, difficulty: 'Hard' },
                  { title: 'System Design 101', category: 'Architecture', points: 150, difficulty: 'Medium' },
                ].map((challenge, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass p-6 rounded-[2rem] group hover:bg-white/[0.03] transition-all duration-500 border border-white/5 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {challenge.category}
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{challenge.difficulty}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 group-hover:text-primary transition-colors">{challenge.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-white">+{challenge.points} XP</span>
                      </div>
                      <div className="p-2 rounded-full bg-white/5 group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Achievements */}
            <motion.div variants={itemVariants} className="glass-floating p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-white mb-6">Achievements</h3>
              <div className="grid grid-cols-4 gap-4">
                {profile?.achievements?.map((achievement) => (
                  <motion.div 
                    key={achievement.id}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={cn(
                      "aspect-square rounded-2xl flex items-center justify-center text-2xl relative group cursor-help transition-all duration-500",
                      achievement.isLocked ? "bg-white/[0.02] grayscale opacity-30" : "bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    )}
                  >
                    {achievement.icon}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 whitespace-nowrap pointer-events-none">
                      {achievement.title}
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 py-3 glass rounded-2xl text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors"
              >
                View All Badges
              </motion.button>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div variants={itemVariants} className="glass-floating p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-white mb-6">Next Event</h3>
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-video rounded-2xl overflow-hidden mb-4 group cursor-pointer"
                >
                  <img 
                    src="https://picsum.photos/seed/event/400/225" 
                    alt="Event" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Workshop</p>
                    <h4 className="text-lg font-bold text-white">Cloud Native Dev</h4>
                  </div>
                </motion.div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>Oct 24, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400 font-bold">
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span>2 Days Left</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary w-full py-3 text-xs"
                >
                  Register Now
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="glass-floating p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  { type: 'submission', text: 'Submitted "React Hooks" challenge', time: '2h ago', icon: Code },
                  { type: 'achievement', text: 'Unlocked "First Steps" badge', time: '5h ago', icon: Award },
                  { type: 'event', text: 'Registered for Cloud Workshop', time: '1d ago', icon: Calendar },
                ].map((activity, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="flex gap-4 group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <activity.icon className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-[13px] text-text-soft font-medium leading-tight mb-1 group-hover:text-white transition-colors">{activity.text}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isBackdoorAdmin, setIsBackdoorAdmin] = useState(localStorage.getItem('clubhub_backdoor_admin') === 'true');
  const [keyBuffer, setKeyBuffer] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newBuffer = (keyBuffer + e.key.toLowerCase()).slice(-5);
      setKeyBuffer(newBuffer);
      if (newBuffer === 'admin') {
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyBuffer]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await userService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Create default profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'visitor',
            skills: [],
            interests: [],
            socialLinks: {},
            streak: 0,
            totalScore: 0,
            xp: 0,
            level: 1,
            rank: 'Newbie',
            achievements: [
              { id: '1', title: 'First Steps', icon: '🌱', isLocked: false, unlockedAt: new Date().toISOString() },
              { id: '2', title: 'Code Warrior', icon: '⚔️', isLocked: true },
              { id: '3', title: 'Bug Hunter', icon: '🐛', isLocked: true },
              { id: '4', title: 'Elite Member', icon: '💎', isLocked: true },
            ],
            createdAt: new Date().toISOString(),
          };
          await userService.createUserProfile(newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup or a new one was requested, ignore gracefully
        return;
      }
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      <div className="min-h-screen selection:bg-primary/30 relative overflow-hidden animated-bg">
        {activeTab !== 'admin' && (
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isBackdoorAdmin={isBackdoorAdmin} />
        )}
        
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <Hero onExplore={() => setActiveTab('events')} />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <Dashboard />
              </motion.div>
            )}

            {activeTab === 'admin' && (profile?.role === 'admin' || isBackdoorAdmin) && (
              <AdminPanel onClose={() => setActiveTab('home')} />
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <Events />
              </motion.div>
            )}

            {activeTab === 'discovery' && (
              <motion.div
                key="discovery"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <Discovery />
              </motion.div>
            )}

            {/* Placeholder for other tabs */}
            {['challenges', 'projects', 'team'].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.05 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="max-w-screen-xl mx-auto px-8 py-48 text-center"
              >
                <h2 className="text-5xl font-bold tracking-tight mb-6 text-white uppercase">{activeTab}</h2>
                <p className="text-text-muted text-lg max-w-md mx-auto mb-12 font-medium">
                  We're crafting a premium experience for this section. It will be available very soon.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('home')}
                  className="btn-secondary mx-auto"
                >
                  Return to Home
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {activeTab !== 'admin' && (
          <footer className="border-t border-white/5 py-20 mt-20">
            <div className="max-w-screen-xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 fill-black" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-text-soft">ClubHub</span>
                </div>
                <button 
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-[10px] font-bold text-text-muted/30 hover:text-text-muted transition-all text-left uppercase tracking-[0.2em] flex items-center gap-2 group"
                >
                  <Lock size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  Admin Access
                </button>
              </div>
              
              <div className="flex items-center gap-8">
                <a href="#" className="text-text-muted hover:text-white transition-colors duration-500"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-text-muted hover:text-white transition-colors duration-500"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-text-muted hover:text-white transition-colors duration-500"><Linkedin className="w-5 h-5" /></a>
              </div>

              <p className="text-[13px] text-text-muted font-medium">
                © 2026 ClubHub. Designed for the next generation.
              </p>
            </div>
          </footer>
        )}

        <AnimatePresence>
          {isAdminModalOpen && (
            <AdminLoginModal 
              isOpen={isAdminModalOpen} 
              onClose={() => setIsAdminModalOpen(false)} 
              onLoginSuccess={() => {
                setIsBackdoorAdmin(true);
                setActiveTab('admin');
                setToast("Welcome Admin");
              }}
            />
          )}
          {toast && (
            <Toast message={toast} onClose={() => setToast(null)} />
          )}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}

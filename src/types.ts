export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'visitor' | 'member' | 'admin';
  skills: string[];
  interests: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  streak: number;
  totalScore: number;
  xp: number;
  level: number;
  rank: string;
  achievements: {
    id: string;
    title: string;
    icon: string;
    unlockedAt?: string;
    isLocked: boolean;
  }[];
  createdAt: string;
}

export interface ParticipationType {
  label: string;
  limit?: number;
  current: number;
}

export interface ClubEvent {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  club: string;
  eventType: string;
  mode: string;
  venue: string;
  dateTime: string;
  status: 'upcoming' | 'past' | 'live';
  isPublished: boolean;
  registrations: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  deadline: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  scheduledFor?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  albumId?: string;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  githubUrl: string;
  liveUrl?: string;
  status: 'pending' | 'reviewed';
  score: number;
  submittedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  techStack: string[];
  contributors: string[]; // UIDs
  githubUrl: string;
  liveUrl?: string;
  likes: number;
  isFeatured: boolean;
}

export interface DiscoveryItem {
  id: string;
  type: 'event' | 'challenge';
  title: string;
  description: string;
  tags: string[];
  dateTime?: string; // for events
  difficulty?: string; // for challenges
  isPublished: boolean;
  club?: string; // for events
  eventType?: string; // for events
  mode?: string; // for events
  venue?: string; // for events
  points?: number; // for challenges
  category?: string; // for challenges
}

import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, ClubEvent, Challenge, Project, Submission, Announcement, GalleryItem, Album } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const userService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${profile.uid}`);
    }
  },

  subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      callback(users);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
  },

  async updateUserRole(uid: string, role: 'visitor' | 'member' | 'admin'): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }
};

export const eventService = {
  subscribeToUpcomingEvents(callback: (events: ClubEvent[]) => void) {
    const q = query(
      collection(db, 'events'), 
      where('isPublished', '==', true), 
      orderBy('dateTime', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubEvent));
      callback(events);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'events'));
  },

  subscribeToAllEvents(callback: (events: ClubEvent[]) => void) {
    const q = query(collection(db, 'events'), orderBy('dateTime', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubEvent));
      callback(events);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'events'));
  },

  async createEvent(event: Omit<ClubEvent, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'events'), { 
        ...event, 
        isPublished: event.isPublished ?? false,
        registrations: event.registrations ?? 0,
        createdAt: new Date().toISOString() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'events');
    }
  },

  async updateEvent(id: string, event: Partial<ClubEvent>): Promise<void> {
    try {
      const docRef = doc(db, 'events', id);
      await updateDoc(docRef, event);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'events', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  }
};

export const challengeService = {
  subscribeToChallenges(callback: (challenges: Challenge[]) => void) {
    const q = query(collection(db, 'challenges'), where('isPublished', '==', true), orderBy('deadline', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      callback(challenges);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'challenges'));
  },

  subscribeToAllChallenges(callback: (challenges: Challenge[]) => void) {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      callback(challenges);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'challenges'));
  },

  async createChallenge(challenge: Omit<Challenge, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'challenges'), { ...challenge, createdAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'challenges');
    }
  },

  async updateChallenge(id: string, challenge: Partial<Challenge>): Promise<void> {
    try {
      const docRef = doc(db, 'challenges', id);
      await updateDoc(docRef, challenge);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `challenges/${id}`);
    }
  },

  async deleteChallenge(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'challenges', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `challenges/${id}`);
    }
  }
};

export const projectService = {
  subscribeToFeaturedProjects(callback: (projects: Project[]) => void) {
    const q = query(collection(db, 'projects'), where('isFeatured', '==', true), limit(6));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(projects);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));
  },

  subscribeToAllProjects(callback: (projects: Project[]) => void) {
    const q = query(collection(db, 'projects'), orderBy('likes', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(projects);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));
  },

  async createProject(project: Omit<Project, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'projects'), project);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  },

  async updateProject(id: string, project: Partial<Project>): Promise<void> {
    try {
      const docRef = doc(db, 'projects', id);
      await updateDoc(docRef, project);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'projects', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  }
};

export const announcementService = {
  subscribeToAnnouncements(callback: (announcements: Announcement[]) => void) {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      callback(announcements);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'announcements'));
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'announcements'), { ...announcement, createdAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    }
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<void> {
    try {
      const docRef = doc(db, 'announcements', id);
      await updateDoc(docRef, announcement);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `announcements/${id}`);
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'announcements', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  }
};

export const discoveryService = {
  async saveInteraction(uid: string, itemId: string, type: 'interested' | 'skipped'): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid, 'discovery', itemId);
      await setDoc(docRef, {
        itemId,
        type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/discovery/${itemId}`);
    }
  },

  async getInteractions(uid: string): Promise<Record<string, 'interested' | 'skipped'>> {
    try {
      const q = query(collection(db, 'users', uid, 'discovery'));
      const snapshot = await new Promise<any>((resolve, reject) => {
        onSnapshot(q, resolve, reject);
      });
      const interactions: Record<string, 'interested' | 'skipped'> = {};
      snapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        interactions[data.itemId] = data.type;
      });
      return interactions;
    } catch (error) {
      // If it fails (e.g. collection doesn't exist yet), return empty
      return {};
    }
  },

  subscribeToInteractions(uid: string, callback: (interactions: Record<string, 'interested' | 'skipped'>) => void) {
    const q = query(collection(db, 'users', uid, 'discovery'));
    return onSnapshot(q, (snapshot) => {
      const interactions: Record<string, 'interested' | 'skipped'> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        interactions[data.itemId] = data.type;
      });
      callback(interactions);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/discovery`));
  }
};

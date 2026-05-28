import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  limit,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Incident, Comment } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Save or Update User Profile
export async function saveUserProfile(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.error("Firebase Error saving user profile:", err);
  }
}

// Find User Profile by Phone Number
export async function findUserProfileByPhone(phone: string): Promise<User | null> {
  try {
    // Strip empty spaces to search reliably
    const cleanPhone = phone.replace(/[\s\-()]+/g, '');
    const userRef = doc(db, 'users', cleanPhone);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
  } catch (err) {
    console.error("Firebase Error finding user by phone:", err);
  }
  return null;
}

// Save or Update Incident
export async function saveIncident(incident: Incident): Promise<void> {
  try {
    const incidentRef = doc(db, 'incidents', incident.id);
    await setDoc(incidentRef, incident, { merge: true });
  } catch (err) {
    console.error("Firebase Error saving incident:", err);
  }
}

// Delete Incident
export async function deleteIncidentFromFirestore(id: string): Promise<void> {
  try {
    const incidentRef = doc(db, 'incidents', id);
    await deleteDoc(incidentRef);
  } catch (err) {
    console.error("Firebase Error deleting incident:", err);
  }
}

// Listen to Incidents from Firestore (Real-time updates)
export function listenIncidents(callback: (incidents: Incident[]) => void): () => void {
  const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Incident[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Incident);
      });
      callback(list);
    },
    (err) => {
      console.error("Firebase Error listening incidents:", err);
    }
  );
}

// Save Comment
export async function saveComment(comment: Comment): Promise<void> {
  try {
    const commentRef = doc(db, 'comments', comment.id);
    await setDoc(commentRef, comment, { merge: true });
  } catch (err) {
    console.error("Firebase Error saving comment:", err);
  }
}

// Listen to Comments
export function listenComments(callback: (comments: Comment[]) => void): () => void {
  const q = query(collection(db, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Comment[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Comment);
      });
      callback(list);
    },
    (err) => {
      console.error("Firebase Error listening comments:", err);
    }
  );
}

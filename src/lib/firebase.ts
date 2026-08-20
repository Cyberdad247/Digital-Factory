/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User,
  OAuthCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CouncilDebateSession, GenesisCartridgeInstance } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Configure Google Auth Provider with all requested Google Workspace scopes
export const googleAuthProvider = new GoogleAuthProvider();
const requestedScopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];
requestedScopes.forEach(scope => googleAuthProvider.addScope(scope));
googleAuthProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// In-memory token storage (never stored in localStorage as per security requirements)
let inMemoryAccessToken: string | null = null;

export const setStoredAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getStoredAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Wrappers
export async function signInWithGoogleWorkspace() {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setStoredAccessToken(credential.accessToken);
    }
    // Update user profile in Firestore
    if (result.user) {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'Camelot Architect',
        photoURL: result.user.photoURL || '',
        lastActiveAt: new Date().toISOString()
      }, { merge: true });
    }
    return { user: result.user, accessToken: credential?.accessToken || null };
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

export async function signOutUser() {
  setStoredAccessToken(null);
  await signOut(auth);
}

// Health Check
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
      return false;
    }
    // Even if permission denied on test path, connection is alive
    return true;
  }
}

// Data Models
export interface ForgedCLIModel {
  id: string;
  binaryName: string;
  version: string;
  category: string;
  skillMd?: string;
  testMd?: string;
  authorUid: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSyncRecordModel {
  id: string;
  service: 'drive' | 'sheets' | 'docs' | 'calendar';
  externalId: string;
  title: string;
  url: string;
  authorUid: string;
  syncedAt: string;
  metadata?: Record<string, any>;
}

// Firestore Persistence Services
export async function saveForgedCLI(cli: ForgedCLIModel): Promise<void> {
  const path = `forged_clis/${cli.id}`;
  try {
    const cliRef = doc(db, 'forged_clis', cli.id);
    await setDoc(cliRef, cli, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserForgedCLIs(userId: string): Promise<ForgedCLIModel[]> {
  const path = 'forged_clis';
  try {
    const q = query(collection(db, path), where('authorUid', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => d.data() as ForgedCLIModel);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveSyncRecord(record: WorkspaceSyncRecordModel): Promise<void> {
  const path = `workspace_sync_records/${record.id}`;
  try {
    const docRef = doc(db, 'workspace_sync_records', record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserSyncRecords(userId: string): Promise<WorkspaceSyncRecordModel[]> {
  const path = 'workspace_sync_records';
  try {
    const q = query(collection(db, path), where('authorUid', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as WorkspaceSyncRecordModel);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteSyncRecord(recordId: string): Promise<void> {
  const path = `workspace_sync_records/${recordId}`;
  try {
    const docRef = doc(db, 'workspace_sync_records', recordId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Forge State Persistence Models & Services
export interface ForgeStateModel {
  id: string;
  authorUid: string;
  player?: Record<string, any>;
  forgedCLIs?: any[];
  activeLeases?: any[];
  toolName?: string;
  category?: string;
  codebaseInput?: string;
  autoSaveCount?: number;
  updatedAt: string;
}

export interface WorldtreeSourceModel {
  id: string;
  title: string;
  content: string;
  type: string;
  authorAgent?: string;
  authorUid: string;
  summary?: string;
  vikingUri?: string;
  groundedScore?: number;
  tokenEstimate?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CloudbrainQueryModel {
  id: string;
  query: string;
  answer: string;
  toonRepresentation?: string;
  groundedScore: number;
  citations: any[];
  latencyMs?: number;
  authorUid: string;
  createdAt: string;
}

export interface AnyaEnhancementModel {
  id: string;
  originalPrompt: string;
  enhancedPrompt: string;
  category?: string;
  targetStudio?: string;
  invariantsAdded?: string[];
  authorUid: string;
  createdAt: string;
}

export async function saveWorldtreeSource(source: WorldtreeSourceModel): Promise<void> {
  const path = `worldtree_sources/${source.id}`;
  try {
    const docRef = doc(db, 'worldtree_sources', source.id);
    await setDoc(docRef, source, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchWorldtreeSources(userId?: string): Promise<WorldtreeSourceModel[]> {
  const path = 'worldtree_sources';
  try {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, path), where('authorUid', 'in', [uid, 'SYSTEM_CANONICAL']));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as WorldtreeSourceModel);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveCloudbrainQuery(record: CloudbrainQueryModel): Promise<void> {
  const path = `cloudbrain_queries/${record.id}`;
  try {
    const docRef = doc(db, 'cloudbrain_queries', record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchCloudbrainQueries(userId?: string): Promise<CloudbrainQueryModel[]> {
  const path = 'cloudbrain_queries';
  try {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, path), where('authorUid', '==', uid));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => d.data() as CloudbrainQueryModel);
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveAnyaEnhancement(enhancement: AnyaEnhancementModel): Promise<void> {
  const path = `anya_enhancements/${enhancement.id}`;
  try {
    const docRef = doc(db, 'anya_enhancements', enhancement.id);
    await setDoc(docRef, enhancement, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchAnyaEnhancements(userId?: string): Promise<AnyaEnhancementModel[]> {
  const path = 'anya_enhancements';
  try {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, path), where('authorUid', '==', uid));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => d.data() as AnyaEnhancementModel);
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveForgeState(state: ForgeStateModel): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.uid) {
    console.log('No active authenticated session; state safely held in local buffer.');
    return;
  }

  // Enforce alignment with current authenticated user
  const sanitizedState: ForgeStateModel = {
    ...state,
    id: `forge_state_${user.uid}`,
    authorUid: user.uid
  };

  const path = `forge_states/${sanitizedState.id}`;
  try {
    const docRef = doc(db, 'forge_states', sanitizedState.id);
    await setDoc(docRef, sanitizedState, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchLatestForgeState(userId: string): Promise<ForgeStateModel | null> {
  const user = auth.currentUser;
  if (!user || !user.uid || user.uid !== userId) {
    return null;
  }
  const path = `forge_states/forge_state_${userId}`;
  try {
    // Attempt direct point read first
    const docRef = doc(db, 'forge_states', `forge_state_${userId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ForgeStateModel;
    }

    // Query fallback for legacy records
    const q = query(collection(db, 'forge_states'), where('authorUid', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const states = snapshot.docs.map(d => d.data() as ForgeStateModel);
    states.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return states[0] || null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveCouncilDebate(debate: CouncilDebateSession): Promise<void> {
  const user = auth.currentUser;
  const uid = user?.uid || debate.authorUid || 'SYSTEM_CANONICAL';
  const sanitized: CouncilDebateSession = {
    ...debate,
    authorUid: uid,
    updatedAt: new Date().toISOString()
  };

  const path = `council_debates/${sanitized.id}`;
  try {
    const docRef = doc(db, 'council_debates', sanitized.id);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchCouncilDebateById(debateId: string): Promise<CouncilDebateSession | null> {
  const path = `council_debates/${debateId}`;
  try {
    const docRef = doc(db, 'council_debates', debateId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CouncilDebateSession;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function fetchUserCouncilDebates(userId?: string): Promise<CouncilDebateSession[]> {
  const path = 'council_debates';
  try {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, path), where('authorUid', 'in', [uid, 'SYSTEM_CANONICAL']));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => d.data() as CouncilDebateSession);
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeUserCouncilDebates(
  userId: string | undefined, 
  callback: (debates: CouncilDebateSession[]) => void,
  onError?: (error: any) => void
): () => void {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    callback([]);
    return () => {};
  }

  const path = 'council_debates';
  try {
    const q = query(collection(db, path), where('authorUid', 'in', [uid, 'SYSTEM_CANONICAL']));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map(d => d.data() as CouncilDebateSession);
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        callback(results);
      },
      (err) => {
        console.warn('Council debates real-time subscription error:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach council debate listener:', err);
    return () => {};
  }
}

export async function deleteCouncilDebate(debateId: string): Promise<void> {
  const path = `council_debates/${debateId}`;
  try {
    const docRef = doc(db, 'council_debates', debateId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveGenesisCartridge(cartridge: GenesisCartridgeInstance): Promise<void> {
  const user = auth.currentUser;
  const uid = user?.uid || cartridge.authorUid || 'SYSTEM_CANONICAL';
  const sanitized: GenesisCartridgeInstance = {
    ...cartridge,
    authorUid: uid,
    updatedAt: new Date().toISOString()
  };

  const path = `genesis_cartridges/${sanitized.id}`;
  try {
    const docRef = doc(db, 'genesis_cartridges', sanitized.id);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserGenesisCartridges(userId?: string): Promise<GenesisCartridgeInstance[]> {
  const path = 'genesis_cartridges';
  try {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, path), where('authorUid', 'in', [uid, 'SYSTEM_CANONICAL']));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => d.data() as GenesisCartridgeInstance);
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteGenesisCartridge(cartridgeId: string): Promise<void> {
  const path = `genesis_cartridges/${cartridgeId}`;
  try {
    const docRef = doc(db, 'genesis_cartridges', cartridgeId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { 
  Cloud, 
  FileText, 
  Table, 
  Calendar as CalendarIcon, 
  HardDrive, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Plus, 
  UploadCloud, 
  Download, 
  Share2, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  Layers,
  Activity,
  Flame,
  UserCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import { 
  auth, 
  signInWithGoogleWorkspace, 
  signOutUser, 
  getStoredAccessToken,
  testFirestoreConnection,
  saveForgedCLI,
  fetchUserForgedCLIs,
  saveSyncRecord,
  fetchUserSyncRecords,
  deleteSyncRecord,
  ForgedCLIModel,
  WorkspaceSyncRecordModel
} from '../lib/firebase';
import { 
  listDriveFiles, 
  uploadDriveFile, 
  deleteDriveFile, 
  DriveFile,
  createGoogleSpreadsheet,
  appendToGoogleSheet,
  createGoogleDocument,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent
} from '../lib/google-workspace';
import { onAuthStateChanged, User } from 'firebase/auth';

interface GoogleWorkspaceHubProps {
  onNotify?: (message: string, type: 'success' | 'warning') => void;
}

type ActiveSubTab = 'DRIVE' | 'SHEETS' | 'DOCS' | 'CALENDAR' | 'FIRESTORE';

export function GoogleWorkspaceHub({ onNotify }: GoogleWorkspaceHubProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(getStoredAccessToken());
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('DRIVE');
  const [isLoading, setIsLoading] = useState(false);
  const [firestoreOnline, setFirestoreOnline] = useState<boolean | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [uploadFileName, setUploadFileName] = useState('titan_omni_forge_blueprint.json');

  // Sheets state
  const [syncedSheets, setSyncedSheets] = useState<{ id: string; title: string; url: string }[]>([]);
  const [targetSpreadsheetId, setTargetSpreadsheetId] = useState('');

  // Docs state
  const [syncedDocs, setSyncedDocs] = useState<{ id: string; title: string; url: string }[]>([]);
  const [docTitle, setDocTitle] = useState('Camelot-OS Titan Omni-Forge Sovereign Specification');

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('Agent Swarm Autonomous Build Window');
  const [newEventMinutes, setNewEventMinutes] = useState(60);

  // Firestore state
  const [persistedCLIs, setPersistedCLIs] = useState<ForgedCLIModel[]>([]);
  const [syncHistory, setSyncHistory] = useState<WorkspaceSyncRecordModel[]>([]);

  // Confirmation modal state for destructive actions
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const token = getStoredAccessToken();
      setAccessToken(token);
      if (currentUser) {
        loadUserData(currentUser.uid);
      }
    });

    // Check Firestore connection
    testFirestoreConnection().then(res => setFirestoreOnline(res));

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const [clis, records] = await Promise.all([
        fetchUserForgedCLIs(uid).catch(() => []),
        fetchUserSyncRecords(uid).catch(() => [])
      ]);
      setPersistedCLIs(clis);
      setSyncHistory(records);
    } catch (err) {
      console.warn('Error loading user firestore records:', err);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogleWorkspace();
      setUser(res.user);
      setAccessToken(res.accessToken);
      onNotify?.(`Authenticated as ${res.user.displayName || res.user.email} with Google Workspace permissions`, 'success');
      if (res.accessToken) {
        if (activeSubTab === 'DRIVE') fetchDrive(res.accessToken);
        if (activeSubTab === 'CALENDAR') fetchCalendar(res.accessToken);
      }
    } catch (err: any) {
      onNotify?.(`Authentication failed: ${err.message || 'Popup closed'}`, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setAccessToken(null);
    setDriveFiles([]);
    setCalendarEvents([]);
    onNotify?.('Signed out of Google Workspace session', 'success');
  };

  // Google Drive Operations
  const fetchDrive = async (token = accessToken) => {
    if (!token) {
      onNotify?.('Please sign in with Google to access Drive files', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const files = await listDriveFiles(token, driveSearch ? `name contains '${driveSearch}'` : undefined);
      setDriveFiles(files);
      onNotify?.(`Loaded ${files.length} files from Google Drive`, 'success');
    } catch (err: any) {
      onNotify?.(err.message || 'Failed to list Drive files', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBlueprintToDrive = async () => {
    if (!accessToken) {
      onNotify?.('Sign in with Google to upload to Drive', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const forgePayload = {
        cartridge: 'TITAN_OMNI_FORGE_V1000',
        version: '1.0.0-PROD',
        sovereignty: 'ARM64_SOVEREIGN_VFS',
        runtime: 'Wasmtime-Isolated',
        memoryBudget: '8GB Edge Clamped',
        weaponsForged: [
          { binaryName: 'hydra-cli', version: '2.4.1', capabilities: ['VFS_EXEC', 'IPC_PIPE', 'AST_REWRITE'] },
          { binaryName: 'merlin-dag-agent', version: '1.9.0', capabilities: ['DAG_SCHEDULER', 'PROOF_RECEIPT'] },
          { binaryName: 'sentinel-guard', version: '3.0.0', capabilities: ['BWRAP_SANDBOX', 'CAPABILITY_LEASE'] }
        ],
        timestamp: new Date().toISOString(),
      };

      const result = await uploadDriveFile(
        accessToken, 
        uploadFileName || 'camelot_titan_forge_manifest.json', 
        JSON.stringify(forgePayload, null, 2),
        'application/json'
      );

      // Save audit record to Firestore
      if (user) {
        await saveSyncRecord({
          id: `sync-drive-${Date.now()}`,
          service: 'drive',
          externalId: result.id,
          title: result.name,
          url: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
          authorUid: user.uid,
          syncedAt: new Date().toISOString()
        });
        loadUserData(user.uid);
      }

      onNotify?.(`Successfully exported "${result.name}" to Google Drive!`, 'success');
      fetchDrive();
    } catch (err: any) {
      onNotify?.(err.message || 'Upload to Drive failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const promptDeleteDriveFile = (file: DriveFile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Drive File',
      description: `Are you sure you want to permanently delete "${file.name}" from your Google Drive? This action cannot be undone.`,
      onConfirm: async () => {
        if (!accessToken) return;
        try {
          await deleteDriveFile(accessToken, file.id);
          setDriveFiles(prev => prev.filter(f => f.id !== file.id));
          onNotify?.(`Deleted "${file.name}" from Google Drive`, 'success');
        } catch (err: any) {
          onNotify?.(err.message || 'Failed to delete file', 'warning');
        }
      }
    });
  };

  // Google Sheets Operations
  const handleExportMetricsToSheets = async () => {
    if (!accessToken) {
      onNotify?.('Sign in with Google to create Google Sheets', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const header = ['Timestamp', 'Workcell ID', 'CPU Core Load', 'RAM Allocated', 'Missions Completed', 'Task Latency (ms)', 'Sentinel Status'];
      const rows = [
        [new Date().toISOString(), 'workcell-arm64-01', '42.8%', '5.1 GB', 1240, 14.2, 'ACTIVE_SECURE'],
        [new Date(Date.now() - 60000).toISOString(), 'workcell-arm64-02', '58.1%', '4.8 GB', 1198, 18.5, 'ACTIVE_SECURE'],
        [new Date(Date.now() - 120000).toISOString(), 'workcell-arm64-03', '33.4%', '3.9 GB', 980, 12.1, 'ACTIVE_SECURE'],
        [new Date(Date.now() - 180000).toISOString(), 'workcell-arm64-04', '71.2%', '6.2 GB', 1450, 22.0, 'ACTIVE_SECURE'],
      ];

      const sheet = await createGoogleSpreadsheet(
        accessToken,
        `Camelot-OS Telemetry & Forge Metrics (${new Date().toLocaleDateString()})`,
        header,
        rows
      );

      const sheetUrl = sheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`;
      setSyncedSheets(prev => [{ id: sheet.spreadsheetId, title: sheet.properties.title, url: sheetUrl }, ...prev]);

      if (user) {
        await saveSyncRecord({
          id: `sync-sheets-${Date.now()}`,
          service: 'sheets',
          externalId: sheet.spreadsheetId,
          title: sheet.properties.title,
          url: sheetUrl,
          authorUid: user.uid,
          syncedAt: new Date().toISOString()
        });
        loadUserData(user.uid);
      }

      onNotify?.(`Spreadsheet "${sheet.properties.title}" created successfully!`, 'success');
    } catch (err: any) {
      onNotify?.(err.message || 'Failed to create Google Sheet', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppendLiveTelemetryToSheet = async () => {
    if (!accessToken || !targetSpreadsheetId) {
      onNotify?.('Please provide a valid Google Spreadsheet ID and ensure you are signed in', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const liveRow = [[new Date().toISOString(), 'workcell-live-stream', `${(Math.random() * 30 + 40).toFixed(1)}%`, '5.3 GB', Math.floor(Math.random() * 500 + 1000), (Math.random() * 10 + 10).toFixed(1), 'ACTIVE_SECURE']];
      await appendToGoogleSheet(accessToken, targetSpreadsheetId, 'Forged Metrics!A:G', liveRow);
      onNotify?.('Live telemetry sample appended to Google Sheet!', 'success');
    } catch (err: any) {
      onNotify?.(err.message || 'Failed to append to Google Sheet', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Docs Operations
  const handleExportSpecificationToDocs = async () => {
    if (!accessToken) {
      onNotify?.('Sign in with Google to create Google Docs', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const docBody = `CAMELOT-OS TITAN OMNI-FORGE SPECIFICATION\n` +
        `Generated: ${new Date().toUTCString()}\n` +
        `Architecture: Sovereign ARM64 8GB Wasmtime Cartridge\n\n` +
        `1. EXECUTIVE SUMMARY\n` +
        `Camelot-OS operates as an air-gapped sovereign execution engine combining 14-stage Blueprint OS state machines, VFS Guardian ephemeral namespaces, and Merlin task DAGs.\n\n` +
        `2. SECURITY & SENTINEL CAPABILITY LEASES\n` +
        `- Bubblewrap (bwrap) isolation with fail-closed seccomp filter.\n` +
        `- Strict capability leasing with cryptographically signed JSON-RPC 2.0 proofs.\n` +
        `- Zero-trust storage synchronization with Google Workspace & Cloud Firestore.\n\n` +
        `3. WORKCELL CAPACITY & TELEMETRY\n` +
        `- Memory Cap: 8.0 GB Physical Edge Floor\n` +
        `- Active Compiler: Anya Synaptic Loom (5-Layer Cognitive Smelter)\n` +
        `- Proof Verifier: Gideon Micro-Proof Engine`;

      const docRes = await createGoogleDocument(accessToken, docTitle, docBody);
      const docUrl = docRes.documentUrl || `https://docs.google.com/document/d/${docRes.documentId}/edit`;
      setSyncedDocs(prev => [{ id: docRes.documentId, title: docRes.title, url: docUrl }, ...prev]);

      if (user) {
        await saveSyncRecord({
          id: `sync-docs-${Date.now()}`,
          service: 'docs',
          externalId: docRes.documentId,
          title: docRes.title,
          url: docUrl,
          authorUid: user.uid,
          syncedAt: new Date().toISOString()
        });
        loadUserData(user.uid);
      }

      onNotify?.(`Google Doc "${docRes.title}" created successfully!`, 'success');
    } catch (err: any) {
      onNotify?.(err.message || 'Failed to create Google Doc', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Calendar Operations
  const fetchCalendar = async (token = accessToken) => {
    if (!token) {
      onNotify?.('Sign in with Google to load Calendar events', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const events = await listCalendarEvents(token);
      setCalendarEvents(events);
      onNotify?.(`Loaded ${events.length} Google Calendar events`, 'success');
    } catch (err: any) {
      onNotify?.(err.message || 'Failed to fetch Calendar events', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCalendarSchedule = async () => {
    if (!accessToken) {
      onNotify?.('Sign in with Google to schedule events', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const startTime = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now
      const endTime = new Date(startTime.getTime() + newEventMinutes * 60 * 1000);

      const eventPayload: CalendarEvent = {
        summary: `🛡️ Camelot-OS: ${newEventTitle}`,
        description: `Automated Sovereign Agent Swarm execution window scheduled via Camelot-OS Titan Omni-Forge.\nTarget Workcell: ARM64-Wasmtime\nSentinel Policy: Strict Seccomp Lease`,
        location: 'Camelot Sovereign VFS Sandbox',
        start: {
          dateTime: startTime.toISOString(),
        },
        end: {
          dateTime: endTime.toISOString(),
        },
      };

      const created = await createCalendarEvent(accessToken, eventPayload);
      setCalendarEvents(prev => [created, ...prev]);

      if (user && created.id) {
        await saveSyncRecord({
          id: `sync-cal-${Date.now()}`,
          service: 'calendar',
          externalId: created.id,
          title: created.summary,
          url: created.htmlLink || 'https://calendar.google.com',
          authorUid: user.uid,
          syncedAt: new Date().toISOString()
        });
        loadUserData(user.uid);
      }

      onNotify?.(`Event "${created.summary}" scheduled on Google Calendar!`, 'success');
    } catch (err: any) {
      onNotify?.(err.message || 'Failed to schedule Calendar event', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const promptDeleteCalendarEvent = (event: CalendarEvent) => {
    if (!event.id) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Calendar Event',
      description: `Are you sure you want to remove "${event.summary}" from your Google Calendar?`,
      onConfirm: async () => {
        if (!accessToken || !event.id) return;
        try {
          await deleteCalendarEvent(accessToken, event.id);
          setCalendarEvents(prev => prev.filter(e => e.id !== event.id));
          onNotify?.(`Removed "${event.summary}" from Google Calendar`, 'success');
        } catch (err: any) {
          onNotify?.(err.message || 'Failed to delete event', 'warning');
        }
      }
    });
  };

  // Firestore Save Active Weapon
  const handleSaveActiveWeaponToFirestore = async () => {
    if (!user) {
      onNotify?.('Please sign in to persist records to Cloud Firestore', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const cliPayload: ForgedCLIModel = {
        id: `cli-titan-${Date.now()}`,
        binaryName: `titan-cli-v${Math.floor(Math.random() * 100 + 1)}`,
        version: '3.4.0',
        category: 'ORCHESTRATION_WEAPON',
        skillMd: '# TITAN SOVEREIGN SKILL\nCapability: ARM64-VFS-ISOLATED',
        testMd: '# TEST SPEC\nAll 15 stages verified.',
        authorUid: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveForgedCLI(cliPayload);
      onNotify?.(`Weapon "${cliPayload.binaryName}" saved to Cloud Firestore!`, 'success');
      loadUserData(user.uid);
    } catch (err: any) {
      onNotify?.(`Firestore error: ${err.message}`, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#14141E] border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{confirmModal.description}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1C28] text-gray-300 hover:text-white border border-[#2D2D3F]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner: Google Sign-in & Ecosystem Sync Status */}
      <div className="bg-gradient-to-r from-[#14141F] via-[#181828] to-[#12121A] border border-[#D4AF37]/40 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
                Google Workspace & Cloud Firestore Command Hub
              </h2>
              <p className="text-xs text-gray-400">
                Connected Services: Google Drive • Google Sheets • Google Docs • Google Calendar • Cloud Firestore
              </p>
            </div>
          </div>
        </div>

        {/* User Auth Info & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B0B10] border border-[#252535] px-3.5 py-2 rounded-xl text-xs">
            <Database size={14} className={firestoreOnline ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-gray-400">Firestore:</span>
            <span className={firestoreOnline ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {firestoreOnline ? 'CONNECTED (US-WEST2)' : 'INITIALIZING'}
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-2 bg-[#0B0B10] border border-[#D4AF37]/40 px-3 py-1.5 rounded-xl text-xs">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-[#D4AF37]" referrerPolicy="no-referrer" />
              ) : (
                <UserCheck size={16} className="text-[#D4AF37]" />
              )}
              <div className="text-left">
                <div className="text-white font-bold text-[11px] leading-tight">{user.displayName || user.email}</div>
                <div className="text-[9px] text-emerald-400 font-mono">Workspace Authorized</div>
              </div>
              <button
                id="btn-workspace-signout"
                onClick={handleSignOut}
                title="Sign out of Google"
                className="ml-2 p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="btn-workspace-signin"
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex items-center gap-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95"
            >
              {/* Google G Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#252535] pb-3">
        <button
          id="tab-drive"
          onClick={() => { setActiveSubTab('DRIVE'); if (accessToken && driveFiles.length === 0) fetchDrive(); }}
          className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'DRIVE'
              ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/30'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white hover:border-[#4285F4]'
          }`}
        >
          <HardDrive size={15} />
          <span>Google Drive</span>
        </button>

        <button
          id="tab-sheets"
          onClick={() => setActiveSubTab('SHEETS')}
          className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'SHEETS'
              ? 'bg-[#0F9D58] text-white shadow-lg shadow-[#0F9D58]/30'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white hover:border-[#0F9D58]'
          }`}
        >
          <Table size={15} />
          <span>Google Sheets</span>
        </button>

        <button
          id="tab-docs"
          onClick={() => setActiveSubTab('DOCS')}
          className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'DOCS'
              ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/30'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white hover:border-[#4285F4]'
          }`}
        >
          <FileText size={15} />
          <span>Google Docs</span>
        </button>

        <button
          id="tab-calendar"
          onClick={() => { setActiveSubTab('CALENDAR'); if (accessToken && calendarEvents.length === 0) fetchCalendar(); }}
          className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'CALENDAR'
              ? 'bg-[#EA4335] text-white shadow-lg shadow-[#EA4335]/30'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white hover:border-[#EA4335]'
          }`}
        >
          <CalendarIcon size={15} />
          <span>Google Calendar</span>
        </button>

        <button
          id="tab-firestore"
          onClick={() => setActiveSubTab('FIRESTORE')}
          className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'FIRESTORE'
              ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/30'
              : 'bg-[#12121A] border border-[#252535] text-amber-300 hover:text-white hover:border-[#D4AF37]'
          }`}
        >
          <Database size={15} />
          <span>Cloud Firestore Sync</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      {/* 1. GOOGLE DRIVE */}
      {activeSubTab === 'DRIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls / Upload Panel */}
          <div className="bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <HardDrive size={16} className="text-[#4285F4]" />
              <span>Export Forge Artifacts to Drive</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Export sovereign manifests, Knight Pill workcell configurations, or Anya Synaptic ASTs straight into your authenticated Google Drive.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Target Filename</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full bg-[#09090D] border border-[#252535] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4285F4] outline-none"
                  placeholder="manifest.json"
                />
              </div>

              <button
                id="btn-export-drive"
                onClick={handleExportBlueprintToDrive}
                disabled={isLoading || !accessToken}
                className="w-full bg-gradient-to-r from-[#4285F4] to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud size={15} />
                <span>Upload Forge Manifest to Drive</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#252535] space-y-2">
              <div className="text-[11px] font-bold text-gray-300">Drive Search Filter</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  placeholder="Filter files..."
                  className="flex-1 bg-[#09090D] border border-[#252535] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
                <button
                  onClick={() => fetchDrive()}
                  disabled={isLoading || !accessToken}
                  className="bg-[#1C1C28] hover:bg-[#252535] border border-[#2D2D3F] px-3 py-1.5 rounded-xl text-xs text-gray-300 flex items-center gap-1"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Drive Files List */}
          <div className="lg:col-span-2 bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Google Drive Cloud Repository</span>
                <span className="text-xs text-blue-400 font-mono">({driveFiles.length} files)</span>
              </h3>
              <button
                onClick={() => fetchDrive()}
                disabled={isLoading || !accessToken}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {!accessToken ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl space-y-3">
                <Lock size={32} className="mx-auto text-gray-500" />
                <div className="text-xs text-gray-400">Sign in with Google to view and sync your Drive files</div>
                <button
                  onClick={handleSignIn}
                  className="bg-white text-black font-bold text-xs px-4 py-2 rounded-xl shadow inline-flex items-center gap-2"
                >
                  <LogIn size={14} />
                  <span>Connect Google Drive</span>
                </button>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl text-xs text-gray-400">
                {isLoading ? 'Fetching Drive files...' : 'No files found matching criteria. Click "Upload Forge Manifest" to create one.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-[#09090D] border border-[#1E1E2A] hover:border-[#4285F4]/50 rounded-xl p-3 flex justify-between items-center gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#4285F4]/10 text-[#4285F4]">
                        <HardDrive size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{file.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono truncate">{file.mimeType}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#252538] text-blue-400 hover:text-white transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => promptDeleteDriveFile(file)}
                        className="p-1.5 rounded-lg bg-[#181824] hover:bg-red-950/50 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GOOGLE SHEETS */}
      {activeSubTab === 'SHEETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Table size={16} className="text-[#0F9D58]" />
              <span>Live Telemetry to Google Sheets</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Generate structured Google Spreadsheets with real-time Knight Pill workcell metrics, memory usage, and mission analytics.
            </p>

            <button
              id="btn-create-sheets"
              onClick={handleExportMetricsToSheets}
              disabled={isLoading || !accessToken}
              className="w-full bg-gradient-to-r from-[#0F9D58] to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Table size={15} />
              <span>Create Telemetry Spreadsheet</span>
            </button>

            <div className="pt-4 border-t border-[#252535] space-y-3">
              <div className="text-[11px] font-bold text-gray-300">Append Telemetry to Existing Sheet</div>
              <input
                type="text"
                value={targetSpreadsheetId}
                onChange={(e) => setTargetSpreadsheetId(e.target.value)}
                placeholder="Google Spreadsheet ID"
                className="w-full bg-[#09090D] border border-[#252535] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                onClick={handleAppendLiveTelemetryToSheet}
                disabled={isLoading || !accessToken || !targetSpreadsheetId}
                className="w-full bg-[#1C1C28] hover:bg-[#252535] border border-[#2D2D3F] disabled:opacity-50 py-2 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Stream Live Row to Sheet</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Synced Google Spreadsheets</span>
              <span className="text-xs text-emerald-400 font-mono">({syncedSheets.length} active)</span>
            </h3>

            {!accessToken ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl space-y-3">
                <Lock size={32} className="mx-auto text-gray-500" />
                <div className="text-xs text-gray-400">Sign in with Google to create and stream to Google Sheets</div>
              </div>
            ) : syncedSheets.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl text-xs text-gray-400 space-y-2">
                <div>No active sheets created in this session.</div>
                <div className="text-[11px] text-gray-500">Click "Create Telemetry Spreadsheet" to start streaming.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {syncedSheets.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#09090D] border border-[#1E1E2A] hover:border-[#0F9D58]/50 rounded-xl p-3 flex justify-between items-center gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58]">
                        <Table size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{s.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono">ID: {s.id}</div>
                      </div>
                    </div>

                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F9D58]/20 hover:bg-[#0F9D58]/30 text-emerald-300 text-xs font-bold transition-colors"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. GOOGLE DOCS */}
      {activeSubTab === 'DOCS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileText size={16} className="text-[#4285F4]" />
              <span>Compile Architecture Whitepaper</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Export comprehensive engineering constitutions, Anya Synaptic compiler specifications, and VFS sandbox contracts directly to Google Docs.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#09090D] border border-[#252535] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4285F4] outline-none"
                />
              </div>

              <button
                id="btn-create-docs"
                onClick={handleExportSpecificationToDocs}
                disabled={isLoading || !accessToken}
                className="w-full bg-gradient-to-r from-[#4285F4] to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FileText size={15} />
                <span>Export Specification to Google Docs</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Exported Google Docs</span>
              <span className="text-xs text-blue-400 font-mono">({syncedDocs.length} compiled)</span>
            </h3>

            {!accessToken ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl space-y-3">
                <Lock size={32} className="mx-auto text-gray-500" />
                <div className="text-xs text-gray-400">Sign in with Google to export specifications to Google Docs</div>
              </div>
            ) : syncedDocs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl text-xs text-gray-400">
                No Google Docs compiled yet. Click "Export Specification to Google Docs" to generate your first architecture paper.
              </div>
            ) : (
              <div className="space-y-2">
                {syncedDocs.map((d) => (
                  <div
                    key={d.id}
                    className="bg-[#09090D] border border-[#1E1E2A] hover:border-[#4285F4]/50 rounded-xl p-3 flex justify-between items-center gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#4285F4]/10 text-[#4285F4]">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{d.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono">ID: {d.id}</div>
                      </div>
                    </div>

                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4285F4]/20 hover:bg-[#4285F4]/30 text-blue-300 text-xs font-bold transition-colors"
                    >
                      <span>Open in Docs</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. GOOGLE CALENDAR */}
      {activeSubTab === 'CALENDAR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CalendarIcon size={16} className="text-[#EA4335]" />
              <span>Schedule Agent Swarm Operations</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Schedule autonomous workcell deployment windows, security lease renewals, and cognitive compiler checkpoints on Google Calendar.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-[#09090D] border border-[#252535] rounded-xl px-3 py-2 text-xs text-white focus:border-[#EA4335] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Duration (Minutes)</label>
                <select
                  value={newEventMinutes}
                  onChange={(e) => setNewEventMinutes(Number(e.target.value))}
                  className="w-full bg-[#09090D] border border-[#252535] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes (Standard Swarm)</option>
                  <option value={120}>2 Hours (Full Pipeline Build)</option>
                  <option value={240}>4 Hours (Deep Forge Smelt)</option>
                </select>
              </div>

              <button
                id="btn-schedule-calendar"
                onClick={handleCreateCalendarSchedule}
                disabled={isLoading || !accessToken}
                className="w-full bg-gradient-to-r from-[#EA4335] to-red-600 hover:from-red-500 hover:to-red-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CalendarIcon size={15} />
                <span>Add to Google Calendar</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Google Calendar Swarm Schedule</span>
                <span className="text-xs text-red-400 font-mono">({calendarEvents.length} events)</span>
              </h3>
              <button
                onClick={() => fetchCalendar()}
                disabled={isLoading || !accessToken}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {!accessToken ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl space-y-3">
                <Lock size={32} className="mx-auto text-gray-500" />
                <div className="text-xs text-gray-400">Sign in with Google to synchronize Google Calendar events</div>
              </div>
            ) : calendarEvents.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl text-xs text-gray-400">
                {isLoading ? 'Loading calendar events...' : 'No upcoming events found. Click "Add to Google Calendar" to schedule one.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id || Math.random()}
                    className="bg-[#09090D] border border-[#1E1E2A] hover:border-[#EA4335]/50 rounded-xl p-3 flex justify-between items-center gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#EA4335]/10 text-[#EA4335]">
                        <CalendarIcon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{evt.summary}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleString() : evt.start.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#252538] text-red-400 hover:text-white transition-colors"
                          title="Open in Google Calendar"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => promptDeleteCalendarEvent(evt)}
                        className="p-1.5 rounded-lg bg-[#181824] hover:bg-red-950/50 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CLOUD FIRESTORE */}
      {activeSubTab === 'FIRESTORE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database size={16} className="text-[#D4AF37]" />
              <span>Durable Cloud Firestore Persistence</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Persist forged agentic tools, execution blueprints, and Google Workspace sync audit records to your provisioned Cloud Firestore database.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-[#0B0B10] border border-[#252535] rounded-xl text-xs space-y-1 font-mono">
                <div className="text-gray-400">Database ID:</div>
                <div className="text-amber-300 text-[11px] truncate">ai-studio-camelotos-4ec67487-0ca7-43ef-a08f-544be9efb3b1</div>
                <div className="text-gray-400 mt-2">Region: <span className="text-white">us-west2</span></div>
              </div>

              <button
                id="btn-save-firestore"
                onClick={handleSaveActiveWeaponToFirestore}
                disabled={isLoading || !user}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-300 hover:from-amber-400 hover:to-amber-200 disabled:opacity-50 text-black font-black text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Database size={15} />
                <span>Save Active Weapon to Firestore</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#12121A] border border-[#252535] rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Cloud Persisted Items & Sync Audits</span>
                <span className="text-xs text-amber-300 font-mono">({persistedCLIs.length + syncHistory.length} records)</span>
              </h3>
              <button
                onClick={() => user && loadUserData(user.uid)}
                disabled={isLoading || !user}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {!user ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl space-y-3">
                <Lock size={32} className="mx-auto text-gray-500" />
                <div className="text-xs text-gray-400">Sign in to sync and load your Firestore records</div>
              </div>
            ) : (persistedCLIs.length === 0 && syncHistory.length === 0) ? (
              <div className="text-center py-12 border border-dashed border-[#252535] rounded-xl text-xs text-gray-400">
                No items persisted in Firestore yet. Click "Save Active Weapon to Firestore" or export to Drive/Sheets to generate records.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {persistedCLIs.map((cli) => (
                  <div
                    key={cli.id}
                    className="bg-[#09090D] border border-[#1E1E2A] hover:border-[#D4AF37]/50 rounded-xl p-3 flex justify-between items-center gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                        <Flame size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{cli.binaryName} (v{cli.version})</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Category: {cli.category} • Created: {new Date(cli.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-400/10 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                      FIRESTORE PERSISTED
                    </span>
                  </div>
                ))}

                {syncHistory.map((sync) => (
                  <div
                    key={sync.id}
                    className="bg-[#09090D] border border-[#1E1E2A] hover:border-blue-500/50 rounded-xl p-3 flex justify-between items-center gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Share2 size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{sync.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Service: {sync.service.toUpperCase()} • Synced: {new Date(sync.syncedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={sync.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#252538] text-blue-400 hover:text-white transition-colors"
                        title="Open Resource"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={async () => {
                          await deleteSyncRecord(sync.id);
                          if (user) loadUserData(user.uid);
                          onNotify?.('Audit record deleted', 'success');
                        }}
                        className="p-1.5 rounded-lg bg-[#181824] hover:bg-red-950/50 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete audit record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

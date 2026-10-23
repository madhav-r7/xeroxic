import { PrintJob, User, Printer, CustomerNotification, PrinterStatus, QueueHoldStatus } from '../types';

export const DEMO_STUDENT: User = {
  id: 'usr-student-01',
  name: 'Rohan Sharma',
  email: 'student@college.edu',
  role: 'student',
  studentId: '250222',
  department: 'Computer Science & Engineering',
  phone: '+91 98765 43210',
  balance: 350,
};

export const DEMO_ADMIN: User = {
  id: 'usr-admin-01',
  name: 'AIT Xerox Shop',
  email: 'admin@college.edu',
  role: 'admin',
  department: 'AIT Xerox Counter',
  phone: '+91 98765 00001',
};

export function generateOrderId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${letter}${num}`;
}

export const INITIAL_PRINTERS: Printer[] = [
  {
    id: 'PRN-01',
    name: 'Canon imageRUNNER 2625i',
    type: 'bw',
    model: 'Canon iR 2625i Multifunction Laser',
    location: 'Main Xerox Counter - Bay 1',
    status: 'online',
    supportedTypes: ['bw'],
    supportedFormats: ['A4', 'A3', 'Legal'],
    maxSpeedPpm: 25,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    issueDescription: undefined,
    estimatedRecovery: undefined,
    estimatedRecoveryTime: undefined,
  },
  {
    id: 'PRN-02',
    name: 'HP Color LaserJet Enterprise M555',
    type: 'color',
    model: 'HP Enterprise M555dn Precision Color',
    location: 'Color Prints Desk - Bay 2',
    status: 'online',
    supportedTypes: ['color', 'bw'],
    supportedFormats: ['A4', 'Glossy', 'Photo'],
    maxSpeedPpm: 38,
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    issueDescription: undefined,
    estimatedRecovery: undefined,
    estimatedRecoveryTime: undefined,
  },
  {
    id: 'PRN-03',
    name: 'Epson WorkForce Pro WF-C879R',
    type: 'all',
    model: 'Epson High-Volume Dual Tray Color/BW',
    location: 'Heavy Duty Section - Bay 3',
    status: 'online',
    supportedTypes: ['color', 'bw'],
    supportedFormats: ['A4', 'A3', 'Cardstock', 'Spiral Covers'],
    maxSpeedPpm: 26,
    lastUpdated: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    issueDescription: undefined,
    estimatedRecovery: undefined,
    estimatedRecoveryTime: undefined,
  },
  {
    id: 'PRN-04',
    name: 'Brother HL-L6400DW SuperDuplex',
    type: 'bw',
    model: 'Brother Industrial High-Duty B&W Duplex',
    location: 'Bulk Queue Counter - Bay 4',
    status: 'online',
    supportedTypes: ['bw'],
    supportedFormats: ['A4'],
    maxSpeedPpm: 50,
    lastUpdated: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    issueDescription: undefined,
    estimatedRecovery: undefined,
    estimatedRecoveryTime: undefined,
  },
];

const INITIAL_JOBS: PrintJob[] = [
  {
    id: 'A101',
    studentId: 'usr-student-01',
    studentName: 'Rohan Sharma',
    studentRoll: '250222',
    studentPhone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    fileName: 'DBMS_Lab_Assignment_3.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    pageCount: 14,
    copies: 2,
    colorMode: 'bw',
    paperSize: 'A4',
    paperType: 'plain',
    orientation: 'portrait',
    sides: 'double',
    binding: 'staple',
    isUrgent: false,
    instructions: 'Please staple top-left corner neatly.',
    cost: 42,
    status: 'ready',
    assignedPrinterId: 'PRN-01',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Ready for pickup',
    statusHistory: [
      { status: 'submitted', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), note: 'Printing started on Canon iR 2625i' },
      { status: 'ready', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), note: 'Printed and stapled. Kept at AIT Xerox Shop.' }
    ]
  },
  {
    id: 'B204',
    studentId: 'usr-student-01',
    studentName: 'Rohan Sharma',
    studentRoll: '250222',
    studentPhone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    fileName: 'Project_Synopsis_Machine_Learning.pdf',
    fileSize: '5.1 MB',
    fileType: 'application/pdf',
    pageCount: 28,
    copies: 1,
    colorMode: 'color',
    paperSize: 'A4',
    paperType: 'photo',
    orientation: 'portrait',
    sides: 'double',
    binding: 'spiral',
    isUrgent: true,
    instructions: 'First page in color, rest in black & white. Spiral binding please.',
    cost: 295,
    status: 'processing',
    assignedPrinterId: 'PRN-02',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Within 15 minutes',
    statusHistory: [
      { status: 'submitted', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'Printing in progress on HP Enterprise M555' }
    ]
  },
  {
    id: 'C310',
    studentId: 'usr-student-02',
    studentName: 'Ananya Deshmukh',
    studentRoll: '250225',
    studentPhone: '+91 91234 56789',
    department: 'Electrical Engineering',
    fileName: 'Circuit_Simulation_Report.pdf',
    fileSize: '3.8 MB',
    fileType: 'application/pdf',
    pageCount: 18,
    copies: 1,
    colorMode: 'bw',
    paperSize: 'A4',
    paperType: 'plain',
    orientation: 'portrait',
    sides: 'single',
    binding: 'staple',
    isUrgent: false,
    instructions: 'Single sided please.',
    cost: 36,
    status: 'submitted',
    assignedPrinterId: 'PRN-01',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: '20-25 minutes',
    statusHistory: [
      { status: 'submitted', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'D405',
    studentId: 'usr-student-01',
    studentName: 'Rohan Sharma',
    studentRoll: '250222',
    studentPhone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    fileName: 'Operating_Systems_Lecture_Notes_Unit1.pdf',
    fileSize: '8.2 MB',
    fileType: 'application/pdf',
    pageCount: 42,
    copies: 1,
    colorMode: 'bw',
    paperSize: 'A4',
    paperType: 'plain',
    orientation: 'portrait',
    sides: 'double',
    binding: 'spiral',
    isUrgent: false,
    instructions: '',
    cost: 89,
    status: 'completed',
    assignedPrinterId: 'PRN-04',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Completed',
    statusHistory: [
      { status: 'submitted', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
      { status: 'ready', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { status: 'completed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), note: 'Collected by student at AIT Xerox Shop' }
    ]
  }
];

import {
  fetchJobsFromSupabase,
  insertJobToSupabase,
  updateJobStatusInSupabase,
  uploadAssignmentFile,
  deleteJobFromSupabase,
  deleteStorageFileFromSupabase,
  fetchJobByIdOrTokenFromSupabase,
  markJobCollectedInSupabase,
  fetchPrintersFromSupabase,
  updatePrinterStatusInSupabase,
  fetchNotificationsFromSupabase,
  insertNotificationToSupabase,
  markNotificationReadInSupabase,
} from './supabase';
import { getOrderCollectionToken } from '../utils/qrCode';

const STORAGE_KEY_JOBS = 'xeroxic_jobs_v3';
const STORAGE_KEY_USER = 'xeroxic_active_user_v3';
const STORAGE_KEY_PRINTERS = 'xeroxic_printers_v2';
const STORAGE_KEY_NOTIFICATIONS = 'xeroxic_notifications_v2';

export function getStoredJobs(): PrintJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOBS);
    let list: PrintJob[] = INITIAL_JOBS;
    if (raw) {
      list = JSON.parse(raw);
    }
    // Ensure every job has a stable collection token
    return list.map((job) => ({
      ...job,
      collectionToken: getOrderCollectionToken(job),
    }));
  } catch {
    return INITIAL_JOBS;
  }
}

export function saveStoredJobs(jobs: PrintJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent('xeroxic_jobs_updated', { detail: jobs }));
  } catch (e) {
    console.error('Error saving jobs to localStorage', e);
  }
}

export async function syncJobsFromSupabase(): Promise<PrintJob[]> {
  try {
    const remote = await fetchJobsFromSupabase();
    if (remote && remote.length > 0) {
      const local = getStoredJobs();
      const remoteMap = new Map(remote.map((r) => [r.id, r]));
      // Keep any local-only jobs that haven't synced yet
      for (const loc of local) {
        if (!remoteMap.has(loc.id)) {
          remote.push(loc);
        }
      }
      saveStoredJobs(remote);
      return remote;
    }
  } catch (err) {
    console.warn('Supabase sync skipped, using local cache:', err);
  }
  return getStoredJobs();
}

const STORAGE_KEY_REGISTERED_USERS = 'xeroxic_registered_accounts_v1';
const STORAGE_KEY_REMEMBERED_LOGIN = 'xeroxic_remembered_login_v1';

export interface RegisteredAccount {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  department?: string;
  password: string;
  createdAt: string;
}

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'admin@college.edu',
  password: 'admin@123',
};

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-student-01',
    name: 'Rohan Sharma',
    rollNumber: '2024CS1092',
    email: 'student@college.edu',
    phone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    password: 'student123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-student-02',
    name: 'Sumit Jangra',
    rollNumber: '2024CS1001',
    email: 'sumit@college.edu',
    phone: '+91 98765 00000',
    department: 'Computer Science & Engineering',
    password: 'student123',
    createdAt: new Date().toISOString(),
  },
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return parsed;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function registerStudentAccount(
  data: Omit<RegisteredAccount, 'id' | 'createdAt'>
): { success: boolean; message?: string; account?: RegisteredAccount } {
  try {
    const accounts = getRegisteredAccounts();
    const cleanRoll = data.rollNumber.trim().toUpperCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if roll or email already exists
    const duplicate = accounts.find(
      (a) =>
        a.rollNumber.toUpperCase() === cleanRoll ||
        a.email.toLowerCase() === cleanEmail
    );

    if (duplicate) {
      return {
        success: false,
        message: 'An account with this Roll Number or Email already exists. Please Sign In.',
      };
    }

    const newAccount: RegisteredAccount = {
      id: 'usr-student-' + Date.now(),
      name: data.name.trim(),
      rollNumber: cleanRoll,
      email: cleanEmail,
      phone: data.phone?.trim() || '+91 98765 43210',
      department: data.department?.trim() || 'Campus Student',
      password: data.password.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccount, ...accounts];
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updated));
    return { success: true, account: newAccount };
  } catch (e: any) {
    return { success: false, message: e.message || 'Error creating account.' };
  }
}

export function verifyStudentLogin(
  identifier: string,
  passwordInput: string
): { success: boolean; message?: string; user?: User } {
  const accounts = getRegisteredAccounts();
  const cleanId = identifier.trim().toLowerCase();

  const matched = accounts.find(
    (a) =>
      a.rollNumber.toLowerCase() === cleanId ||
      a.email.toLowerCase() === cleanId
  );

  if (!matched) {
    return {
      success: false,
      message: 'No registered student account found for this Roll Number or Email. Please Sign Up first.',
    };
  }

  if (matched.password !== passwordInput.trim()) {
    return {
      success: false,
      message: 'Incorrect password. Please verify and try again.',
    };
  }

  const user: User = {
    id: matched.id,
    name: matched.name,
    email: matched.email,
    role: 'student',
    studentId: matched.rollNumber,
    department: matched.department,
    phone: matched.phone,
    balance: 350,
  };

  return { success: true, user };
}

export function verifyAdminLogin(
  identifier: string,
  passwordInput: string
): { success: boolean; message?: string; user?: User } {
  const cleanId = identifier.trim().toLowerCase();
  const validUsernames = ['admin', 'admin@college.edu', 'admin@xeroxic.edu'];

  if (!validUsernames.includes(cleanId)) {
    return {
      success: false,
      message: 'Invalid admin username or email. (Admin ID: admin)',
    };
  }

  if (passwordInput.trim() !== ADMIN_CREDENTIALS.password) {
    return {
      success: false,
      message: 'Incorrect admin password. (Hint: admin@123)',
    };
  }

  return { success: true, user: DEMO_ADMIN };
}

export function getRememberedLogin(): { identifier: string; isAdmin: boolean } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMEMBERED_LOGIN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveRememberedLogin(identifier: string, isAdmin: boolean = false): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_REMEMBERED_LOGIN,
      JSON.stringify({ identifier, isAdmin })
    );
  } catch {}
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    window.dispatchEvent(new CustomEvent('xeroxic_user_updated', { detail: user }));
  } catch (e) {
    console.error('Error saving user to localStorage', e);
  }
}

export async function addPrintJobAsync(job: PrintJob, file?: File | null): Promise<boolean> {
  // If not assigned, assign an appropriate printer automatically based on color capability & availability
  if (!job.assignedPrinterId) {
    const printers = getStoredPrinters();
    const isColor = job.colorMode === 'color';
    const matchingPrinters = printers.filter((p) => p.supportedTypes.includes(isColor ? 'color' : 'bw'));
    const onlineMatch = matchingPrinters.find((p) => p.status === 'online' || p.status === 'busy');
    const chosen = onlineMatch || matchingPrinters[0] || printers[0];
    if (chosen) {
      job.assignedPrinterId = chosen.id;
      // If chosen printer is currently disrupted, tag delay notice immediately
      if (['out_of_paper', 'paper_jam', 'maintenance', 'offline'].includes(chosen.status)) {
        job.delayNotice = {
          isDelayed: true,
          reason: chosen.issueDescription || `Assigned printer ${chosen.name} is currently ${chosen.status.replace('_', ' ')}`,
          originalEta: job.estimatedPickupTime,
          revisedEta: chosen.estimatedRecoveryTime ? `Delayed (~${chosen.estimatedRecoveryTime})` : 'Delayed - awaiting maintenance',
          reportedAt: new Date().toISOString(),
        };
      }
    }
  }

  // Update local storage first for instant responsiveness
  const jobs = getStoredJobs();
  const updated = [job, ...jobs.filter((j) => j.id !== job.id)];
  saveStoredJobs(updated);

  try {
    let fileUrl: string | undefined = undefined;
    if (file) {
      const uploadedUrl = await uploadAssignmentFile(file, job.id);
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
        job.fileUrl = uploadedUrl;
        const currentJobs = getStoredJobs();
        saveStoredJobs(currentJobs.map((j) => (j.id === job.id ? { ...j, fileUrl: uploadedUrl } : j)));
      }
    }
    const inserted = await insertJobToSupabase(job, fileUrl);
    if (!inserted) {
      console.warn('Supabase insert failed with fileUrl, retrying without fileUrl...');
      await insertJobToSupabase(job, undefined);
    }
    return true;
  } catch (err) {
    console.error('Error sending job to Supabase:', err);
    return false;
  }
}

export function addPrintJob(job: PrintJob, file?: File | null): void {
  addPrintJobAsync(job, file).catch((err) =>
    console.warn('addPrintJob background error:', err)
  );
}

export function updateJobStatus(
  jobId: string,
  newStatus: PrintJob['status'],
  note?: string,
  collectedAtTimestamp?: string
): void {
  const jobs = getStoredJobs();
  const now = collectedAtTimestamp || new Date().toISOString();
  const updated = jobs.map((j) => {
    if (j.id === jobId) {
      const updatedHistory = [
        ...j.statusHistory,
        { status: newStatus, timestamp: now, note },
      ];
      let estimated = j.estimatedPickupTime;
      if (newStatus === 'processing') estimated = 'Printing now (~10 mins)';
      if (newStatus === 'ready') estimated = 'Ready for pickup at counter';
      if (newStatus === 'completed') estimated = 'Delivered';
      if (newStatus === 'cancelled') estimated = 'Cancelled';

      return {
        ...j,
        status: newStatus,
        updatedAt: now,
        estimatedPickupTime: estimated,
        statusHistory: updatedHistory,
        collectedAt: newStatus === 'completed' ? (j.collectedAt || now) : j.collectedAt,
      };
    }
    return j;
  });
  saveStoredJobs(updated);

  // Sync to Supabase in background
  if (newStatus === 'completed') {
    // Preserve completed order record in Supabase with collected_at timestamp
    updateJobStatusInSupabase(jobId, 'completed', now).catch((err) =>
      console.warn('Completed status update note:', err)
    );
    // Remove the uploaded document file from storage to protect privacy & space
    deleteStorageFileFromSupabase(jobId).catch((err) =>
      console.warn('Post-collection storage cleanup note:', err)
    );
  } else {
    // Once printed (ready for pickup), remove the uploaded file from storage to protect privacy & space
    if (newStatus === 'ready') {
      deleteStorageFileFromSupabase(jobId).catch((err) =>
        console.warn('Storage purge note:', err)
      );
    }

    updateJobStatusInSupabase(jobId, newStatus).catch((err) =>
      console.warn('Background Supabase update error:', err)
    );
  }
}

// Manually delete a print job from local storage and Supabase database/storage
export function deletePrintJob(jobId: string): void {
  const jobs = getStoredJobs();
  const updated = jobs.filter((j) => j.id !== jobId);
  saveStoredJobs(updated);

  deleteJobFromSupabase(jobId).catch((err) =>
    console.warn('Background Supabase delete error:', err)
  );
}

// Find a job by Order ID or Collection Token (local cache + remote Supabase)
export async function findJobByIdOrToken(identifier: string): Promise<PrintJob | null> {
  const clean = identifier.trim().toUpperCase();
  const localJobs = getStoredJobs();

  // Try local first
  const localMatch = localJobs.find(
    (j) =>
      j.id.toUpperCase() === clean ||
      (j.collectionToken && j.collectionToken.toLowerCase() === identifier.trim().toLowerCase())
  );

  // Query Supabase for latest authoritative record
  try {
    const remote = await fetchJobByIdOrTokenFromSupabase(identifier);
    if (remote) {
      if (!remote.collectionToken) {
        remote.collectionToken = getOrderCollectionToken(remote);
      }
      const updated = [remote, ...localJobs.filter((j) => j.id !== remote.id)];
      saveStoredJobs(updated);
      return remote;
    }
  } catch (e) {
    console.warn('Supabase lookup failed, relying on local match:', e);
  }

  if (localMatch) {
    if (!localMatch.collectionToken) {
      localMatch.collectionToken = getOrderCollectionToken(localMatch);
    }
    return localMatch;
  }

  return null;
}

// Atomically confirm job collection by staff
export async function confirmStaffJobCollection(
  jobId: string,
  operatorUser?: User | null
): Promise<{ success: boolean; message: string; job?: PrintJob }> {
  // Authorization check
  if (operatorUser && operatorUser.role !== 'admin') {
    return {
      success: false,
      message: 'Unauthorized: Only campus xerox staff can confirm order collections.',
    };
  }

  const now = new Date().toISOString();

  // 1. Atomic update in Supabase
  const result = await markJobCollectedInSupabase(jobId, now);

  if (!result.success) {
    return {
      success: false,
      message: result.error || 'Failed to confirm collection.',
    };
  }

  // 2. Update local storage
  updateJobStatus(
    jobId,
    'completed',
    'Order collected and verified via staff QR scanner',
    now
  );

  const updatedJobs = getStoredJobs();
  const finalJob = updatedJobs.find((j) => j.id === jobId) || result.updatedJob;

  const formattedTime = new Date(now).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    success: true,
    message: `Order #${jobId} confirmed & marked as Collected at ${formattedTime}.`,
    job: finalJob,
  };
}

// ==========================================
// PRINTER STATUS & NOTIFICATIONS MANAGEMENT
// ==========================================

export function getStoredPrinters(): Printer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRINTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRINTERS, JSON.stringify(INITIAL_PRINTERS));
      return INITIAL_PRINTERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_PRINTERS, JSON.stringify(INITIAL_PRINTERS));
      return INITIAL_PRINTERS;
    }
    return parsed;
  } catch {
    return INITIAL_PRINTERS;
  }
}

export function saveStoredPrinters(printers: Printer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRINTERS, JSON.stringify(printers));
    window.dispatchEvent(new CustomEvent('xeroxic_printers_updated', { detail: printers }));
  } catch (e) {
    console.error('Error saving printers to localStorage', e);
  }
}

export async function syncPrintersFromSupabase(): Promise<Printer[]> {
  try {
    const remote = await fetchPrintersFromSupabase();
    if (remote && remote.length > 0) {
      const local = getStoredPrinters();
      const remoteMap = new Map(remote.map((p) => [p.id, p]));
      for (const loc of local) {
        if (!remoteMap.has(loc.id)) {
          remote.push(loc);
        }
      }
      saveStoredPrinters(remote);
      return remote;
    }
  } catch (e) {
    console.warn('Supabase printer sync skipped, using local cache:', e);
  }
  return getStoredPrinters();
}

export function getStoredNotifications(): CustomerNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredNotifications(notifications: CustomerNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('xeroxic_notifications_updated', { detail: notifications }));
  } catch (e) {
    console.error('Error saving notifications to localStorage', e);
  }
}

export async function syncNotificationsFromSupabase(studentId?: string): Promise<CustomerNotification[]> {
  try {
    const remote = await fetchNotificationsFromSupabase(studentId);
    if (remote && remote.length > 0) {
      const local = getStoredNotifications();
      const remoteMap = new Map(remote.map((n) => [n.id, n]));
      for (const loc of local) {
        if (!remoteMap.has(loc.id)) {
          remote.push(loc);
        }
      }
      // Sort newest first
      remote.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveStoredNotifications(remote);
      return remote;
    }
  } catch (e) {
    console.warn('Supabase notifications sync skipped, using local cache:', e);
  }
  return getStoredNotifications();
}

export function markNotificationRead(notificationId: string): void {
  const list = getStoredNotifications();
  const updated = list.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated);
  markNotificationReadInSupabase(notificationId).catch((err) =>
    console.warn('Background Supabase markNotificationRead error:', err)
  );
}

export function markAllNotificationsRead(studentId?: string): void {
  const list = getStoredNotifications();
  const updated = list.map((n) => {
    if (!studentId || n.studentId === studentId) {
      return { ...n, isRead: true };
    }
    return n;
  });
  saveStoredNotifications(updated);
}

// Browser notification helper
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): void {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  } catch (e) {
    console.warn('Browser notification failed:', e);
  }
}

export function isPrinterUnavailable(status: PrinterStatus): boolean {
  return ['out_of_paper', 'paper_jam', 'maintenance', 'offline'].includes(status);
}

export function getPrinterStatusLabel(status: PrinterStatus): string {
  switch (status) {
    case 'online':
      return 'Available';
    case 'busy':
      return 'Processing Jobs';
    case 'out_of_paper':
      return 'Out of Paper';
    case 'paper_jam':
      return 'Paper Jam';
    case 'maintenance':
      return 'Under Maintenance';
    case 'offline':
      return 'Offline';
    default:
      return status;
  }
}

// Find compatible alternative printers for a job or print type
export function findAlternativePrinters(
  currentPrinterId: string,
  requiredType: 'bw' | 'color',
  printers: Printer[] = getStoredPrinters()
): Printer[] {
  return printers.filter(
    (p) =>
      p.id !== currentPrinterId &&
      p.supportedTypes.includes(requiredType) &&
      (p.status === 'online' || p.status === 'busy')
  );
}

// Staff Printer Status Update with Automatic Customer Impact Detection and Alerting
export async function updatePrinterStatusAndNotify(
  printerId: string,
  newStatus: PrinterStatus,
  issueDescription?: string,
  estimatedRecoveryTime?: string,
  operator?: User | null
): Promise<{ affectedJobsCount: number; message: string; printer?: Printer; affectedJobs: PrintJob[] }> {
  // Authorization check (limit state modifications to authorized staff)
  if (operator && operator.role !== 'admin') {
    return {
      affectedJobsCount: 0,
      message: 'Unauthorized: Only xerox shop staff can update printer availability.',
      affectedJobs: [],
    };
  }

  const printers = getStoredPrinters();
  const targetPrinter = printers.find((p) => p.id === printerId);

  if (!targetPrinter) {
    return {
      affectedJobsCount: 0,
      message: `Printer ${printerId} not found in fleet records.`,
      affectedJobs: [],
    };
  }

  const prevStatus = targetPrinter.status;
  const now = new Date().toISOString();

  // Update printer record
  const recovery = estimatedRecoveryTime?.trim() || (isPrinterUnavailable(newStatus) ? (targetPrinter.estimatedRecoveryTime || targetPrinter.estimatedRecovery) : undefined);
  const updatedPrinter: Printer = {
    ...targetPrinter,
    status: newStatus,
    issueDescription: issueDescription?.trim() || (isPrinterUnavailable(newStatus) ? targetPrinter.issueDescription : undefined),
    estimatedRecovery: recovery,
    estimatedRecoveryTime: recovery,
    lastUpdated: now,
    updatedAt: now,
  };

  const updatedPrinters = printers.map((p) => (p.id === printerId ? updatedPrinter : p));
  saveStoredPrinters(updatedPrinters);

  // Sync printer update to Supabase in background
  updatePrinterStatusInSupabase(
    printerId,
    newStatus,
    updatedPrinter.issueDescription,
    updatedPrinter.estimatedRecoveryTime
  ).catch((err) => console.warn('Supabase printer status update error:', err));

  // Identify affected pending and in-progress jobs assigned to this printer
  const currentJobs = getStoredJobs();
  const affectedJobs: PrintJob[] = [];
  const notificationsToSend: CustomerNotification[] = [];
  const existingNotifications = getStoredNotifications();

  const isBecomingUnavailable = isPrinterUnavailable(newStatus);
  const wasUnavailable = isPrinterUnavailable(prevStatus);
  const isRestored = !isBecomingUnavailable && wasUnavailable;

  const updatedJobsList = currentJobs.map((job) => {
    // Only target active orders (submitted or processing) on this printer
    if (job.assignedPrinterId === printerId && (job.status === 'submitted' || job.status === 'processing')) {
      affectedJobs.push(job);

      if (isBecomingUnavailable) {
        // Set delay notice without changing the core workflow status
        const revisedEta = updatedPrinter.estimatedRecoveryTime
          ? `Delayed (~${updatedPrinter.estimatedRecoveryTime})`
          : 'Delayed - technician attending';

        const origEta = (typeof job.delayNotice === 'object' && job.delayNotice?.originalEta)
          ? job.delayNotice.originalEta
          : (typeof job.delayNotice === 'string' ? job.delayNotice : job.estimatedPickupTime);

        const delayNotice = {
          isDelayed: true,
          reason: updatedPrinter.issueDescription || `Printer ${targetPrinter.name} is ${getPrinterStatusLabel(newStatus).toLowerCase()}`,
          originalEta: origEta,
          revisedEta,
          reportedAt: now,
        };

        // Check for recent duplicate notification (within 15 minutes for same event)
        const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
        const duplicate = existingNotifications.find(
          (n) =>
            n.orderId === job.id &&
            n.printerId === printerId &&
            n.type === 'printer_unavailable' &&
            new Date(n.createdAt).getTime() > fifteenMinutesAgo
        );

        if (!duplicate) {
          const reasonText = updatedPrinter.issueDescription
            ? updatedPrinter.issueDescription
            : getPrinterStatusLabel(newStatus).toLowerCase();

          const notifMessage = updatedPrinter.estimatedRecoveryTime
            ? `Your Xeroxic order #${job.id} may be delayed because assigned printer ${targetPrinter.name} is experiencing ${reasonText}. Estimated recovery time: ${updatedPrinter.estimatedRecoveryTime}.`
            : `Your Xeroxic order #${job.id} may be delayed because assigned printer ${targetPrinter.name} is experiencing ${reasonText}. We will update your estimated completion time as soon as more information is available.`;

          const notif: CustomerNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            orderId: job.id,
            studentId: job.studentId,
            type: 'printer_unavailable',
            title: `Printer Issue Alert: Order #${job.id}`,
            message: notifMessage,
            printerId: targetPrinter.id,
            printerName: targetPrinter.name,
            estimatedRecovery: updatedPrinter.estimatedRecovery,
            estimatedDelay: updatedPrinter.estimatedRecovery,
            createdAt: now,
            isRead: false,
          };

          notificationsToSend.push(notif);
        }

        return {
          ...job,
          delayNotice,
          updatedAt: now,
        };
      } else if (isRestored) {
        // Printer is back online: clear delay notice and notify
        const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
        const duplicate = existingNotifications.find(
          (n) =>
            n.orderId === job.id &&
            n.printerId === printerId &&
            n.type === 'printer_restored' &&
            new Date(n.createdAt).getTime() > fifteenMinutesAgo
        );

        if (!duplicate) {
          const notif: CustomerNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            orderId: job.id,
            studentId: job.studentId,
            type: 'printer_restored',
            title: `Printer Restored: Order #${job.id}`,
            message: `Update: The printer issue affecting your Xeroxic order #${job.id} on ${targetPrinter.name} has been resolved. Your order can now continue processing.`,
            printerId: targetPrinter.id,
            printerName: targetPrinter.name,
            createdAt: now,
            isRead: false,
          };

          notificationsToSend.push(notif);
        }

        return {
          ...job,
          delayNotice: undefined,
          updatedAt: now,
        };
      }
    }
    return job;
  });

  // Save updated jobs
  saveStoredJobs(updatedJobsList);

  // Sync updated jobs delay notice to Supabase in background
  for (const affJob of affectedJobs) {
    const updatedAffJob = updatedJobsList.find((j) => j.id === affJob.id);
    if (updatedAffJob) {
      updateJobStatusInSupabase(updatedAffJob.id, updatedAffJob.status).catch((e) =>
        console.warn('Sync affected job status error:', e)
      );
    }
  }

  // Save and deliver notifications
  if (notificationsToSend.length > 0) {
    const allNotifications = [...notificationsToSend, ...existingNotifications];
    saveStoredNotifications(allNotifications);

    for (const notif of notificationsToSend) {
      // Send to Supabase in background
      insertNotificationToSupabase(notif).catch((e) =>
        console.warn('Sync notification to Supabase error:', e)
      );

      // Trigger browser notification
      sendBrowserNotification(notif.title, {
        body: notif.message,
      });
    }
  }

  const statusLabel = getPrinterStatusLabel(newStatus);
  const resultMessage = isBecomingUnavailable
    ? `Printer "${targetPrinter.name}" marked as ${statusLabel}. Identified ${affectedJobs.length} active order(s) and dispatched ${notificationsToSend.length} customer alert(s).`
    : `Printer "${targetPrinter.name}" restored to ${statusLabel}. Dispatched ${notificationsToSend.length} service recovery alert(s).`;

  return {
    affectedJobsCount: affectedJobs.length,
    message: resultMessage,
    printer: updatedPrinter,
    affectedJobs,
  };
}

// Reassign a specific order to an alternative compatible printer
export async function reassignJobPrinter(
  jobId: string,
  newPrinterId: string,
  reason?: string,
  operator?: User | null
): Promise<{ success: boolean; message: string; job?: PrintJob }> {
  if (operator && operator.role !== 'admin') {
    return {
      success: false,
      message: 'Unauthorized: Only xerox shop staff can reassign print jobs.',
    };
  }

  const jobs = getStoredJobs();
  const targetJob = jobs.find((j) => j.id === jobId);

  if (!targetJob) {
    return { success: false, message: `Order #${jobId} not found.` };
  }

  const printers = getStoredPrinters();
  const targetPrinter = printers.find((p) => p.id === newPrinterId);

  if (!targetPrinter) {
    return { success: false, message: `Target printer ${newPrinterId} not found.` };
  }

  // Compatibility verification
  const requiredType = targetJob.colorMode === 'color' ? 'color' : 'bw';
  if (!targetPrinter.supportedTypes.includes(requiredType)) {
    return {
      success: false,
      message: `Incompatible printer: ${targetPrinter.name} does not support ${requiredType.toUpperCase()} printing.`,
    };
  }

  const now = new Date().toISOString();
  const oldPrinterId = targetJob.assignedPrinterId;
  const oldPrinter = printers.find((p) => p.id === oldPrinterId);

  const isTargetOperational = targetPrinter.status === 'online' || targetPrinter.status === 'busy';

  const origEta = (typeof targetJob.delayNotice === 'object' && targetJob.delayNotice?.originalEta)
    ? targetJob.delayNotice.originalEta
    : (typeof targetJob.delayNotice === 'string' ? targetJob.delayNotice : targetJob.estimatedPickupTime);

  const updatedJob: PrintJob = {
    ...targetJob,
    assignedPrinterId: newPrinterId,
    // Clear delay notice if target printer is online; otherwise update notice
    delayNotice: isTargetOperational
      ? undefined
      : {
          isDelayed: true,
          reason: targetPrinter.issueDescription || `Assigned printer ${targetPrinter.name} is ${getPrinterStatusLabel(targetPrinter.status).toLowerCase()}`,
          originalEta: origEta,
          revisedEta: (targetPrinter.estimatedRecoveryTime || targetPrinter.estimatedRecovery) ? `Delayed (~${targetPrinter.estimatedRecoveryTime || targetPrinter.estimatedRecovery})` : 'Delayed',
          reportedAt: now,
        },
    updatedAt: now,
    statusHistory: [
      ...targetJob.statusHistory,
      {
        status: targetJob.status,
        timestamp: now,
        note: `Order reassigned from ${oldPrinter?.name || oldPrinterId || 'previous printer'} to ${targetPrinter.name}${reason ? ' (' + reason + ')' : ''}`,
      },
    ],
  };

  const updatedJobs = jobs.map((j) => (j.id === jobId ? updatedJob : j));
  saveStoredJobs(updatedJobs);

  // Sync job to Supabase in background
  updateJobStatusInSupabase(jobId, updatedJob.status).catch((e) =>
    console.warn('Sync reassigned job error:', e)
  );

  // Send notification to customer
  const reassignmentReason = reason ? ` (${reason})` : '';
  const notif: CustomerNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    orderId: targetJob.id,
    studentId: targetJob.studentId,
    type: 'order_reassigned',
    title: `Order Reassigned: #${targetJob.id}`,
    message: `Your Xeroxic order #${targetJob.id} has been reassigned to ${targetPrinter.name}${reassignmentReason} to ensure timely printing. Your order progress continues normally.`,
    printerId: targetPrinter.id,
    printerName: targetPrinter.name,
    estimatedRecovery: targetPrinter.estimatedRecovery || targetPrinter.estimatedRecoveryTime,
    estimatedDelay: targetPrinter.estimatedRecovery || targetPrinter.estimatedRecoveryTime,
    createdAt: now,
    isRead: false,
  };

  const existingNotifs = getStoredNotifications();
  saveStoredNotifications([notif, ...existingNotifs]);

  insertNotificationToSupabase(notif).catch((e) =>
    console.warn('Sync reassignment notification error:', e)
  );

  sendBrowserNotification(notif.title, { body: notif.message });

  return {
    success: true,
    message: `Order #${jobId} successfully reassigned to ${targetPrinter.name}. Customer notified.`,
    job: updatedJob,
  };
}

// Register or add a new printer to the fleet
export async function registerPrinter(
  printerData: Omit<Printer, 'updatedAt' | 'lastUpdated'> & { lastUpdated?: string; updatedAt?: string },
  operator?: User | null
): Promise<{ success: boolean; message: string; printer?: Printer }> {
  if (operator && operator.role !== 'admin') {
    return { success: false, message: 'Unauthorized: Only campus staff can register printers.' };
  }

  const printers = getStoredPrinters();
  if (printers.some((p) => p.id.toUpperCase() === printerData.id.trim().toUpperCase())) {
    return { success: false, message: `Printer with ID "${printerData.id}" already exists.` };
  }

  const now = new Date().toISOString();
  const newPrinter: Printer = {
    ...printerData,
    id: printerData.id.trim().toUpperCase(),
    name: printerData.name.trim(),
    model: printerData.model.trim(),
    location: printerData.location.trim(),
    supportedFormats: printerData.supportedFormats || ['A4'],
    supportedTypes: printerData.supportedTypes || [(printerData.type === 'color' ? 'color' : 'bw')],
    lastUpdated: now,
    updatedAt: now,
  };

  const updated = [...printers, newPrinter];
  saveStoredPrinters(updated);

  // Background Supabase sync
  updatePrinterStatusInSupabase(
    newPrinter.id,
    newPrinter.status,
    newPrinter.issueDescription,
    newPrinter.estimatedRecoveryTime
  ).catch((e) => console.warn('Supabase register printer note:', e));

    return {
    success: true,
    message: `Printer "${newPrinter.name}" (${newPrinter.id}) successfully registered.`,
    printer: newPrinter,
  };
}

// ==========================================
// GLOBAL QUEUE HOLD / TECHNICAL PAUSE FEATURE
// ==========================================

const STORAGE_KEY_QUEUE_HOLD = 'xeroxic_queue_hold_v1';

export function getQueueHoldStatus(): QueueHoldStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE_HOLD);
    if (!raw) return { isHeld: false };
    return JSON.parse(raw);
  } catch {
    return { isHeld: false };
  }
}

export function setQueueHoldStatus(
  isHeld: boolean,
  reason?: string,
  estimatedResume?: string,
  operator?: User | null
): { success: boolean; message: string; status: QueueHoldStatus } {
  if (operator && operator.role !== 'admin') {
    return {
      success: false,
      message: 'Unauthorized: Only campus xerox staff can pause or resume the print queue.',
      status: getQueueHoldStatus(),
    };
  }

  const now = new Date().toISOString();
  const status: QueueHoldStatus = {
    isHeld,
    reason: isHeld ? (reason?.trim() || 'Temporary technical issue at Xerox counter') : undefined,
    estimatedResume: isHeld ? estimatedResume?.trim() : undefined,
    updatedAt: now,
    heldBy: operator?.name || 'AIT Xerox Operator',
  };

  try {
    localStorage.setItem(STORAGE_KEY_QUEUE_HOLD, JSON.stringify(status));
    window.dispatchEvent(new CustomEvent('xeroxic_queue_hold_updated', { detail: status }));
  } catch (e) {
    console.error('Error saving queue hold status', e);
  }

  // Create broadcast customer notification
  const notif: CustomerNotification = {
    id: `notif-queue-${Date.now()}`,
    orderId: 'QUEUE-NOTICE',
    studentId: '',
    type: isHeld ? 'delay_update' : 'printer_restored',
    title: isHeld ? '⚠️ Printing Queue Under Hold' : '✅ Printing Queue Resumed',
    message: isHeld
      ? `The Xerox counter print queue is temporarily on hold due to: ${status.reason}.${status.estimatedResume ? ' Expected resume: ' + status.estimatedResume + '.' : ' Our staff is attending to it.'} All submitted orders remain safely in line.`
      : 'The technical issue has been resolved. The Xerox counter queue has resumed normal printing.',
    estimatedRecovery: status.estimatedResume,
    estimatedDelay: status.estimatedResume,
    createdAt: now,
    isRead: false,
  };

  const existing = getStoredNotifications();
  saveStoredNotifications([notif, ...existing]);
  insertNotificationToSupabase(notif).catch(() => {});
  sendBrowserNotification(notif.title, { body: notif.message });

  return {
    success: true,
    message: isHeld
      ? `Queue put on hold: "${status.reason}". Broadcast alert sent to students.`
      : 'Queue resumed! All systems back to operational mode.',
    status,
  };
}



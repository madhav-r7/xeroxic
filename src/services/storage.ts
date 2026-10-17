import { PrintJob, User } from '../types';

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
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Ready for pickup',
    statusHistory: [
      { status: 'submitted', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), note: 'Printing started' },
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
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Within 15 minutes',
    statusHistory: [
      { status: 'submitted', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'Printing in progress' }
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
} from './supabase';

const STORAGE_KEY_JOBS = 'xeroxic_jobs_v3';
const STORAGE_KEY_USER = 'xeroxic_active_user_v3';

export function getStoredJobs(): PrintJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
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

export function updateJobStatus(jobId: string, newStatus: PrintJob['status'], note?: string): void {
  const jobs = getStoredJobs();
  const updated = jobs.map((j) => {
    if (j.id === jobId) {
      const now = new Date().toISOString();
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
      };
    }
    return j;
  });
  saveStoredJobs(updated);

  // Sync to Supabase in background
  if (newStatus === 'completed') {
    // Automatically purge printed & delivered job from Supabase database and storage
    deleteJobFromSupabase(jobId).catch((err) =>
      console.warn('Auto-delete from Supabase note:', err)
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

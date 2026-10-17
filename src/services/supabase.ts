import { createClient } from '@supabase/supabase-js';
import { PrintJob } from '../types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://tjmwwnheuphnrxyxkvhx.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G6JwV7GlrRP2Tda5iAklaQ_R7wtd-DK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function mapSupabaseToPrintJob(row: any): PrintJob {
  const status = row.status || 'submitted';
  let estimated = '20-25 mins';
  if (status === 'processing') estimated = 'Printing now (~10 mins)';
  if (status === 'ready') estimated = 'Ready for pickup at counter';
  if (status === 'completed') estimated = 'Delivered';
  if (status === 'cancelled') estimated = 'Cancelled';

  return {
    id: row.id,
    studentId: row.student_id || 'usr-student',
    studentName: row.student_name || 'Student',
    studentRoll: row.student_roll || '2024CS0000',
    studentPhone: row.student_phone || '+91 98765 43210',
    department: row.department || 'Computer Science & Engineering',
    fileName: row.file_name || 'Document.pdf',
    fileSize: row.file_size || '1.0 MB',
    fileType: 'application/pdf',
    pageCount: Number(row.page_count) || 1,
    copies: Number(row.copies) || 1,
    colorMode: (row.color_mode as 'bw' | 'color') || 'bw',
    paperSize: 'A4',
    orientation: 'portrait',
    sides: (row.sides as 'single' | 'double') || 'single',
    binding: (row.binding as any) || 'none',
    isUrgent: false,
    instructions: '',
    cost: Number(row.cost) || 0,
    status: status,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.created_at || new Date().toISOString(),
    pickupCounter: 'Counter 1 & 2',
    estimatedPickupTime: estimated,
    statusHistory: [
      {
        status: status,
        timestamp: row.created_at || new Date().toISOString(),
        note: status === 'submitted' ? 'Order placed in queue at Xerox counter' : undefined,
      },
    ],
  };
}

export function mapPrintJobToSupabase(job: PrintJob, fileUrl?: string): any {
  return {
    id: job.id,
    student_id: job.studentId,
    student_name: job.studentName,
    student_roll: job.studentRoll,
    student_phone: job.studentPhone,
    department: job.department,
    file_name: job.fileName,
    file_url: fileUrl || `https://tjmwwnheuphnrxyxkvhx.supabase.co/storage/v1/object/public/assignment/${job.id}_${encodeURIComponent(job.fileName)}`,
    file_size: job.fileSize,
    page_count: job.pageCount,
    copies: job.copies,
    color_mode: job.colorMode,
    sides: job.sides,
    binding: job.binding,
    cost: job.cost,
    status: job.status,
  };
}

// Upload file to Supabase Storage if bucket exists
export async function uploadAssignmentFile(file: File, jobId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${jobId}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('assignment')
      .upload(filePath, file);

    if (uploadError) {
      console.warn('Storage bucket upload note (will fallback to simulated URL):', uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('assignment').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Could not upload file to Supabase storage:', err);
    return null;
  }
}

// Fetch all jobs from Supabase
export async function fetchJobsFromSupabase(): Promise<PrintJob[] | null> {
  try {
    const { data, error } = await supabase
      .from('print_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    return (data || []).map(mapSupabaseToPrintJob);
  } catch (err) {
    console.warn('Could not connect to Supabase:', err);
    return null;
  }
}

// Insert new job into Supabase
export async function insertJobToSupabase(job: PrintJob, fileUrl?: string): Promise<boolean> {
  try {
    const payload = mapPrintJobToSupabase(job, fileUrl);
    const { error } = await supabase.from('print_jobs').insert([payload]);
    if (error) {
      console.warn('Supabase insert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Could not insert job to Supabase:', err);
    return false;
  }
}

// Update job status in Supabase
export async function updateJobStatusInSupabase(
  jobId: string,
  newStatus: PrintJob['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('print_jobs')
      .update({ status: newStatus })
      .eq('id', jobId);

    if (error) {
      console.warn('Supabase update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Could not update job in Supabase:', err);
    return false;
  }
}

// Realtime listener for live updates
export function subscribeToLiveJobs(onChange: () => void) {
  try {
    const channel = supabase
      .channel('public:print_jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'print_jobs' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Could not setup realtime channel:', e);
    return () => {};
  }
}

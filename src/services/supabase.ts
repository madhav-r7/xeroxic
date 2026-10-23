import { createClient } from '@supabase/supabase-js';
import { PrintJob, Printer, CustomerNotification, PrinterStatus } from '../types';

const env: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : (typeof process !== 'undefined' ? process.env : {});
const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://tjmwwnheuphnrxyxkvhx.supabase.co';
const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G6JwV7GlrRP2Tda5iAklaQ_R7wtd-DK';

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
    studentRoll: row.student_roll || '250222',
    studentPhone: row.student_phone || '+91 98765 43210',
    department: row.department || 'Computer Science & Engineering',
    fileName: row.file_name || 'Document.pdf',
    fileSize: row.file_size || '1.0 MB',
    fileType: 'application/pdf',
    fileUrl: row.file_url,
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
    updatedAt: row.collected_at || row.created_at || new Date().toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: estimated,
    statusHistory: [
      {
        status: status,
        timestamp: row.created_at || new Date().toISOString(),
        note: status === 'submitted' ? 'Order placed in queue at Xerox counter' : undefined,
      },
      ...(row.collected_at
        ? [
            {
              status: 'completed' as const,
              timestamp: row.collected_at,
              note: 'Verified and collected via QR scan at counter',
            },
          ]
        : []),
    ],
    collectionToken: row.collection_token || undefined,
    collectedAt: row.collected_at || undefined,
    assignedPrinterId: row.assigned_printer_id || undefined,
    delayNotice: row.delay_notice || undefined,
  };
}

export function mapPrintJobToSupabase(job: PrintJob, fileUrl?: string): any {
  const payload: any = {
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

  if (job.collectionToken) {
    payload.collection_token = job.collectionToken;
  }
  if (job.collectedAt) {
    payload.collected_at = job.collectedAt;
  }
  if (job.assignedPrinterId) {
    payload.assigned_printer_id = job.assignedPrinterId;
  }
  if (job.delayNotice) {
    payload.delay_notice = job.delayNotice;
  }

  return payload;
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
  newStatus: PrintJob['status'],
  collectedAt?: string
): Promise<boolean> {
  try {
    const updatePayload: any = { status: newStatus };
    if (collectedAt) {
      updatePayload.collected_at = collectedAt;
    }

    const { error } = await supabase
      .from('print_jobs')
      .update(updatePayload)
      .eq('id', jobId);

    if (error) {
      // If error is due to collected_at not yet in remote schema, retry without collected_at
      if (collectedAt) {
        const { error: retryError } = await supabase
          .from('print_jobs')
          .update({ status: newStatus })
          .eq('id', jobId);
        if (!retryError) return true;
      }
      console.warn('Supabase update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Could not update job in Supabase:', err);
    return false;
  }
}

// Fetch single job by Order ID or Collection Token
export async function fetchJobByIdOrTokenFromSupabase(identifier: string): Promise<PrintJob | null> {
  const clean = identifier.trim().toUpperCase();
  try {
    // 1. First search by exact ID
    const { data: byIdData, error: byIdError } = await supabase
      .from('print_jobs')
      .select('*')
      .ilike('id', clean)
      .limit(1);

    if (!byIdError && byIdData && byIdData.length > 0) {
      return mapSupabaseToPrintJob(byIdData[0]);
    }

    // 2. Search by collection_token
    const { data: byTokenData, error: byTokenError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('collection_token', identifier.trim())
      .limit(1);

    if (!byTokenError && byTokenData && byTokenData.length > 0) {
      return mapSupabaseToPrintJob(byTokenData[0]);
    }
  } catch (err) {
    console.warn('Supabase fetchJobByIdOrToken error:', err);
  }
  return null;
}

// Atomically verify and mark order as collected in Supabase
export async function markJobCollectedInSupabase(
  jobId: string,
  collectionTime: string = new Date().toISOString()
): Promise<{ success: boolean; error?: string; updatedJob?: PrintJob }> {
  try {
    // 1. Fetch current status from Supabase to prevent duplicate collection
    const { data: existingList, error: fetchErr } = await supabase
      .from('print_jobs')
      .select('*')
      .ilike('id', jobId.trim())
      .limit(1);

    if (fetchErr) {
      return { success: false, error: 'Database connection error: ' + fetchErr.message };
    }

    if (!existingList || existingList.length === 0) {
      return { success: false, error: `Order ${jobId} not found in database.` };
    }

    const existing = existingList[0];

    // 2. Validate state machine transitions
    if (existing.status === 'completed') {
      const formatted = existing.collected_at
        ? new Date(existing.collected_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : 'previously';
      return {
        success: false,
        error: `This order has already been collected (${formatted}).`,
      };
    }

    if (existing.status === 'cancelled') {
      return { success: false, error: 'This order was cancelled and cannot be collected.' };
    }

    if (existing.status !== 'ready') {
      const statusLabel =
        existing.status === 'processing'
          ? 'Printing in progress (~10 mins)'
          : 'Queued (awaiting print)';
      return {
        success: false,
        error: `Order is not ready for collection yet. Current status: ${statusLabel}.`,
      };
    }

    // 3. Perform atomic update conditioned on status == 'ready' to eliminate race conditions
    const { data: updateData, error: updateError } = await supabase
      .from('print_jobs')
      .update({
        status: 'completed',
        collected_at: collectionTime,
      })
      .ilike('id', jobId.trim())
      .eq('status', 'ready')
      .select();

    if (updateError) {
      // Graceful fallback if collected_at column is not yet present on remote DB
      console.warn('Update with collected_at had notice, retrying with status only:', updateError.message);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('print_jobs')
        .update({ status: 'completed' })
        .ilike('id', jobId.trim())
        .eq('status', 'ready')
        .select();

      if (fallbackError) {
        return { success: false, error: 'Failed to update order status: ' + fallbackError.message };
      }

      if (!fallbackData || fallbackData.length === 0) {
        return {
          success: false,
          error: 'Order status changed before collection could be finalized. Please verify.',
        };
      }

      const updated = mapSupabaseToPrintJob({ ...fallbackData[0], collected_at: collectionTime });
      return { success: true, updatedJob: updated };
    }

    if (!updateData || updateData.length === 0) {
      return {
        success: false,
        error: 'Order could not be collected because its status is no longer "ready".',
      };
    }

    return {
      success: true,
      updatedJob: mapSupabaseToPrintJob(updateData[0]),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to connect to Supabase. Please try again.',
    };
  }
}

// Delete uploaded document file from Supabase storage bucket
export async function deleteStorageFileFromSupabase(jobId: string): Promise<boolean> {
  try {
    const { data: fileList, error: listError } = await supabase.storage
      .from('assignment')
      .list('', { search: jobId });

    if (listError) {
      console.warn('Supabase list error for cleanup:', listError.message);
      return false;
    }

    if (fileList && fileList.length > 0) {
      const filesToRemove = fileList.map((f) => f.name);
      const { error: removeError } = await supabase.storage
        .from('assignment')
        .remove(filesToRemove);

      if (removeError) {
        console.warn('Supabase storage remove error:', removeError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('Could not remove file from Supabase storage:', err);
    return false;
  }
}

// Automatically delete job record and its uploaded file from Supabase
export async function deleteJobFromSupabase(jobId: string): Promise<boolean> {
  try {
    // 1. Delete from print_jobs database table
    const { error: dbError } = await supabase
      .from('print_jobs')
      .delete()
      .eq('id', jobId);

    if (dbError) {
      console.warn('Supabase DB delete error:', dbError.message);
    }

    // 2. Also delete file from storage bucket
    await deleteStorageFileFromSupabase(jobId);

    return !dbError;
  } catch (err) {
    console.warn('Could not delete job from Supabase:', err);
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

// ====================================================================
// PRINTER FLEET MANAGEMENT (Supabase Integration)
// ====================================================================

export function mapSupabaseToPrinter(row: any): Printer {
  let formats = ['A4'];
  if (Array.isArray(row.supported_formats)) {
    formats = row.supported_formats;
  } else if (typeof row.supported_formats === 'string') {
    try {
      formats = JSON.parse(row.supported_formats);
    } catch {}
  }

  const pType = (row.type as any) || 'bw';
  const supportedTypes: ('bw' | 'color')[] =
    pType === 'color' ? ['color', 'bw'] : pType === 'all' ? ['color', 'bw'] : ['bw'];

  return {
    id: row.id,
    name: row.name || 'Printer',
    type: pType,
    model: row.model || 'Standard Laser Printer',
    location: row.location || 'Main Counter',
    status: (row.status as PrinterStatus) || 'online',
    supportedFormats: formats,
    supportedTypes,
    issueDescription: row.issue_description || undefined,
    estimatedRecovery: row.estimated_recovery || undefined,
    estimatedRecoveryTime: row.estimated_recovery || undefined,
    lastUpdated: row.updated_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapPrinterToSupabase(printer: Printer): any {
  return {
    id: printer.id,
    name: printer.name,
    type: printer.type,
    model: printer.model,
    location: printer.location,
    status: printer.status,
    supported_formats: printer.supportedFormats,
    issue_description: printer.issueDescription || null,
    estimated_recovery: printer.estimatedRecovery || null,
    updated_at: printer.lastUpdated || new Date().toISOString(),
  };
}

export async function fetchPrintersFromSupabase(): Promise<Printer[] | null> {
  try {
    const { data, error } = await supabase
      .from('printers')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      // Table may not exist yet in user's Supabase instance
      return null;
    }

    return (data || []).map(mapSupabaseToPrinter);
  } catch (err) {
    return null;
  }
}

export async function updatePrinterStatusInSupabase(
  printerId: string,
  newStatus: PrinterStatus,
  issueDescription?: string,
  estimatedRecovery?: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('printers')
      .update({
        status: newStatus,
        issue_description: issueDescription || null,
        estimated_recovery: estimatedRecovery || null,
        updated_at: now,
      })
      .eq('id', printerId);

    if (error) {
      console.warn('Supabase printer status update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Could not update printer in Supabase:', err);
    return false;
  }
}

export function subscribeToLivePrinters(onChange: () => void) {
  try {
    const channel = supabase
      .channel('public:printers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'printers' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    return () => {};
  }
}

// ====================================================================
// CUSTOMER NOTIFICATIONS (Supabase Integration)
// ====================================================================

export function mapSupabaseToNotification(row: any): CustomerNotification {
  return {
    id: row.id,
    orderId: row.order_id,
    studentId: row.student_id,
    type: row.type || 'printer_unavailable',
    title: row.title,
    message: row.message,
    printerId: row.printer_id || undefined,
    printerName: row.printer_name || undefined,
    estimatedRecovery: row.estimated_recovery || undefined,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapNotificationToSupabase(notif: CustomerNotification): any {
  return {
    id: notif.id,
    order_id: notif.orderId,
    student_id: notif.studentId,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    printer_id: notif.printerId || null,
    printer_name: notif.printerName || null,
    estimated_recovery: notif.estimatedRecovery || null,
    is_read: notif.isRead,
    created_at: notif.createdAt,
  };
}

export async function fetchNotificationsFromSupabase(
  studentId?: string
): Promise<CustomerNotification[] | null> {
  try {
    let query = supabase
      .from('customer_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error) {
      return null;
    }
    return (data || []).map(mapSupabaseToNotification);
  } catch (err) {
    return null;
  }
}

export async function insertNotificationToSupabase(
  notif: CustomerNotification
): Promise<boolean> {
  try {
    const payload = mapNotificationToSupabase(notif);
    const { error } = await supabase.from('customer_notifications').insert([payload]);
    if (error) {
      console.warn('Supabase notification insert note:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function markNotificationReadInSupabase(
  notificationId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return !error;
  } catch {
    return false;
  }
}

export function subscribeToLiveNotifications(
  studentId: string | undefined,
  onChange: () => void
) {
  try {
    const channel = supabase
      .channel('public:customer_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_notifications' },
        (payload: any) => {
          if (!studentId || payload.new?.student_id === studentId) {
            onChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    return () => {};
  }
}

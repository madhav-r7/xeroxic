import React, { useState, useEffect } from 'react';
import {
  Printer as PrinterIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Plus,
  Shield,
  ArrowRightLeft,
  X,
  Send,
  Zap,
  Info,
  Layers,
  Check,
  ChevronRight,
  FileText,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { Printer, PrinterStatus, PrinterType, PrintJob, User, QueueHoldStatus } from '../types';
import {
  getStoredPrinters,
  getStoredJobs,
  updatePrinterStatusAndNotify,
  reassignJobPrinter,
  registerPrinter,
  syncPrintersFromSupabase,
  syncJobsFromSupabase,
  findAlternativePrinters,
  isPrinterUnavailable,
  getPrinterStatusLabel,
  getQueueHoldStatus,
  setQueueHoldStatus,
} from '../services/storage';
import { subscribeToLivePrinters } from '../services/supabase';

const QUEUE_HOLD_REASON_PRESETS = [
  '⚡ Campus Power Interruption / Generator Switchover',
  '🌐 College LAN / Network Connectivity Disruption',
  '🖨️ Main Counter Hardware Recalibration & Maintenance',
  '📦 Bulk Paper & High-Yield Toner Replenishment',
  '⚙️ Spooler Queue & Print Server Maintenance',
  '🔄 Counter Shift Handover & Machine Servicing',
];

const QUEUE_HOLD_ETA_PRESETS = [
  '10-15 minutes',
  '20-30 minutes',
  '45 minutes',
  '1 hour',
  'Under 2 hours',
];

interface PrinterStatusManagerProps {
  user: User | null;
  onJobUpdated?: () => void;
}

export const PrinterStatusManager: React.FC<PrinterStatusManagerProps> = ({
  user,
  onJobUpdated,
}) => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);

  // Status update form state
  const [targetStatus, setTargetStatus] = useState<PrinterStatus>('online');
  const [issueDescription, setIssueDescription] = useState('');
  const [estimatedRecovery, setEstimatedRecovery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [confirmModal, setConfirmModal] = useState<{
    printer: Printer;
    newStatus: PrinterStatus;
    affectedCount: number;
  } | null>(null);

  const [reassignModal, setReassignModal] = useState<{
    job: PrintJob;
    targetPrinterId: string;
    reason: string;
  } | null>(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newPrinter, setNewPrinter] = useState({
    id: '',
    name: '',
    type: 'bw' as PrinterType,
    model: '',
    location: 'Main Counter',
    supportedFormats: 'A4, A3',
    maxSpeedPpm: 30,
  });

  // Global Queue Hold / Technical Pause State
  const [queueHold, setQueueHold] = useState<QueueHoldStatus>(() => getQueueHoldStatus());
  const [showHoldModal, setShowHoldModal] = useState<boolean>(false);
  const [holdReason, setHoldReason] = useState<string>(QUEUE_HOLD_REASON_PRESETS[0]);
  const [holdCustomReason, setHoldCustomReason] = useState<string>('');
  const [holdEta, setHoldEta] = useState<string>('20-30 minutes');

  const loadData = () => {
    setPrinters(getStoredPrinters());
    setJobs(getStoredJobs());
    setQueueHold(getQueueHoldStatus());
  };

  useEffect(() => {
    loadData();

    syncPrintersFromSupabase().then((p) => p && setPrinters(p));
    syncJobsFromSupabase().then((j) => j && setJobs(j));

    const handlePrinterUpdate = () => loadData();
    const handleJobUpdate = () => loadData();
    const handleQueueHoldUpdate = (e: any) => {
      if (e.detail) {
        setQueueHold(e.detail);
      } else {
        setQueueHold(getQueueHoldStatus());
      }
    };

    window.addEventListener('xeroxic_printers_updated', handlePrinterUpdate);
    window.addEventListener('xeroxic_jobs_updated', handleJobUpdate);
    window.addEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdate);
    window.addEventListener('storage', handleQueueHoldUpdate);

    const unsubscribe = subscribeToLivePrinters(() => {
      loadData();
      syncPrintersFromSupabase().then((p) => p && setPrinters(p));
    });

    return () => {
      window.removeEventListener('xeroxic_printers_updated', handlePrinterUpdate);
      window.removeEventListener('xeroxic_jobs_updated', handleJobUpdate);
      window.removeEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdate);
      window.removeEventListener('storage', handleQueueHoldUpdate);
      unsubscribe();
    };
  }, []);

  const handlePutQueueOnHold = () => {
    const finalReason = holdCustomReason.trim() ? holdCustomReason.trim() : holdReason;
    const res = setQueueHoldStatus(true, finalReason, holdEta, user);
    if (res.success) {
      setQueueHold(res.status);
      setShowHoldModal(false);
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => setStatusMessage(null), 5000);
      if (onJobUpdated) onJobUpdated();
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleResumeQueue = () => {
    const res = setQueueHoldStatus(false, undefined, undefined, user);
    if (res.success) {
      setQueueHold(res.status);
      setStatusMessage({ type: 'success', text: 'Queue resumed! Normal printing restored.' });
      setTimeout(() => setStatusMessage(null), 5000);
      if (onJobUpdated) onJobUpdated();
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const openStatusEditor = (printer: Printer) => {
    setSelectedPrinter(printer);
    setTargetStatus(printer.status);
    setIssueDescription(printer.issueDescription || '');
    setEstimatedRecovery(printer.estimatedRecovery || printer.estimatedRecoveryTime || '');
    setStatusMessage(null);
  };

  // Get active jobs on printer
  const getActiveJobsOnPrinter = (printerId: string) => {
    return jobs.filter(
      (j) => j.assignedPrinterId === printerId && (j.status === 'submitted' || j.status === 'processing')
    );
  };

  const handleStatusSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPrinter) return;

    const affected = getActiveJobsOnPrinter(selectedPrinter.id);
    const isEnteringUnavailable = isPrinterUnavailable(targetStatus);
    const wasOperational = !isPrinterUnavailable(selectedPrinter.status);

    // Require confirmation if moving to unavailable state and active orders are in queue
    if (isEnteringUnavailable && wasOperational && affected.length > 0) {
      setConfirmModal({
        printer: selectedPrinter,
        newStatus: targetStatus,
        affectedCount: affected.length,
      });
      return;
    }

    executeStatusUpdate(selectedPrinter.id, targetStatus, issueDescription, estimatedRecovery);
  };

  const executeStatusUpdate = async (
    printerId: string,
    newStatus: PrinterStatus,
    issue?: string,
    eta?: string
  ) => {
    setIsUpdating(true);
    setStatusMessage(null);
    try {
      const result = await updatePrinterStatusAndNotify(
        printerId,
        newStatus,
        issue,
        eta,
        user
      );

      setStatusMessage({
        type: 'success',
        text: result.message,
      });

      loadData();
      if (onJobUpdated) onJobUpdated();
      setConfirmModal(null);
      setSelectedPrinter(null);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update printer status.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Order Reassignment
  const handleExecuteReassignment = async () => {
    if (!reassignModal) return;
    setIsUpdating(true);
    try {
      const result = await reassignJobPrinter(
        reassignModal.job.id,
        reassignModal.targetPrinterId,
        reassignModal.reason,
        user
      );

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: result.message,
        });
        setReassignModal(null);
        loadData();
        if (onJobUpdated) onJobUpdated();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Register New Printer
  const handleRegisterPrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinter.id.trim() || !newPrinter.name.trim()) return;

    const formats = newPrinter.supportedFormats.split(',').map((f) => f.trim());
    const supportedTypes: ('bw' | 'color')[] =
      newPrinter.type === 'color'
        ? ['color', 'bw']
        : newPrinter.type === 'all'
        ? ['color', 'bw']
        : ['bw'];

    const result = await registerPrinter(
      {
        id: newPrinter.id.trim().toUpperCase(),
        name: newPrinter.name.trim(),
        type: newPrinter.type,
        model: newPrinter.model.trim() || 'Multifunction Laser Printer',
        location: newPrinter.location.trim() || 'Counter Bay',
        status: 'online',
        supportedFormats: formats,
        supportedTypes,
        maxSpeedPpm: Number(newPrinter.maxSpeedPpm) || 30,
      },
      user
    );

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setShowRegisterModal(false);
      setNewPrinter({
        id: '',
        name: '',
        type: 'bw',
        model: '',
        location: 'Main Counter',
        supportedFormats: 'A4, A3',
        maxSpeedPpm: 30,
      });
      loadData();
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const getStatusBadge = (status: PrinterStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Busy
          </span>
        );
      case 'out_of_paper':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            Out of Paper
          </span>
        );
      case 'paper_jam':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="w-3 h-3" />
            Paper Jam
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400">
            <Clock className="w-3 h-3" />
            Maintenance
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Offline
          </span>
        );
    }
  };

  const statusPresets: { label: string; status: PrinterStatus; defaultReason: string; defaultEta: string }[] = [
    { label: 'Restore to Online', status: 'online', defaultReason: '', defaultEta: '' },
    { label: 'Paper Jam in Tray', status: 'paper_jam', defaultReason: 'Paper jammed in main feeder tray. Clearing rollers.', defaultEta: '10 mins' },
    { label: 'Out of Paper', status: 'out_of_paper', defaultReason: 'Reloading 80 GSM A4 bond paper packs.', defaultEta: '5 mins' },
    { label: 'Toner Replacement', status: 'maintenance', defaultReason: 'Replacing depleted high-yield black/color cartridge.', defaultEta: '15 mins' },
    { label: 'Full Maintenance', status: 'maintenance', defaultReason: 'Routine drum cleaning and roller maintenance.', defaultEta: '45 mins' },
    { label: 'Take Offline', status: 'offline', defaultReason: 'Counter bay temporarily closed for hardware inspection.', defaultEta: '2 hours' },
  ];

  return (
    <div className="bg-white dark:bg-[#1e2025] rounded-2xl border border-bone/80 dark:border-white/10 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-bone/60 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso dark:text-white flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-espresso dark:text-white" />
              Staff Fleet Console
            </span>
            <span className="text-xs text-status-ready font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
              Realtime Impact Dispatcher
            </span>
          </div>
          <h2 className="text-xl font-bold text-espresso dark:text-white">
            Printer Fleet Availability & Delay Controls
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-0.5">
            Update printer operational states. Any disruption automatically computes affected student orders, sets delay notices, and dispatches in-app notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-espresso hover:bg-espresso/90 text-white dark:bg-white dark:text-black transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Printer
          </button>
        </div>
      </div>

      {/* Global Queue Technical Hold Control Card */}
      <div className={`mt-5 p-4 rounded-2xl border transition-all ${
        queueHold.isHeld
          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40'
          : 'bg-linen/70 dark:bg-white/5 border-bone dark:border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shrink-0 ${queueHold.isHeld ? 'bg-amber-500' : 'bg-espresso dark:bg-white dark:text-black'}`}>
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-espresso dark:text-white">
                  Counter Queue Status: {queueHold.isHeld ? 'ON HOLD (Technical Pause Active)' : 'OPERATIONAL (Normal Service)'}
                </span>
                {queueHold.isHeld ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 animate-pulse uppercase">
                    On Hold
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
                    Accepting Orders
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">
                {queueHold.isHeld
                  ? `Technical issue: "${queueHold.reason}"${queueHold.estimatedResume ? ' • Expected resume: ' + queueHold.estimatedResume : ''}${queueHold.heldBy ? ' • By: ' + queueHold.heldBy : ''}`
                  : 'Declare counter queue on hold due to college power outages, LAN disruptions, paper replenishment, or hardware calibration.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {queueHold.isHeld ? (
              <button
                onClick={handleResumeQueue}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Resume Queue Now</span>
              </button>
            ) : (
              <button
                onClick={() => setShowHoldModal(true)}
                className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/40 font-semibold text-xs rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Put Queue On Hold</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert / Notification Feedback Banner */}
      {statusMessage && (
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:opacity-70 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {printers.map((printer) => {
          const activeJobs = getActiveJobsOnPrinter(printer.id);
          const isDisrupted = isPrinterUnavailable(printer.status);
          const alternativePrinters = isDisrupted
            ? findAlternativePrinters(
                printer.id,
                printer.supportedTypes.includes('color') ? 'color' : 'bw',
                printers
              )
            : [];

          return (
            <div
              key={printer.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isDisrupted
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-bone/80 dark:border-white/10 bg-paper-white/50 dark:bg-white/5'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-bone dark:bg-white/10 text-espresso dark:text-white">
                      {printer.id}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {printer.location}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-espresso dark:text-white mt-1">
                    {printer.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {printer.model}
                  </p>
                </div>
                {getStatusBadge(printer.status)}
              </div>

              {/* Supported capabilities */}
              <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                {printer.supportedTypes.map((type) => (
                  <span
                    key={type}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-bone/70 dark:bg-white/10 text-espresso dark:text-gray-300"
                  >
                    {type.toUpperCase()}
                  </span>
                ))}
                {printer.supportedFormats.map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-bone/40 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                  >
                    {fmt}
                  </span>
                ))}
                <span className="ml-auto text-[11px] font-medium text-espresso dark:text-gray-300">
                  {activeJobs.length} active order{activeJobs.length !== 1 ? 's' : ''} in queue
                </span>
              </div>

              {/* Issue details if disrupted */}
              {isDisrupted && (
                <div className="p-2.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40 dark:border-amber-800/40 text-xs mb-3">
                  <div className="font-medium text-amber-900 dark:text-amber-200">
                    {printer.issueDescription || `Experiencing ${printer.status.replace('_', ' ')}`}
                  </div>
                  {printer.estimatedRecovery && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {printer.estimatedRecovery}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Affected active orders on this printer */}
              {isDisrupted && activeJobs.length > 0 && (
                <div className="mb-3 p-3 rounded-lg bg-white dark:bg-black/30 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {activeJobs.length} Delayed Student Order(s)
                    </span>
                    {alternativePrinters.length > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                        {alternativePrinters[0].name} is ready
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between gap-2 p-1.5 rounded bg-bone/30 dark:bg-white/5 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-espresso dark:text-white">
                            #{job.id}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1.5 truncate">
                            {job.studentName} ({job.colorMode.toUpperCase()})
                          </span>
                        </div>

                        {alternativePrinters.length > 0 && (
                          <button
                            onClick={() =>
                              setReassignModal({
                                job,
                                targetPrinterId: alternativePrinters[0].id,
                                reason: `Auto-routed from disrupted ${printer.name}`,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-espresso hover:bg-espresso/90 text-white dark:bg-white dark:text-black rounded transition-colors shrink-0"
                            title="Safely reassign to alternative printer"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Reassign to {alternativePrinters[0].id}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-bone/60 dark:border-white/5">
                <button
                  onClick={() => openStatusEditor(printer)}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-bone hover:bg-bone/80 dark:bg-white/10 dark:hover:bg-white/15 text-espresso dark:text-white transition-colors text-center"
                >
                  Update Machine Status
                </button>

                {isDisrupted && (
                  <button
                    onClick={() =>
                      executeStatusUpdate(
                        printer.id,
                        'online',
                        '',
                        ''
                      )
                    }
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Quick Restore
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Update Drawer / Modal */}
      {selectedPrinter && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2025] rounded-2xl border border-bone/80 dark:border-white/10 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-bone/60 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-espresso dark:text-white">
                  Update Machine Status — {selectedPrinter.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedPrinter.id} • Current status: {getPrinterStatusLabel(selectedPrinter.status)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPrinter(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Common Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {statusPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTargetStatus(preset.status);
                        setIssueDescription(preset.defaultReason);
                        setEstimatedRecovery(preset.defaultEta);
                      }}
                      className="p-2 text-left rounded-lg border border-bone/80 dark:border-white/10 hover:border-espresso dark:hover:border-white text-[11px] font-medium text-espresso dark:text-white transition-all bg-bone/20 dark:bg-white/5"
                    >
                      <div className="font-semibold">{preset.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {preset.status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as PrinterStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-espresso/20"
                >
                  <option value="online">Online (Available for new jobs)</option>
                  <option value="busy">Busy (Processing jobs normally)</option>
                  <option value="out_of_paper">Out of Paper (Requires paper replenishment)</option>
                  <option value="paper_jam">Paper Jam (Requires technician attention)</option>
                  <option value="maintenance">Under Maintenance (Temporarily unavailable)</option>
                  <option value="offline">Offline (Powered down / Not in service)</option>
                </select>
              </div>

              {/* Optional Issue Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Issue Description (Optional, shown in customer alert)
                </label>
                <input
                  type="text"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Paper jam in tray 2, clearing rollers"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-espresso/20"
                />
              </div>

              {/* Estimated Recovery Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Recovery Time (Optional)
                </label>
                <input
                  type="text"
                  value={estimatedRecovery}
                  onChange={(e) => setEstimatedRecovery(e.target.value)}
                  placeholder="e.g. 15 mins, 30 mins, By 2:30 PM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-espresso/20"
                />
              </div>

              {/* Impact Notice Preview */}
              {isPrinterUnavailable(targetStatus) && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Customer Impact Notice: </span>
                  {getActiveJobsOnPrinter(selectedPrinter.id).length > 0 ? (
                    <span>
                      {getActiveJobsOnPrinter(selectedPrinter.id).length} student orders will receive an in-app delay alert with this reason and estimated recovery time.
                    </span>
                  ) : (
                    <span>No active orders currently queued on this machine. Future orders will route to other online machines.</span>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedPrinter(null)}
                  className="px-4 py-2 text-xs font-medium rounded-full hover:bg-bone dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-semibold rounded-full bg-espresso text-white hover:bg-espresso/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Significant Status Change */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2025] rounded-2xl border border-amber-300 dark:border-amber-800 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
              <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-espresso dark:text-white">
                Confirm Printer Status Change
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed mb-4">
              You are marking <span className="font-bold text-espresso dark:text-white">{confirmModal.printer.name}</span> as <span className="font-bold uppercase text-amber-700 dark:text-amber-400">{getPrinterStatusLabel(confirmModal.newStatus)}</span>.
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs mb-4">
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                {confirmModal.affectedCount} Active Order(s) Affected:
              </span>
              <p className="text-amber-800 dark:text-amber-300 mt-1">
                The system will tag these orders with delay notices and automatically notify each student with your explanation and recovery ETA.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-medium rounded-full hover:bg-bone dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() =>
                  executeStatusUpdate(
                    confirmModal.printer.id,
                    confirmModal.newStatus,
                    issueDescription,
                    estimatedRecovery
                  )
                }
                className="px-5 py-2 text-xs font-semibold rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
              >
                Yes, Change & Notify Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Order Modal */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2025] rounded-2xl border border-bone/80 dark:border-white/10 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-espresso dark:text-white mb-3">
              <div className="p-2.5 rounded-full bg-bone dark:bg-white/10">
                <ArrowRightLeft className="w-5 h-5 text-espresso dark:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-espresso dark:text-white">
                  Reassign Order #{reassignModal.job.id}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reassignModal.job.studentName} • {reassignModal.job.fileName}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 my-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Destination Printer
                </label>
                <select
                  value={reassignModal.targetPrinterId}
                  onChange={(e) =>
                    setReassignModal({ ...reassignModal, targetPrinterId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-espresso/20"
                >
                  {printers
                    .filter((p) =>
                      p.supportedTypes.includes(
                        reassignModal.job.colorMode === 'color' ? 'color' : 'bw'
                      )
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) — {getPrinterStatusLabel(p.status)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Reassignment (Optional)
                </label>
                <input
                  type="text"
                  value={reassignModal.reason}
                  onChange={(e) =>
                    setReassignModal({ ...reassignModal, reason: e.target.value })
                  }
                  placeholder="e.g. Routed to faster tray to avoid paper jam delay"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-espresso/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200">
                Student will receive an instant notification that their order was reassigned to keep printing on schedule.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReassignModal(null)}
                className="px-4 py-2 text-xs font-medium rounded-full hover:bg-bone dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReassignment}
                disabled={isUpdating}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-espresso text-white hover:bg-espresso/90 dark:bg-white dark:text-black transition-colors shadow-sm disabled:opacity-50"
              >
                {isUpdating ? 'Reassigning...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Printer Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2025] rounded-2xl border border-bone/80 dark:border-white/10 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-bone/60 dark:border-white/10 mb-4">
              <h3 className="font-bold text-base text-espresso dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Register New Shop Printer
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterPrinter} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Printer ID (e.g. PRN-05)
                </label>
                <input
                  type="text"
                  required
                  value={newPrinter.id}
                  onChange={(e) => setNewPrinter({ ...newPrinter, id: e.target.value })}
                  placeholder="PRN-05"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Printer Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                  placeholder="HP LaserJet Pro M404dn"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Print Capability
                  </label>
                  <select
                    value={newPrinter.type}
                    onChange={(e) => setNewPrinter({ ...newPrinter, type: e.target.value as PrinterType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white"
                  >
                    <option value="bw">Black & White</option>
                    <option value="color">Full Color</option>
                    <option value="all">Dual B&W / Color</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Max Speed (ppm)
                  </label>
                  <input
                    type="number"
                    value={newPrinter.maxSpeedPpm}
                    onChange={(e) => setNewPrinter({ ...newPrinter, maxSpeedPpm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Location / Bay
                </label>
                <input
                  type="text"
                  value={newPrinter.location}
                  onChange={(e) => setNewPrinter({ ...newPrinter, location: e.target.value })}
                  placeholder="Main Counter - Bay 5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Supported Formats (comma separated)
                </label>
                <input
                  type="text"
                  value={newPrinter.supportedFormats}
                  onChange={(e) => setNewPrinter({ ...newPrinter, supportedFormats: e.target.value })}
                  placeholder="A4, A3, Legal"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-bone/80 dark:border-white/10 bg-white dark:bg-[#16181d] text-espresso dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-full hover:bg-bone dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-full bg-espresso text-white hover:bg-espresso/90 dark:bg-white dark:text-black transition-colors shadow-sm"
                >
                  Register Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUT QUEUE ON HOLD MODAL */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-paper-white dark:bg-[#16181d] text-aubergine-ink dark:text-gray-100 rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-bone dark:border-white/10 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/30">
                  <PauseCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Put Queue Under Hold
                  </h3>
                  <p className="text-xs text-warm-ash dark:text-gray-400 mt-0.5">
                    Declare technical hold & broadcast instant alerts to students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHoldModal(false)}
                className="p-1.5 rounded-full hover:bg-bone dark:hover:bg-white/10 text-stone transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reason Presets */}
            <div>
              <label className="block text-xs font-semibold mb-2">
                Select Technical Issue Preset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUEUE_HOLD_REASON_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setHoldReason(preset);
                      setHoldCustomReason('');
                    }}
                    className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                      holdReason === preset && !holdCustomReason
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold ring-1 ring-amber-500/30'
                        : 'border-bone dark:border-white/10 hover:bg-bone dark:hover:bg-white/5 text-warm-ash dark:text-gray-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Or Enter Custom Technical Reason:
              </label>
              <textarea
                value={holdCustomReason}
                onChange={(e) => setHoldCustomReason(e.target.value)}
                placeholder="e.g. Main duplex laser toner drum replacement in progress..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-outline/30 dark:border-white/10 bg-paper-white dark:bg-[#20232a] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Estimated Resume Time */}
            <div>
              <label className="block text-xs font-semibold mb-2">
                Estimated Resume Time:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUEUE_HOLD_ETA_PRESETS.map((eta) => (
                  <button
                    key={eta}
                    type="button"
                    onClick={() => setHoldEta(eta)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      holdEta === eta
                        ? 'border-amber-500 bg-amber-500 text-white font-semibold'
                        : 'border-bone dark:border-white/10 hover:bg-bone dark:hover:bg-white/5 text-stone dark:text-gray-300'
                    }`}
                  >
                    {eta}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={holdEta}
                onChange={(e) => setHoldEta(e.target.value)}
                placeholder="e.g. 20-30 minutes"
                className="w-full text-xs px-3 py-2 rounded-xl border border-outline/30 dark:border-white/10 bg-paper-white dark:bg-[#20232a] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Info notice */}
            <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>What happens when you confirm:</span>
              </div>
              <p>• A persistent alert banner is immediately displayed across student viewports.</p>
              <p>• In-app alert notification is broadcast to all active customers.</p>
              <p>• Submitted print jobs remain safely ordered in queue without cancellation.</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowHoldModal(false)}
                className="px-4 py-2 border border-outline/30 hover:bg-bone dark:hover:bg-white/10 font-semibold text-xs rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePutQueueOnHold}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-full shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Confirm & Put Queue On Hold</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

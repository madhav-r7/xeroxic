import React, { useState, useEffect, useRef } from 'react';
import { PrintJob, User, QueueHoldStatus } from '../types';
import { updateJobStatus, deletePrintJob, getQueueHoldStatus, setQueueHoldStatus } from '../services/storage';
import { soundManager } from '../utils/audio';
import {
  Printer,
  CheckCircle2,
  Clock,
  PackageCheck,
  Search,
  Play,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  Volume2,
  VolumeX,
  Bell,
  FileText,
  QrCode,
  AlertTriangle,
  ArrowRightLeft,
  PauseCircle,
  PlayCircle,
  Pause,
  ShieldAlert,
} from 'lucide-react';
import { PrinterStatusManager } from './PrinterStatusManager';

const HOLD_REASON_PRESETS = [
  '⚡ Campus Power Interruption / Generator Switchover',
  '🌐 College LAN / Network Connectivity Disruption',
  '🖨️ Main Counter Hardware Recalibration & Maintenance',
  '📦 Bulk Paper & High-Yield Toner Replenishment',
  '⚙️ Spooler Queue & Print Server Maintenance',
  '🔄 Counter Shift Handover & Machine Servicing',
];

const HOLD_ETA_PRESETS = [
  '10-15 minutes',
  '20-30 minutes',
  '45 minutes',
  '1 hour',
  'Under 2 hours',
];

interface AdminQueueProps {
  user: User;
  jobs: PrintJob[];
  onRefresh: () => void;
  onOpenScanner?: () => void;
}

export const AdminQueue: React.FC<AdminQueueProps> = ({ user, jobs, onRefresh, onOpenScanner }) => {
  const [dashboardView, setDashboardView] = useState<'queue' | 'printers'>('queue');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'processing' | 'ready' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

  // Global Queue Hold / Technical Pause State
  const [queueHold, setQueueHold] = useState<QueueHoldStatus>(() => getQueueHoldStatus());
  const [showHoldModal, setShowHoldModal] = useState<boolean>(false);
  const [holdReason, setHoldReason] = useState<string>(HOLD_REASON_PRESETS[0]);
  const [holdCustomReason, setHoldCustomReason] = useState<string>('');
  const [holdEta, setHoldEta] = useState<string>('20-30 minutes');

  useEffect(() => {
    const handleHoldUpdate = (e: any) => {
      if (e.detail) {
        setQueueHold(e.detail);
      } else {
        setQueueHold(getQueueHoldStatus());
      }
    };
    window.addEventListener('xeroxic_queue_hold_updated', handleHoldUpdate);
    window.addEventListener('storage', handleHoldUpdate);
    return () => {
      window.removeEventListener('xeroxic_queue_hold_updated', handleHoldUpdate);
      window.removeEventListener('storage', handleHoldUpdate);
    };
  }, []);

  const handlePutQueueOnHold = () => {
    const finalReason = holdCustomReason.trim() ? holdCustomReason.trim() : holdReason;
    const res = setQueueHoldStatus(true, finalReason, holdEta, user);
    if (res.success) {
      setQueueHold(res.status);
      setShowHoldModal(false);
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(''), 4500);
    } else {
      alert(res.message);
    }
  };

  const handleResumeQueue = () => {
    const res = setQueueHoldStatus(false, undefined, undefined, user);
    if (res.success) {
      setQueueHold(res.status);
      setActionSuccessMsg('Counter printing queue resumed! Broadcast notification sent to students.');
      setTimeout(() => setActionSuccessMsg(''), 4500);
    } else {
      alert(res.message);
    }
  };

  // Track known submitted job IDs to sound the bell when a new request arrives
  const knownSubmittedIdsRef = useRef<Set<string>>(
    new Set(jobs.filter((j) => j.status === 'submitted').map((j) => j.id))
  );

  useEffect(() => {
    const currentSubmitted = jobs.filter((j) => j.status === 'submitted');
    const newIncoming = currentSubmitted.filter(
      (j) => !knownSubmittedIdsRef.current.has(j.id)
    );

    if (newIncoming.length > 0) {
      soundManager.playNewOrderBell();
      const first = newIncoming[0];
      setNewOrderAlert(
        `🛎️ New Print Order: ${first.fileName} (${first.id}) from ${first.studentName}`
      );
      setTimeout(() => setNewOrderAlert(null), 6000);
    }

    knownSubmittedIdsRef.current = new Set(currentSubmitted.map((j) => j.id));
  }, [jobs]);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundManager.playNewOrderBell();
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    return job.status === filter;
  });

  const handleUpdateStatus = (jobId: string, newStatus: PrintJob['status'], note?: string) => {
    updateJobStatus(jobId, newStatus, note);
    onRefresh();

    let text = '';
    if (newStatus === 'processing') text = `Order ${jobId} status updated to Printing.`;
    if (newStatus === 'ready') text = `Order ${jobId} printed & ready for pickup at Counter.`;
    if (newStatus === 'completed') text = `Order ${jobId} completed & handed over to student.`;

    setActionSuccessMsg(text);
    setTimeout(() => setActionSuccessMsg(''), 3500);

    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    if (previewJob && previewJob.id === jobId) {
      setPreviewJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Permanently delete order ${jobId} and its files from the database and storage?`)) {
      deletePrintJob(jobId);
      onRefresh();
      setActionSuccessMsg(`Order ${jobId} deleted from database and storage.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(null);
      }
      if (previewJob && previewJob.id === jobId) {
        setPreviewJob(null);
      }
    }
  };

  // Direct In-Web Print Trigger
  const handleDirectWebPrint = () => {
    if (!previewJob) return;
    try {
      const iframe = document.getElementById('admin-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      }
    } catch (e) {
      console.warn('Iframe print error, falling back to window.open:', e);
    }
    if (previewJob.fileUrl) {
      window.open(previewJob.fileUrl, '_blank');
    }
  };

  // KPI Calculations
  const submittedCount = jobs.filter((j) => j.status === 'submitted').length;
  const processingCount = jobs.filter((j) => j.status === 'processing').length;
  const readyCount = jobs.filter((j) => j.status === 'ready').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const totalRevenue = jobs.reduce((acc, j) => acc + j.cost, 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 text-[1.03em] text-left space-y-6">
      {/* Operator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-aubergine-ink tracking-tight">
              Xerox Operator Dashboard
            </h1>
            {queueHold.isHeld ? (
              <span className="text-xs bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                <PauseCircle className="w-3 h-3 text-amber-600" />
                Queue Under Hold
              </span>
            ) : (
              <span className="text-xs bg-status-ready/10 text-status-ready font-semibold px-2.5 py-0.5 rounded-full border border-status-ready/20">
                Shop Open
              </span>
            )}
          </div>
          <p className="text-xs text-warm-ash mt-0.5">
            Incoming student print requests, in-web print portal, preview & counter queue
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Queue Under Hold / Technical Pause Button */}
          {queueHold.isHeld ? (
            <button
              onClick={handleResumeQueue}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors shadow-sm animate-pulse"
              title="Technical pause active — Click to resume counter print queue"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Resume Queue</span>
            </button>
          ) : (
            <button
              onClick={() => setShowHoldModal(true)}
              className="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/40 font-semibold px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors shadow-xs"
              title="Pause counter print queue due to technical issues"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Put Queue On Hold</span>
            </button>
          )}

          {/* Sound Notification Alert Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Order Bell Chimes' : 'Enable Order Bell Chimes'}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center space-x-1.5 border transition-colors shadow-sm ${
              soundEnabled
                ? 'bg-paper-white text-status-ready border-status-ready/30 hover:bg-status-ready/5'
                : 'bg-paper-white text-stone border-outline/30 hover:bg-bone'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-status-ready" /> : <VolumeX className="w-3.5 h-3.5 text-stone" />}
            <span>Bell: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => soundManager.playNewOrderBell()}
            title="Test audio chime"
            className="text-xs bg-paper-white hover:bg-bone text-espresso border border-outline/30 px-2.5 py-1.5 rounded-full font-medium"
          >
            Test Bell
          </button>

          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="text-xs bg-espresso hover:bg-espresso/90 text-paper-white dark:bg-white dark:text-[#0c0d10] dark:hover:bg-gray-100 font-semibold px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Open staff QR scanner to verify customer collection"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan to Collect</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="text-xs bg-paper-white hover:bg-bone text-aubergine-ink border border-outline/30 px-3.5 py-1.5 rounded-full font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-espresso" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Queue Hold Alert Banner */}
      {queueHold.isHeld && (
        <div className="mb-4 p-4 bg-linear-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-transparent border-2 border-amber-500/40 rounded-[20px] text-xs font-medium text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-950 dark:text-amber-100">
                  Printing Queue is Currently Under Hold
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 uppercase">
                  Technical Pause Active
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-300">
                <strong>Reason:</strong> {queueHold.reason || 'Technical issue at counter'}
                {queueHold.estimatedResume && (
                  <span> • <strong>Expected Resume:</strong> {queueHold.estimatedResume}</span>
                )}
                {queueHold.heldBy && (
                  <span> • <strong>Placed By:</strong> {queueHold.heldBy}</span>
                )}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                Students see a live alert on their screens. All submitted orders are safely kept in queue and will be processed immediately upon resuming.
              </p>
            </div>
          </div>
          <button
            onClick={handleResumeQueue}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Resume Queue Now</span>
          </button>
        </div>
      )}

      {/* Bell / New Incoming Request Alert Banner */}
      {newOrderAlert && (
        <div className="mb-4 p-3.5 bg-status-queued/10 text-status-queued border-2 border-status-queued/20 rounded-[16px] text-xs font-semibold flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-status-queued" />
            <span>{newOrderAlert}</span>
          </div>
          <span className="text-[11px] font-normal text-warm-ash">Click "Preview & Print" to start</span>
        </div>
      )}

      {/* Success Notification Bar */}
      {actionSuccessMsg && (
        <div className="mb-4 p-3 bg-status-ready/10 text-status-ready border border-status-ready/20 rounded-[16px] text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccessMsg}</span>
          </div>
          <span className="text-[11px] font-normal">Student tracking updated in real time</span>
        </div>
      )}

      {/* Operator KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-paper-white ring-1 ring-black/[0.06] p-3.5 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Queued Orders</div>
          <div className="text-2xl font-bold text-status-queued mt-0.5">{submittedCount}</div>
          <div className="text-[10px] text-stone">Awaiting print</div>
        </div>

        <div className="bg-paper-white ring-1 ring-black/[0.06] p-3.5 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Printing Now</div>
          <div className="text-2xl font-bold text-status-printing mt-0.5">{processingCount}</div>
          <div className="text-[10px] text-stone">Being printed</div>
        </div>

        <div className="bg-paper-white ring-1 ring-black/[0.06] p-3.5 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Ready for Pickup</div>
          <div className="text-2xl font-bold text-status-ready mt-0.5">{readyCount}</div>
          <div className="text-[10px] text-stone">At Counter</div>
        </div>

        <div className="bg-paper-white ring-1 ring-black/[0.06] p-3.5 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Delivered Today</div>
          <div className="text-2xl font-bold text-status-completed mt-0.5">{completedCount}</div>
          <div className="text-[10px] text-stone">Collected by students</div>
        </div>

        <div className="bg-paper-white ring-1 ring-black/[0.06] p-3.5 rounded-[20px] shadow-card col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Today's Revenue</div>
          <div className="text-2xl font-bold text-espresso mt-0.5">₹{totalRevenue}</div>
          <div className="text-[10px] text-stone">Across {jobs.length} orders</div>
        </div>
      </div>

      {/* View Switcher: Order Queue vs Printer Fleet & Alerts */}
      <div className="flex items-center gap-2 border-b border-bone/60 dark:border-white/10 pb-3 mb-4">
        <button
          onClick={() => setDashboardView('queue')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            dashboardView === 'queue'
              ? 'bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] shadow-xs'
              : 'text-warm-ash hover:bg-bone dark:hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Queue Orders ({jobs.length})</span>
        </button>

        <button
          onClick={() => setDashboardView('printers')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            dashboardView === 'printers'
              ? 'bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] shadow-xs'
              : 'text-warm-ash hover:bg-bone dark:hover:bg-white/5'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Printer Fleet & Alert Dispatcher</span>
        </button>
      </div>

      {dashboardView === 'printers' ? (
        <PrinterStatusManager user={user} onJobUpdated={onRefresh} />
      ) : (
        <>
          {/* Filter and Search */}
          <div className="bg-paper-white ring-1 ring-black/[0.06] p-3 rounded-[20px] mb-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex space-x-1 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === 'all'
                ? 'bg-espresso text-paper-white font-semibold'
                : 'text-warm-ash hover:bg-bone'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === 'submitted'
                ? 'bg-status-queued text-paper-white font-semibold'
                : 'text-warm-ash hover:bg-bone'
            }`}
          >
            Queued ({submittedCount})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === 'processing'
                ? 'bg-status-printing text-paper-white font-semibold'
                : 'text-warm-ash hover:bg-bone'
            }`}
          >
            Printing ({processingCount})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === 'ready'
                ? 'bg-status-ready text-paper-white font-semibold'
                : 'text-warm-ash hover:bg-bone'
            }`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-status-completed text-paper-white font-semibold'
                : 'text-warm-ash hover:bg-bone'
            }`}
          >
            Delivered ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-stone absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID (e.g. A001), Roll No, File..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-outline/30 rounded-full focus:ring-2 focus:ring-espresso focus:outline-none"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-linen text-warm-ash border-b border-bone">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Document & Specs</th>
                <th className="py-3 px-4 font-semibold">Format & Paper</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions & Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone text-aubergine-ink">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone">
                    No print jobs match this filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-linen/50 transition-colors">
                    {/* Token ID */}
                    <td className="py-3 px-4 font-mono font-bold text-espresso">
                      <div className="flex items-center space-x-1.5">
                        <span>{job.id}</span>
                        {job.isUrgent && (
                          <span className="text-[9px] bg-status-queued/10 text-status-queued font-bold px-1.5 py-0.5 rounded-full border border-status-queued/20">
                            URGENT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone font-sans font-normal mt-0.5">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-aubergine-ink">{job.studentName}</div>
                      <div className="text-[11px] text-warm-ash font-mono">{job.studentRoll}</div>
                      <div className="text-[10px] text-stone truncate max-w-[150px]">{job.department}</div>
                    </td>

                    {/* Document & Specs */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-aubergine-ink truncate max-w-[180px]" title={job.fileName}>
                          {job.fileName}
                        </span>
                        {/* Preview icon button */}
                        <button
                          onClick={() => setPreviewJob(job)}
                          className="text-espresso hover:bg-bone p-1 rounded-full transition-colors"
                          title="Open In-Web Document Preview & Print Portal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {job.fileUrl && (
                          <a
                            href={job.fileUrl}
                            download={job.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-warm-ash hover:text-espresso p-1 rounded-full transition-colors"
                            title="Download Document File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-warm-ash mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-espresso">{job.pageCount} pgs</span>
                        <span>×</span>
                        <span className="font-semibold">{job.copies} copy</span>
                        <span>•</span>
                        <span className="capitalize">{job.colorMode === 'color' ? 'Color' : 'B&W'}</span>
                        <span>•</span>
                        <span>{job.sides === 'double' ? 'Duplex' : 'Single'}</span>
                        {job.paperType === 'photo' && (
                          <span className="text-[10px] bg-bone text-espresso font-bold px-1.5 py-0.5 rounded-full border border-espresso/20">
                            PHOTO PAPER
                          </span>
                        )}
                      </div>
                      {job.instructions && (
                        <div className="text-[10px] text-status-queued font-medium mt-1 truncate max-w-[200px]" title={job.instructions}>
                          Note: {job.instructions}
                        </div>
                      )}
                    </td>

                    {/* Format & Paper */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-aubergine-ink">{job.paperSize} • {job.sides === 'double' ? 'Double Sided' : 'Single'}</span>
                      <div className="text-[11px] text-stone">
                        {job.paperType === 'photo' ? 'Photo Paper' : 'Plain Paper'} ({job.orientation})
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-aubergine-ink">₹{job.cost}.00</div>
                      <div className="text-[10px] text-stone capitalize">
                        {job.paymentMethod === 'upi' ? 'UPI Online' : 'Pay at Counter'}
                      </div>
                    </td>

                    {/* Status Badge & Machine Assignment */}
                    <td className="py-3 px-4">
                      {job.status === 'submitted' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-queued/10 text-status-queued border border-status-queued/20">
                          <Clock className="w-3 h-3" />
                          <span>Queued</span>
                        </span>
                      )}
                      {job.status === 'processing' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-printing/10 text-status-printing border border-status-printing/20">
                          <Printer className="w-3 h-3 animate-pulse" />
                          <span>Printing</span>
                        </span>
                      )}
                      {job.status === 'ready' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-ready/10 text-status-ready border border-status-ready/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready for Pickup</span>
                        </span>
                      )}
                      {job.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-bone text-status-completed border border-outline-variant">
                          <PackageCheck className="w-3 h-3" />
                          <span>Delivered</span>
                        </span>
                      )}

                      {/* Assigned Printer Badge */}
                      {job.assignedPrinterId && (
                        <div className="mt-1">
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-bone/80 dark:bg-white/10 text-espresso dark:text-gray-300">
                            Bay: {job.assignedPrinterId}
                          </span>
                        </div>
                      )}

                      {/* Delay Notice Indicator */}
                      {job.delayNotice && (
                        <div
                          className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold"
                          title={typeof job.delayNotice === 'object' ? job.delayNotice.reason : job.delayNotice}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[130px]">
                            {typeof job.delayNotice === 'object'
                              ? job.delayNotice.revisedEta || 'Delayed'
                              : 'Delayed'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Direct Preview & Print Portal Button */}
                        <button
                          onClick={() => setPreviewJob(job)}
                          className="bg-bone hover:bg-surface-container-high text-aubergine-ink border border-outline/20 px-2 py-1 rounded-full font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                          title="Open Web Print Preview & Direct Print"
                        >
                          <Eye className="w-3 h-3 text-espresso" />
                          <span>Preview</span>
                        </button>

                        {job.status === 'submitted' && (
                          <button
                            onClick={() => {
                              if (job.fileUrl) {
                                window.open(job.fileUrl, '_blank');
                              }
                              handleUpdateStatus(job.id, 'processing', 'Printing in progress');
                            }}
                            className="bg-espresso hover:bg-espresso/90 text-paper-white px-2.5 py-1 rounded-full font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                            title="Start Printing & Open Merged PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Start Print</span>
                          </button>
                        )}

                        {job.status === 'processing' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'ready', 'Printing complete. Kept at Counter.')}
                            className="bg-status-ready hover:bg-status-ready/90 text-paper-white px-2.5 py-1 rounded-full font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                            title="Mark Ready for Pickup"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Ready</span>
                          </button>
                        )}

                        {job.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'completed', 'Collected by student')}
                            className="bg-status-completed hover:bg-status-completed/90 text-paper-white px-2.5 py-1 rounded-full font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                            title="Mark Handed Over"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDeleteJob(job.id, e)}
                          className="p-1 text-stone hover:text-status-queued hover:bg-status-queued/10 rounded-full transition-colors"
                          title="Delete from Database & Storage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1 text-warm-ash hover:text-espresso hover:bg-bone rounded-full transition-colors"
                          title="View Order Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* IN-WEB DOCUMENT PREVIEW & PRINT PORTAL MODAL */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-linen border-b border-bone flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-[20px]">
              <div className="overflow-hidden">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-espresso bg-bone px-2 py-0.5 rounded-full">
                    {previewJob.id}
                  </span>
                  <span className="text-xs text-warm-ash">by {previewJob.studentName} ({previewJob.studentRoll})</span>
                </div>
                <h3 className="text-base font-semibold text-aubergine-ink truncate mt-1" title={previewJob.fileName}>
                  {previewJob.fileName}
                </h3>
              </div>

              {/* Action Buttons: Direct Print + Download */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDirectWebPrint}
                  className="bg-espresso hover:bg-espresso/90 active:bg-espresso/80 text-paper-white px-3.5 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
                  title="Direct print from web without downloading"
                >
                  <Printer className="w-4 h-4" />
                  <span>Direct Web Print</span>
                </button>

                {previewJob.fileUrl && (
                  <a
                    href={previewJob.fileUrl}
                    download={previewJob.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-paper-white hover:bg-bone text-aubergine-ink border border-outline/30 px-3 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                    title="Download document file"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                )}

                <button
                  onClick={() => setPreviewJob(null)}
                  className="p-1.5 text-warm-ash hover:text-aubergine-ink hover:bg-bone rounded-full"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Specifications Banner */}
            <div className="px-4 py-2.5 bg-bone/50 border-b border-bone flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-espresso">{previewJob.pageCount} Pages</span>
                <span>•</span>
                <span className="font-semibold">{previewJob.copies} Copy/Set</span>
                <span>•</span>
                <span className="capitalize font-medium">{previewJob.colorMode === 'color' ? 'Full Color' : 'Black & White'}</span>
                <span>•</span>
                <span className="capitalize">{previewJob.sides === 'double' ? 'Double Sided' : 'Single Sided'}</span>
                <span>•</span>
                <span>{previewJob.paperType === 'photo' ? 'Photo Paper' : 'Plain Paper'}</span>
                <span>•</span>
                <span>Size: {previewJob.paperSize}</span>
              </div>
              <div className="font-bold text-aubergine-ink">
                Total: ₹{previewJob.cost}.00 ({previewJob.paymentMethod === 'upi' ? 'UPI' : 'Pay at Counter'})
              </div>
            </div>

            {previewJob.instructions && (
              <div className="px-4 py-2 bg-status-queued/5 border-b border-status-queued/20 text-xs text-status-queued flex items-center space-x-2">
                <span className="font-bold">Student Note:</span>
                <span>{previewJob.instructions}</span>
              </div>
            )}

            {/* Embedded Web Previewer */}
            <div className="flex-1 p-3 bg-bone/30 overflow-auto flex items-center justify-center min-h-[400px]">
              {previewJob.fileUrl ? (
                <iframe
                  id="admin-preview-iframe"
                  src={previewJob.fileUrl}
                  title={previewJob.fileName}
                  className="w-full h-full min-h-[500px] bg-paper-white border border-bone rounded-[16px] shadow"
                />
              ) : (
                <div className="p-8 bg-paper-white border border-bone rounded-[20px] text-center max-w-md space-y-3 shadow-card">
                  <FileText className="w-12 h-12 text-espresso mx-auto" />
                  <div className="font-semibold text-sm text-aubergine-ink">{previewJob.fileName}</div>
                  <p className="text-xs text-warm-ash">
                    Live browser preview is not available for this local simulated file. Use Direct Web Print or Download.
                  </p>
                  <button
                    onClick={handleDirectWebPrint}
                    className="px-4 py-2 bg-espresso text-paper-white text-xs font-semibold rounded-full"
                  >
                    Send to Printer
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer with Status Transitions */}
            <div className="p-3 bg-paper-white border-t border-bone flex flex-wrap items-center justify-between gap-3 text-xs rounded-b-[20px]">
              <div className="flex items-center space-x-2">
                <span className="text-warm-ash">Current Status:</span>
                <span className="font-semibold capitalize text-aubergine-ink">{previewJob.status}</span>
              </div>

              <div className="flex items-center space-x-2">
                {previewJob.status === 'submitted' && (
                  <button
                    onClick={() => handleUpdateStatus(previewJob.id, 'processing', 'Printing in progress')}
                    className="bg-espresso hover:bg-espresso/90 text-paper-white px-4 py-2 rounded-full font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Printing</span>
                  </button>
                )}

                {previewJob.status === 'processing' && (
                  <button
                    onClick={() => handleUpdateStatus(previewJob.id, 'ready', 'Printing complete. Kept at Counter.')}
                    className="bg-status-ready hover:bg-status-ready/90 text-paper-white px-4 py-2 rounded-full font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                )}

                {previewJob.status === 'ready' && (
                  <button
                    onClick={() => handleUpdateStatus(previewJob.id, 'completed', 'Collected by student')}
                    className="bg-status-completed hover:bg-status-completed/90 text-paper-white px-4 py-2 rounded-full font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Mark Handed Over</span>
                  </button>
                )}

                <button
                  onClick={() => setPreviewJob(null)}
                  className="px-3.5 py-2 border border-outline/30 hover:bg-bone text-aubergine-ink font-semibold rounded-full text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operator Job Inspection Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-bone">
              <div>
                <span className="text-xs font-mono font-bold text-espresso">{selectedJob.id}</span>
                <h3 className="text-base font-semibold text-aubergine-ink mt-0.5">{selectedJob.fileName}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 text-warm-ash hover:text-aubergine-ink rounded-full hover:bg-bone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Student info */}
              <div className="p-3 bg-linen rounded-[16px] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-warm-ash block">Student Name:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.studentName}</span>
                </div>
                <div>
                  <span className="text-warm-ash block">Roll Number:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.studentRoll}</span>
                </div>
                <div>
                  <span className="text-warm-ash block">Department:</span>
                  <span className="text-aubergine-ink">{selectedJob.department}</span>
                </div>
                <div>
                  <span className="text-warm-ash block">Phone:</span>
                  <span className="text-aubergine-ink font-mono">{selectedJob.studentPhone}</span>
                </div>
              </div>

              {/* Print specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Pages:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.pageCount} pages</span>
                </div>
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Copies:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.copies} copy</span>
                </div>
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Color:</span>
                  <span className="font-semibold text-aubergine-ink capitalize">{selectedJob.colorMode}</span>
                </div>
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Sides:</span>
                  <span className="font-semibold text-aubergine-ink capitalize">{selectedJob.sides} sided</span>
                </div>
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Paper Size:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.paperSize}</span>
                </div>
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Paper Type:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.paperType === 'photo' ? 'Photo Paper (+₹15)' : 'Plain Paper'}</span>
                </div>
                <div className="p-2 border border-bone rounded-[12px]">
                  <span className="text-warm-ash block">Payment:</span>
                  <span className="font-semibold text-aubergine-ink capitalize">{selectedJob.paymentMethod === 'upi' ? 'UPI Online' : 'Pay at Counter'}</span>
                </div>
              </div>

              {selectedJob.fileUrl && (
                <div className="p-2.5 bg-bone/40 border border-espresso/15 rounded-[12px] flex items-center justify-between">
                  <div>
                    <span className="text-espresso font-semibold block text-xs">Attached Student Document</span>
                    <span className="text-[11px] text-warm-ash">{selectedJob.fileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setPreviewJob(selectedJob);
                        setSelectedJob(null);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-semibold rounded-full shadow-sm transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview & Print</span>
                    </button>
                    <a
                      href={selectedJob.fileUrl}
                      download={selectedJob.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-paper-white border border-outline/30 hover:bg-bone text-aubergine-ink text-xs font-semibold rounded-full"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedJob.instructions && (
                <div className="p-3 bg-status-queued/5 border border-status-queued/20 rounded-[12px]">
                  <span className="font-semibold text-status-queued block mb-0.5">Note from Student:</span>
                  <p className="text-aubergine-ink">{selectedJob.instructions}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-bone">
                <div>
                  <span className="text-warm-ash block text-[11px]">Total Amount:</span>
                  <span className="text-lg font-bold text-espresso">₹{selectedJob.cost}.00</span>
                </div>
                <div className="text-right">
                  <span className="text-warm-ash block text-[11px]">Pickup Counter:</span>
                  <span className="font-semibold text-aubergine-ink">{selectedJob.pickupCounter}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-bone flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setPreviewJob(selectedJob);
                  setSelectedJob(null);
                }}
                className="bg-espresso hover:bg-espresso/90 text-paper-white px-3.5 py-2 rounded-full font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open in Web Print Portal</span>
              </button>

              {selectedJob.status === 'submitted' && (
                <button
                  onClick={() => {
                    if (selectedJob.fileUrl) {
                      window.open(selectedJob.fileUrl, '_blank');
                    }
                    handleUpdateStatus(selectedJob.id, 'processing', 'Printing in progress');
                    setSelectedJob(null);
                  }}
                  className="bg-espresso hover:bg-espresso/90 text-paper-white px-4 py-2 rounded-full font-semibold text-xs transition-colors flex items-center space-x-1.5"
                  title="Start Printing & Open Merged PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Start Print & Open PDF</span>
                </button>
              )}
              {selectedJob.status === 'processing' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedJob.id, 'ready', 'Printing complete. Kept at Counter.');
                    setSelectedJob(null);
                  }}
                  className="bg-status-ready hover:bg-status-ready/90 text-paper-white px-4 py-2 rounded-full font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark Ready</span>
                </button>
              )}
              {selectedJob.status === 'ready' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedJob.id, 'completed', 'Collected by student');
                    setSelectedJob(null);
                  }}
                  className="bg-status-completed hover:bg-status-completed/90 text-paper-white px-4 py-2 rounded-full font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Mark Handed Over</span>
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="px-3 py-2 border border-outline/30 hover:bg-bone text-aubergine-ink font-semibold text-xs rounded-full"
              >
                Close
              </button>
            </div>
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
                {HOLD_REASON_PRESETS.map((preset) => (
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
                {HOLD_ETA_PRESETS.map((eta) => (
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

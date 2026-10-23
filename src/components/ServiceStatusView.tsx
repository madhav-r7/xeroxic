import React, { useState, useEffect } from 'react';
import {
  Printer as PrinterIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Info,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  Check,
  PauseCircle,
} from 'lucide-react';
import { Printer, PrinterStatus, QueueHoldStatus } from '../types';
import {
  getStoredPrinters,
  syncPrintersFromSupabase,
  findAlternativePrinters,
  isPrinterUnavailable,
  getQueueHoldStatus,
} from '../services/storage';
import { subscribeToLivePrinters } from '../services/supabase';

interface ServiceStatusViewProps {
  onNavigateToUpload: () => void;
  onNavigateToTrack: () => void;
}

export const ServiceStatusView: React.FC<ServiceStatusViewProps> = ({
  onNavigateToUpload,
  onNavigateToTrack,
}) => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [queueHold, setQueueHold] = useState<QueueHoldStatus>(() => getQueueHoldStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const loadPrinters = () => {
    setPrinters(getStoredPrinters());
    setQueueHold(getQueueHoldStatus());
    setLastRefreshedAt(new Date());
  };

  useEffect(() => {
    loadPrinters();

    // Initial Supabase fetch
    syncPrintersFromSupabase().then((remote) => {
      if (remote && remote.length > 0) {
        setPrinters(remote);
        setLastRefreshedAt(new Date());
      }
    });

    // Storage event listener
    const handleStorageUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPrinters(e.detail);
        setLastRefreshedAt(new Date());
      } else {
        loadPrinters();
      }
    };

    const handleQueueHoldUpdate = (e: any) => {
      if (e.detail) {
        setQueueHold(e.detail);
      } else {
        setQueueHold(getQueueHoldStatus());
      }
    };

    window.addEventListener('xeroxic_printers_updated', handleStorageUpdate);
    window.addEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('storage', handleQueueHoldUpdate);

    // Supabase Realtime subscription
    const unsubscribe = subscribeToLivePrinters(() => {
      loadPrinters();
      syncPrintersFromSupabase().then((remote) => {
        if (remote && remote.length > 0) {
          setPrinters(remote);
          setLastRefreshedAt(new Date());
        }
      });
    });

    return () => {
      window.removeEventListener('xeroxic_printers_updated', handleStorageUpdate);
      window.removeEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('storage', handleQueueHoldUpdate);
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await syncPrintersFromSupabase();
      setPrinters(refreshed);
      setLastRefreshedAt(new Date());
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Status Metrics
  const totalCount = printers.length;
  const operationalCount = printers.filter(
    (p) => p.status === 'online' || p.status === 'busy'
  ).length;
  const disruptedCount = printers.filter((p) => isPrinterUnavailable(p.status)).length;

  const isBwAvailable = printers.some(
    (p) => p.supportedTypes.includes('bw') && (p.status === 'online' || p.status === 'busy')
  );
  const isColorAvailable = printers.some(
    (p) => p.supportedTypes.includes('color') && (p.status === 'online' || p.status === 'busy')
  );

  // Overall Status
  let overallStatus: 'optimal' | 'partial' | 'outage' = 'optimal';
  if (operationalCount === 0 && totalCount > 0) {
    overallStatus = 'outage';
  } else if (disruptedCount > 0) {
    overallStatus = 'partial';
  }

  const getStatusBadge = (status: PrinterStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Processing Jobs
          </span>
        );
      case 'out_of_paper':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            Out of Paper
          </span>
        );
      case 'paper_jam':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            Paper Jam
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400">
            <Clock className="w-3.5 h-3.5" />
            Under Maintenance
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Offline
          </span>
        );
    }
  };

  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return 'Moments ago';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-bone/60 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-espresso/5 dark:bg-white/10 text-espresso dark:text-white uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-status-ready" />
              Live Telemetry
            </span>
            <span className="flex items-center gap-1.5 text-xs text-status-ready font-medium">
              <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
              Supabase Realtime Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-espresso dark:text-white">
            Printer & Counter Service Status
          </h1>
          <p className="text-sm text-on-surface-variant dark:text-gray-400 mt-1 max-w-2xl">
            Live health of photocopy machines, high-speed duplex printers, and color lasers. Check machine availability before submitting your order.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full bg-bone hover:bg-bone/80 dark:bg-[#282b33] dark:hover:bg-[#343842] text-espresso dark:text-gray-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            Checked at {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className="mt-6 space-y-4">
        {queueHold.isHeld && (
          <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/40 flex items-start sm:items-center gap-4 shadow-sm animate-pulse">
            <div className="p-3 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
              <PauseCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-200">
                  Xerox Counter Queue is Currently Under Hold
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 rounded-full uppercase">
                  Technical Pause Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300 mt-0.5">
                <strong>Reason:</strong> {queueHold.reason || 'Technical issue at counter'}
                {queueHold.estimatedResume && (
                  <span> • <strong>Expected to resume in:</strong> {queueHold.estimatedResume}</span>
                )}
                {queueHold.heldBy && (
                  <span> • <strong>Announced by:</strong> {queueHold.heldBy}</span>
                )}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1">
                Submitted orders remain safely in line. Online orders continue to be accepted and will be printed immediately once counter operations resume.
              </p>
            </div>
          </div>
        )}

        {overallStatus === 'optimal' && (
          <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-300">
                  All Printing Services Operational
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-full">
                  Normal Speed
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-400/90 mt-0.5">
                All 4 shop counter bays are running smoothly. Black & white laser and photo color printing queues are moving at standard turnaround (~10-15 mins).
              </p>
            </div>
          </div>
        )}

        {overallStatus === 'partial' && (
          <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-300">
                  Partial Service Disruption ({disruptedCount} Machine{disruptedCount > 1 ? 's' : ''} Under Attention)
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 rounded-full">
                  Delays Possible
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-400/90 mt-0.5">
                One or more printers are temporarily offline, out of paper, or being serviced. Alternative compatible printers are operational and absorbing jobs.
              </p>
            </div>
          </div>
        )}

        {overallStatus === 'outage' && (
          <div className="p-5 rounded-2xl bg-linear-to-r from-red-500/15 via-red-500/5 to-transparent border border-red-500/30 flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-red-600 text-white shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-red-950 dark:text-red-300">
                  Temporary Service Pause
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-200/70 dark:bg-red-900/50 text-red-900 dark:text-red-300 rounded-full">
                  Attention Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-900/80 dark:text-red-400/90 mt-0.5">
                All printing bays are currently undergoing maintenance or offline. Shop staff is attending to restore service as quickly as possible.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Service Category Availability Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1e2025] border border-bone/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              B&W Documents & Photocopy
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-lg font-bold text-espresso dark:text-white">
                {isBwAvailable ? 'Fully Available' : 'Temporarily Delayed'}
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Canon iR 2625i & Brother SuperDuplex
            </p>
          </div>
          <div className={`p-2.5 rounded-full shrink-0 ${isBwAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
            {isBwAvailable ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1e2025] border border-bone/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Color & Glossy Reports
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-lg font-bold text-espresso dark:text-white">
                {isColorAvailable ? 'Fully Available' : 'Temporarily Delayed'}
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              HP Enterprise M555 & Epson WorkForce Pro
            </p>
          </div>
          <div className={`p-2.5 rounded-full shrink-0 ${isColorAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
            {isColorAvailable ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1e2025] border border-bone/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Fleet Capacity
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-lg font-bold text-espresso dark:text-white">
                {operationalCount} / {totalCount} Online
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Estimated wait: ~{disruptedCount > 0 ? '15-25' : '10-15'} minutes
            </p>
          </div>
          <div className="p-2.5 rounded-full bg-espresso/5 dark:bg-white/10 text-espresso dark:text-white shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Individual Printer Cards Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-espresso dark:text-white flex items-center gap-2">
            <PrinterIcon className="w-5 h-5" />
            Shop Counter Printer Fleet
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Automated load balancing & routing active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {printers.map((printer) => {
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
                className={`p-6 rounded-2xl bg-white dark:bg-[#1e2025] border transition-all duration-200 shadow-xs ${
                  isDisrupted
                    ? 'border-amber-300 dark:border-amber-900/50 ring-1 ring-amber-400/20'
                    : 'border-bone/80 dark:border-white/10 hover:border-espresso/30 dark:hover:border-white/20'
                }`}
              >
                {/* Top: Name, Status badge & ID */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-bone dark:bg-white/10 text-espresso dark:text-gray-300">
                        {printer.id}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {printer.location}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-espresso dark:text-white mt-1">
                      {printer.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {printer.model}
                    </p>
                  </div>
                  {getStatusBadge(printer.status)}
                </div>

                {/* Capabilities & Formats */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {printer.supportedTypes.map((type) => (
                    <span
                      key={type}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        type === 'color'
                          ? 'bg-linear-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 text-purple-700 dark:text-purple-300 border border-purple-300/30'
                          : 'bg-bone dark:bg-white/10 text-espresso dark:text-gray-300'
                      }`}
                    >
                      {type === 'color' ? 'Full Color Laser' : 'Black & White Mono'}
                    </span>
                  ))}
                  {printer.supportedFormats.map((fmt) => (
                    <span
                      key={fmt}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-bone/60 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                    >
                      {fmt}
                    </span>
                  ))}
                  {printer.maxSpeedPpm && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                      {printer.maxSpeedPpm} ppm
                    </span>
                  )}
                </div>

                {/* Interruption / Delay Details if Disrupted */}
                {isDisrupted && (
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/40 text-xs">
                    <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Service Interruption: </span>
                        <span>
                          {printer.issueDescription ||
                            `${printer.name} is currently experiencing a technical pause (${printer.status.replace('_', ' ')}).`}
                        </span>
                      </div>
                    </div>

                    {printer.estimatedRecovery && (
                      <div className="flex items-center gap-1.5 mt-2 text-amber-800 dark:text-amber-300 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Estimated resolution: {printer.estimatedRecovery}</span>
                      </div>
                    )}

                    {/* Compatible Alternative Suggestion */}
                    {alternativePrinters.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-900/60 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          Alternative online:{' '}
                          <span className="font-bold underline">{alternativePrinters[0].name}</span> is available for new orders.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer: Last status update time */}
                <div className="mt-4 pt-3 border-t border-bone/60 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span>Last status update:</span>
                  <span className="font-medium text-espresso dark:text-gray-300">
                    {formatLastUpdated(printer.lastUpdated || printer.updatedAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Guidance & Actions */}
      <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-bone/40 dark:bg-white/5 border border-bone/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-espresso dark:text-white" />
            <span className="text-xs font-semibold text-espresso dark:text-white uppercase tracking-wider">
              Smart Order Routing
            </span>
          </div>
          <h3 className="text-lg font-bold text-espresso dark:text-white">
            Ready to print your college assignment or notes?
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-1">
            Our queue system automatically schedules your document to the nearest available machine. If a machine ever experiences a paper jam or requires service, you will immediately receive an in-app and browser alert with your updated pickup estimate.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={onNavigateToTrack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium text-espresso dark:text-white bg-white dark:bg-[#1e2025] hover:bg-bone dark:hover:bg-[#282b33] border border-bone/80 dark:border-white/10 transition-colors shadow-xs text-center"
          >
            Track Existing Order
          </button>
          <button
            onClick={onNavigateToUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white dark:text-black bg-espresso hover:bg-espresso/90 dark:bg-white dark:hover:bg-gray-100 transition-colors shadow-sm text-center"
          >
            Upload & Print Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

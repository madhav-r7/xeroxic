import React, { useEffect, useRef, useState } from 'react';
import { PrintJob } from '../types';
import { formatQrPayload, renderQrToCanvas, downloadQrCodeAsPng } from '../utils/qrCode';
import { Download, QrCode, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';

interface OrderQrCodeCardProps {
  job: PrintJob;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const OrderQrCodeCard: React.FC<OrderQrCodeCardProps> = ({
  job,
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasWidth = size === 'sm' ? 140 : size === 'lg' ? 240 : 190;

  useEffect(() => {
    if (!canvasRef.current) return;
    const payload = formatQrPayload(job);
    renderQrToCanvas(canvasRef.current, payload, canvasWidth).catch((err) => {
      console.error('Failed to render QR canvas:', err);
    });
  }, [job, canvasWidth]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadQrCodeAsPng(job);
    } catch (e) {
      console.error('Failed to download QR code PNG:', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(job.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReady = job.status === 'ready';
  const isCollected = job.status === 'completed';

  return (
    <div
      className={`bg-paper-white dark:bg-[#1c1f26] border border-bone dark:border-white/10 rounded-[22px] p-5 shadow-card transition-all text-center flex flex-col items-center ${className}`}
    >
      {/* Header Badge */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-bone dark:border-white/10 text-xs">
        <div className="flex items-center space-x-1.5 text-espresso dark:text-white font-semibold">
          <QrCode className="w-4 h-4 text-espresso dark:text-white" />
          <span>Collection QR Pass</span>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] text-warm-ash dark:text-[#a1a1aa]">
          <ShieldCheck className="w-3.5 h-3.5 text-status-ready" />
          <span>Encrypted Pass</span>
        </div>
      </div>

      {/* QR Code Canvas with rounded frame */}
      <div className="p-3 bg-white rounded-[16px] shadow-sm border border-bone dark:border-white/20 inline-block relative group">
        <canvas ref={canvasRef} className="block mx-auto rounded-[8px]" />
      </div>

      {/* Order ID clearly below QR Code */}
      <div className="mt-3.5 w-full">
        <div className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase tracking-wider">
          Order ID
        </div>
        <button
          onClick={handleCopyOrderId}
          title="Click to copy Order ID"
          className="text-2xl font-bold font-mono tracking-wider text-espresso dark:text-[#fafafa] hover:opacity-80 transition-opacity inline-flex items-center gap-1.5 mt-0.5"
        >
          <span>{job.id}</span>
          {copied && <span className="text-[10px] font-sans text-status-ready font-semibold">Copied!</span>}
        </button>
      </div>

      {/* Instructional text */}
      <div className="mt-2 text-xs text-warm-ash dark:text-[#a1a1aa] flex items-center justify-center gap-1">
        <Smartphone className="w-3.5 h-3.5 shrink-0 text-stone" />
        <span>
          {isCollected
            ? 'Order already collected'
            : isReady
            ? 'Present this QR code at counter for instant pickup'
            : 'Show this QR code at counter when ready'}
        </span>
      </div>

      {/* Status banner indicator */}
      {isReady && (
        <div className="mt-3 w-full py-1 px-2.5 rounded-full bg-status-ready/10 text-status-ready border border-status-ready/20 text-[11px] font-semibold flex items-center justify-center gap-1.5 animate-pulse">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Printed & Ready for Handover!</span>
        </div>
      )}

      {isCollected && (
        <div className="mt-3 w-full py-1 px-2.5 rounded-full bg-bone dark:bg-white/10 text-status-completed dark:text-[#a1a1aa] border border-outline-variant text-[11px] font-medium">
          Handed over to student
          {job.collectedAt ? ` (${new Date(job.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
        </div>
      )}

      {/* Download PNG Button */}
      <div className="mt-4 w-full pt-3 border-t border-bone dark:border-white/10 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] hover:bg-espresso/90 dark:hover:bg-white/90 transition-colors shadow-sm disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Saving Image...' : 'Download QR Code (.png)'}</span>
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 text-[11px] text-stone dark:text-[#a1a1aa]">
          Pickup Counter: <strong className="text-aubergine-ink dark:text-white">{job.pickupCounter}</strong>
        </div>
      )}
    </div>
  );
};

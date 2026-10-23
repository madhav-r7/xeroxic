import React, { useState, useEffect } from 'react';
import { PrintJob, User, QueueHoldStatus } from '../types';
import { addPrintJobAsync, generateOrderId, getStoredPrinters, isPrinterUnavailable, getQueueHoldStatus } from '../services/storage';
import { mergeFilesToPdf, MAX_PAGE_COUNT, MAX_TOTAL_SIZE_BYTES } from '../utils/pdfMerger';
import { PDFDocument } from 'pdf-lib';
import { generateCollectionToken } from '../utils/qrCode';
import { OrderQrCodeCard } from './OrderQrCodeCard';
import {
  Upload,
  Check,
  CreditCard,
  Clock,
  MapPin,
  AlertCircle,
  FileCheck,
  Info,
  FileText,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Banknote,
  ShieldCheck,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

interface UploadAssignmentProps {
  user: User;
  onJobCreated: (job: PrintJob) => void;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
}

export const UploadAssignment: React.FC<UploadAssignmentProps> = ({ user, onJobCreated }) => {
  // Navigation phase: 'upload' | 'configure' | 'payment'
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'payment'>('upload');

  // Queue Hold status
  const [queueHold, setQueueHold] = useState<QueueHoldStatus>(() => getQueueHoldStatus());

  useEffect(() => {
    const handleQueueHoldUpdate = (e: any) => {
      if (e.detail) {
        setQueueHold(e.detail);
      } else {
        setQueueHold(getQueueHoldStatus());
      }
    };
    window.addEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdate);
    window.addEventListener('storage', handleQueueHoldUpdate);
    return () => {
      window.removeEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdate);
      window.removeEventListener('storage', handleQueueHoldUpdate);
    };
  }, []);

  // Multi-file state
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [mergedFile, setMergedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Print configuration state (No binding options)
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [copies, setCopies] = useState<number>(1);
  const [sides, setSides] = useState<'single' | 'double'>('double');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Letter'>('A4');
  const [paperType, setPaperType] = useState<'plain' | 'photo'>('plain');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isUrgent, setIsUrgent] = useState(false);
  const [instructions, setInstructions] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'counter'>('upi');
  const [utrNumber, setUtrNumber] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successJob, setSuccessJob] = useState<PrintJob | null>(null);

  // Price calculations - strictly 0 until files are uploaded and merged!
  const hasFile = fileList.length > 0 && Boolean(mergedFile);
  const perPageRate = colorMode === 'color' ? 10 : 2;
  const paperMultiplier = paperSize === 'A3' ? 2 : 1;
  const pagesCost = hasFile ? pageCount * copies * perPageRate * paperMultiplier : 0;
  const photoPaperFee = hasFile && paperType === 'photo' ? 15 * copies : 0;
  const urgentFee = hasFile && isUrgent ? 10 : 0;
  const totalCost = hasFile ? pagesCost + photoPaperFee + urgentFee : 0;

  // Merge files pipeline using pdf-lib
  const triggerMerge = async (items: UploadedFileItem[]) => {
    if (items.length === 0) {
      setMergedFile(null);
      setFileName('');
      setFileSize('');
      setPageCount(1);
      setMergeError(null);
      setIsMerging(false);
      return;
    }

    setIsMerging(true);
    setMergeError(null);

    try {
      const rawFiles = items.map((item) => item.file);
      const result = await mergeFilesToPdf(rawFiles);
      setMergedFile(result.mergedFile);
      setFileName(result.mergedFile.name);
      setFileSize(result.fileSizeFormatted);
      setPageCount(result.pageCount);
    } catch (err: any) {
      console.error('Merge error:', err);
      setMergeError(err.message || 'Failed to merge files into a PDF.');
    } finally {
      setIsMerging(false);
    }
  };

  // Add files to queue
  const processNewFiles = async (incoming: FileList | File[]) => {
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    const fileArray = Array.from(incoming);
    for (const f of fileArray) {
      const lower = f.name.toLowerCase();
      const isValid =
        validExtensions.some((ext) => lower.endsWith(ext)) ||
        f.type === 'application/pdf' ||
        f.type.startsWith('image/');
      if (isValid) {
        validFiles.push(f);
      } else {
        rejectedFiles.push(f.name);
      }
    }

    if (rejectedFiles.length > 0) {
      alert(`Only PDF, JPG, JPEG, and PNG files are supported.\nSkipped: ${rejectedFiles.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    // Check size limit
    const existingBytes = fileList.reduce((acc, f) => acc + f.size, 0);
    const newBytes = validFiles.reduce((acc, f) => acc + f.size, 0);
    if (existingBytes + newBytes > MAX_TOTAL_SIZE_BYTES) {
      alert(`Total size of files cannot exceed 50 MB.`);
      return;
    }

    const newItems: UploadedFileItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).substring(2, 8)}`,
      file,
      name: file.name,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
    }));

    const updatedList = [...fileList, ...newItems];
    setFileList(updatedList);
    await triggerMerge(updatedList);
    setCurrentStep('configure');
  };

  // Reorder files
  const handleMoveFile = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fileList.length) return;

    const reordered = [...fileList];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setFileList(reordered);
    await triggerMerge(reordered);
  };

  // Remove single file
  const handleRemoveFile = async (id: string) => {
    const updated = fileList.filter((item) => item.id !== id);
    setFileList(updated);
    if (updated.length === 0) {
      setMergedFile(null);
      setFileName('');
      setFileSize('');
      setPageCount(1);
      setMergeError(null);
      setCurrentStep('upload');
    } else {
      await triggerMerge(updated);
    }
  };

  // Clear all files
  const handleClearAll = () => {
    setFileList([]);
    setMergedFile(null);
    setFileName('');
    setFileSize('');
    setPageCount(1);
    setMergeError(null);
    setCurrentStep('upload');
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processNewFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processNewFiles(e.target.files);
      // Reset input value so same files can be re-selected if removed
      e.target.value = '';
    }
  };

  // Generate sample files (creates a valid sample PDF using pdf-lib)
  const handleUseSampleFile = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const sampleDoc = await PDFDocument.create();
      sampleDoc.addPage([595.28, 841.89]);
      sampleDoc.addPage([595.28, 841.89]);
      const pdfBytes = await sampleDoc.save();
      const sample = new File([pdfBytes], 'Lab_Assignment_Unit_4.pdf', {
        type: 'application/pdf',
      });
      await processNewFiles([sample]);
    } catch (err) {
      console.error('Error generating sample document:', err);
    }
  };

  // Open merged PDF preview in a new browser tab
  const handlePreviewMergedPdf = () => {
    if (!mergedFile) return;
    const blobUrl = URL.createObjectURL(mergedFile);
    window.open(blobUrl, '_blank');
  };

  const handleProceedToPayment = () => {
    if (!mergedFile || fileList.length === 0) {
      alert('Please upload and merge at least one document or image first.');
      return;
    }
    if (mergeError) {
      alert(`Please fix merging errors before proceeding:\n${mergeError}`);
      return;
    }
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergedFile) return;

    setIsSubmitting(true);

    const randomToken = generateOrderId();
    const now = new Date().toISOString();

    const newJob: PrintJob = {
      id: randomToken,
      studentId: user.id,
      studentName: user.name,
      studentRoll: user.studentId || '250222',
      studentPhone: user.phone || '+91 98765 43210',
      department: user.department || 'Campus Student',
      fileName: fileName || mergedFile.name,
      fileSize: fileSize || '1.5 MB',
      fileType: 'application/pdf',
      pageCount: pageCount,
      copies: copies,
      colorMode: colorMode,
      paperSize: paperSize,
      paperType: paperType,
      orientation: orientation,
      sides: sides,
      binding: 'none',
      isUrgent: isUrgent,
      instructions: instructions.trim(),
      cost: totalCost,
      status: 'submitted',
      paymentMethod: paymentMethod,
      utrNumber: utrNumber.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      pickupCounter: 'AIT Xerox Shop',
      estimatedPickupTime: isUrgent ? '10-15 minutes' : '20-25 minutes',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: `Order placed online (${fileList.length} files merged into single PDF) via ${
            paymentMethod === 'upi' ? 'UPI' : 'Pay at Counter'
          }. Queued at AIT Xerox Shop.`,
        },
      ],
      collectionToken: generateCollectionToken(randomToken),
    };

    try {
      await addPrintJobAsync(newJob, mergedFile);
      onJobCreated(newJob);
      setSuccessJob(newJob);
    } catch (err) {
      console.error('Failed to submit print job:', err);
      // Still show success as local job is persisted
      onJobCreated(newJob);
      setSuccessJob(newJob);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS / CONFIRMATION SCREEN
  if (successJob) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-10 px-4 sm:px-6 lg:px-8 text-[1.03em] text-left">
        <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 sm:p-10 shadow-card text-left">
          <div className="flex items-center space-x-3 pb-5 border-b border-bone dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-status-ready/15 text-status-ready flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-aubergine-ink dark:text-[#fafafa]">Print Request Received!</h2>
              <p className="text-xs text-warm-ash dark:text-[#a1a1aa]">
                Your single merged PDF has been sent to the AIT Xerox operator desk.
              </p>
            </div>
          </div>

          {/* Confirmation Content: Left: Details & Specs; Right: Collection QR Pass */}
          <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Token ID Highlight */}
              <div className="p-5 bg-linen dark:bg-[#20232a] border border-bone dark:border-white/10 rounded-[16px] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase">Your Token ID</div>
                  <div className="text-2xl font-bold text-espresso dark:text-[#fafafa] mt-1 tracking-wider font-mono">
                    {successJob.id}
                  </div>
                  <div className="text-[11px] text-stone dark:text-[#a1a1aa] mt-0.5">Show this token or QR pass at pickup</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase">Pickup Counter</div>
                  <div className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa] mt-1">
                    {successJob.pickupCounter}
                  </div>
                  <div className="text-[11px] text-stone dark:text-[#a1a1aa]">Shopping Complex</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase">Estimated Time</div>
                  <div className="text-base font-semibold text-status-ready mt-1">
                    {successJob.estimatedPickupTime}
                  </div>
                  <div className="text-[11px] text-stone dark:text-[#a1a1aa]">
                    Amount: ₹{successJob.cost} ({successJob.paymentMethod === 'upi' ? 'UPI' : 'Pay at Counter'})
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3 text-xs text-aubergine-ink dark:text-[#fafafa] pb-4">
                <div className="font-semibold text-sm text-aubergine-ink dark:text-[#fafafa]">Print Specifications</div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  <div className="bg-linen dark:bg-[#20232a] p-2.5 border border-bone dark:border-white/10 rounded-[12px]">
                    <span className="text-warm-ash dark:text-[#a1a1aa] block text-[11px]">Merged PDF:</span>
                    <span className="font-medium truncate block" title={successJob.fileName}>
                      {successJob.fileName}
                    </span>
                  </div>
                  <div className="bg-linen dark:bg-[#20232a] p-2.5 border border-bone dark:border-white/10 rounded-[12px]">
                    <span className="text-warm-ash dark:text-[#a1a1aa] block text-[11px]">Pages & Copies:</span>
                    <span className="font-medium">
                      {successJob.pageCount} pgs × {successJob.copies} {successJob.copies > 1 ? 'copies' : 'copy'}
                    </span>
                  </div>
                  <div className="bg-linen dark:bg-[#20232a] p-2.5 border border-bone dark:border-white/10 rounded-[12px]">
                    <span className="text-warm-ash dark:text-[#a1a1aa] block text-[11px]">Color & Sides:</span>
                    <span className="font-medium">
                      {successJob.colorMode === 'color' ? 'Color' : 'B&W'} ({successJob.sides === 'double' ? 'Duplex' : 'Single Sided'})
                    </span>
                  </div>
                  <div className="bg-linen dark:bg-[#20232a] p-2.5 border border-bone dark:border-white/10 rounded-[12px]">
                    <span className="text-warm-ash dark:text-[#a1a1aa] block text-[11px]">Paper Type:</span>
                    <span className="font-medium">
                      {successJob.paperType === 'photo' ? 'Photo Paper' : 'Plain Paper'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Pass Card */}
            <div className="lg:col-span-1 flex justify-center">
              <OrderQrCodeCard job={successJob} size="md" className="w-full max-w-sm" />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setSuccessJob(null);
                handleClearAll();
              }}
              className="w-full sm:w-auto px-4 py-2 border border-outline/40 hover:bg-bone dark:border-white/20 dark:hover:bg-white/10 text-aubergine-ink dark:text-[#fafafa] text-xs font-semibold rounded-full transition-colors"
            >
              Upload Another Assignment
            </button>
            <button
              type="button"
              onClick={() => onJobCreated(successJob)}
              className="w-full sm:w-auto px-5 py-2 bg-espresso hover:bg-espresso/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-paper-white text-xs font-semibold rounded-full transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Track Live Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: PAYMENT PAGE
  if (currentStep === 'payment') {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 text-left text-[1.03em] space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-warm-ash dark:text-[#a1a1aa] mb-4">
          <button
            onClick={() => setCurrentStep('configure')}
            className="flex items-center space-x-1 hover:text-espresso dark:hover:text-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Print Options</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-aubergine-ink dark:text-[#fafafa]">Checkout & Payment</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-aubergine-ink dark:text-[#fafafa] tracking-tight">
            Review Order & Payment
          </h1>
          <p className="text-sm text-warm-ash dark:text-[#a1a1aa] mt-1">
            Complete payment or choose pay at counter to send your print request to the operator desk
          </p>
        </div>

        <form onSubmit={handleFinalOrderSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Payment Options (7/8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] p-5 shadow-card space-y-4">
                <h2 className="text-sm font-semibold text-aubergine-ink pb-2 border-b border-bone">
                  Select Payment Method
                </h2>

                {/* Option 1: Instant UPI QR Code */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-[16px] cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'ring-2 ring-espresso bg-bone/20'
                      : 'ring-1 ring-black/[0.06] hover:ring-outline/40 bg-paper-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-[12px] bg-bone text-espresso flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-aubergine-ink">
                          Instant UPI Payment (QR Code)
                        </div>
                        <div className="text-xs text-warm-ash mt-0.5">
                          Pay using GPay, PhonePe, Paytm, or BHIM
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <Check className="w-5 h-5 text-espresso" />}
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-4 border-t border-bone space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-linen p-3.5 border border-bone rounded-[12px]">
                        {/* Mock UPI QR Graphic */}
                        <div className="w-32 h-32 shrink-0 bg-paper-white border border-aubergine-ink/20 p-2 flex flex-col items-center justify-center rounded-[12px]">
                          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                            <rect width="100" height="100" fill="#ffffff" />
                            <rect x="10" y="10" width="25" height="25" fill="#000" />
                            <rect x="15" y="15" width="15" height="15" fill="#fff" />
                            <rect x="18" y="18" width="9" height="9" fill="#000" />
                            <rect x="65" y="10" width="25" height="25" fill="#000" />
                            <rect x="70" y="15" width="15" height="15" fill="#fff" />
                            <rect x="73" y="18" width="9" height="9" fill="#000" />
                            <rect x="10" y="65" width="25" height="25" fill="#000" />
                            <rect x="15" y="70" width="15" height="15" fill="#fff" />
                            <rect x="18" y="73" width="9" height="9" fill="#000" />
                            <rect x="42" y="12" width="6" height="6" fill="#000" />
                            <rect x="52" y="12" width="6" height="6" fill="#000" />
                            <rect x="42" y="22" width="6" height="6" fill="#000" />
                            <rect x="42" y="32" width="16" height="6" fill="#000" />
                            <rect x="12" y="42" width="16" height="6" fill="#000" />
                            <rect x="32" y="42" width="6" height="16" fill="#000" />
                            <rect x="42" y="42" width="16" height="16" fill="#160f0c" />
                            <rect x="62" y="42" width="6" height="6" fill="#000" />
                            <rect x="72" y="42" width="16" height="6" fill="#000" />
                            <rect x="62" y="52" width="16" height="6" fill="#000" />
                            <rect x="42" y="62" width="6" height="16" fill="#000" />
                            <rect x="52" y="72" width="16" height="6" fill="#000" />
                            <rect x="72" y="62" width="16" height="16" fill="#000" />
                          </svg>
                        </div>

                        <div className="text-xs space-y-1.5 flex-1">
                          <div className="text-[11px] font-semibold text-warm-ash uppercase">Scan & Pay</div>
                          <div className="text-base font-bold text-espresso">₹{totalCost}.00</div>
                          <div className="text-xs text-aubergine-ink">
                            UPI ID: <span className="font-mono font-semibold">ait.xerox@upi</span>
                          </div>
                          <div className="text-[11px] text-warm-ash flex items-center space-x-1 pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-status-ready" />
                            <span>Verified AIT Xerox Shop</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-aubergine-ink mb-1">
                          UTR / Transaction Ref No. (Optional)
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 429183019283 (from UPI app)"
                          className="w-full px-3 py-2 text-xs border border-outline/40 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none bg-paper-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Pay at Counter */}
                <div
                  onClick={() => setPaymentMethod('counter')}
                  className={`p-4 rounded-[16px] cursor-pointer transition-all ${
                    paymentMethod === 'counter'
                      ? 'ring-2 ring-espresso bg-bone/20'
                      : 'ring-1 ring-black/[0.06] hover:ring-outline/40 bg-paper-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-[12px] bg-status-ready/10 text-status-ready flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-aubergine-ink">
                          Pay at Counter on Pickup
                        </div>
                        <div className="text-xs text-warm-ash mt-0.5">
                          Pay cash or scan shop QR when collecting printed sheets
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'counter' && <Check className="w-5 h-5 text-espresso" />}
                  </div>

                  {paymentMethod === 'counter' && (
                    <div className="mt-3 pt-3 border-t border-bone text-xs text-warm-ash space-y-1">
                      <p>
                        Your order will be printed and kept ready at <strong className="text-aubergine-ink">AIT Xerox Shop</strong> (Shopping Complex).
                      </p>
                      <p className="text-status-ready font-medium">
                        Pay ₹{totalCost}.00 in cash or via UPI when handing your Token ID.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Button (5/4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 shadow-card space-y-5 sticky top-20">
                <h3 className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa] pb-3 border-b border-bone dark:border-white/10">
                  Order Summary
                </h3>

                {/* Document summary */}
                <div className="p-3 bg-linen border border-bone rounded-[12px] space-y-1.5 text-xs">
                  <div className="font-semibold text-aubergine-ink truncate" title={fileName}>
                    {fileName}
                  </div>
                  <div className="text-warm-ash flex items-center space-x-2">
                    <span>{fileList.length} source file(s)</span>
                    <span>•</span>
                    <span className="font-semibold text-espresso">{pageCount} total pages</span>
                    <span>•</span>
                    <span>{fileSize}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs py-2 border-b border-bone">
                  <div className="flex justify-between text-warm-ash">
                    <span>
                      Printing ({pageCount} pgs × {copies} × ₹{perPageRate})
                    </span>
                    <span className="font-medium text-aubergine-ink">₹{pagesCost}.00</span>
                  </div>

                  {photoPaperFee > 0 && (
                    <div className="flex justify-between text-warm-ash">
                      <span>Photo Paper Finish</span>
                      <span className="font-medium text-aubergine-ink">₹{photoPaperFee}.00</span>
                    </div>
                  )}

                  {urgentFee > 0 && (
                    <div className="flex justify-between text-warm-ash">
                      <span>Urgent Priority Fee</span>
                      <span className="font-medium text-aubergine-ink">+₹10.00</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-semibold text-aubergine-ink">Total Payable</span>
                  <span className="text-2xl font-bold text-espresso">₹{totalCost}.00</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-espresso hover:bg-espresso/90 active:bg-espresso/80 text-paper-white text-xs font-semibold rounded-full transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading Merged PDF & Sending...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Confirm & Send to Print Queue (₹{totalCost})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('configure')}
                    className="w-full mt-2 py-2 text-xs text-warm-ash hover:text-aubergine-ink hover:underline text-center"
                  >
                    Edit Print Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // STEP 1 & STEP 2: UPLOAD & CONFIGURE
  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 text-left text-[1.03em] space-y-8">
      {/* Title section */}
      <div className="pb-2 border-b border-bone/60 dark:border-white/10">
        <h1 className="text-3xl font-bold text-aubergine-ink dark:text-[#fafafa] tracking-tight">
          New Print Order
        </h1>
        <p className="text-sm text-warm-ash dark:text-[#a1a1aa] mt-1.5 leading-relaxed">
          Upload single or multiple files (PDFs, JPGs, PNGs). They will be automatically merged into one print-ready PDF.
        </p>
      </div>

      {/* Queue Hold Notice */}
      {queueHold.isHeld && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">
              Notice: Xerox Counter Queue is Temporarily On Hold ({queueHold.reason})
            </span>
            <p className="mt-0.5">
              You can proceed to upload and configure your print order normally. Your document will be accepted and safely placed in line; printing will start once counter operations resume{queueHold.estimatedResume ? ` (approx. ${queueHold.estimatedResume})` : ''}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload Dropzone, File List & Print Options (7/8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* STEP 1: MULTI-FILE UPLOADER & MERGER */}
          <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-bone dark:border-white/10">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa]">Document & File Upload</h2>
              </div>
              {fileList.length === 0 && (
                <button
                  type="button"
                  onClick={handleUseSampleFile}
                  className="text-xs text-espresso hover:underline font-medium"
                >
                  Load Sample Document
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[16px] p-6 sm:p-8 text-center transition-colors ${
                dragActive
                  ? 'border-espresso bg-bone/30'
                  : 'border-outline-variant hover:border-outline bg-linen'
              }`}
            >
              <div className="w-11 h-11 mx-auto mb-2 rounded-full bg-bone text-espresso flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-aubergine-ink">
                {fileList.length === 0 ? 'Drag and drop your files here' : 'Drag and drop more files here'}
              </div>
              <p className="text-xs text-warm-ash mt-1 mb-3">
                Upload multiple <strong>PDF, JPG, JPEG, or PNG</strong> files (Max 50 MB total, up to 1,000 pages).
              </p>
              <label className="inline-flex items-center justify-center px-4 py-2 bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>{fileList.length === 0 ? 'Select Files from Device' : 'Add More Files'}</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Error Banner */}
            {mergeError && (
              <div className="p-3 bg-status-queued/10 border border-status-queued/30 rounded-[12px] text-xs text-status-queued flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">PDF Merging Error</span>
                  <span>{mergeError}</span>
                </div>
              </div>
            )}

            {/* Uploaded Files Queue (with Reordering & Delete) */}
            {fileList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-aubergine-ink dark:text-[#fafafa]">
                    Queued Files ({fileList.length}) — Merged in this order:
                  </span>
                  <div className="flex items-center space-x-3">
                    <label className="text-espresso dark:text-[#fafafa] hover:underline font-semibold cursor-pointer flex items-center space-x-1">
                      <Plus className="w-3 h-3" />
                      <span>Add More</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-status-queued hover:underline font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {fileList.map((item, idx) => {
                    const isPdf = item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 bg-linen hover:bg-bone dark:bg-[#20232a] dark:hover:bg-[#282c35] border border-bone dark:border-white/10 rounded-[12px] flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-2.5 overflow-hidden flex-1 mr-2">
                          <span className="w-5 h-5 rounded-full bg-paper-white dark:bg-[#16181d] text-warm-ash dark:text-[#a1a1aa] border border-outline-variant dark:border-white/10 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-[8px] bg-paper-white dark:bg-[#16181d] border border-bone dark:border-white/10 text-espresso dark:text-[#fafafa] flex items-center justify-center shrink-0">
                            {isPdf ? <FileText className="w-4 h-4 text-status-queued" /> : <ImageIcon className="w-4 h-4 text-status-printing" />}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-aubergine-ink dark:text-[#fafafa] block truncate" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-stone dark:text-[#a1a1aa]">
                              {item.sizeFormatted} • {isPdf ? 'PDF document' : 'Image (aspect ratio kept on page)'}
                            </span>
                          </div>
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveFile(idx, 'up')}
                            disabled={idx === 0 || isMerging}
                            className="p-1 rounded-full hover:bg-paper-white dark:hover:bg-white/10 text-warm-ash dark:text-[#a1a1aa] disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveFile(idx, 'down')}
                            disabled={idx === fileList.length - 1 || isMerging}
                            className="p-1 rounded-full hover:bg-paper-white dark:hover:bg-white/10 text-warm-ash dark:text-[#a1a1aa] disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            disabled={isMerging}
                            className="p-1 rounded-full hover:bg-status-queued/10 text-stone dark:text-[#a1a1aa] hover:text-status-queued ml-1 transition-colors"
                            title="Remove File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Merged PDF Status Bar */}
                <div className="pt-2">
                  {isMerging ? (
                    <div className="p-3 bg-bone border border-outline-variant rounded-[12px] text-xs text-espresso flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Merging {fileList.length} files client-side with pdf-lib into single PDF...</span>
                    </div>
                  ) : mergedFile ? (
                    <div className="p-3 bg-status-ready/10 border border-status-ready/30 rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-status-ready shrink-0" />
                        <div>
                          <div className="font-semibold text-status-ready flex items-center space-x-1.5">
                            <span>Ready to Print: Single Merged PDF</span>
                            <span className="text-[11px] font-normal text-aubergine-ink">({fileSize})</span>
                          </div>
                          <div className="text-[11px] text-warm-ash">
                            Actual page count: <strong className="text-espresso font-bold">{pageCount} pages</strong> (Images fitted to A4 preserving aspect ratio)
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePreviewMergedPdf}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-paper-white hover:bg-bone text-espresso border border-espresso/20 rounded-full font-semibold text-xs shadow-sm transition-colors"
                        title="Preview generated PDF in browser"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Merged PDF</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: PRINT SPECIFICATIONS (SHOWN AFTER FILES ADDED) */}
          {fileList.length > 0 && (
            <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-bone dark:border-white/10">
                <span className="w-6 h-6 rounded-full bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa]">Print Specifications</h2>
              </div>

              {/* Number of Pages to Print (Actual page count from merged PDF) */}
              <div className="p-3 bg-linen border border-bone rounded-[12px] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-aubergine-ink">
                  <Info className="w-4 h-4 text-espresso" />
                  <div>
                    <span className="font-semibold">Actual Merged Page Count:</span>
                    <span className="text-warm-ash text-[11px] block">
                      Calculated directly from the merged PDF ({pageCount} {pageCount === 1 ? 'page' : 'pages'})
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={MAX_PAGE_COUNT}
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, Math.min(MAX_PAGE_COUNT, parseInt(e.target.value) || 1)))}
                    className="w-20 px-2 py-1.5 border border-outline/40 rounded-[12px] text-sm text-center font-semibold focus:ring-2 focus:ring-espresso focus:outline-none bg-paper-white"
                  />
                  <span className="text-warm-ash font-medium">pages</span>
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-xs font-semibold text-aubergine-ink mb-2">
                  Color Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setColorMode('bw')}
                    className={`p-3 rounded-[16px] cursor-pointer transition-all flex items-start justify-between ${
                      colorMode === 'bw'
                        ? 'ring-2 ring-espresso bg-linen/50'
                        : 'ring-1 ring-black/[0.06] hover:ring-outline/40 bg-paper-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-aubergine-ink">Black & White</div>
                      <div className="text-[11px] text-warm-ash mt-0.5">Assignments, notes & reports</div>
                      <div className="text-xs font-bold text-espresso mt-1">₹2.00 / page</div>
                    </div>
                    {colorMode === 'bw' && <Check className="w-4 h-4 text-espresso" />}
                  </div>

                  <div
                    onClick={() => setColorMode('color')}
                    className={`p-3 rounded-[16px] cursor-pointer transition-all flex items-start justify-between ${
                      colorMode === 'color'
                        ? 'ring-2 ring-espresso bg-linen/50'
                        : 'ring-1 ring-black/[0.06] hover:ring-outline/40 bg-paper-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-aubergine-ink">Color Print</div>
                      <div className="text-[11px] text-warm-ash mt-0.5">Charts, diagrams & cover pages</div>
                      <div className="text-xs font-bold text-espresso mt-1">₹10.00 / page</div>
                    </div>
                    {colorMode === 'color' && <Check className="w-4 h-4 text-espresso" />}
                  </div>
                </div>

                {/* Live Machine Fleet Availability for Selected Color Mode */}
                {(() => {
                  const printers = getStoredPrinters();
                  const targetType = colorMode === 'color' ? 'color' : 'bw';
                  const capablePrinters = printers.filter((p) => p.supportedTypes.includes(targetType));
                  const operationalPrinters = capablePrinters.filter(
                    (p) => p.status === 'online' || p.status === 'busy'
                  );
                  const disruptedPrinters = capablePrinters.filter((p) => isPrinterUnavailable(p.status));

                  if (operationalPrinters.length > 0) {
                    return (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>
                            <strong>{operationalPrinters[0].name}</strong> is Ready ({colorMode === 'color' ? 'Precision Color Laser' : 'High-Speed B&W Laser'})
                          </span>
                        </div>
                        {disruptedPrinters.length > 0 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            (Alternative bay operational)
                          </span>
                        )}
                      </div>
                    );
                  } else if (disruptedPrinters.length > 0) {
                    const firstDisrupted = disruptedPrinters[0];
                    return (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Notice on {firstDisrupted.name}: </span>
                          <span>
                            Currently {firstDisrupted.status.replace('_', ' ')}
                            {firstDisrupted.estimatedRecovery ? ` (ETA: ${firstDisrupted.estimatedRecovery})` : ''}.
                            Orders will queue and process as soon as staff completes servicing.
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Sides and Copies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Print Sides */}
                <div>
                  <label className="block text-xs font-semibold text-aubergine-ink mb-2">
                    Print Sides
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSides('double')}
                      className={`py-2 px-3 text-xs font-medium rounded-full border text-center transition-colors ${
                        sides === 'double'
                          ? 'border-espresso bg-espresso text-paper-white'
                          : 'border-outline/40 hover:bg-bone text-aubergine-ink'
                      }`}
                    >
                      Double Sided (Duplex)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSides('single')}
                      className={`py-2 px-3 text-xs font-medium rounded-full border text-center transition-colors ${
                        sides === 'single'
                          ? 'border-espresso bg-espresso text-paper-white'
                          : 'border-outline/40 hover:bg-bone text-aubergine-ink'
                      }`}
                    >
                      Single Sided
                    </button>
                  </div>
                </div>

                {/* Copies Stepper */}
                <div>
                  <label className="block text-xs font-semibold text-aubergine-ink mb-2">
                    Number of Copies
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="w-9 h-9 border border-outline/40 rounded-full bg-bone hover:bg-surface-container-high text-aubergine-ink font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-9 border border-outline/40 rounded-[12px] text-center text-sm font-semibold focus:ring-2 focus:ring-espresso focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 1)}
                      className="w-9 h-9 border border-outline/40 rounded-full bg-bone hover:bg-surface-container-high text-aubergine-ink font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-xs text-warm-ash pl-1 font-medium">set(s)</span>
                  </div>
                </div>
              </div>

              {/* Paper Type: Plain vs Photo Paper (+15 rs) */}
              <div>
                <label className="block text-xs font-semibold text-aubergine-ink mb-2">
                  Paper Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaperType('plain')}
                    className={`p-3 rounded-[16px] cursor-pointer transition-all flex items-start justify-between ${
                      paperType === 'plain'
                        ? 'ring-2 ring-espresso bg-linen/50'
                        : 'ring-1 ring-black/[0.06] hover:ring-outline/40 bg-paper-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-aubergine-ink">Plain Paper</div>
                      <div className="text-[11px] text-warm-ash mt-0.5">Standard 75 GSM paper</div>
                      <div className="text-xs font-bold text-status-ready mt-1">Included (Standard)</div>
                    </div>
                    {paperType === 'plain' && <Check className="w-4 h-4 text-espresso" />}
                  </div>

                  <div
                    onClick={() => setPaperType('photo')}
                    className={`p-3 rounded-[16px] cursor-pointer transition-all flex items-start justify-between ${
                      paperType === 'photo'
                        ? 'ring-2 ring-espresso bg-linen/50'
                        : 'ring-1 ring-black/[0.06] hover:ring-outline/40 bg-paper-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-aubergine-ink">Photo Paper</div>
                      <div className="text-[11px] text-warm-ash mt-0.5">Glossy high-resolution finish</div>
                      <div className="text-xs font-bold text-espresso mt-1">+₹15.00 / copy</div>
                    </div>
                    {paperType === 'photo' && <Check className="w-4 h-4 text-espresso" />}
                  </div>
                </div>
              </div>

              {/* Paper Size & Orientation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-aubergine-ink mb-1.5">
                    Paper Size
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs border border-outline/40 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none bg-paper-white"
                  >
                    <option value="A4">A4 (Standard Campus Paper)</option>
                    <option value="A3">A3 (Large Sheet - 2x Rate)</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-aubergine-ink mb-1.5">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs border border-outline/40 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none bg-paper-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {/* Urgent Priority Checkbox */}
              <div className="p-3 bg-status-queued/[0.05] border border-status-queued/20 rounded-[12px] flex items-center justify-between">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded-full border-outline/40 text-espresso focus:ring-espresso mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-semibold text-aubergine-ink">Urgent Priority Order (+₹10)</div>
                    <div className="text-[11px] text-warm-ash">Priority counter queue (ready in 10-15 minutes)</div>
                  </div>
                </label>
              </div>

              {/* Note for Operator */}
              <div>
                <label className="block text-xs font-semibold text-aubergine-ink mb-1">
                  Note for Operator (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please staple top left corner, or first page in color"
                  className="w-full p-2.5 text-xs border border-outline/40 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Estimate & Action (5/4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 sm:p-8 shadow-card sticky top-20 space-y-5">
            <h3 className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa] pb-3 border-b border-bone dark:border-white/10">
              Print Order Estimate
            </h3>

            {/* Student info */}
            <div className="py-3 border-b border-bone text-xs space-y-1">
              <div className="text-warm-ash">
                Student: <span className="font-semibold text-aubergine-ink">{user.name}</span>
              </div>
              <div className="text-warm-ash">
                Roll No: <span className="font-semibold text-aubergine-ink">{user.studentId || '250222'}</span>
              </div>
              <div className="text-warm-ash">
                Dept: <span className="text-aubergine-ink">{user.department || 'Campus Student'}</span>
              </div>
            </div>

            {/* Bill breakdown */}
            <div className="py-3 border-b border-bone space-y-2 text-xs">
              {!hasFile ? (
                <div className="py-4 text-center bg-linen rounded-[12px] border border-dashed border-bone p-3">
                  <div className="w-8 h-8 rounded-full bg-bone text-stone flex items-center justify-center mx-auto mb-1.5">
                    <Upload className="w-4 h-4 text-espresso" />
                  </div>
                  <div className="text-xs font-semibold text-aubergine-ink">No Document Uploaded</div>
                  <div className="text-[11px] text-warm-ash mt-0.5">
                    Upload your file to see page count and printing estimate
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-warm-ash">
                    <span>
                      Printing ({pageCount} pgs × {copies} × ₹{perPageRate})
                    </span>
                    <span className="font-medium text-aubergine-ink">₹{pagesCost}.00</span>
                  </div>

                  {photoPaperFee > 0 && (
                    <div className="flex justify-between text-warm-ash">
                      <span>Photo Paper ({copies} copy)</span>
                      <span className="font-medium text-aubergine-ink">₹{photoPaperFee}.00</span>
                    </div>
                  )}

                  {urgentFee > 0 && (
                    <div className="flex justify-between text-warm-ash">
                      <span>Urgent Fee</span>
                      <span className="font-medium text-aubergine-ink">₹{urgentFee}.00</span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2 border-t border-dashed border-bone flex justify-between items-baseline">
                <span className="text-sm font-semibold text-aubergine-ink">Total Amount</span>
                <span className={`text-2xl font-bold ${hasFile ? 'text-espresso' : 'text-stone'}`}>
                  {hasFile ? `₹${totalCost}.00` : '₹0.00'}
                </span>
              </div>
            </div>

            {/* Counter details */}
            <div className="py-3 border-b border-bone space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-warm-ash">
                <MapPin className="w-4 h-4 text-espresso shrink-0" />
                <span>Pickup: <strong className="text-aubergine-ink">AIT Xerox Shop (Shopping Complex)</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-warm-ash">
                <Clock className="w-4 h-4 text-status-ready shrink-0" />
                <span>ETA: <strong className="text-aubergine-ink">{isUrgent ? '10-15 mins' : '20-25 mins'}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-warm-ash">
                <CreditCard className="w-4 h-4 text-stone shrink-0" />
                <span>Payment via UPI QR or at Counter</span>
              </div>
            </div>

            {/* Proceed to Payment Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={!hasFile || isMerging || !!mergeError}
                className={`w-full py-2.5 px-4 rounded-full font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm ${
                  !hasFile || isMerging || !!mergeError
                    ? 'bg-bone text-stone cursor-not-allowed'
                    : 'bg-espresso hover:bg-espresso/90 active:bg-espresso/80 text-paper-white'
                }`}
              >
                <span>{hasFile ? `Proceed to Payment (₹${totalCost})` : 'Upload Document to Proceed'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!hasFile && (
                <div className="text-[11px] text-status-queued flex items-center justify-center space-x-1 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Upload your document or images to proceed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

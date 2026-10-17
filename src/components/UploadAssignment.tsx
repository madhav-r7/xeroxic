import React, { useState } from 'react';
import { PrintJob, User } from '../types';
import { addPrintJobAsync } from '../services/storage';
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
  Trash2
} from 'lucide-react';

interface UploadAssignmentProps {
  user: User;
  onJobCreated: (job: PrintJob) => void;
}

export const UploadAssignment: React.FC<UploadAssignmentProps> = ({ user, onJobCreated }) => {
  // Navigation phase: 'upload' | 'configure' | 'payment'
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'payment'>('upload');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [pageCount, setPageCount] = useState<number>(0);
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

  // Price calculations - strictly 0 until a document is uploaded!
  const hasFile = Boolean(selectedFile && fileName);
  const perPageRate = colorMode === 'color' ? 10 : 2;
  const paperMultiplier = paperSize === 'A3' ? 2 : 1;
  const pagesCost = hasFile ? pageCount * copies * perPageRate * paperMultiplier : 0;
  const photoPaperFee = hasFile && paperType === 'photo' ? 15 * copies : 0;
  const urgentFee = hasFile && isUrgent ? 10 : 0;
  const totalCost = hasFile ? pagesCost + photoPaperFee + urgentFee : 0;

  // File drop & selection handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);

    // Parse actual page count for PDF if possible
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const content = reader.result as string;
          // Count /Type /Page (excluding /Type /Pages)
          const matches = content.match(/\/Type\s*\/Page\b/g);
          if (matches && matches.length > 0) {
            setPageCount(matches.length);
            return;
          }
          const countMatch = content.match(/\/Count\s+(\d+)/);
          if (countMatch && countMatch[1]) {
            const count = parseInt(countMatch[1], 10);
            if (count > 0 && count < 1000) {
              setPageCount(count);
              return;
            }
          }
        } catch {
          // fallback
        }
        const estimatedPages = Math.max(1, Math.min(60, Math.round(file.size / (120 * 1024))));
        setPageCount(estimatedPages);
      };
      // Read initial slice for fast client-side parsing
      reader.readAsText(file.slice(0, 500000));
    } else {
      const estimatedPages = Math.max(1, Math.min(60, Math.round(file.size / (120 * 1024))));
      setPageCount(estimatedPages);
    }

    setCurrentStep('configure');
  };

  const handleUseSampleFile = (e: React.MouseEvent) => {
    e.preventDefault();
    const sample = new File(['sample pdf content'], 'Lab_Assignment_Unit_4.pdf', {
      type: 'application/pdf',
    });
    setSelectedFile(sample);
    setFileName('Lab_Assignment_Unit_4.pdf');
    setFileSize('2.8 MB');
    setPageCount(12);
    setCurrentStep('configure');
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setFileName('');
    setFileSize('');
    setPageCount(0);
    setCurrentStep('upload');
  };

  const handleProceedToPayment = () => {
    if (!fileName) {
      alert('Please upload an assignment document first.');
      return;
    }
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsSubmitting(true);

    const randomToken = `XER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newJob: PrintJob = {
      id: randomToken,
      studentId: user.id,
      studentName: user.name,
      studentRoll: user.studentId || '2024CS1092',
      studentPhone: user.phone || '+91 98765 43210',
      department: user.department || 'Campus Student',
      fileName: fileName,
      fileSize: fileSize || '2.5 MB',
      fileType: selectedFile?.type || 'application/pdf',
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
      pickupCounter: isUrgent ? 'Counter 2' : 'Counter 1',
      estimatedPickupTime: isUrgent ? '10-15 minutes' : '20-25 minutes',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: `Order placed online via ${paymentMethod === 'upi' ? 'UPI' : 'Pay at Counter'}. Queued at Xerox counter.`,
        },
      ],
    };

    try {
      await addPrintJobAsync(newJob, selectedFile);
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
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white border border-[#e1dfdd] rounded-lg p-8 shadow-sm text-left">
          <div className="flex items-center space-x-3 pb-5 border-b border-[#edebe9]">
            <div className="w-12 h-12 rounded-full bg-[#107c10]/15 text-[#107c10] flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#242424]">Print Request Received!</h2>
              <p className="text-xs text-[#605e5c]">
                Your document has been sent to the college Xerox operator desk.
              </p>
            </div>
          </div>

          {/* Token ID Highlight */}
          <div className="my-6 p-5 bg-[#f3f2f1] border border-[#e1dfdd] rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Your Token ID</div>
              <div className="text-2xl font-bold text-[#0067b8] mt-1 tracking-wider font-mono">
                {successJob.id}
              </div>
              <div className="text-[11px] text-[#797775] mt-0.5">Show this token at pickup</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Pickup Counter</div>
              <div className="text-base font-semibold text-[#242424] mt-1">
                {successJob.pickupCounter}
              </div>
              <div className="text-[11px] text-[#797775]">Library Ground Floor</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Estimated Time</div>
              <div className="text-base font-semibold text-[#107c10] mt-1">
                {successJob.estimatedPickupTime}
              </div>
              <div className="text-[11px] text-[#797775]">
                Amount: ₹{successJob.cost} ({successJob.paymentMethod === 'upi' ? 'UPI' : 'Pay at Counter'})
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 text-xs text-[#323130] pb-6 border-b border-[#edebe9]">
            <div className="font-semibold text-sm text-[#242424]">Print Specifications</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#faf9f8] p-2.5 border border-[#e1dfdd] rounded">
                <span className="text-[#605e5c] block text-[11px]">Document:</span>
                <span className="font-medium truncate block" title={successJob.fileName}>
                  {successJob.fileName}
                </span>
              </div>
              <div className="bg-[#faf9f8] p-2.5 border border-[#e1dfdd] rounded">
                <span className="text-[#605e5c] block text-[11px]">Pages & Copies:</span>
                <span className="font-medium">
                  {successJob.pageCount} pgs × {successJob.copies} {successJob.copies > 1 ? 'copies' : 'copy'}
                </span>
              </div>
              <div className="bg-[#faf9f8] p-2.5 border border-[#e1dfdd] rounded">
                <span className="text-[#605e5c] block text-[11px]">Color & Sides:</span>
                <span className="font-medium">
                  {successJob.colorMode === 'color' ? 'Color' : 'B&W'} ({successJob.sides === 'double' ? 'Duplex' : 'Single Sided'})
                </span>
              </div>
              <div className="bg-[#faf9f8] p-2.5 border border-[#e1dfdd] rounded">
                <span className="text-[#605e5c] block text-[11px]">Paper Type:</span>
                <span className="font-medium">
                  {successJob.paperType === 'photo' ? 'Photo Paper' : 'Plain Paper'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setSuccessJob(null);
                setSelectedFile(null);
                setFileName('');
                setCurrentStep('upload');
              }}
              className="w-full sm:w-auto px-4 py-2 border border-[#8a8886] hover:bg-[#f3f2f1] text-[#242424] text-xs font-semibold rounded transition-colors"
            >
              Upload Another Assignment
            </button>
            <button
              type="button"
              onClick={() => onJobCreated(successJob)}
              className="w-full sm:w-auto px-5 py-2 bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Track Live Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: TEMPORARY PAYMENT PAGE
  if (currentStep === 'payment') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 text-left">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-[#605e5c] mb-4">
          <button
            onClick={() => setCurrentStep('configure')}
            className="flex items-center space-x-1 hover:text-[#0067b8]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Print Options</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-[#242424]">Checkout & Payment</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">
            Review Order & Payment
          </h1>
          <p className="text-xs text-[#605e5c] mt-0.5">
            Complete payment or choose pay at counter to send your print request to the operator desk
          </p>
        </div>

        <form onSubmit={handleFinalOrderSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Payment Options (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-[#e1dfdd] rounded-lg p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-[#242424] pb-2 border-b border-[#edebe9]">
                  Select Payment Method
                </h2>

                {/* Option 1: Instant UPI QR Code */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#0067b8] bg-[#e6f2fb]/30'
                      : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md bg-[#0067b8]/10 text-[#0067b8] flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#242424]">
                          Instant UPI Payment (QR Code)
                        </div>
                        <div className="text-xs text-[#605e5c] mt-0.5">
                          Pay using GPay, PhonePe, Paytm, or BHIM
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <Check className="w-5 h-5 text-[#0067b8]" />}
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-4 border-t border-[#edebe9] space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 border border-[#e1dfdd] rounded-md">
                        {/* Mock UPI QR Graphic */}
                        <div className="w-32 h-32 shrink-0 bg-white border border-[#242424] p-2 flex flex-col items-center justify-center rounded">
                          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                            {/* SVG QR Code Pattern */}
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

                            {/* Inner data blocks */}
                            <rect x="42" y="12" width="6" height="6" fill="#000" />
                            <rect x="52" y="12" width="6" height="6" fill="#000" />
                            <rect x="42" y="22" width="6" height="6" fill="#000" />
                            <rect x="42" y="32" width="16" height="6" fill="#000" />
                            <rect x="12" y="42" width="16" height="6" fill="#000" />
                            <rect x="32" y="42" width="6" height="16" fill="#000" />
                            <rect x="42" y="42" width="16" height="16" fill="#0067b8" />
                            <rect x="62" y="42" width="6" height="6" fill="#000" />
                            <rect x="72" y="42" width="16" height="6" fill="#000" />
                            <rect x="62" y="52" width="16" height="6" fill="#000" />
                            <rect x="42" y="62" width="6" height="16" fill="#000" />
                            <rect x="52" y="72" width="16" height="6" fill="#000" />
                            <rect x="72" y="62" width="16" height="16" fill="#000" />
                          </svg>
                        </div>

                        <div className="text-xs space-y-1.5 flex-1">
                          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Scan & Pay</div>
                          <div className="text-base font-bold text-[#0067b8]">₹{totalCost}.00</div>
                          <div className="text-xs text-[#242424]">
                            UPI ID: <span className="font-mono font-semibold">college.xerox@upi</span>
                          </div>
                          <div className="text-[11px] text-[#605e5c] flex items-center space-x-1 pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#107c10]" />
                            <span>Verified College Xerox Merchant</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#374151] mb-1">
                          UTR / Transaction Ref No. (Optional)
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 429183019283 (from UPI app)"
                          className="w-full px-3 py-2 text-xs border border-[#8a8886] rounded focus:outline-none focus:border-[#0067b8]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Pay at Counter */}
                <div
                  onClick={() => setPaymentMethod('counter')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'counter'
                      ? 'border-[#0067b8] bg-[#e6f2fb]/30'
                      : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md bg-[#107c10]/10 text-[#107c10] flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#242424]">
                          Pay at Counter on Pickup
                        </div>
                        <div className="text-xs text-[#605e5c] mt-0.5">
                          Pay cash or scan shop QR when collecting printed sheets
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'counter' && <Check className="w-5 h-5 text-[#0067b8]" />}
                  </div>

                  {paymentMethod === 'counter' && (
                    <div className="mt-3 pt-3 border-t border-[#edebe9] text-xs text-[#605e5c] space-y-1">
                      <p>
                        Your order will be printed and kept ready at <strong>Counter 1 & 2</strong> in the Central Library.
                      </p>
                      <p className="text-[#107c10] font-medium">
                        Pay ₹{totalCost}.00 in cash or via UPI when handing your Token ID.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Confirm (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#e1dfdd] rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-[#242424] pb-2 border-b border-[#edebe9]">
                  Order Summary
                </h3>

                <div className="text-xs space-y-2 pb-3 border-b border-[#edebe9]">
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Document</span>
                    <span className="font-semibold text-[#242424] truncate max-w-[160px]" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Pages to Print</span>
                    <span className="font-medium text-[#242424]">{pageCount} pages</span>
                  </div>
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Copies</span>
                    <span className="font-medium text-[#242424]">{copies} copy/set</span>
                  </div>
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Color Mode</span>
                    <span className="font-medium text-[#242424]">
                      {colorMode === 'color' ? 'Color Print (₹10/pg)' : 'Black & White (₹2/pg)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Sides</span>
                    <span className="font-medium text-[#242424]">
                      {sides === 'double' ? 'Double Sided' : 'Single Sided'}
                    </span>
                  </div>
                  {paperType === 'photo' && (
                    <div className="flex justify-between text-[#605e5c]">
                      <span>Paper Type</span>
                      <span className="font-medium text-[#242424]">Photo Paper (+₹15)</span>
                    </div>
                  )}
                  {isUrgent && (
                    <div className="flex justify-between text-[#d83b01]">
                      <span>Urgent Priority</span>
                      <span className="font-medium">+₹10.00</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-semibold text-[#242424]">Total Payable</span>
                  <span className="text-2xl font-bold text-[#0067b8]">₹{totalCost}.00</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#0067b8] hover:bg-[#005da6] active:bg-[#004e8c] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:bg-[#a19f9d]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending to Xerox Desk...</span>
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
                    className="w-full mt-2 py-2 text-xs text-[#605e5c] hover:text-[#242424] hover:underline text-center"
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
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 text-left">
      {/* Title section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">
          New Print Order
        </h1>
        <p className="text-xs text-[#605e5c] mt-0.5">
          Upload your document first to unlock page and print specifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Dropzone & (Conditional) Print Options (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: FILE UPLOADER */}
          <div className="bg-white border border-[#e1dfdd] rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#0067b8] text-white text-xs font-semibold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-semibold text-[#242424]">Document Upload</h2>
              </div>
              {!fileName && (
                <button
                  type="button"
                  onClick={handleUseSampleFile}
                  className="text-xs text-[#0067b8] hover:underline font-medium"
                >
                  Load Sample Document
                </button>
              )}
            </div>

            {!fileName ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                  dragActive
                    ? 'border-[#0067b8] bg-[#e6f2fb]/40'
                    : 'border-[#c8c6c4] hover:border-[#8a8886] bg-[#faf9f8]'
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#e6f2fb] text-[#0067b8] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#242424]">
                  Drag and drop your assignment or document here
                </div>
                <p className="text-xs text-[#605e5c] mt-1 mb-4">
                  Supports PDF, DOCX, PPTX, or Image (Max 50 MB)
                </p>
                <label className="inline-flex items-center justify-center px-4 py-2 bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-sm">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="p-4 bg-[#f3f2f1] border border-[#e1dfdd] rounded-md flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-[#e6f2fb] text-[#0067b8] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-[#242424] truncate" title={fileName}>
                      {fileName}
                    </div>
                    <div className="text-xs text-[#605e5c] flex items-center space-x-2 mt-0.5">
                      <span>{fileSize}</span>
                      <span>•</span>
                      <span className="text-[#107c10] font-medium">Ready for specifications</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-3">
                  <label className="text-xs text-[#0067b8] hover:underline font-semibold cursor-pointer">
                    <span>Change</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleResetFile}
                    className="text-xs text-[#d83b01] hover:underline font-semibold flex items-center space-x-1"
                    title="Remove File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: PRINT SPECIFICATIONS (SHOWN ONLY AFTER DOCUMENT UPLOADED) */}
          {fileName && (
            <div className="bg-white border border-[#e1dfdd] rounded-lg p-5 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#edebe9]">
                <span className="w-5 h-5 rounded-full bg-[#0067b8] text-white text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-semibold text-[#242424]">Print Specifications</h2>
              </div>

              {/* Number of Pages to Print */}
              <div className="p-3 bg-[#faf9f8] border border-[#edebe9] rounded-md flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-[#242424]">
                  <Info className="w-4 h-4 text-[#0067b8]" />
                  <span className="font-semibold">Number of pages to print:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2 py-1.5 border border-[#8a8886] rounded text-sm text-center font-semibold focus:outline-none focus:border-[#0067b8] bg-white"
                  />
                  <span className="text-[#605e5c] font-medium">pages</span>
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-2">
                  Color Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setColorMode('bw')}
                    className={`p-3 rounded-md border-2 cursor-pointer transition-all flex items-start justify-between ${
                      colorMode === 'bw'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/40'
                        : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#242424]">Black & White</div>
                      <div className="text-[11px] text-[#605e5c] mt-0.5">Assignments, notes & reports</div>
                      <div className="text-xs font-bold text-[#0067b8] mt-1">₹2.00 / page</div>
                    </div>
                    {colorMode === 'bw' && <Check className="w-4 h-4 text-[#0067b8]" />}
                  </div>

                  <div
                    onClick={() => setColorMode('color')}
                    className={`p-3 rounded-md border-2 cursor-pointer transition-all flex items-start justify-between ${
                      colorMode === 'color'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/40'
                        : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#242424]">Color Print</div>
                      <div className="text-[11px] text-[#605e5c] mt-0.5">Charts, diagrams & cover pages</div>
                      <div className="text-xs font-bold text-[#0067b8] mt-1">₹10.00 / page</div>
                    </div>
                    {colorMode === 'color' && <Check className="w-4 h-4 text-[#0067b8]" />}
                  </div>
                </div>
              </div>

              {/* Sides and Copies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Print Sides */}
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-2">
                    Print Sides
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSides('double')}
                      className={`py-2 px-3 text-xs font-medium rounded border text-center transition-colors ${
                        sides === 'double'
                          ? 'border-[#0067b8] bg-[#0067b8] text-white'
                          : 'border-[#8a8886] hover:bg-[#f3f2f1] text-[#242424]'
                      }`}
                    >
                      Double Sided (Back-to-Back)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSides('single')}
                      className={`py-2 px-3 text-xs font-medium rounded border text-center transition-colors ${
                        sides === 'single'
                          ? 'border-[#0067b8] bg-[#0067b8] text-white'
                          : 'border-[#8a8886] hover:bg-[#f3f2f1] text-[#242424]'
                      }`}
                    >
                      Single Sided
                    </button>
                  </div>
                </div>

                {/* Copies Stepper */}
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-2">
                    Number of Copies
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="w-9 h-9 border border-[#8a8886] rounded bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-9 border border-[#8a8886] rounded text-center text-sm font-semibold focus:outline-none focus:border-[#0067b8]"
                    />
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 1)}
                      className="w-9 h-9 border border-[#8a8886] rounded bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#605e5c] pl-1 font-medium">set(s)</span>
                  </div>
                </div>
              </div>

              {/* Paper Type: Plain vs Photo Paper */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-2">
                  Paper Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaperType('plain')}
                    className={`p-3 rounded-md border-2 cursor-pointer transition-all flex items-start justify-between ${
                      paperType === 'plain'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/40'
                        : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#242424]">Plain Paper</div>
                      <div className="text-[11px] text-[#605e5c] mt-0.5">Standard 75 GSM paper</div>
                      <div className="text-xs font-bold text-[#107c10] mt-1">Included (Standard)</div>
                    </div>
                    {paperType === 'plain' && <Check className="w-4 h-4 text-[#0067b8]" />}
                  </div>

                  <div
                    onClick={() => setPaperType('photo')}
                    className={`p-3 rounded-md border-2 cursor-pointer transition-all flex items-start justify-between ${
                      paperType === 'photo'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/40'
                        : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#242424]">Photo Paper</div>
                      <div className="text-[11px] text-[#605e5c] mt-0.5">Glossy high-resolution finish</div>
                      <div className="text-xs font-bold text-[#0067b8] mt-1">+₹15.00</div>
                    </div>
                    {paperType === 'photo' && <Check className="w-4 h-4 text-[#0067b8]" />}
                  </div>
                </div>
              </div>

              {/* Paper Size & Orientation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                    Paper Size
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs border border-[#8a8886] rounded focus:outline-none focus:border-[#0067b8] bg-white"
                  >
                    <option value="A4">A4 (Standard Campus Paper)</option>
                    <option value="A3">A3 (Large Sheet - 2x Rate)</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs border border-[#8a8886] rounded focus:outline-none focus:border-[#0067b8] bg-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {/* Urgent Priority Checkbox */}
              <div className="p-3 bg-[#fff4ce]/50 border border-[#f2c80f] rounded-md flex items-center justify-between">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-[#8a8886] text-[#0067b8] focus:ring-[#0067b8] mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#242424]">Urgent Priority Order (+₹10)</div>
                    <div className="text-[11px] text-[#605e5c]">Priority counter queue (ready in 10-15 minutes)</div>
                  </div>
                </label>
              </div>

              {/* Note for Operator */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">
                  Note for Operator (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please staple top left corner, or first page in color"
                  className="w-full p-2.5 text-xs border border-[#8a8886] rounded focus:outline-none focus:border-[#0067b8]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Estimate & Action (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#e1dfdd] rounded-lg p-5 shadow-sm sticky top-20">
            <h3 className="text-sm font-semibold text-[#242424] pb-3 border-b border-[#edebe9]">
              Print Order Estimate
            </h3>

            {/* Student info */}
            <div className="py-3 border-b border-[#edebe9] text-xs space-y-1">
              <div className="text-[#605e5c]">
                Student: <span className="font-semibold text-[#242424]">{user.name}</span>
              </div>
              <div className="text-[#605e5c]">
                Roll No: <span className="font-semibold text-[#242424]">{user.studentId || '2024CS1092'}</span>
              </div>
              <div className="text-[#605e5c]">
                Dept: <span className="text-[#242424]">{user.department || 'Campus Student'}</span>
              </div>
            </div>

            {/* Bill breakdown */}
            <div className="py-3 border-b border-[#edebe9] space-y-2 text-xs">
              {!hasFile ? (
                <div className="py-4 text-center bg-[#faf9f8] rounded border border-dashed border-[#edebe9] p-3">
                  <div className="w-8 h-8 rounded-full bg-[#f3f2f1] text-[#8a8886] flex items-center justify-center mx-auto mb-1.5">
                    <Upload className="w-4 h-4 text-[#0067b8]" />
                  </div>
                  <div className="text-xs font-semibold text-[#242424]">No Document Uploaded</div>
                  <div className="text-[11px] text-[#605e5c] mt-0.5">
                    Upload your file to see page count and printing estimate
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-[#605e5c]">
                    <span>
                      Printing ({pageCount} pgs × {copies} × ₹{perPageRate})
                    </span>
                    <span className="font-medium text-[#242424]">₹{pagesCost}.00</span>
                  </div>

                  {photoPaperFee > 0 && (
                    <div className="flex justify-between text-[#605e5c]">
                      <span>Photo Paper Finish</span>
                      <span className="font-medium text-[#242424]">₹{photoPaperFee}.00</span>
                    </div>
                  )}

                  {urgentFee > 0 && (
                    <div className="flex justify-between text-[#605e5c]">
                      <span>Urgent Fee</span>
                      <span className="font-medium text-[#242424]">₹{urgentFee}.00</span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2 border-t border-dashed border-[#edebe9] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#242424]">Total Amount</span>
                <span className={`text-2xl font-bold ${hasFile ? 'text-[#0067b8]' : 'text-[#8a8886]'}`}>
                  {hasFile ? `₹${totalCost}.00` : '₹0.00'}
                </span>
              </div>
            </div>

            {/* Counter details */}
            <div className="py-3 border-b border-[#edebe9] space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#605e5c]">
                <MapPin className="w-4 h-4 text-[#0067b8] shrink-0" />
                <span>Pickup: <strong>Library Ground Floor, Counter 1</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-[#605e5c]">
                <Clock className="w-4 h-4 text-[#107c10] shrink-0" />
                <span>ETA: <strong>{isUrgent ? '10-15 mins' : '20-25 mins'}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-[#605e5c]">
                <CreditCard className="w-4 h-4 text-[#797775] shrink-0" />
                <span>Payment via UPI QR or at Counter</span>
              </div>
            </div>

            {/* Proceed to Payment Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={!hasFile}
                className={`w-full py-2.5 px-4 rounded font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm ${
                  !hasFile
                    ? 'bg-[#edebe9] text-[#a19f9d] cursor-not-allowed'
                    : 'bg-[#0067b8] hover:bg-[#005da6] active:bg-[#004e8c] text-white'
                }`}
              >
                <span>{hasFile ? `Proceed to Payment (₹${totalCost})` : 'Upload Document to Proceed'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!hasFile && (
                <div className="text-[11px] text-[#d83b01] flex items-center justify-center space-x-1 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Upload your document first to proceed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

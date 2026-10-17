import React, { useState } from 'react';
import { PrintJob, User } from '../types';
import { addPrintJob } from '../services/storage';
import {
  Upload,
  Check,
  CreditCard,
  Clock,
  MapPin,
  AlertCircle,
  FileCheck,
  Info,
  FileText
} from 'lucide-react';

interface UploadAssignmentProps {
  user: User;
  onJobCreated: (job: PrintJob) => void;
}

export const UploadAssignment: React.FC<UploadAssignmentProps> = ({ user, onJobCreated }) => {
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [pageCount, setPageCount] = useState<number>(8);
  const [dragActive, setDragActive] = useState(false);

  // Print configuration state
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [copies, setCopies] = useState<number>(1);
  const [sides, setSides] = useState<'single' | 'double'>('double');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Letter'>('A4');
  const [paperType, setPaperType] = useState<'plain' | 'photo'>('plain');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [binding, setBinding] = useState<'none' | 'staple' | 'spiral' | 'hardcover'>('staple');
  const [isUrgent, setIsUrgent] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successJob, setSuccessJob] = useState<PrintJob | null>(null);

  // Price calculations
  const perPageRate = colorMode === 'color' ? 10 : 2;
  const paperMultiplier = paperSize === 'A3' ? 2 : 1;
  const pagesCost = pageCount * copies * perPageRate * paperMultiplier;

  const photoPaperFee = paperType === 'photo' ? 15 * copies : 0;

  let bindingCost = 0;
  if (binding === 'spiral') bindingCost = 25;
  if (binding === 'hardcover') bindingCost = 120;

  const urgentFee = isUrgent ? 10 : 0;
  const totalCost = pagesCost + photoPaperFee + bindingCost + urgentFee;

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
    const estimatedPages = Math.max(2, Math.min(60, Math.round(file.size / (100 * 1024))));
    setPageCount(estimatedPages || 8);
  };

  const handleUseSampleFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setFileName('Lab_Assignment_Unit_4.pdf');
    setFileSize('2.8 MB');
    setPageCount(12);
    setSelectedFile(new File(['sample'], 'Lab_Assignment_Unit_4.pdf', { type: 'application/pdf' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      alert('Please upload an assignment document first.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomToken = `XER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const newJob: PrintJob = {
        id: randomToken,
        studentId: user.id,
        studentName: user.name,
        studentRoll: user.studentId || '2024CS1092',
        studentPhone: user.phone || '+91 98765 43210',
        department: user.department || 'Computer Science & Engineering',
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
        binding: binding,
        isUrgent: isUrgent,
        instructions: instructions.trim(),
        cost: totalCost,
        status: 'submitted',
        createdAt: now,
        updatedAt: now,
        pickupCounter: isUrgent ? 'Counter 2' : 'Counter 1',
        estimatedPickupTime: isUrgent ? '10-15 minutes' : '20-25 minutes',
        statusHistory: [
          {
            status: 'submitted',
            timestamp: now,
            note: 'Order placed in queue at Xerox shop'
          }
        ]
      };

      addPrintJob(newJob, selectedFile);
      setIsSubmitting(false);
      setSuccessJob(newJob);
    }, 600);
  };

  if (successJob) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white border border-[#e1dfdd] rounded-[2px] p-8 shadow-sm">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#edebe9]">
            <div className="w-10 h-10 rounded-full bg-[#107c10]/10 text-[#107c10] flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#242424]">Print Job Placed in Queue</h2>
              <p className="text-xs text-[#605e5c]">Received at the college Xerox counter</p>
            </div>
          </div>

          <div className="my-6 p-4 bg-[#f3f2f1] border border-[#e1dfdd] rounded-[2px] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Your Token ID</div>
              <div className="text-lg font-bold text-[#0067b8] mt-0.5 tracking-wider">{successJob.id}</div>
              <div className="text-[11px] text-[#797775]">Show this token at the counter</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Pickup Counter</div>
              <div className="text-sm font-semibold text-[#242424] mt-0.5">{successJob.pickupCounter}</div>
              <div className="text-[11px] text-[#797775]">Library Ground Floor</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Estimated Time</div>
              <div className="text-sm font-semibold text-[#107c10] mt-0.5">{successJob.estimatedPickupTime}</div>
              <div className="text-[11px] text-[#797775]">Total: ₹{successJob.cost}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#323130] pb-6 border-b border-[#edebe9]">
            <div className="font-semibold text-sm text-[#242424] mb-2">Print Details</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-2 border border-[#e1dfdd]">
                <span className="text-[#605e5c] block">File:</span>
                <span className="font-medium truncate block">{successJob.fileName}</span>
              </div>
              <div className="bg-white p-2 border border-[#e1dfdd]">
                <span className="text-[#605e5c] block">Pages & Copies:</span>
                <span className="font-medium">{successJob.pageCount} pgs × {successJob.copies} copy</span>
              </div>
              <div className="bg-white p-2 border border-[#e1dfdd]">
                <span className="text-[#605e5c] block">Print Mode:</span>
                <span className="font-medium">{successJob.colorMode === 'color' ? 'Color' : 'B&W'} ({successJob.sides})</span>
              </div>
              <div className="bg-white p-2 border border-[#e1dfdd]">
                <span className="text-[#605e5c] block">Paper Type:</span>
                <span className="font-medium">{successJob.paperType === 'photo' ? 'Photo Paper (+₹15)' : 'Plain Paper'}</span>
              </div>
              <div className="bg-white p-2 border border-[#e1dfdd]">
                <span className="text-[#605e5c] block">Binding:</span>
                <span className="font-medium capitalize">{successJob.binding}</span>
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
              }}
              className="w-full sm:w-auto px-4 py-2 border border-[#8a8886] hover:bg-[#f3f2f1] text-[#242424] text-xs font-semibold rounded-[2px] transition-colors"
            >
              Upload Another Assignment
            </button>
            <button
              type="button"
              onClick={() => onJobCreated(successJob)}
              className="w-full sm:w-auto px-5 py-2 bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold rounded-[2px] transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Track Live Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Title section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">
          New Print Order
        </h1>
        <p className="text-xs text-[#605e5c] mt-0.5">
          Upload your assignment, choose print options, and pick it up at the Xerox counter
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: File Upload & Print Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: File Uploader Card */}
            <div className="bg-white border border-[#e1dfdd] rounded-[2px] p-5 shadow-sm">
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
                  className={`border-2 border-dashed rounded-[4px] p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-[#0067b8] bg-[#e6f2fb]/40'
                      : 'border-[#c8c6c4] hover:border-[#8a8886] bg-[#faf9f8]'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#e6f2fb] text-[#0067b8] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-[#242424]">
                    Drag and drop your assignment here
                  </div>
                  <p className="text-xs text-[#605e5c] mt-1 mb-4">
                    PDF, DOCX, PPTX, or Image (Max 50 MB)
                  </p>
                  <label className="inline-flex items-center justify-center px-4 py-2 bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold rounded-[2px] cursor-pointer transition-colors shadow-sm">
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
                <div className="p-4 bg-[#f3f2f1] border border-[#e1dfdd] rounded-[2px] flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded bg-[#e6f2fb] text-[#0067b8] flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-[#242424] truncate">{fileName}</div>
                      <div className="text-xs text-[#605e5c] flex items-center space-x-2 mt-0.5">
                        <span>{fileSize}</span>
                        <span>•</span>
                        <span className="text-[#107c10] font-medium">Ready</span>
                      </div>
                    </div>
                  </div>
                  <label className="text-xs text-[#0067b8] hover:underline font-semibold cursor-pointer shrink-0 ml-3">
                    <span>Replace</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}

              {/* Page count */}
              <div className="mt-4 pt-4 border-t border-[#edebe9] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-1.5 text-[#605e5c]">
                  <Info className="w-4 h-4 text-[#0067b8]" />
                  <span>Number of pages to print:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2 py-1 border border-[#8a8886] rounded-[2px] text-sm text-center font-semibold focus:outline-none focus:border-[#0067b8]"
                  />
                  <span className="text-[#605e5c]">pages</span>
                </div>
              </div>
            </div>

            {/* Step 2: Print Configuration */}
            <div className="bg-white border border-[#e1dfdd] rounded-[2px] p-5 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#edebe9]">
                <span className="w-5 h-5 rounded-full bg-[#0067b8] text-white text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-semibold text-[#242424]">Print Specifications</h2>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-2">
                  Color Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setColorMode('bw')}
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all flex items-start justify-between ${
                      colorMode === 'bw'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/50 ring-1 ring-[#0067b8]'
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
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all flex items-start justify-between ${
                      colorMode === 'color'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/50 ring-1 ring-[#0067b8]'
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

              {/* Paper Type: Plain vs Photo Paper */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-2">
                  Paper Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaperType('plain')}
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all flex items-start justify-between ${
                      paperType === 'plain'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/50 ring-1 ring-[#0067b8]'
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
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all flex items-start justify-between ${
                      paperType === 'photo'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/50 ring-1 ring-[#0067b8]'
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
                      className={`py-2 px-3 text-xs font-medium rounded-[2px] border text-center transition-colors ${
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
                      className={`py-2 px-3 text-xs font-medium rounded-[2px] border text-center transition-colors ${
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
                      className="w-9 h-9 border border-[#8a8886] rounded-[2px] bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-9 border border-[#8a8886] rounded-[2px] text-center text-sm font-semibold focus:outline-none focus:border-[#0067b8]"
                    />
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 1)}
                      className="w-9 h-9 border border-[#8a8886] rounded-[2px] bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#605e5c] pl-2">set(s)</span>
                  </div>
                </div>
              </div>

              {/* Paper Size & Orientation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-2">
                    Paper Size
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full py-1.5 px-3 text-xs border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8] bg-white"
                  >
                    <option value="A4">A4 (Standard Paper)</option>
                    <option value="A3">A3 (Large Sheet - 2x Rate)</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-2">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full py-1.5 px-3 text-xs border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8] bg-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {/* Finishing & Binding */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-2">
                  Binding Option
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div
                    onClick={() => setBinding('none')}
                    className={`p-2.5 rounded-[2px] border cursor-pointer text-center transition-all ${
                      binding === 'none'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/60 font-semibold'
                        : 'border-[#edebe9] hover:border-[#a19f9d]'
                    }`}
                  >
                    <div className="text-xs text-[#242424]">Loose Sheets</div>
                    <div className="text-[10px] text-[#605e5c] mt-0.5">Free</div>
                  </div>
                  <div
                    onClick={() => setBinding('staple')}
                    className={`p-2.5 rounded-[2px] border cursor-pointer text-center transition-all ${
                      binding === 'staple'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/60 font-semibold'
                        : 'border-[#edebe9] hover:border-[#a19f9d]'
                    }`}
                  >
                    <div className="text-xs text-[#242424]">Corner Staple</div>
                    <div className="text-[10px] text-[#107c10] font-semibold mt-0.5">Free</div>
                  </div>
                  <div
                    onClick={() => setBinding('spiral')}
                    className={`p-2.5 rounded-[2px] border cursor-pointer text-center transition-all ${
                      binding === 'spiral'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/60 font-semibold'
                        : 'border-[#edebe9] hover:border-[#a19f9d]'
                    }`}
                  >
                    <div className="text-xs text-[#242424]">Spiral Binding</div>
                    <div className="text-[10px] text-[#0067b8] font-bold mt-0.5">+₹25.00</div>
                  </div>
                  <div
                    onClick={() => setBinding('hardcover')}
                    className={`p-2.5 rounded-[2px] border cursor-pointer text-center transition-all ${
                      binding === 'hardcover'
                        ? 'border-[#0067b8] bg-[#e6f2fb]/60 font-semibold'
                        : 'border-[#edebe9] hover:border-[#a19f9d]'
                    }`}
                  >
                    <div className="text-xs text-[#242424]">Hardcover Book</div>
                    <div className="text-[10px] text-[#0067b8] font-bold mt-0.5">+₹120.00</div>
                  </div>
                </div>
              </div>

              {/* Express Queue Checkbox */}
              <div className="p-3 bg-[#fff4ce]/50 border border-[#f2c80f] rounded-[2px] flex items-center justify-between">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-[#8a8886] text-[#0067b8] focus:ring-[#0067b8] mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#242424]">Urgent Order (+₹10)</div>
                    <div className="text-[11px] text-[#605e5c]">Priority queue (ready in 10-15 minutes)</div>
                  </div>
                </label>
              </div>

              {/* Instructions for Operator */}
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">
                  Note for Operator (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please staple top left corner, or first page color and rest B&W"
                  className="w-full p-2.5 text-xs border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Card */}
          <div className="space-y-4">
            <div className="bg-white border border-[#e1dfdd] rounded-[2px] p-5 shadow-sm sticky top-20">
              <h3 className="text-sm font-semibold text-[#242424] pb-3 border-b border-[#edebe9]">
                Print Order Estimate
              </h3>

              {/* Student info card */}
              <div className="py-3 border-b border-[#edebe9] text-xs space-y-1">
                <div className="text-[#605e5c]">Student: <span className="font-semibold text-[#242424]">{user.name}</span></div>
                <div className="text-[#605e5c]">Roll No: <span className="font-semibold text-[#242424]">{user.studentId}</span></div>
                <div className="text-[#605e5c]">Dept: <span className="text-[#242424]">{user.department}</span></div>
              </div>

              {/* Bill breakdown */}
              <div className="py-3 border-b border-[#edebe9] space-y-2 text-xs">
                <div className="flex justify-between text-[#605e5c]">
                  <span>Printing ({pageCount} pgs × {copies} set × ₹{perPageRate})</span>
                  <span className="font-medium text-[#242424]">₹{pagesCost}.00</span>
                </div>
                {photoPaperFee > 0 && (
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Photo Paper Finish</span>
                    <span className="font-medium text-[#242424]">₹{photoPaperFee}.00</span>
                  </div>
                )}
                {bindingCost > 0 && (
                  <div className="flex justify-between text-[#605e5c]">
                    <span className="capitalize">{binding} Binding</span>
                    <span className="font-medium text-[#242424]">₹{bindingCost}.00</span>
                  </div>
                )}
                {urgentFee > 0 && (
                  <div className="flex justify-between text-[#605e5c]">
                    <span>Urgent Fee</span>
                    <span className="font-medium text-[#242424]">₹{urgentFee}.00</span>
                  </div>
                )}
                <div className="pt-2 border-t border-dashed border-[#edebe9] flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-[#242424]">Total Amount</span>
                  <span className="text-xl font-bold text-[#0067b8]">₹{totalCost}.00</span>
                </div>
              </div>

              {/* Counter and ETA */}
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
                  <span>Pay via UPI or Cash when collecting</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !fileName}
                  className={`w-full py-2.5 px-4 rounded-[2px] font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm ${
                    !fileName
                      ? 'bg-[#edebe9] text-[#a19f9d] cursor-not-allowed'
                      : isSubmitting
                      ? 'bg-[#005da6] text-white cursor-wait'
                      : 'bg-[#0067b8] hover:bg-[#005da6] text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{isSubmitting ? 'Placing Order...' : 'Submit Print Order'}</span>
                </button>

                {!fileName && (
                  <div className="text-[11px] text-[#d83b01] flex items-center justify-center space-x-1 mt-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Upload a document to enable order submission</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

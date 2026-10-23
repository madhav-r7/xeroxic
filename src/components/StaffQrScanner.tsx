import React, { useState, useEffect, useRef } from 'react';
import { PrintJob, User } from '../types';
import { parseQrPayload } from '../utils/qrCode';
import { findJobByIdOrToken, confirmStaffJobCollection } from '../services/storage';
import { soundManager } from '../utils/audio';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  QrCode,
  Search,
  RotateCcw,
  PackageCheck,
  Printer,
  Clock,
  ShieldCheck,
  FileText,
  UserCheck,
  Loader2,
  XCircle,
  ArrowRight,
  Upload,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Info,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface StaffQrScannerProps {
  user: User;
  onNavigate?: (tab: string) => void;
  onRefresh?: () => void;
}

interface CameraOption {
  id: string;
  label: string;
}

export const StaffQrScanner: React.FC<StaffQrScannerProps> = ({
  user,
  onNavigate,
  onRefresh,
}) => {
  // Scanner camera state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraOption[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);

  // Manual input state
  const [manualInput, setManualInput] = useState<string>('');

  // Processing & verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [scannedJob, setScannedJob] = useState<PrintJob | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Collection submission state
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File upload scan ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Prevent multiple simultaneous scan triggers
  const scanLockRef = useRef<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'xeroxic-html5-qr-reader';

  // Helper to ensure scanner instance is created
  const getScannerInstance = (): Html5Qrcode => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
    }
    return html5QrCodeRef.current;
  };

  // Stop camera helper
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      }
    } catch (e) {
      console.warn('Error stopping camera:', e);
    } finally {
      html5QrCodeRef.current = null;
      setIsScanning(false);
      setIsStartingCamera(false);
    }
  };

  // Query browser camera permission state on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' as any })
        .then((perm) => {
          setPermissionState(perm.state as any);
          perm.onchange = () => {
            setPermissionState(perm.state as any);
          };
        })
        .catch(() => {
          setPermissionState('unknown');
        });
    }
  }, []);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Listen for clipboard paste (e.g. Win + Shift + S screenshot pasted with Ctrl+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            await scanImageBlob(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Process a scanned or entered code
  const handleProcessCode = async (rawCode: string) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    setIsVerifying(true);
    setVerifyError(null);
    setSuccessMessage(null);

    try {
      // 1. Parse QR payload
      const parsed = parseQrPayload(rawCode);

      if (!parsed.isValid) {
        setVerifyError(
          parsed.error || 'Invalid QR code. Please scan a valid Xeroxic order QR code.'
        );
        soundManager.playNewOrderBell();
        setScannedJob(null);
        return;
      }

      const lookupKey = parsed.orderId || parsed.token || rawCode.trim();

      // 2. Fetch order from database / local store
      const job = await findJobByIdOrToken(lookupKey);

      if (!job) {
        setVerifyError(
          `Order "${lookupKey}" was not found in the database. Please verify the order ID or token.`
        );
        setScannedJob(null);
        return;
      }

      // Order found!
      setScannedJob(job);
      setVerifyError(null);

      // Stop camera once verified
      await stopCamera();
    } catch (err: any) {
      console.error('Verification error:', err);
      setVerifyError(
        err?.message || 'Unable to connect to database. Please check connection and try again.'
      );
      setScannedJob(null);
    } finally {
      setIsVerifying(false);
      setTimeout(() => {
        scanLockRef.current = false;
      }, 1000);
    }
  };

  // Scan QR code from any image Blob/File (upload, drop, or clipboard paste)
  const scanImageBlob = async (file: Blob | File) => {
    setIsVerifying(true);
    setVerifyError(null);
    setCameraError(null);

    try {
      const scanner = getScannerInstance();
      const decodedText = await scanner.scanFile(file as File, false);
      if (decodedText) {
        await handleProcessCode(decodedText);
      } else {
        setVerifyError(
          'No QR code detected in the selected image. Please make sure the QR code is clearly visible and well-lit, or enter the Order ID manually.'
        );
      }
    } catch (err: any) {
      console.warn('File QR scan error:', err);
      setVerifyError(
        'Could not decode a valid Xeroxic QR code from this image. Please upload a clear photo/screenshot or enter Order ID manually.'
      );
    } finally {
      setIsVerifying(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Scan QR code from an image file picker (PNG / JPG / Screenshot)
  const handleScanImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await scanImageBlob(file);
  };

  // Full reset: cleanly flush camera hardware locks, query permissions, and restart
  const handleClearAndResetScanner = async () => {
    setCameraError(null);
    setVerifyError(null);
    setSuccessMessage(null);

    // 1. Stop any active camera streams cleanly
    await stopCamera();

    // 2. Query browser permission state again
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const perm = await navigator.permissions.query({ name: 'camera' as any });
        setPermissionState(perm.state as any);
      } catch (_) {}
    }

    // 3. Re-start camera scanner
    await handleStartScanner(selectedCameraId);
  };

  // Start camera scanner with direct browser prompt and resilient fallbacks
  const handleStartScanner = async (preferredId?: string) => {
    setCameraError(null);
    setVerifyError(null);
    setSuccessMessage(null);
    setScannedJob(null);
    setIsStartingCamera(true);

    // Check secure context (HTTP on IP addresses is blocked by all browsers)
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setIsStartingCamera(false);
      setCameraError(
        'Insecure Browser Context: Camera access is disabled by modern browsers over unencrypted network IP addresses (http://192.168...). Please open Xeroxic using "http://localhost:5173" on this device, or upload a photo of the QR code / enter Order ID manually.'
      );
      return;
    }

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsStartingCamera(false);
      setCameraError(
        'Camera API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Firefox, or use "Upload QR Image" or Manual Entry below.'
      );
      return;
    }

    // Stop and clear any previous scanner instance cleanly
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      }
    } catch (e) {
      console.warn('Scanner cleanup notice:', e);
    }
    html5QrCodeRef.current = null;

    // Small delay so React renders the container element in the DOM
    await new Promise((resolve) => setTimeout(resolve, 80));

    const qrConfig = {
      fps: 15,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const edge = Math.min(viewfinderWidth, viewfinderHeight);
        const size = Math.floor(edge * 0.72);
        return {
          width: Math.max(180, Math.min(size, 260)),
          height: Math.max(180, Math.min(size, 260)),
        };
      },
      aspectRatio: 1.0,
    };

    // Attempt 1: Start with target camera or environment (rear) camera
    try {
      const scanner = new Html5Qrcode(qrRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      const cameraConstraint: any =
        preferredId && preferredId.trim()
          ? preferredId
          : { facingMode: 'environment' };

      await scanner.start(
        cameraConstraint,
        qrConfig,
        (decodedText) => handleProcessCode(decodedText),
        () => {}
      );

      setIsScanning(true);
      setIsStartingCamera(false);
      setPermissionState('granted');
      setCameraError(null);

      // Populate available cameras now that permission is granted
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setAvailableCameras(
            cameras.map((c, i) => ({
              id: c.id,
              label: c.label || `Camera ${i + 1}`,
            }))
          );
        }
      } catch (_) {}

      return;
    } catch (attempt1Err: any) {
      console.warn('Attempt 1 failed:', attempt1Err);
      const errMsg = String(attempt1Err?.message || attempt1Err);
      const errName = attempt1Err?.name || '';

      // If user or browser blocked camera, STOP IMMEDIATELY — do not attempt fallbacks
      if (
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError' ||
        errMsg.includes('Permission') ||
        errMsg.includes('denied') ||
        errMsg.includes('NotAllowedError')
      ) {
        setIsScanning(false);
        setIsStartingCamera(false);
        setPermissionState('denied');
        setCameraError(
          'Camera access is blocked by your browser. The browser will NOT display the permission popup again until you reset the permission in the URL bar.'
        );
        return;
      }

      if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError' || errMsg.includes('found')) {
        setIsScanning(false);
        setIsStartingCamera(false);
        setCameraError(
          'No camera device was detected on your computer. You can upload an image of the QR code or use manual Order ID entry below.'
        );
        return;
      }

      if (errName === 'NotReadableError' || errName === 'TrackStartError' || errMsg.includes('in use')) {
        setIsScanning(false);
        setIsStartingCamera(false);
        setCameraError(
          'Your webcam is currently occupied or locked by another application (e.g. Zoom, Microsoft Teams, or another browser tab). Please close other apps using the camera and click "Clear & Restart Scanner".'
        );
        return;
      }

      // Attempt 2: If attempt 1 failed due to constraint (e.g. laptop webcam has no environment tag), try user-facing
      try {
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.clear();
        }
        const fallbackScanner = new Html5Qrcode(qrRegionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrCodeRef.current = fallbackScanner;

        await fallbackScanner.start(
          { facingMode: 'user' },
          qrConfig,
          (decodedText) => handleProcessCode(decodedText),
          () => {}
        );

        setIsScanning(true);
        setIsStartingCamera(false);
        setPermissionState('granted');
        setCameraError(null);

        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            setAvailableCameras(
              cameras.map((c, i) => ({
                id: c.id,
                label: c.label || `Camera ${i + 1}`,
              }))
            );
          }
        } catch (_) {}

        return;
      } catch (fallbackErr: any) {
        console.warn('Fallback camera attempt also failed:', fallbackErr);
        setIsScanning(false);
        setIsStartingCamera(false);
        const fbMsg = String(fallbackErr?.message || fallbackErr);
        if (fbMsg.includes('Permission') || fbMsg.includes('NotAllowedError')) {
          setPermissionState('denied');
          setCameraError(
            'Camera access is blocked by your browser. The browser will NOT display the permission popup again until you reset the permission in the URL bar.'
          );
        } else {
          setCameraError(
            `Camera stream could not be started (${fbMsg}). Please verify camera permissions or use "Upload QR Image" / Manual Entry below.`
          );
        }
      }
    }
  };

  // Switch camera if user selects a different camera from dropdown
  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (isScanning) {
      await stopCamera();
      await handleStartScanner(newId);
    }
  };

  // Confirm handover / collection
  const handleConfirmCollection = async () => {
    if (!scannedJob) return;

    if (user.role !== 'admin') {
      setVerifyError('Unauthorized: Only xerox shopkeeper / staff can mark orders as collected.');
      return;
    }

    setIsConfirming(true);
    setVerifyError(null);

    try {
      const result = await confirmStaffJobCollection(scannedJob.id, user);

      if (!result.success) {
        setVerifyError(result.message);
        return;
      }

      soundManager.playReadyChime();
      setSuccessMessage(result.message);
      setScannedJob(result.job || { ...scannedJob, status: 'completed' });

      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error('Confirm collection failed:', err);
      setVerifyError(err?.message || 'Database request failed. Please check connection and try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Reset scanner to scan another customer
  const handleResetScanner = () => {
    setScannedJob(null);
    setVerifyError(null);
    setSuccessMessage(null);
    setManualInput('');
    scanLockRef.current = false;
  };

  // Manual submit handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessCode(manualInput.trim());
  };

  // Eligibility evaluation
  const isEligible = scannedJob?.status === 'ready';
  const isAlreadyCollected = scannedJob?.status === 'completed';
  const isProcessing = scannedJob?.status === 'processing';
  const isSubmitted = scannedJob?.status === 'submitted';
  const isCancelled = scannedJob?.status === 'cancelled';

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 text-left space-y-6 transition-colors duration-300">
      {/* Hidden File Input for Image QR Scanning */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleScanImageFile}
        accept="image/*"
        className="hidden"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bone/60 dark:border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-aubergine-ink dark:text-[#fafafa] tracking-tight">
                Scan to Collect
              </h1>
              <p className="text-xs text-warm-ash dark:text-[#a1a1aa]">
                Staff QR verification desk • Instant printout handover verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs bg-paper-white dark:bg-[#20232a] hover:bg-bone dark:hover:bg-white/10 text-aubergine-ink dark:text-white border border-outline/30 px-3.5 py-1.5 rounded-full font-semibold transition-colors shadow-sm"
            >
              Back to Operator Queue
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs bg-paper-white dark:bg-[#20232a] hover:bg-bone dark:hover:bg-white/10 text-aubergine-ink dark:text-white border border-outline/30 px-3.5 py-1.5 rounded-full font-semibold transition-colors shadow-sm"
            >
              Completed Archive
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Scanner & Manual Entry, Right Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Camera Scanner & Manual Input (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Camera Scanner Card */}
          <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 rounded-[22px] p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-bone dark:border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-espresso dark:text-white" />
                <h2 className="text-sm font-semibold text-aubergine-ink dark:text-[#fafafa]">
                  Live Camera Scanner
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-warm-ash dark:text-[#a1a1aa]">
                  {isScanning ? (
                    <span className="text-status-ready font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
                      Live Video
                    </span>
                  ) : isStartingCamera ? (
                    <span className="text-espresso dark:text-white flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Starting...
                    </span>
                  ) : permissionState === 'denied' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Blocked
                    </span>
                  ) : (
                    'Camera Idle'
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHelpGuide(!showHelpGuide)}
                  className="text-[11px] text-warm-ash hover:text-aubergine-ink dark:hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-bone dark:hover:bg-white/10 transition-colors"
                  title="Toggle camera troubleshooting guide"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Help</span>
                </button>
              </div>
            </div>

            {/* Viewfinder Region - Drag & Drop enabled */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  await scanImageBlob(file);
                }
              }}
              className={`relative overflow-hidden rounded-[18px] transition-all min-h-[290px] flex flex-col items-center justify-center p-3 text-center border-2 ${
                isDragging
                  ? 'border-status-ready bg-status-ready/10 scale-[1.01]'
                  : 'bg-linen dark:bg-[#20232a] border-dashed border-bone dark:border-white/20'
              }`}
            >
              {/* HTML5 QR reader mount element - always visible when starting or scanning */}
              <div
                id={qrRegionId}
                className="w-full max-w-[340px] rounded-[14px] overflow-hidden"
                style={{
                  display: isScanning || isStartingCamera ? 'block' : 'none',
                  minHeight: '260px',
                }}
              />

              {/* Requesting Permission / Starting Camera Loader */}
              {isStartingCamera && !isScanning && (
                <div className="py-8 px-4 flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-bone dark:bg-white/10 text-espresso dark:text-white flex items-center justify-center shadow-inner">
                    <Loader2 className="w-7 h-7 animate-spin text-espresso dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-aubergine-ink dark:text-white">
                      Opening Camera Stream
                    </h3>
                    <p className="text-xs text-warm-ash dark:text-[#a1a1aa] mt-1 max-w-xs text-center">
                      Please click <strong>"Allow"</strong> if your browser asks for camera permission.
                    </p>
                  </div>
                </div>
              )}

              {/* Idle View */}
              {!isScanning && !isStartingCamera && (
                <div className="py-6 px-4 flex flex-col items-center justify-center space-y-3.5">
                  <div className="w-16 h-16 rounded-full bg-bone dark:bg-white/10 text-espresso dark:text-white flex items-center justify-center shadow-inner">
                    <QrCode className="w-8 h-8 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-aubergine-ink dark:text-white">
                      Scan Customer QR Pass
                    </h3>
                    <p className="text-xs text-warm-ash dark:text-[#a1a1aa] mt-0.5 max-w-xs">
                      Hold QR pass in front of camera, or drag & drop / paste (Ctrl+V) an image here.
                    </p>
                  </div>

                  {/* Multi-camera selector if multiple webcams/cameras are available */}
                  {availableCameras.length > 1 && (
                    <div className="w-full max-w-xs">
                      <select
                        value={selectedCameraId}
                        onChange={handleCameraChange}
                        className="w-full px-3 py-1.5 text-xs bg-paper-white dark:bg-[#16181d] border border-outline/30 rounded-lg text-aubergine-ink dark:text-white focus:outline-none"
                      >
                        {availableCameras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full justify-center">
                    <button
                      onClick={() => handleStartScanner(selectedCameraId)}
                      disabled={isVerifying || isStartingCamera}
                      className="px-5 py-2.5 rounded-full bg-espresso text-paper-white dark:bg-white dark:text-[#0c0d10] font-semibold text-xs inline-flex items-center justify-center space-x-2 hover:bg-espresso/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera Scanner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isVerifying}
                      className="px-4 py-2.5 rounded-full border border-outline/30 hover:bg-bone dark:hover:bg-white/10 text-aubergine-ink dark:text-white text-xs font-semibold inline-flex items-center justify-center space-x-1.5 transition-colors"
                      title="Upload or scan a photo/screenshot of the QR code"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR Image</span>
                    </button>
                  </div>

                  {/* Keyboard shortcut hint */}
                  <div className="text-[11px] text-warm-ash dark:text-[#a1a1aa] flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3 h-3 text-status-ready" />
                    <span>Tip: Snip QR code (<code>Win+Shift+S</code>) and press <code>Ctrl+V</code> here</span>
                  </div>

                  {permissionState === 'denied' && (
                    <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 max-w-sm text-left">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-bold block">Camera permission is blocked in your browser</span>
                        <span>Click the lock icon in your URL bar to allow camera, or see instructions below.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Overlay Guides when scanning */}
              {isScanning && (
                <div className="mt-3 w-full flex items-center justify-between text-xs text-warm-ash dark:text-[#a1a1aa] px-2 pt-2 border-t border-bone/60 dark:border-white/10">
                  <span className="flex items-center gap-1.5 text-status-ready font-medium text-xs">
                    <span className="w-2 h-2 rounded-full bg-status-ready animate-ping" />
                    Scanning for Xeroxic QR code...
                  </span>

                  <div className="flex items-center gap-2">
                    {availableCameras.length > 1 && (
                      <button
                        onClick={async () => {
                          const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
                          const next = availableCameras[(currentIndex + 1) % availableCameras.length];
                          if (next) {
                            setSelectedCameraId(next.id);
                            await stopCamera();
                            await handleStartScanner(next.id);
                          }
                        }}
                        className="text-xs text-espresso dark:text-white hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Flip Camera</span>
                      </button>
                    )}
                    <button
                      onClick={stopCamera}
                      className="text-xs font-semibold text-status-queued hover:underline inline-flex items-center gap-1"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostic bar */}
            <div className="mt-3 px-3 py-1.5 rounded-lg bg-linen/60 dark:bg-white/5 border border-bone dark:border-white/10 text-[11px] text-warm-ash dark:text-[#a1a1aa] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>Context: <strong className="text-aubergine-ink dark:text-white">{typeof window !== 'undefined' && window.isSecureContext ? 'Secure' : 'Insecure'}</strong></span>
                <span>•</span>
                <span>Permission: <strong className={permissionState === 'granted' ? 'text-status-ready' : permissionState === 'denied' ? 'text-amber-600' : 'text-aubergine-ink dark:text-white'}>{permissionState}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleClearAndResetScanner}
                disabled={isStartingCamera}
                className="text-espresso dark:text-white hover:underline flex items-center gap-1 font-semibold"
                title="Flush active camera handles and test restart"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Scanner</span>
              </button>
            </div>

            {/* Camera Permission / Error Resolution Card */}
            {(cameraError || permissionState === 'denied' || showHelpGuide) && (
              <div className="mt-4 p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 rounded-[20px] text-xs space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Camera Permission Resolution Guide</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 font-mono text-[10px] font-bold uppercase">
                    How to Clear
                  </span>
                </div>

                {cameraError && (
                  <p className="text-xs leading-relaxed text-aubergine-ink dark:text-[#f4f4f6]">
                    {cameraError}
                  </p>
                )}

                {/* Step-by-step address bar permission instructions */}
                <div className="p-3.5 bg-paper-white dark:bg-[#16181d] rounded-xl border border-bone dark:border-white/10 text-[11px] text-stone dark:text-gray-200 space-y-2 text-left">
                  <span className="font-bold text-aubergine-ink dark:text-white block text-xs">
                    Why isn't the browser asking permission?
                  </span>
                  <p className="text-[11px] text-warm-ash dark:text-[#a1a1aa] leading-relaxed">
                    Once a site is blocked or dismissed, modern browsers (Chrome & Edge) <strong>silently block</strong> camera access without ever showing the popup again. To reset it:
                  </p>

                  <div className="space-y-2 pt-1 border-t border-bone/60 dark:border-white/10">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-espresso text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Look at the <strong>address bar</strong> (URL) at the top of this window. Click the <strong>🔒 Lock</strong>, <strong>🎛️ Tune / Sliders</strong>, or <strong>📷 Camera</strong> icon next to the URL.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-espresso text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        In the popup menu, set <strong>Camera</strong> to <strong>"Allow"</strong> (or click <strong>"Reset permissions"</strong>).
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-espresso text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Click the green <strong>"Reload Page Now"</strong> button below to activate the camera.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Windows 10/11 Privacy Settings Note */}
                <div className="p-2.5 bg-bone/50 dark:bg-white/5 rounded-lg text-[10px] text-warm-ash dark:text-[#a1a1aa] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-espresso dark:text-white mt-0.5" />
                  <span>
                    <strong>Windows OS Check:</strong> If the browser never prompts, check Windows: press <kbd className="font-mono bg-paper-white dark:bg-black/40 px-1 rounded">Win + I</kbd> → <em>Privacy & security</em> → <em>Camera</em> → Turn ON <strong>"Camera access"</strong> and <strong>"Let desktop apps access your camera"</strong>.
                  </span>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-full bg-status-ready text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reload Page Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAndResetScanner}
                    disabled={isStartingCamera}
                    className="px-4 py-2 rounded-full bg-espresso text-paper-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Clear & Try Camera Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-full border border-outline/30 hover:bg-bone dark:hover:bg-white/10 font-semibold text-xs flex items-center gap-1 text-aubergine-ink dark:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR Image Instead</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fallback Manual Order ID / Token Entry */}
          <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 rounded-[22px] p-6 shadow-card">
            <div className="flex items-center space-x-2 pb-3 border-b border-bone dark:border-white/10 mb-4">
              <Search className="w-4 h-4 text-espresso dark:text-white" />
              <h2 className="text-sm font-semibold text-aubergine-ink dark:text-[#fafafa]">
                Manual Entry Fallback
              </h2>
            </div>
            <p className="text-xs text-warm-ash dark:text-[#a1a1aa] mb-3">
              Type the student's Order ID (e.g. <code>A101</code>) or collection token:
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. A101 or xrx_A101_..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-mono border border-outline/30 rounded-xl focus:ring-2 focus:ring-espresso dark:bg-[#20232a] dark:text-white dark:border-white/20 focus:outline-none uppercase"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                {manualInput && (
                  <button
                    type="button"
                    onClick={() => setManualInput('')}
                    className="px-3 py-1.5 text-xs text-warm-ash hover:text-aubergine-ink dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!manualInput.trim() || isVerifying}
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-espresso text-paper-white dark:bg-white dark:text-black hover:bg-espresso/90 disabled:opacity-40 transition-colors shadow-sm inline-flex items-center space-x-1.5"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Verification Panel & Collection Actions (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 rounded-[22px] p-6 sm:p-8 shadow-card flex flex-col justify-between min-h-[460px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-bone dark:border-white/10 mb-6">
                <div>
                  <h2 className="text-base font-bold text-aubergine-ink dark:text-[#fafafa]">
                    Order Verification Panel
                  </h2>
                  <p className="text-xs text-warm-ash dark:text-[#a1a1aa] mt-0.5">
                    Live database verification & handover authorization
                  </p>
                </div>
                {scannedJob && (
                  <button
                    onClick={handleResetScanner}
                    className="text-xs text-warm-ash hover:text-aubergine-ink dark:hover:text-white flex items-center space-x-1 font-semibold px-2 py-1 rounded-full hover:bg-bone dark:hover:bg-white/10 transition-colors"
                    title="Clear and scan another"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Scan Another</span>
                  </button>
                )}
              </div>

              {/* VERIFICATION ERROR BANNER */}
              {verifyError && (
                <div className="mb-6 p-4 bg-status-queued/10 text-status-queued border border-status-queued/30 rounded-[16px] text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center space-x-2 font-semibold">
                    <XCircle className="w-4 h-4 text-status-queued shrink-0" />
                    <span>Verification Warning</span>
                  </div>
                  <p className="text-xs leading-relaxed">{verifyError}</p>
                </div>
              )}

              {/* SUCCESS BANNER */}
              {successMessage && (
                <div className="mb-6 p-4 bg-status-ready/15 text-status-ready border-2 border-status-ready/30 rounded-[18px] text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-status-ready shrink-0" />
                    <span>Order Collected Successfully!</span>
                  </div>
                  <p className="text-xs">{successMessage}</p>
                  <p className="text-[11px] text-stone dark:text-[#a1a1aa]">
                    Supabase order status updated to "Delivered / Collected". Customer tracking updated in real time.
                  </p>
                </div>
              )}

              {/* EMPTY STATE */}
              {!scannedJob && !isVerifying && !verifyError && (
                <div className="py-16 text-center text-warm-ash dark:text-[#a1a1aa] space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-bone dark:bg-white/10 flex items-center justify-center text-stone">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-aubergine-ink dark:text-white">
                    No Order Scanned Yet
                  </h3>
                  <p className="text-xs max-w-sm mx-auto leading-relaxed">
                    Point camera at customer's Xeroxic QR pass or enter their Order ID on the left to verify handover eligibility.
                  </p>
                </div>
              )}

              {/* LOADING STATE */}
              {isVerifying && (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-espresso dark:text-white animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-aubergine-ink dark:text-white">
                    Verifying QR pass with Supabase database...
                  </p>
                </div>
              )}

              {/* VERIFIED ORDER DETAILS DISPLAY */}
              {scannedJob && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Status Banner */}
                  {isEligible ? (
                    <div className="p-3.5 bg-status-ready/10 text-status-ready border border-status-ready/30 rounded-[14px] text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Order Verified — Eligible for Collection</span>
                      </div>
                      <span className="text-[11px] bg-status-ready text-paper-white px-2 py-0.5 rounded-full font-bold">
                        READY AT COUNTER
                      </span>
                    </div>
                  ) : isAlreadyCollected ? (
                    <div className="p-3.5 bg-bone dark:bg-white/10 text-status-completed dark:text-[#a1a1aa] border border-outline-variant rounded-[14px] text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PackageCheck className="w-4 h-4 shrink-0" />
                        <span>Already Collected</span>
                      </div>
                      <span className="text-[11px]">
                        {scannedJob.collectedAt
                          ? new Date(scannedJob.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Recorded'}
                      </span>
                    </div>
                  ) : isProcessing ? (
                    <div className="p-3.5 bg-status-printing/10 text-status-printing border border-status-printing/30 rounded-[14px] text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Printer className="w-4 h-4 animate-pulse shrink-0" />
                        <span>Not Ready — Currently Printing</span>
                      </div>
                      <span className="text-[11px]">Print in Progress (~10m)</span>
                    </div>
                  ) : isCancelled ? (
                    <div className="p-3.5 bg-status-queued/10 text-status-queued border border-status-queued/30 rounded-[14px] text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Order Cancelled</span>
                      </div>
                      <span className="text-[11px]">Cancelled by Operator</span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-status-queued/10 text-status-queued border border-status-queued/30 rounded-[14px] text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Not Ready — In Print Queue</span>
                      </div>
                      <span className="text-[11px]">Awaiting Print</span>
                    </div>
                  )}

                  {/* Order Top Summary Grid */}
                  <div className="p-4 bg-linen dark:bg-[#20232a] border border-bone dark:border-white/10 rounded-[16px] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase block">
                        Order ID
                      </span>
                      <span className="text-xl font-bold font-mono text-espresso dark:text-white">
                        {scannedJob.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase block">
                        Customer
                      </span>
                      <span className="font-semibold text-aubergine-ink dark:text-white truncate block">
                        {scannedJob.studentName}
                      </span>
                      <span className="text-[10px] text-stone dark:text-[#a1a1aa] font-mono">
                        {scannedJob.studentRoll}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase block">
                        Amount
                      </span>
                      <span className="text-base font-bold text-status-ready block">
                        ₹{scannedJob.cost}.00
                      </span>
                      <span className="text-[10px] text-stone dark:text-[#a1a1aa] capitalize">
                        {scannedJob.paymentMethod === 'upi' ? 'UPI Online' : 'Pay at Counter'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase block">
                        Submitted At
                      </span>
                      <span className="font-medium text-aubergine-ink dark:text-white block">
                        {new Date(scannedJob.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-stone dark:text-[#a1a1aa]">
                        {new Date(scannedJob.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Print Specifications */}
                  <div>
                    <h4 className="text-xs font-semibold text-warm-ash dark:text-[#a1a1aa] uppercase tracking-wider mb-2">
                      Print Job Specifications
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 bg-paper-white dark:bg-white/5 border border-bone dark:border-white/10 rounded-[12px]">
                        <span className="text-[11px] text-warm-ash dark:text-[#a1a1aa] block">File:</span>
                        <span className="font-semibold text-aubergine-ink dark:text-white truncate block" title={scannedJob.fileName}>
                          {scannedJob.fileName}
                        </span>
                      </div>
                      <div className="p-2.5 bg-paper-white dark:bg-white/5 border border-bone dark:border-white/10 rounded-[12px]">
                        <span className="text-[11px] text-warm-ash dark:text-[#a1a1aa] block">Volume:</span>
                        <span className="font-semibold text-aubergine-ink dark:text-white">
                          {scannedJob.pageCount} pgs × {scannedJob.copies} copy
                        </span>
                      </div>
                      <div className="p-2.5 bg-paper-white dark:bg-white/5 border border-bone dark:border-white/10 rounded-[12px]">
                        <span className="text-[11px] text-warm-ash dark:text-[#a1a1aa] block">Color & Sides:</span>
                        <span className="font-semibold text-aubergine-ink dark:text-white capitalize">
                          {scannedJob.colorMode === 'color' ? 'Color' : 'B&W'} ({scannedJob.sides === 'double' ? 'Duplex' : 'Single'})
                        </span>
                      </div>
                      <div className="p-2.5 bg-paper-white dark:bg-white/5 border border-bone dark:border-white/10 rounded-[12px]">
                        <span className="text-[11px] text-warm-ash dark:text-[#a1a1aa] block">Paper:</span>
                        <span className="font-semibold text-aubergine-ink dark:text-white capitalize">
                          {scannedJob.paperSize} ({scannedJob.paperType === 'photo' ? 'Photo' : 'Plain'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {scannedJob.instructions && (
                    <div className="p-3 bg-bone/40 dark:bg-white/5 border border-bone dark:border-white/10 rounded-[12px] text-xs">
                      <span className="font-semibold text-espresso dark:text-white block mb-0.5">Special Instructions:</span>
                      <span className="text-aubergine-ink dark:text-[#a1a1aa]">{scannedJob.instructions}</span>
                    </div>
                  )}

                  {scannedJob.collectedAt && (
                    <div className="text-xs text-warm-ash dark:text-[#a1a1aa] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-ready" />
                      <span>
                        Collected timestamp: <strong>{new Date(scannedJob.collectedAt).toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS FOOTER */}
            {scannedJob && (
              <div className="mt-8 pt-5 border-t border-bone dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetScanner}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-outline/30 text-xs font-semibold hover:bg-bone dark:hover:bg-white/10 transition-colors"
                >
                  Cancel / Scan Another
                </button>

                {isEligible ? (
                  <button
                    type="button"
                    onClick={handleConfirmCollection}
                    disabled={isConfirming}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-status-ready text-paper-white font-bold text-xs inline-flex items-center justify-center space-x-2 hover:bg-status-ready/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Supabase...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Handover & Mark Collected</span>
                      </>
                    )}
                  </button>
                ) : isAlreadyCollected ? (
                  <button
                    type="button"
                    onClick={handleResetScanner}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-espresso text-paper-white dark:bg-white dark:text-black font-semibold text-xs inline-flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Scan Next Order</span>
                  </button>
                ) : (
                  <div className="text-xs text-status-queued font-semibold">
                    Order is not ready for collection yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

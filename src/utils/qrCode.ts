import QRCode from 'qrcode';
import { PrintJob } from '../types';

/**
 * Generate a cryptographically strong, unique collection token for a new order.
 * Format: xrx_<ORDER_ID>_<RANDOM_HEX>
 */
export function generateCollectionToken(orderId: string): string {
  const cleanId = orderId.trim().toUpperCase();
  let randomPart = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    randomPart = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    randomPart = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  }
  return `xrx_${cleanId}_${randomPart}`;
}

/**
 * For legacy orders without a saved collection token, derive a stable deterministic
 * token so it never regenerates or changes on page reload.
 */
export function getDeterministicToken(job: Pick<PrintJob, 'id' | 'createdAt'>): string {
  const seed = `${job.id}_${job.createdAt || '2026'}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `xrx_${job.id.toUpperCase()}_legacy${hex}`;
}

/**
 * Get or ensure an order has a valid collection token.
 */
export function getOrderCollectionToken(job: PrintJob): string {
  return job.collectionToken || getDeterministicToken(job);
}

/**
 * Format the structured QR code payload.
 * Strictly avoids encoding sensitive customer details, phone numbers, or document contents.
 */
export function formatQrPayload(job: PrintJob): string {
  const token = getOrderCollectionToken(job);
  const payload = {
    app: 'xeroxic',
    orderId: job.id,
    token: token,
    v: 1,
  };
  return JSON.stringify(payload);
}

export interface ParsedQrResult {
  orderId?: string;
  token?: string;
  rawText: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parse and validate scanned or manually entered QR payload or token string.
 */
export function parseQrPayload(input: string): ParsedQrResult {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return { rawText: '', isValid: false, error: 'Empty QR code data.' };
  }

  // 1. Try parsing JSON payload format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      if (data && typeof data === 'object') {
        if (data.app === 'xeroxic' && data.orderId) {
          return {
            orderId: String(data.orderId).trim().toUpperCase(),
            token: data.token ? String(data.token).trim() : undefined,
            rawText: trimmed,
            isValid: true,
          };
        }
        // Unknown JSON schema
        return {
          rawText: trimmed,
          isValid: false,
          error: 'This QR code is not a valid Xeroxic print order token.',
        };
      }
    } catch {
      // not JSON, fallback below
    }
  }

  // 2. Check if it's our direct collection token format: xrx_<ORDERID>_<RANDOM>
  const tokenMatch = trimmed.match(/^xrx_([A-Za-z0-9_-]+)_[a-zA-Z0-9]+$/i);
  if (tokenMatch) {
    return {
      orderId: tokenMatch[1].toUpperCase(),
      token: trimmed,
      rawText: trimmed,
      isValid: true,
    };
  }

  // 3. Check if it's a direct Order ID (e.g. A101, B204, C733)
  const orderIdMatch = trimmed.match(/^[A-Za-z][0-9]{2,4}$/i);
  if (orderIdMatch) {
    return {
      orderId: trimmed.toUpperCase(),
      rawText: trimmed,
      isValid: true,
    };
  }

  // Unrecognized
  return {
    rawText: trimmed,
    isValid: false,
    error: 'Unrecognized QR format. Please scan a valid Xeroxic order QR code.',
  };
}

/**
 * Render QR code directly to an HTML canvas element.
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  width: number = 220
): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    width: width,
    margin: 1.5,
    color: {
      dark: '#1c1815', // Xeroxic espresso
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate and download a branded, clean PNG image containing the QR code and Order ID.
 */
export async function downloadQrCodeAsPng(job: PrintJob): Promise<void> {
  const payload = formatQrPayload(job);

  // Generate QR code as high-res data URL
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 600,
    margin: 2,
    color: {
      dark: '#1c1815',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  // Render on offscreen canvas with nice branding card
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#faf8f5'; // linen
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card border
  ctx.strokeStyle = '#e6ded4';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Header Brand
  ctx.fillStyle = '#1c1815';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('XEROXIC', canvas.width / 2, 85);

  ctx.fillStyle = '#7a7067';
  ctx.font = '16px sans-serif';
  ctx.fillText('CAMPUS PRINT STUDIO • ORDER COLLECTION PASS', canvas.width / 2, 115);

  // Draw QR Image
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  const qrX = (canvas.width - 480) / 2;
  ctx.drawImage(img, qrX, 150, 480, 480);

  // Order ID Badge
  ctx.fillStyle = '#1c1815';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(`ORDER ID: ${job.id}`, canvas.width / 2, 690);

  // Document details
  ctx.fillStyle = '#423730';
  ctx.font = '18px sans-serif';
  const truncatedFile =
    job.fileName.length > 36 ? job.fileName.substring(0, 33) + '...' : job.fileName;
  ctx.fillText(`File: ${truncatedFile}`, canvas.width / 2, 735);

  ctx.fillStyle = '#7a7067';
  ctx.font = '16px sans-serif';
  ctx.fillText(
    `${job.pageCount} pgs × ${job.copies} set(s) • ${job.colorMode === 'color' ? 'Color' : 'B&W'} • ${job.sides === 'double' ? 'Duplex' : 'Single'}`,
    canvas.width / 2,
    765
  );

  // Pickup Counter instruction
  ctx.fillStyle = '#166534'; // status green
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`Collect at: ${job.pickupCounter}`, canvas.width / 2, 810);

  ctx.fillStyle = '#9c9187';
  ctx.font = '14px sans-serif';
  ctx.fillText('Show this QR code on your phone screen to the xerox shopkeeper.', canvas.width / 2, 850);

  // Download Trigger
  const pngUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = pngUrl;
  a.download = `xeroxic-order-${job.id}-collection-qr.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

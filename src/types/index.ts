export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  department?: string;
  phone?: string;
  balance?: number;
}

export type JobStatus = 'submitted' | 'processing' | 'ready' | 'completed' | 'cancelled';

export interface StatusHistoryItem {
  status: JobStatus;
  timestamp: string;
  note?: string;
}

export interface PrintJob {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentPhone: string;
  department: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  paymentMethod?: 'upi' | 'counter';
  utrNumber?: string;
  pageCount: number;
  copies: number;
  colorMode: 'bw' | 'color';
  paperSize: 'A4' | 'A3' | 'Letter';
  paperType?: 'plain' | 'photo';
  orientation: 'portrait' | 'landscape';
  sides: 'single' | 'double';
  binding: 'none' | 'staple' | 'spiral' | 'hardcover';
  isUrgent: boolean;
  instructions?: string;
  cost: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  pickupCounter: string;
  estimatedPickupTime: string;
  statusHistory: StatusHistoryItem[];
  collectionToken?: string;
  collectedAt?: string;
  assignedPrinterId?: string;
  delayNotice?: DelayNotice | string;
}

export interface DelayNotice {
  isDelayed: boolean;
  reason: string;
  originalEta?: string;
  revisedEta?: string;
  reportedAt: string;
}

export type PrinterStatus =
  | 'online'
  | 'busy'
  | 'out_of_paper'
  | 'paper_jam'
  | 'maintenance'
  | 'offline';

export type PrinterType = 'bw' | 'color' | 'all';

export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  model: string;
  location: string;
  status: PrinterStatus;
  supportedFormats: string[];
  supportedTypes: ('bw' | 'color')[];
  maxSpeedPpm?: number;
  issueDescription?: string;
  estimatedRecovery?: string;
  estimatedRecoveryTime?: string;
  lastUpdated: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'printer_unavailable'
  | 'delay_update'
  | 'printer_restored'
  | 'order_reassigned';

export interface CustomerNotification {
  id: string;
  orderId: string;
  studentId: string;
  type: NotificationType;
  title: string;
  message: string;
  printerId?: string;
  printerName?: string;
  estimatedRecovery?: string;
  estimatedDelay?: string;
  isRead: boolean;
  createdAt: string;
}

export interface QueueHoldStatus {
  isHeld: boolean;
  reason?: string;
  estimatedResume?: string;
  updatedAt?: string;
  heldBy?: string;
}


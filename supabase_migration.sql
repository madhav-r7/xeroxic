-- ====================================================================
-- Xeroxic: Database Migration
-- Includes:
-- 1. QR-Based Job Collection System
-- 2. Live Printer Status & Customer Alert System
-- ====================================================================
-- Safe to execute in the Supabase SQL Editor without recreating tables
-- or modifying existing order data.
-- ====================================================================

-- 1. Extend print_jobs table with collection and printer assignment fields
ALTER TABLE print_jobs
  ADD COLUMN IF NOT EXISTS collection_token TEXT,
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_printer_id TEXT,
  ADD COLUMN IF NOT EXISTS delay_notice TEXT;

CREATE INDEX IF NOT EXISTS idx_print_jobs_collection_token ON print_jobs (collection_token);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs (status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_assigned_printer ON print_jobs (assigned_printer_id);

-- 2. Create printers table
CREATE TABLE IF NOT EXISTS printers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bw', -- 'bw' | 'color' | 'all'
  model TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online', -- 'online' | 'busy' | 'out_of_paper' | 'paper_jam' | 'maintenance' | 'offline'
  supported_formats JSONB DEFAULT '["A4"]'::jsonb,
  issue_description TEXT,
  estimated_recovery TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Printer Fleet if empty
INSERT INTO printers (id, name, type, model, location, status, supported_formats, issue_description, estimated_recovery, updated_at)
VALUES
  ('PRN-01', 'Canon imageRUNNER 2625i', 'bw', 'Canon iR 2625i Multifunction', 'Counter 1 - Express B&W', 'online', '["A4", "A3", "Duplex"]'::jsonb, NULL, NULL, NOW()),
  ('PRN-02', 'HP Color LaserJet Enterprise M555', 'color', 'HP Color M555 High-Res', 'Counter 2 - Color Station', 'online', '["A4", "Photo Paper", "Duplex"]'::jsonb, NULL, NULL, NOW()),
  ('PRN-03', 'Epson WorkForce Pro Dual-Tray', 'all', 'Epson WF-C878R Multi-Tray', 'Counter 3 - High-Volume Deck', 'online', '["A4", "A3", "Heavy Stock"]'::jsonb, NULL, NULL, NOW()),
  ('PRN-04', 'Brother High-Speed Duplex B&W', 'bw', 'Brother HL-L6400DW', 'Counter 4 - Quick Pickup', 'online', '["A4", "Duplex"]'::jsonb, NULL, NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Create customer_notifications table
CREATE TABLE IF NOT EXISTS customer_notifications (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'printer_unavailable' | 'delay_update' | 'printer_restored' | 'order_reassigned'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  printer_id TEXT,
  printer_name TEXT,
  estimated_recovery TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON customer_notifications (order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON customer_notifications (student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON customer_notifications (created_at DESC);

# CampusPrint - College Xerox & Assignment Printing System

A modern, high-efficiency college Xerox web application designed for students to upload assignments and track printing in real time, with a dedicated Xerox Operator Admin console to manage print queues.

Styled using **Microsoft Official Design Language (Fluent UI)** with Segoe UI typography, Microsoft signature blue palette, clean elevations, and zero robotic emojis.

---

## 🚀 Key Features

### 1. Two Dedicated Accounts
- **Student Account**:
  - **Email:** `student@college.edu`
  - **Password:** `password123`
  - **Capabilities:** Upload assignments, specify print specifications (Color/B&W, copies, double/single sided, binding), view transparent price calculations, and track orders live.
- **Admin Xerox Desk**:
  - **Email:** `admin@college.edu`
  - **Password:** `adminpassword`
  - **Capabilities:** Live incoming queue management, start digital press print jobs, mark orders ready at counter, and record completed deliveries.

### 2. Student Assignment Upload
- Drag-and-drop or file browser upload (PDF, DOCX, PPTX, JPG, PNG).
- Color Mode: Standard Monochrome (₹2/page) vs Full Color (₹10/page).
- Paper & Sides: Single-sided or Duplex (Back-to-Back), A4 / A3 / Letter formats.
- Finishing & Binding: Loose sheets (Free), Corner Staple (Free), Spiral Coil Binding (₹25), Hardcover Project Book (₹120).
- Express priority queue option (+₹10).
- Special instructions field for xerox machine operators.
- Real-time transparent bill estimate & ETA calculation.

### 3. Live 4-Step Print Tracker
- **Stage 1: Queued** (Order verified and placed in machine queue)
- **Stage 2: Printing** (Active on digital laser press)
- **Stage 3: Ready for Pickup** (Stapled/bound and waiting at counter)
- **Stage 4: Completed** (Handed over to student)
- Unique Token IDs (e.g. `#XER-2024-8841`) with 1-click clipboard copy.
- Detailed activity timeline with timestamps and operator notes.

### 4. Admin Xerox Console
- Real-time KPI summary (Queued, Printing Now, Ready for Counter, Delivered Today, Total Revenue).
- Live Print Queue Table with instant machine actions: `[Print Now]`, `[Mark Ready]`, `[Handed Over]`.
- Detailed job inspection modal.
- Historical delivery archives.

---

## 🛠️ Tech Stack
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (Custom Microsoft Fluent Theme: `#0067b8`, `#107c10`, Segoe UI font stack)
- **Icons:** Lucide React (Clean vector SVG icons, strictly no emojis)
- **State & Storage:** Persistent `localStorage` with real-time custom event synchronization across tabs and views.

---

## 🏃 Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

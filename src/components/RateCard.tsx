import React from 'react';
import { Clock, MapPin, CheckCircle2, ShieldCheck, Printer, Sparkles } from 'lucide-react';

export const RateCard: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-[1.03em] text-left transition-colors duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-bone/60 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-aubergine-ink dark:text-[#fafafa] tracking-tight">
            Xerox Rates & Service Pricing
          </h1>
          <p className="text-sm text-warm-ash dark:text-[#a1a1aa] mt-1.5 leading-relaxed">
            Transparent campus pricing for printing, copies, and document finishing at the Shopping Complex counter.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-linen dark:bg-[#20232a] border border-bone dark:border-white/10 text-xs font-semibold text-espresso dark:text-[#fafafa]">
          <ShieldCheck className="w-4 h-4 text-status-ready" />
          <span>Verified Student Rates • Pay via UPI or Cash</span>
        </div>
      </div>

      {/* Main Pricing Table Card */}
      <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-linen dark:bg-[#20232a] border-b border-bone dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Printer className="w-4 h-4 text-espresso dark:text-[#fafafa]" />
            <h2 className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa]">
              Document Printing & Photocopying Rates
            </h2>
          </div>
          <span className="text-xs text-warm-ash dark:text-[#a1a1aa]">All taxes included</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-linen/50 dark:bg-[#1a1c22] text-warm-ash dark:text-[#a1a1aa] border-b border-bone dark:border-white/10">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Print Type</th>
                <th className="py-3.5 px-6 font-semibold">Paper Size</th>
                <th className="py-3.5 px-6 font-semibold">Single Sided</th>
                <th className="py-3.5 px-6 font-semibold">Double Sided (Back-to-Back)</th>
                <th className="py-3.5 px-6 font-semibold">Recommended Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone dark:divide-white/10 text-aubergine-ink dark:text-[#f4f4f6]">
              <tr className="hover:bg-linen/50 dark:hover:bg-white/[0.03] transition-colors">
                <td className="py-4 px-6 font-semibold">Black & White Standard</td>
                <td className="py-4 px-6 text-warm-ash dark:text-[#a1a1aa]">A4 (75 GSM)</td>
                <td className="py-4 px-6 font-bold text-espresso dark:text-[#fafafa]">₹2.00 / page</td>
                <td className="py-4 px-6 font-bold text-status-ready">₹1.50 / side</td>
                <td className="py-4 px-6 text-stone dark:text-[#9ca3af]">Assignments, lab records, notes, lecture handouts</td>
              </tr>
              <tr className="hover:bg-linen/50 dark:hover:bg-white/[0.03] transition-colors">
                <td className="py-4 px-6 font-semibold">Color Laser Print</td>
                <td className="py-4 px-6 text-warm-ash dark:text-[#a1a1aa]">A4 (75 GSM)</td>
                <td className="py-4 px-6 font-bold text-espresso dark:text-[#fafafa]">₹10.00 / page</td>
                <td className="py-4 px-6 font-bold text-espresso dark:text-[#fafafa]">₹9.00 / side</td>
                <td className="py-4 px-6 text-stone dark:text-[#9ca3af]">Project cover pages, diagrams, circuit designs, charts</td>
              </tr>
              <tr className="hover:bg-linen/50 dark:hover:bg-white/[0.03] transition-colors">
                <td className="py-4 px-6 font-semibold">Large Sheet (B&W)</td>
                <td className="py-4 px-6 text-warm-ash dark:text-[#a1a1aa]">A3 Drawing Sheet</td>
                <td className="py-4 px-6 font-bold text-espresso dark:text-[#fafafa]">₹4.00 / page</td>
                <td className="py-4 px-6 font-bold text-espresso dark:text-[#fafafa]">₹7.00 / side</td>
                <td className="py-4 px-6 text-stone dark:text-[#9ca3af]">Architectural drawings, CAD layouts, engineering diagrams</td>
              </tr>
              <tr className="hover:bg-linen/50 dark:hover:bg-white/[0.03] transition-colors">
                <td className="py-4 px-6 font-semibold">Large Sheet (Color)</td>
                <td className="py-4 px-6 text-warm-ash dark:text-[#a1a1aa]">A3 Drawing Sheet</td>
                <td className="py-4 px-6 font-bold text-espresso dark:text-[#fafafa]">₹20.00 / page</td>
                <td className="py-4 px-6 text-stone dark:text-[#9ca3af]">N/A</td>
                <td className="py-4 px-6 text-stone dark:text-[#9ca3af]">Posters, seminar presentations, college event banners</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Paper Types & Finishing Options (Full width with spacious gaps) */}
      <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-linen dark:bg-[#20232a] border-b border-bone dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-espresso dark:text-[#fafafa]" />
            <h2 className="text-base font-semibold text-aubergine-ink dark:text-[#fafafa]">
              Paper Stock & Finishing Add-ons
            </h2>
          </div>
          <span className="text-xs text-warm-ash dark:text-[#a1a1aa]">Selected during upload</span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="p-5 border border-bone dark:border-white/10 rounded-[20px] bg-linen dark:bg-[#20232a] flex flex-col justify-between space-y-4">
            <div>
              <div className="font-semibold text-base text-aubergine-ink dark:text-[#fafafa]">Plain Paper (Standard)</div>
              <div className="text-xs text-warm-ash dark:text-[#a1a1aa] mt-1">High-grade 75 GSM bright white multipurpose bond paper</div>
            </div>
            <div className="text-base font-bold text-status-ready">Included Free</div>
          </div>

          <div className="p-5 border border-espresso/20 dark:border-white/20 rounded-[20px] bg-bone/30 dark:bg-[#252832] flex flex-col justify-between space-y-4">
            <div>
              <div className="font-semibold text-base text-espresso dark:text-[#fafafa]">Photo Paper (Glossy Finish)</div>
              <div className="text-xs text-warm-ash dark:text-[#a1a1aa] mt-1">Premium 180 GSM high-resolution glossy photographic paper</div>
            </div>
            <div className="text-base font-bold text-espresso dark:text-[#fafafa]">+₹15.00 / print job</div>
          </div>

          <div className="p-5 border border-bone dark:border-white/10 rounded-[20px] bg-linen dark:bg-[#20232a] flex flex-col justify-between space-y-4">
            <div>
              <div className="font-semibold text-base text-aubergine-ink dark:text-[#fafafa]">Corner Stapling</div>
              <div className="text-xs text-warm-ash dark:text-[#a1a1aa] mt-1">Industrial heavy-duty top-left corner staple to bind your pages</div>
            </div>
            <div className="text-base font-bold text-status-ready">Free on Request</div>
          </div>
        </div>
      </div>

      {/* Guidelines and Counter Info Cards (Full width 2-column grid with generous gaps) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Guidelines */}
        <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 text-base font-semibold text-aubergine-ink dark:text-[#fafafa]">
            <CheckCircle2 className="w-5 h-5 text-status-ready shrink-0" />
            <span>Helpful Guidelines for Students</span>
          </div>
          <ul className="text-sm text-warm-ash dark:text-[#a1a1aa] space-y-3 list-disc pl-5 leading-relaxed">
            <li>PDF files are highly recommended for guaranteed exact layout preservation and automatic page count verification.</li>
            <li>Double-sided (duplex) printing reduces document bulk and saves paper at ₹1.50 per side.</li>
            <li>Always note or screenshot your <strong className="text-aubergine-ink dark:text-[#fafafa]">Token ID</strong> to show at the counter for instant pickup.</li>
            <li>Payment is settled conveniently via UPI QR code scan or cash when collecting your documents at the counter.</li>
          </ul>
        </div>

        {/* Counter Info */}
        <div className="bg-paper-white dark:bg-[#16181d] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 rounded-[24px] p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 text-base font-semibold text-aubergine-ink dark:text-[#fafafa]">
            <MapPin className="w-5 h-5 text-espresso dark:text-[#fafafa] shrink-0" />
            <span>Counter Location & Operating Schedule</span>
          </div>
          <div className="text-sm text-warm-ash dark:text-[#a1a1aa] space-y-3 leading-relaxed">
            <div>
              <strong className="text-aubergine-ink dark:text-[#fafafa] block">Location:</strong>
              Shopping Complex (AIT Xerox Shop • Campus Ground Floor).
            </div>
            <div>
              <strong className="text-aubergine-ink dark:text-[#fafafa] block">Operating Hours:</strong>
              Monday to Saturday: 8:30 AM – 4:00 PM (Sunday closed).
            </div>
            <div className="p-3 bg-bone dark:bg-[#242730] text-espresso dark:text-[#fafafa] border border-espresso/20 dark:border-white/15 rounded-[16px] flex items-center space-x-3">
              <Clock className="w-5 h-5 shrink-0 text-status-ready" />
              <span><strong>Rush Hours Tip:</strong> Peak line forms during lunch break (1:00 PM – 2:00 PM). Submit your prints online early to bypass the line!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const RateCard: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-aubergine-ink tracking-tight">
          Xerox Rates & Details
        </h1>
        <p className="text-xs text-warm-ash mt-0.5">
          Current printing and photocopying charges at the college Xerox shop
        </p>
      </div>

      {/* Main Pricing Table */}
      <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] shadow-card overflow-hidden">
        <div className="px-5 py-3.5 bg-linen border-b border-bone">
          <h2 className="text-sm font-semibold text-aubergine-ink">Document Printing Rates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-linen/50 text-warm-ash border-b border-bone">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Print Type</th>
                <th className="py-2.5 px-4 font-semibold">Paper Size</th>
                <th className="py-2.5 px-4 font-semibold">Single Sided</th>
                <th className="py-2.5 px-4 font-semibold">Double Sided (Back-to-Back)</th>
                <th className="py-2.5 px-4 font-semibold">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone text-aubergine-ink">
              <tr className="hover:bg-linen/50">
                <td className="py-3 px-4 font-medium">Black & White</td>
                <td className="py-3 px-4 text-warm-ash">A4 Standard</td>
                <td className="py-3 px-4 font-semibold text-espresso">₹2.00 / page</td>
                <td className="py-3 px-4 font-semibold text-status-ready">₹1.50 / side</td>
                <td className="py-3 px-4 text-stone">Assignments, notes, reports</td>
              </tr>
              <tr className="hover:bg-linen/50">
                <td className="py-3 px-4 font-medium">Color Print</td>
                <td className="py-3 px-4 text-warm-ash">A4 Standard</td>
                <td className="py-3 px-4 font-semibold text-espresso">₹10.00 / page</td>
                <td className="py-3 px-4 font-semibold text-espresso">₹9.00 / side</td>
                <td className="py-3 px-4 text-stone">Diagrams, presentations, project cover</td>
              </tr>
              <tr className="hover:bg-linen/50">
                <td className="py-3 px-4 font-medium">Large Sheet (B&W)</td>
                <td className="py-3 px-4 text-warm-ash">A3 Sheet</td>
                <td className="py-3 px-4 font-semibold text-espresso">₹4.00 / page</td>
                <td className="py-3 px-4 font-semibold text-espresso">₹7.00 / side</td>
                <td className="py-3 px-4 text-stone">Drawings, circuit diagrams, charts</td>
              </tr>
              <tr className="hover:bg-linen/50">
                <td className="py-3 px-4 font-medium">Large Sheet (Color)</td>
                <td className="py-3 px-4 text-warm-ash">A3 Sheet</td>
                <td className="py-3 px-4 font-semibold text-espresso">₹20.00 / page</td>
                <td className="py-3 px-4 text-stone">N/A</td>
                <td className="py-3 px-4 text-stone">Posters and event banners</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Paper Types & Finishing */}
      <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] shadow-card overflow-hidden">
        <div className="px-5 py-3.5 bg-linen border-b border-bone">
          <h2 className="text-sm font-semibold text-aubergine-ink">Paper Options & Finishing</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 border border-bone rounded-[16px] bg-linen">
            <div className="font-semibold text-aubergine-ink">Plain Paper</div>
            <div className="text-[11px] text-warm-ash mt-0.5">Standard 75 GSM multipurpose</div>
            <div className="text-sm font-bold text-status-ready mt-2">Included</div>
          </div>
          <div className="p-3 border border-espresso/20 rounded-[16px] bg-bone/30">
            <div className="font-semibold text-espresso">Photo Paper</div>
            <div className="text-[11px] text-warm-ash mt-0.5">Glossy high-resolution finish</div>
            <div className="text-sm font-bold text-espresso mt-2">+₹15.00</div>
          </div>
          <div className="p-3 border border-bone rounded-[16px] bg-linen">
            <div className="font-semibold text-aubergine-ink">Corner Staple</div>
            <div className="text-[11px] text-warm-ash mt-0.5">Top-left corner staple</div>
            <div className="text-sm font-bold text-status-ready mt-2">Free</div>
          </div>
        </div>
      </div>

      {/* Guidelines and Counter Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guidelines */}
        <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] p-5 shadow-card space-y-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-aubergine-ink">
            <CheckCircle2 className="w-4 h-4 text-status-ready" />
            <span>Helpful Guidelines for Students</span>
          </div>
          <ul className="text-xs text-warm-ash space-y-2 list-disc pl-4">
            <li>PDF files are recommended for accurate layout and exact page count.</li>
            <li>Double-sided printing helps save paper and keeps your report compact.</li>
            <li>Show your <strong className="text-aubergine-ink">Token ID</strong> at the counter to collect your prints without confusion.</li>
            <li>Payment can be made via UPI QR code or cash at the counter when picking up.</li>
          </ul>
        </div>

        {/* Counter Info */}
        <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] p-5 shadow-card space-y-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-aubergine-ink">
            <MapPin className="w-4 h-4 text-espresso" />
            <span>Location & Timings</span>
          </div>
          <div className="text-xs text-warm-ash space-y-2">
            <div>
              <strong className="text-aubergine-ink block">Location:</strong>
              ait xerox shop.
            </div>
            <div>
              <strong className="text-aubergine-ink block">Operating Hours:</strong>
              Monday to Saturday: 8:30 AM – 4:00 PM (Sunday closed).
            </div>
            <div className="p-2.5 bg-bone text-espresso border border-espresso/20 rounded-full flex items-center space-x-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span><strong>Rush Hours:</strong> Lunch break (1:00 PM – 2:00 PM). Order online in advance to skip the queue!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

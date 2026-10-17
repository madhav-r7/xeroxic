import React from 'react';
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface HomeViewProps {
  onOpenPortal: () => void;
  onOpenRates: () => void;
  onOpenTracking: () => void;
  onOpenSignIn: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenPortal,
  onOpenRates,
  onOpenTracking,
  onOpenSignIn,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section matching Image 3 (Microsoft style clean hero) */}
      <section className="bg-[#fbfbfb] border-b border-[#e5e5e5] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-block px-3 py-1 bg-[#ebf3fc] text-[#0067b8] text-xs font-semibold rounded-full">
              Central Campus Xerox & Document Printing
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#242424] tracking-tight leading-tight">
              Print assignments without waiting in line.
            </h1>
            <p className="text-sm sm:text-base text-[#605e5c] max-w-xl leading-relaxed">
              Upload your assignments, lab manuals, and reports directly from your phone or laptop. Configure color, paper finish, and double-sided printing, then pick up your documents from Counter 1 & 2 in the Central Library.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPortal}
                className="bg-[#0067b8] hover:bg-[#005da6] active:bg-[#004e8c] text-white px-5 py-2.5 rounded-[4px] font-semibold text-sm transition-colors flex items-center space-x-2 shadow-sm"
              >
                <span>Upload & Print Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenRates}
                className="bg-white hover:bg-[#f3f2f1] text-[#242424] border border-[#8a8886] px-4 py-2.5 rounded-[4px] font-semibold text-sm transition-colors shadow-sm"
              >
                View Print Rates
              </button>
            </div>
          </div>

          {/* Right Aesthetic Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#e1dfdd] aspect-[4/3] bg-white">
              <img
                src="/images/hero-study.jpg"
                alt="College student studying and preparing assignments"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Cards Benefits & Portal Grid matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-left">
          <h2 className="text-2xl font-semibold text-[#242424] tracking-tight">
            Designed for College Students
          </h2>
          <p className="text-xs sm:text-sm text-[#605e5c] mt-1">
            Simple, transparent, and built to make assignment submissions hassle-free.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Skip Queues */}
          <div className="bg-white rounded-xl border border-[#e1dfdd] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-gray-100">
                <img
                  src="/images/card-laptop.jpg"
                  alt="Student uploading files"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 text-left">
                <h3 className="font-semibold text-base text-[#242424]">
                  Skip the Rush Hours
                </h3>
                <p className="text-xs text-[#605e5c] mt-2 leading-relaxed">
                  Never get stuck in long 20-minute xerox queues right before lab submissions. Upload from your room or classroom anytime.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 text-left">
              <button
                onClick={onOpenPortal}
                className="w-full sm:w-auto bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold px-4 py-2 rounded-[4px] transition-colors"
              >
                Learn more
              </button>
            </div>
          </div>

          {/* Card 2: Transparent Rates */}
          <div className="bg-white rounded-xl border border-[#e1dfdd] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-gray-100">
                <img
                  src="/images/card-rates.jpg"
                  alt="Library study desk"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 text-left">
                <h3 className="font-semibold text-base text-[#242424]">
                  Clear Campus Rates
                </h3>
                <p className="text-xs text-[#605e5c] mt-2 leading-relaxed">
                  Fixed pricing at ₹2 per B&W page and ₹10 for color. Corner stapling is free. Pay via UPI QR code or cash when picking up.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 text-left">
              <button
                onClick={onOpenRates}
                className="w-full sm:w-auto bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold px-4 py-2 rounded-[4px] transition-colors"
              >
                View rates
              </button>
            </div>
          </div>

          {/* Card 3: Live Order Tracking */}
          <div className="bg-white rounded-xl border border-[#e1dfdd] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-gray-100">
                <img
                  src="/images/card-tracking.jpg"
                  alt="Students on campus"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 text-left">
                <h3 className="font-semibold text-base text-[#242424]">
                  Live Order Tracking
                </h3>
                <p className="text-xs text-[#605e5c] mt-2 leading-relaxed">
                  Get a unique Token ID for every job. Check whether your print is in queue, printing, or ready at the counter before heading over.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 text-left">
              <button
                onClick={onOpenTracking}
                className="w-full sm:w-auto bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold px-4 py-2 rounded-[4px] transition-colors"
              >
                Track an order
              </button>
            </div>
          </div>

          {/* Card 4: Access Print Portal (Highlighted!) */}
          <div className="bg-white rounded-xl border-2 border-[#0067b8]/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-gray-100">
                <img
                  src="/images/card-portal.jpg"
                  alt="Printed documents on desk"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 text-left">
                <div className="flex items-center space-x-1.5 text-[#0067b8] text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </div>
                <h3 className="font-semibold text-base text-[#242424]">
                  Access Print Portal
                </h3>
                <p className="text-xs text-[#605e5c] mt-2 leading-relaxed">
                  Upload your PDF or DOCX assignment now, select single or double-sided printing, choose paper type, and send it to print.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 text-left">
              <button
                onClick={onOpenPortal}
                className="w-full bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold px-4 py-2.5 rounded-[4px] transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Open Print Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Information Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f3f2f1] border border-[#e1dfdd] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#242424]">Need to submit an assignment today?</h3>
            <p className="text-xs sm:text-sm text-[#605e5c]">
              We are located at ait xerox shop. Standard operating hours are 8:30 AM to 4:00 PM (Mon–Sat).
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenPortal}
              className="bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold px-5 py-2.5 rounded-[4px] transition-colors"
            >
              Start Printing
            </button>
            <button
              onClick={onOpenSignIn}
              className="bg-white hover:bg-[#edebe9] text-[#242424] border border-[#d2d0ce] text-xs font-semibold px-4 py-2.5 rounded-[4px] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

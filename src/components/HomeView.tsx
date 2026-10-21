import React from 'react';
import { ArrowRight, FileText, MapPin } from 'lucide-react';

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
      {/* Hero Section */}
      <section className="bg-linen border-b border-bone py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bone rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-status-ready inline-block"></span>
              <span className="text-xs font-medium text-warm-ash tracking-wide uppercase">Central Campus Xerox & Document Printing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-aubergine-ink tracking-tight leading-tight">
              Print assignments without waiting in line.
            </h1>
            <p className="text-sm sm:text-base text-warm-ash max-w-xl leading-relaxed">
              Upload your assignments, lab manuals, and reports directly from your phone or laptop. Configure color, paper finish, and double-sided printing, then pick up your documents from Counter 1 & 2 in the Central Library.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPortal}
                className="bg-espresso hover:bg-espresso/90 active:scale-[0.99] text-paper-white px-6 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Upload & Print Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenRates}
                className="bg-bone hover:bg-surface-container-high text-aubergine-ink border border-bone px-5 py-2.5 rounded-full font-medium text-sm transition-colors"
              >
                View Print Rates
              </button>
            </div>
          </div>

          {/* Right Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[20px] overflow-hidden shadow-card border border-bone aspect-[4/3] bg-paper-white">
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

      {/* 4 Cards Benefits */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-left">
          <h2 className="text-2xl font-semibold text-aubergine-ink tracking-tight">
            Designed for College Students
          </h2>
          <p className="text-sm text-warm-ash mt-1">
            Simple, transparent, and built to make assignment submissions hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-paper-white rounded-[20px] ring-1 ring-black/[0.06] overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-bone">
                <img src="/images/card-laptop.jpg" alt="Student uploading files" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 text-left">
                <h3 className="font-semibold text-base text-aubergine-ink">Skip the Rush Hours</h3>
                <p className="text-xs text-warm-ash mt-2 leading-relaxed">
                  Never get stuck in long 20-minute xerox queues right before lab submissions. Upload from your room or classroom anytime.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button onClick={onOpenPortal} className="bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                Learn more
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-paper-white rounded-[20px] ring-1 ring-black/[0.06] overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-bone">
                <img src="/images/card-rates.jpg" alt="Library study desk" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 text-left">
                <h3 className="font-semibold text-base text-aubergine-ink">Clear Campus Rates</h3>
                <p className="text-xs text-warm-ash mt-2 leading-relaxed">
                  Fixed pricing at ₹2 per B&W page and ₹10 for color. Corner stapling is free. Pay via UPI QR code or cash when picking up.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button onClick={onOpenRates} className="bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                View rates
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-paper-white rounded-[20px] ring-1 ring-black/[0.06] overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-bone">
                <img src="/images/card-tracking.jpg" alt="Students on campus" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 text-left">
                <h3 className="font-semibold text-base text-aubergine-ink">Live Order Tracking</h3>
                <p className="text-xs text-warm-ash mt-2 leading-relaxed">
                  Get a unique Token ID for every job. Check whether your print is in queue, printing, or ready at the counter before heading over.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button onClick={onOpenTracking} className="bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                Track an order
              </button>
            </div>
          </div>

          {/* Card 4: Highlighted */}
          <div className="bg-paper-white rounded-[20px] ring-2 ring-espresso/20 overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 w-full overflow-hidden bg-bone">
                <img src="/images/card-portal.jpg" alt="Printed documents on desk" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 text-left">
                <div className="flex items-center gap-1.5 text-warm-ash text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </div>
                <h3 className="font-semibold text-base text-aubergine-ink">Access Print Portal</h3>
                <p className="text-xs text-warm-ash mt-2 leading-relaxed">
                  Upload your PDF or DOCX assignment now, select single or double-sided printing, choose paper type, and send it to print.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={onOpenPortal}
                className="w-full bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-medium px-4 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Open Print Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Information Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-paper-white rounded-[20px] ring-1 ring-black/[0.06] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-card">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-aubergine-ink">Need to submit an assignment today?</h3>
            <p className="text-sm text-warm-ash flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone flex-shrink-0" />
              We are located at AIT Xerox Shop. Standard operating hours: 8:30 AM – 4:00 PM (Mon–Sat).
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onOpenPortal}
              className="bg-espresso hover:bg-espresso/90 text-paper-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors shadow-sm"
            >
              Start Printing
            </button>
            <button
              onClick={onOpenSignIn}
              className="bg-bone hover:bg-surface-container-high text-aubergine-ink text-sm font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

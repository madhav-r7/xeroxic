import { ArrowRight, MapPin, Activity } from 'lucide-react';

interface HomeViewProps {
  onOpenPortal: () => void;
  onOpenRates: () => void;
  onOpenTracking: () => void;
  onOpenSignIn: () => void;
  onOpenStatus?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenPortal,
  onOpenRates,
  onOpenTracking,
  onOpenSignIn,
  onOpenStatus,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-transparent border-b border-bone/60 dark:border-white/10 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left area kept open so background animated van and road are fully visible */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 pointer-events-none" aria-hidden="true" />

          {/* Hero Box moved to right side with 5% increased area and 9px extra vertical length */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-left px-7 sm:px-9 lg:px-10 py-[32.5px] sm:py-[40.5px] lg:py-[44.5px] text-[1.05em] rounded-[26px] bg-paper-white/75 dark:bg-[#16181d]/85 backdrop-blur-md border border-bone/80 dark:border-white/10 shadow-card">

            <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-bold tracking-tight leading-tight animated-gradient-title">
              Print assignments without waiting in line.
            </h1>
            <p className="text-sm sm:text-base text-aubergine-ink/85 dark:text-[#d4d4d8] font-medium max-w-2xl leading-relaxed">
              Upload your assignments, lab manuals, and reports directly from your phone or laptop. Configure color, paper finish, and double-sided printing, then pick up your documents from the Xerox counter in the Shopping Complex.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPortal}
                className="bg-espresso hover:bg-espresso/90 active:scale-[0.99] text-paper-white px-6 py-3 rounded-full font-medium text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Upload & Print Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenRates}
                className="bg-bone dark:bg-[#282b33] hover:bg-surface-container-high dark:hover:bg-[#343842] text-aubergine-ink dark:text-[#f4f4f6] border border-bone dark:border-white/10 px-5 py-3 rounded-full font-medium text-sm transition-colors"
              >
                View Print Rates
              </button>
              {onOpenStatus && (
                <button
                  onClick={onOpenStatus}
                  className="bg-transparent hover:bg-bone/60 dark:hover:bg-white/5 text-aubergine-ink dark:text-[#f4f4f6] border border-bone/80 dark:border-white/10 px-4 py-3 rounded-full font-medium text-sm transition-colors inline-flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Printer Status</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Key Benefits Cards */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-left">
          <h2 className="text-2xl font-semibold text-aubergine-ink dark:text-[#fafafa] tracking-tight">
            Designed for College Students
          </h2>
          <p className="text-sm text-warm-ash dark:text-[#a1a1aa] mt-1">
            Simple, transparent, and built to make assignment submissions hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-paper-white dark:bg-[#16181d] rounded-[22px] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="h-48 sm:h-52 w-full overflow-hidden bg-bone dark:bg-[#242730]">
                <img
                  src="/images/card-laptop.jpg"
                  alt="Student uploading files"
                  className="w-full h-full object-cover grayscale contrast-[1.08] brightness-[0.98] hover:scale-105 transition-all duration-500"
                />
              </div>
              <div className="p-6 text-left">
                <h3 className="font-semibold text-lg text-aubergine-ink dark:text-[#fafafa]">Skip the Rush Hours</h3>
                <p className="text-xs sm:text-sm text-warm-ash dark:text-[#a1a1aa] mt-2 leading-relaxed">
                  Never get stuck in long 20-minute xerox queues right before lab submissions. Upload from your room or classroom anytime.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={onOpenPortal} className="bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-sm">
                <span>Upload & Skip Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-paper-white dark:bg-[#16181d] rounded-[22px] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="h-48 sm:h-52 w-full overflow-hidden bg-bone dark:bg-[#242730]">
                <img
                  src="/images/card-rates.jpg"
                  alt="Campus study desk"
                  className="w-full h-full object-cover grayscale contrast-[1.08] brightness-[0.98] hover:scale-105 transition-all duration-500"
                />
              </div>
              <div className="p-6 text-left">
                <h3 className="font-semibold text-lg text-aubergine-ink dark:text-[#fafafa]">Clear Campus Rates</h3>
                <p className="text-xs sm:text-sm text-warm-ash dark:text-[#a1a1aa] mt-2 leading-relaxed">
                  Fixed pricing at ₹2 per B&W page and ₹10 for color. Corner stapling is free. Pay via UPI QR code or cash when picking up.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={onOpenRates} className="bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-sm">
                <span>View Print Rates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-paper-white dark:bg-[#16181d] rounded-[22px] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="h-48 sm:h-52 w-full overflow-hidden bg-bone dark:bg-[#242730]">
                <img
                  src="/images/card-tracking.jpg"
                  alt="Students on campus"
                  className="w-full h-full object-cover grayscale contrast-[1.08] brightness-[0.98] hover:scale-105 transition-all duration-500"
                />
              </div>
              <div className="p-6 text-left">
                <h3 className="font-semibold text-lg text-aubergine-ink dark:text-[#fafafa]">Live Order Tracking</h3>
                <p className="text-xs sm:text-sm text-warm-ash dark:text-[#a1a1aa] mt-2 leading-relaxed">
                  Get a unique Token ID for every job. Check whether your print is in queue, printing, or ready at the counter before heading over.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={onOpenTracking} className="bg-espresso hover:bg-espresso/90 text-paper-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-sm">
                <span>Track an Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Information Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-paper-white dark:bg-[#16181d] rounded-[20px] ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-card">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-aubergine-ink dark:text-[#fafafa]">Need to submit an assignment today?</h3>
            <p className="text-sm text-warm-ash dark:text-[#a1a1aa] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone dark:text-[#9ca3af] flex-shrink-0" />
              We are located at the Shopping Complex (AIT Xerox Shop). Standard operating hours: 8:30 AM – 4:00 PM (Mon–Sat).
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
              className="bg-bone dark:bg-[#282b33] hover:bg-surface-container-high dark:hover:bg-[#343842] text-aubergine-ink dark:text-[#f4f4f6] border border-bone dark:border-white/10 text-sm font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

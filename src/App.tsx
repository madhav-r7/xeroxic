import { useState, useEffect } from 'react';
import { MapPin, PlayCircle } from 'lucide-react';
import { User, PrintJob, QueueHoldStatus } from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredJobs,
  syncJobsFromSupabase,
  getQueueHoldStatus,
  setQueueHoldStatus,
  DEMO_STUDENT,
  DEMO_ADMIN,
} from './services/storage';
import { subscribeToLiveJobs } from './services/supabase';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { LoginPage } from './components/LoginPage';
import { UploadAssignment } from './components/UploadAssignment';
import { TrackPrinting } from './components/TrackPrinting';
import { RateCard } from './components/RateCard';
import { AdminQueue } from './components/AdminQueue';
import { AdminHistory } from './components/AdminHistory';
import { StaffQrScanner } from './components/StaffQrScanner';
import { VanJourneyBackground } from './components/VanJourneyBackground';
import { LoadingScreen } from './components/LoadingScreen';
import { ServiceStatusView } from './components/ServiceStatusView';
import { PrinterStatusManager } from './components/PrinterStatusManager';
import { initTheme } from './services/theme';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [jobs, setJobs] = useState<PrintJob[]>(() => getStoredJobs());
  const [queueHold, setQueueHold] = useState<QueueHoldStatus>(() => getQueueHoldStatus());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const user = getStoredUser();
    if (user?.role === 'admin') return 'queue';
    return 'home';
  });
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [showLoadingSplash, setShowLoadingSplash] = useState<boolean>(true);

  // Initialize theme (default to dark) and scroll to top on navigation
  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, showSignInModal]);

  // Supabase initial sync, live subscription, and background 5s poller
  useEffect(() => {
    const doSync = async () => {
      try {
        const latest = await syncJobsFromSupabase();
        if (latest && latest.length > 0) {
          setJobs(latest);
        }
      } catch (err) {
        console.warn('Sync error:', err);
      }
    };

    doSync();
    const interval = setInterval(doSync, 5000);

    const unsubscribe = subscribeToLiveJobs(async () => {
      await doSync();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Keep jobs and user in sync with localStorage and custom window events
  useEffect(() => {
    const handleJobsUpdated = (e: any) => {
      if (e.detail) {
        setJobs(e.detail);
      } else {
        setJobs(getStoredJobs());
      }
    };

    const handleUserUpdated = (e: any) => {
      if (e.detail !== undefined) {
        setCurrentUser(e.detail);
      }
    };

    const handleQueueHoldUpdated = (e: any) => {
      if (e.detail) {
        setQueueHold(e.detail);
      } else {
        setQueueHold(getQueueHoldStatus());
      }
    };

    window.addEventListener('xeroxic_jobs_updated', handleJobsUpdated);
    window.addEventListener('xeroxic_user_updated', handleUserUpdated);
    window.addEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdated);
    window.addEventListener('storage', handleJobsUpdated);
    window.addEventListener('storage', handleQueueHoldUpdated);

    return () => {
      window.removeEventListener('xeroxic_jobs_updated', handleJobsUpdated);
      window.removeEventListener('xeroxic_user_updated', handleUserUpdated);
      window.removeEventListener('xeroxic_queue_hold_updated', handleQueueHoldUpdated);
      window.removeEventListener('storage', handleJobsUpdated);
      window.removeEventListener('storage', handleQueueHoldUpdated);
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    setShowSignInModal(false);
    if (user.role === 'admin') {
      setActiveTab('queue');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
    setActiveTab('home');
  };

  const handleRefreshJobs = async () => {
    const refreshed = await syncJobsFromSupabase();
    setJobs(refreshed);
  };

  const handleJobCreated = async (newJob: PrintJob) => {
    setJobs((prev) => [newJob, ...prev.filter((j) => j.id !== newJob.id)]);
    setActiveTab('track');
    const refreshed = await syncJobsFromSupabase();
    setJobs(refreshed);
  };

  const handleOpenPortal = () => {
    setActiveTab('upload');
  };

  // If sign in modal is requested, display the LoginPage modal
  if (showSignInModal) {
    return (
      <>
        {showLoadingSplash && (
          <LoadingScreen onComplete={() => setShowLoadingSplash(false)} />
        )}
        <LoginPage
          onLogin={handleLogin}
          onCancel={() => setShowSignInModal(false)}
        />
      </>
    );
  }

  return (
    <>
      {showLoadingSplash && (
        <LoadingScreen onComplete={() => setShowLoadingSplash(false)} />
      )}
      <div className="min-h-screen bg-linen dark:bg-[#0c0d10] text-aubergine-ink dark:text-[#f4f4f6] flex flex-col justify-between relative selection:bg-espresso selection:text-paper-white overflow-x-hidden transition-colors duration-300">
        {/* Ambient Gradient Glow Backdrop Layer matching Stitch design */}
        <div className="ambient-glow-layer fixed inset-0 pointer-events-none -z-10 transition-all duration-500 ease-out" />

        {/* Persistent 2D Monochrome Van Driving in Background of Every Page */}
        <VanJourneyBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar
          user={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSignIn={() => setShowSignInModal(true)}
          onLogout={handleLogout}
        />

        {/* Global Technical Hold Alert Banner for entire application */}
        {queueHold.isHeld && (
          <div className="bg-amber-500/15 dark:bg-amber-950/70 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-medium z-30 transition-all">
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span>
                  <strong>Counter Queue On Hold:</strong> {queueHold.reason || 'Technical issue at Xerox counter'}
                  {queueHold.estimatedResume && (
                    <span className="ml-1.5 font-normal text-amber-800 dark:text-amber-300">
                      • Expected resume: <strong>{queueHold.estimatedResume}</strong>
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-amber-800/90 dark:text-amber-300/90 hidden md:inline">
                  Submitted orders remain safely saved in queue
                </span>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      const res = setQueueHoldStatus(false, undefined, undefined, currentUser);
                      if (res.success) setQueueHold(res.status);
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1 shadow-xs"
                    title="Click to resume counter queue"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume Queue</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="pb-12">
          {activeTab === 'home' && (
            <HomeView
              onOpenPortal={handleOpenPortal}
              onOpenRates={() => setActiveTab('rates')}
              onOpenTracking={() => {
                if (!currentUser) {
                  setCurrentUser(DEMO_STUDENT);
                  saveStoredUser(DEMO_STUDENT);
                }
                setActiveTab('track');
              }}
              onOpenSignIn={() => setShowSignInModal(true)}
              onOpenStatus={() => setActiveTab('status')}
            />
          )}

          {activeTab === 'upload' && (
            <UploadAssignment
              user={currentUser || DEMO_STUDENT}
              onJobCreated={handleJobCreated}
            />
          )}

          {activeTab === 'track' && (
            <TrackPrinting
              user={currentUser || DEMO_STUDENT}
              jobs={jobs}
              onRefresh={handleRefreshJobs}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'rates' && <RateCard />}

          {activeTab === 'status' && (
            <ServiceStatusView
              onNavigateToUpload={() => setActiveTab('upload')}
              onNavigateToTrack={() => setActiveTab('track')}
            />
          )}

          {activeTab === 'printers' && (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PrinterStatusManager
                user={currentUser || DEMO_ADMIN}
                onJobUpdated={handleRefreshJobs}
              />
            </div>
          )}

          {activeTab === 'queue' && (
            <AdminQueue
              user={currentUser || DEMO_ADMIN}
              jobs={jobs}
              onRefresh={handleRefreshJobs}
              onOpenScanner={() => setActiveTab('scanner')}
            />
          )}

          {activeTab === 'scanner' && (
            <StaffQrScanner
              user={currentUser || DEMO_ADMIN}
              onNavigate={(tab) => setActiveTab(tab)}
              onRefresh={handleRefreshJobs}
            />
          )}

          {activeTab === 'history' && <AdminHistory jobs={jobs} />}
        </main>
      </div>

      {/* Editorial Linen & Ink Footer matching Stitch UI */}
      <footer className="w-full bg-bone/90 dark:bg-[#16181d]/90 backdrop-blur-sm py-8 text-on-surface dark:text-[#a1a1aa] border-t border-bone dark:border-white/10 relative z-10 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-espresso dark:text-[#fafafa] font-semibold">
                <span className="text-sm font-semibold tracking-tight">Xeroxic</span>
                <span className="text-stone">•</span>
                <span className="text-xs text-warm-ash dark:text-[#a1a1aa] font-medium uppercase tracking-wider">
                  Campus Print Studio • Shopping Complex
                </span>
              </div>
              <p className="text-xs text-warm-ash dark:text-[#a1a1aa]">
                AIT Xerox Shop • Shopping Complex, Army Institute of Technology • Operating Hours: Mon–Sat 8:30 AM – 7:30 PM • Direct Ext: 4108
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linen dark:bg-[#242730] text-xs text-on-surface dark:text-[#e4e4e7] border border-bone dark:border-white/10">
                <span>100% Recycled Grain • Zero-Waste Campus Initiative</span>
              </div>
              {!currentUser && (
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="text-xs font-semibold text-espresso dark:text-[#fafafa] hover:underline px-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Embedded Xerox Shop Location Map */}
          <div className="pt-4 border-t border-bone/60 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-espresso dark:text-[#fafafa]">
                <MapPin className="w-3.5 h-3.5 text-espresso dark:text-white" />
                <span>AIT Xerox Shop Location • Army Institute of Technology</span>
              </div>
              <span className="text-[11px] text-warm-ash dark:text-[#a1a1aa] hidden sm:inline">
                Dighi Hills, Alandi Road, Pune
              </span>
            </div>
            <div className="w-full rounded-[18px] overflow-hidden border border-bone dark:border-white/10 shadow-sm bg-linen dark:bg-[#20232a]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.269897016225!2d73.87251157519376!3d18.606926382503488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c70090000001%3A0x160a20f3d0273495!2sArmy%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1792728181272!5m2!1sen!2sin"
                width="100%"
                height="240"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="AIT Xerox Shop - Army Institute of Technology Location"
                className="w-full block"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

export default App;

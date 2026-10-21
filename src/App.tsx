import { useState, useEffect } from 'react';
import { User, PrintJob } from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredJobs,
  syncJobsFromSupabase,
  DEMO_STUDENT,
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

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [jobs, setJobs] = useState<PrintJob[]>(() => getStoredJobs());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const user = getStoredUser();
    if (user?.role === 'admin') return 'queue';
    return 'upload';
  });
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

  // Scroll to top on navigation
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

    window.addEventListener('xeroxic_jobs_updated', handleJobsUpdated);
    window.addEventListener('xeroxic_user_updated', handleUserUpdated);
    window.addEventListener('storage', handleJobsUpdated);

    return () => {
      window.removeEventListener('xeroxic_jobs_updated', handleJobsUpdated);
      window.removeEventListener('xeroxic_user_updated', handleUserUpdated);
      window.removeEventListener('storage', handleJobsUpdated);
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

  // Require user to sign in or create an account before accessing the app
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }

  if (showSignInModal) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onCancel={() => setShowSignInModal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linen text-aubergine-ink flex flex-col justify-between relative selection:bg-espresso selection:text-paper-white">
      {/* Ambient Gradient Glow Backdrop Layer matching Stitch design */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-300 ease-out"
        style={{
          background:
            'radial-gradient(circle at 50% 15%, rgba(220, 226, 250, 0.45) 0%, rgba(240, 242, 249, 0.25) 50%, rgba(247, 247, 245, 0.95) 100%)',
        }}
      />

      <div>
        <Navbar
          user={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSignIn={() => setShowSignInModal(true)}
          onLogout={handleLogout}
        />

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

          {activeTab === 'queue' && (
            <AdminQueue
              user={currentUser || DEMO_STUDENT}
              jobs={jobs}
              onRefresh={handleRefreshJobs}
            />
          )}

          {activeTab === 'history' && <AdminHistory jobs={jobs} />}
        </main>
      </div>

      {/* Editorial Linen & Ink Footer matching Stitch UI */}
      <footer className="w-full bg-bone/90 backdrop-blur-sm py-8 text-on-surface border-t border-bone relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-espresso font-semibold">
              <span className="text-sm font-semibold tracking-tight">Xeroxic</span>
              <span className="text-stone">•</span>
              <span className="text-xs text-warm-ash font-medium uppercase tracking-wider">
                Campus Print Studio • Library Ground Floor
              </span>
            </div>
            <p className="text-xs text-warm-ash">
              Room LG-04 • Operating Hours: Mon–Sat 8:30 AM – 7:30 PM • Direct Ext: 4108
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linen text-xs text-on-surface border border-bone">
              <span className="w-1.5 h-1.5 rounded-full bg-status-ready inline-block"></span>
              <span>100% Recycled Grain • Zero-Waste Campus Initiative</span>
            </div>
            {!currentUser && (
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-xs font-semibold text-espresso hover:underline px-2"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

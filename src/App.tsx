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
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, showSignInModal]);

  // Supabase initial sync and real-time subscription
  useEffect(() => {
    syncJobsFromSupabase().then((latest) => {
      if (latest && latest.length > 0) {
        setJobs(latest);
      }
    });

    const unsubscribe = subscribeToLiveJobs(async () => {
      const refreshed = await syncJobsFromSupabase();
      if (refreshed && refreshed.length > 0) {
        setJobs(refreshed);
      }
    });

    return () => {
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
      setActiveTab('upload');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
    setActiveTab('home');
  };

  const handleRefreshJobs = () => {
    setJobs(getStoredJobs());
  };

  const handleJobCreated = (_newJob: PrintJob) => {
    setJobs(getStoredJobs());
    setActiveTab('track');
  };

  // If user opens portal without an active session, default to demo student so they can upload immediately
  const handleOpenPortal = () => {
    if (!currentUser) {
      setCurrentUser(DEMO_STUDENT);
      saveStoredUser(DEMO_STUDENT);
    }
    setActiveTab('upload');
  };

  if (showSignInModal) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onCancel={() => setShowSignInModal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#242424] font-segoe flex flex-col justify-between">
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

      {/* Clean quiet footer */}
      <footer className="bg-white border-t border-[#e5e5e5] py-6 px-6 text-xs text-[#605e5c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#242424]">Xeroxic</span>
            <span>•</span>
            <span>College Xerox Station (Library Ground Floor • Counter 1 & 2)</span>
          </div>

          <div className="flex items-center space-x-5">
            <span>Operating Hours: 8:30 AM – 7:30 PM (Mon–Sat)</span>
            <span
              onClick={() => setShowSignInModal(true)}
              className="text-[#0067b8] hover:underline cursor-pointer"
            >
              Sign In
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

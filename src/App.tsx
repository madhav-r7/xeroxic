import { useState, useEffect } from 'react';
import { User, PrintJob } from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredJobs,
  DEMO_STUDENT,
  DEMO_ADMIN,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { UploadAssignment } from './components/UploadAssignment';
import { TrackPrinting } from './components/TrackPrinting';
import { RateCard } from './components/RateCard';
import { AdminQueue } from './components/AdminQueue';
import { AdminHistory } from './components/AdminHistory';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [jobs, setJobs] = useState<PrintJob[]>(() => getStoredJobs());
  const [activeTab, setActiveTab] = useState<string>('upload');

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

  // Update default tab when user changes role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setActiveTab('queue');
    } else {
      setActiveTab('upload');
    }
  }, [currentUser?.role]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    if (user.role === 'admin') {
      setActiveTab('queue');
    } else {
      setActiveTab('upload');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
  };

  const handleSwitchRole = () => {
    if (currentUser?.role === 'student') {
      handleLogin(DEMO_ADMIN);
    } else {
      handleLogin(DEMO_STUDENT);
    }
  };

  const handleRefreshJobs = () => {
    setJobs(getStoredJobs());
  };

  const handleJobCreated = (_newJob: PrintJob) => {
    setJobs(getStoredJobs());
    setActiveTab('track');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#242424] font-segoe flex flex-col justify-between">
      <div>
        <Navbar
          user={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
        />

        <main className="pb-12">
          {currentUser.role === 'student' ? (
            <>
              {activeTab === 'upload' && (
                <UploadAssignment user={currentUser} onJobCreated={handleJobCreated} />
              )}
              {activeTab === 'track' && (
                <TrackPrinting
                  user={currentUser}
                  jobs={jobs}
                  onRefresh={handleRefreshJobs}
                  onNavigateToUpload={() => setActiveTab('upload')}
                />
              )}
              {activeTab === 'rates' && <RateCard />}
            </>
          ) : (
            <>
              {activeTab === 'queue' && (
                <AdminQueue
                  user={currentUser}
                  jobs={jobs}
                  onRefresh={handleRefreshJobs}
                />
              )}
              {activeTab === 'history' && <AdminHistory jobs={jobs} />}
            </>
          )}
        </main>
      </div>

      {/* Clean footer */}
      <footer className="bg-white border-t border-[#e1dfdd] py-3.5 px-6 text-xs text-[#605e5c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#242424]">Xeroxic</span>
            <span>•</span>
            <span>College Xerox Station (Library Ground Floor • Counter 1 & 2)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Operating Hours: 8:30 AM – 7:30 PM (Mon–Sat)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

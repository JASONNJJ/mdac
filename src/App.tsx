import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { ApplicationWizard } from './pages/ApplicationWizard.tsx';
import { StatusCheck } from './pages/StatusCheck.tsx';
import { Privacy } from './pages/Privacy.tsx';
import { AdminLogin } from './pages/admin/AdminLogin.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { authService } from './services/authService.ts';

type ViewMode = 'home' | 'apply' | 'status' | 'privacy' | 'admin';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [statusSearchId, setStatusSearchId] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(authService.isAuthenticated());

  // Listen to hash changes for direct URL bookmarking e.g. #admin, #privacy, #status, #apply
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin') {
        setCurrentView('admin');
      } else if (hash === 'privacy') {
        setCurrentView('privacy');
      } else if (hash === 'status') {
        setCurrentView('status');
      } else if (hash === 'apply') {
        setCurrentView('apply');
      } else if (!hash || hash === 'home') {
        setCurrentView('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: ViewMode, hashValue?: string) => {
    setCurrentView(view);
    window.location.hash = hashValue || view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartApply = () => {
    navigateTo('apply');
  };

  const handleCheckStatus = (appId?: string) => {
    if (appId) {
      setStatusSearchId(appId);
    }
    navigateTo('status');
  };

  const handleGoHome = () => {
    navigateTo('home');
  };

  const handleViewPrivacy = () => {
    navigateTo('privacy');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Navbar with brand identity, language switcher & disclaimer banner */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => navigateTo(view as ViewMode)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onStartApply={handleStartApply}
            onCheckStatus={() => handleCheckStatus()}
            onViewPrivacy={handleViewPrivacy}
          />
        )}

        {currentView === 'apply' && (
          <ApplicationWizard
            onGoHome={handleGoHome}
            onCheckStatus={(id) => handleCheckStatus(id)}
          />
        )}

        {currentView === 'status' && (
          <StatusCheck
            initialAppId={statusSearchId}
            onApplyNew={handleStartApply}
          />
        )}

        {currentView === 'privacy' && (
          <Privacy onBack={handleGoHome} />
        )}

        {currentView === 'admin' && (
          <>
            {isAdminLoggedIn ? (
              <AdminDashboard
                onLogout={() => {
                  setIsAdminLoggedIn(false);
                  navigateTo('home');
                }}
                onGoToSite={handleGoHome}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => setIsAdminLoggedIn(true)}
                onBackToSite={handleGoHome}
              />
            )}
          </>
        )}
      </main>

      {/* Footer with mandatory disclaimers and compliance notes */}
      <Footer
        onNavigate={(view) => navigateTo(view as ViewMode)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

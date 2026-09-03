import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Dashboards
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { AdminCenterDashboard } from './components/dashboards/AdminCenterDashboard';
import { StudentAdvisorDashboard } from './components/dashboards/StudentAdvisorDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';

// Views
import { UserManagement } from './components/views/UserManagement';
import { ClassManagement } from './components/views/ClassManagement';
import { CenterManagement } from './components/views/CenterManagement';
import { ModuleCurriculumView } from './components/views/ModuleCurriculumView';
import { LiveMonitoringView } from './components/views/LiveMonitoringView';
import { ScheduleTimetable } from './components/views/ScheduleTimetable';
import { StudentPortfoliosView } from './components/views/StudentPortfoliosView';
import { LoginView } from './components/views/LoginView';

export const App: React.FC = () => {
  const { currentUser, isAuthenticated, isLoadingDb, dbError } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Show loading while DB connects
  if (isLoadingDb && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-brand-pink rounded-full animate-spin mx-auto" />
          <p className="text-white/80 text-sm font-medium">Menghubungkan ke database Neon...</p>
          {dbError && <p className="text-brand-pink text-xs max-w-xs">{dbError}</p>}
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Render proper content based on role & active tab
  const renderContent = () => {
    // If activeTab is 'dashboard', render specific role dashboard
    if (activeTab === 'dashboard') {
      switch (currentUser.role) {
        case 'admin':
          return <AdminDashboard onNavigate={setActiveTab} />;
        case 'admin_center':
          return <AdminCenterDashboard onNavigate={setActiveTab} />;
        case 'student_advisor':
          return <StudentAdvisorDashboard onNavigate={setActiveTab} />;
        case 'teacher':
          return <TeacherDashboard onNavigate={setActiveTab} />;
        case 'parent':
          return <ParentDashboard onNavigate={setActiveTab} />;
        case 'student':
          return <StudentDashboard onNavigate={setActiveTab} />;
      }
    }

    // Role-specific sub tabs
    if (activeTab === 'users' || activeTab === 'students') {
      return <UserManagement />;
    }
    if (activeTab === 'classes' || activeTab === 'my_classes') {
      return <ClassManagement />;
    }
    if (activeTab === 'centers') {
      return <CenterManagement />;
    }
    if (activeTab === 'modules' || activeTab === 'learning_modules') {
      return <ModuleCurriculumView />;
    }
    if (activeTab === 'monitoring' || activeTab === 'attendance_mark' || activeTab === 'attendance_confirm') {
      return <LiveMonitoringView />;
    }
    if (activeTab === 'schedule' || activeTab === 'my_schedule') {
      return <ScheduleTimetable />;
    }
    if (activeTab === 'classrooms' || activeTab === 'trial_classes') {
      return <AdminCenterDashboard onNavigate={setActiveTab} />;
    }
    if (activeTab === 'projects' || activeTab === 'my_projects' || activeTab === 'student_progress') {
      if (currentUser.role === 'student') {
        return <StudentDashboard onNavigate={setActiveTab} />;
      }
      return <StudentPortfoliosView />;
    }
    if (activeTab === 'children_progress' || activeTab === 'attendance_history') {
      return <ParentDashboard onNavigate={setActiveTab} />;
    }

    return <AdminDashboard onNavigate={setActiveTab} />;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Responsive Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

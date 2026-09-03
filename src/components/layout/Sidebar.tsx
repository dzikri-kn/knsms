import React from 'react';
import { useApp } from '../../context/AppContext';
import { KodingNextLogo } from '../ui';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  Building2,
  DoorClosed,
  GraduationCap,
  ClipboardCheck,
  Sparkles,
  Compass,
  FolderGit2,
  LogOut,
  Code2,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { currentUser } = useApp();

  // Navigation menu items mapped according to Role in English
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
          { id: 'classes', label: 'Class Management', icon: <BookOpen className="w-5 h-5" /> },
          { id: 'schedule', label: 'Schedule & Timetable', icon: <CalendarDays className="w-5 h-5" /> },
          { id: 'centers', label: 'Centers', icon: <Building2 className="w-5 h-5" /> },
          { id: 'modules', label: 'Modules', icon: <GraduationCap className="w-5 h-5" /> },
          { id: 'projects', label: 'Student Portfolios', icon: <FolderGit2 className="w-5 h-5" /> },
        ];
      case 'admin_center':
        return [
          { id: 'dashboard', label: 'Center Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'users', label: 'Center Staff & Students', icon: <Users className="w-5 h-5" /> },
          { id: 'classes', label: 'Center Classes', icon: <BookOpen className="w-5 h-5" /> },
          { id: 'schedule', label: 'Schedule Timetable', icon: <CalendarDays className="w-5 h-5" /> },
        ];
      case 'student_advisor':
        return [
          { id: 'dashboard', label: 'Advisor Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'students', label: 'Student Leads & CRM', icon: <Users className="w-5 h-5" /> },
          { id: 'trial_classes', label: 'Trial & Consult Booking', icon: <Compass className="w-5 h-5" /> },
          { id: 'classes', label: 'Class Slots & Capacity', icon: <BookOpen className="w-5 h-5" /> },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Teacher Portal', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'my_classes', label: 'Assigned Classes', icon: <BookOpen className="w-5 h-5" /> },
          { id: 'attendance_mark', label: 'Mark Live Attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
          { id: 'my_schedule', label: 'Teaching Schedule', icon: <CalendarDays className="w-5 h-5" /> },
          { id: 'learning_modules', label: 'Curriculum & Guides', icon: <GraduationCap className="w-5 h-5" /> },
          { id: 'student_progress', label: 'Student Grade & Feedback', icon: <Sparkles className="w-5 h-5" /> },
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: 'Parent Portal', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'children_progress', label: 'My Children Progress', icon: <Users className="w-5 h-5" /> },
          { id: 'attendance_history', label: 'Attendance History', icon: <ClipboardCheck className="w-5 h-5" /> },
          { id: 'my_projects', label: 'Student Project Showcase', icon: <FolderGit2 className="w-5 h-5" /> },
          { id: 'my_schedule', label: 'Weekly Schedule', icon: <CalendarDays className="w-5 h-5" /> },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Student Portal', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'my_projects', label: 'My Project Portfolio', icon: <FolderGit2 className="w-5 h-5" /> },
          { id: 'learning_modules', label: 'Module Lessons & XP', icon: <Sparkles className="w-5 h-5" /> },
          { id: 'my_schedule', label: 'Class Timetable', icon: <CalendarDays className="w-5 h-5" /> },
          { id: 'attendance_confirm', label: 'Attendance History', icon: <ClipboardCheck className="w-5 h-5" /> },
        ];
    }
  };

  const navItems = getNavItems();

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Logo & Mobile Close Button */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <KodingNextLogo variant="light" size="sm" showSubtitle />

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>v1.0 • Responsive Ready</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live
          </span>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal } from '../ui';
import { ClassItem } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Plus,
  DoorClosed,
  User,
  Users,
  Video,
  Eye,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  MapPin,
  Building2
} from 'lucide-react';

export const ScheduleTimetable: React.FC = () => {
  const { currentUser, classes, centers, classrooms, selectedCenterId, setSelectedCenterId, addClass } = useApp();

  const isAdminCenter = currentUser.role === 'admin_center';
  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  const [currentView, setCurrentView] = useState<'week' | 'day' | 'month'>('week');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState<string>(isAdminCenter ? assignedCenterIds[0] : 'all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Available centers for dropdown
  const availableCenters = isAdminCenter 
    ? centers.filter(c => assignedCenterIds.includes(c.id))
    : centers;

  // Available rooms based on selected center filter
  const availableRooms = selectedCenterFilter === 'all'
    ? (isAdminCenter ? classrooms.filter(r => assignedCenterIds.includes(r.centerId)) : classrooms)
    : classrooms.filter(r => r.centerId === selectedCenterFilter || r.centerName === selectedCenterFilter || selectedCenterFilter === 'ctr-online');

  // Week configuration (Google Calendar style: Mon - Sun)
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayDates = [
    { day: 'Monday', date: 'Aug 31' },
    { day: 'Tuesday', date: 'Sep 1' },
    { day: 'Wednesday', date: 'Sep 2' },
    { day: 'Thursday', date: 'Sep 3' },
    { day: 'Friday', date: 'Sep 4' },
    { day: 'Saturday', date: 'Sep 5' },
    { day: 'Sunday', date: 'Sep 6' }
  ];

  // Working Time Slots: 08:00 AM to 19:00 PM (1-hour slots)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Child IDs for parent
  const parentChildIds = new Set([
    ...(currentUser.childrenIds || []),
    ...users.filter(u => u.parentId === currentUser.id).map(u => u.id)
  ]);

  // Filtered Classes based on Role, Center, Room, and Type
  const filteredClasses = classes.filter((cls) => {
    // 1. Super Admin sees all
    if (currentUser.role === 'admin') {
      // no role restriction
    }
    // 2. Admin Center sees classes in assigned center(s)
    else if (currentUser.role === 'admin_center') {
      if (!assignedCenterIds.includes(cls.centerId)) return false;
    }
    // 3. Student Advisor sees classes in assigned center(s)
    else if (currentUser.role === 'student_advisor') {
      if (!assignedCenterIds.includes(cls.centerId)) return false;
    }
    // 4. Teacher only sees classes they teach
    else if (currentUser.role === 'teacher') {
      if (cls.teacherId !== currentUser.id && cls.teacherName !== currentUser.name) return false;
    }
    // 5. Parent only sees classes where their children are enrolled
    else if (currentUser.role === 'parent') {
      const hasChildEnrolled = (cls.studentIds || []).some(sid => parentChildIds.has(sid));
      if (!hasChildEnrolled) return false;
    }
    // 6. Student only sees classes they are enrolled in
    else if (currentUser.role === 'student') {
      if (!(cls.studentIds || []).includes(currentUser.id)) return false;
    }

    const matchesCenter = selectedCenterFilter === 'all' || cls.centerId === selectedCenterFilter || cls.centerName === selectedCenterFilter;
    const matchesRoom = selectedRoomFilter === 'all' || cls.roomId === selectedRoomFilter || cls.roomName === selectedRoomFilter;
    const matchesType = selectedTypeFilter === 'all' || cls.type === selectedTypeFilter;
    return matchesCenter && matchesRoom && matchesType;
  });

  // Calculate pixel top and height for time placement
  const calculatePosition = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const baseHour = 8; // 08:00 is top 0
    const startMinutesFromBase = (startH - baseHour) * 60 + startM;
    const endMinutesFromBase = (endH - baseHour) * 60 + endM;
    const durationMinutes = Math.max(endMinutesFromBase - startMinutesFromBase, 45);

    // Each hour slot is 64px tall (approx 1.066px per minute)
    const pxPerMinute = 64 / 60;
    const top = Math.max(startMinutesFromBase * pxPerMinute, 0);
    const height = durationMinutes * pxPerMinute;

    return { top: `${top}px`, height: `${height}px` };
  };

  // Google Calendar Event Color Palette by module / type
  const getEventStyle = (cls: ClassItem) => {
    if (cls.type === 'Trial') {
      return {
        bg: 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        indicator: 'bg-amber-500'
      };
    }
    if (cls.type === 'Make-up' || cls.type === 'Catchup') {
      return {
        bg: 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        indicator: 'bg-rose-500'
      };
    }
    if (cls.moduleLevel === 'LK 4-6') {
      return {
        bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        indicator: 'bg-emerald-500'
      };
    }
    if (cls.moduleLevel === 'JK 7-9') {
      return {
        bg: 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-900',
        badge: 'bg-sky-100 text-sky-800 border-sky-300',
        indicator: 'bg-sky-500'
      };
    }
    if (cls.moduleLevel === 'JK 10-12') {
      return {
        bg: 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900',
        badge: 'bg-purple-100 text-purple-800 border-purple-300',
        indicator: 'bg-purple-500'
      };
    }
    // JK 12-16 / Default
    return {
      bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      indicator: 'bg-indigo-600'
    };
  };

  const handleOpenDetail = (cls: ClassItem) => {
    setSelectedClass(cls);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Google Calendar Navigation Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Today, Date Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm shadow-primary-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Weekly Schedule</h1>
              <p className="text-xs text-gray-500">Aug 31 – Sep 6, 2026</p>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-1">
            <button 
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => {}}
            >
              Today
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Filters, View Toggle & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Center Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedCenterFilter}
              onChange={(e) => {
                setSelectedCenterFilter(e.target.value);
                setSelectedRoomFilter('all');
              }}
              className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none max-w-[160px] truncate"
            >
              <option value="all">All Centers ({centers.length})</option>
              {centers.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <DoorClosed className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none max-w-[150px] truncate"
            >
              <option value="all">All Rooms ({availableRooms.length})</option>
              {availableRooms.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="Regular">Regular</option>
              <option value="Trial">Trial</option>
              <option value="Make-up">Make-up</option>
              <option value="Catchup">Catchup</option>
            </select>
          </div>

          {/* View Mode Toggle (Week, Day, Month) */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currentView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currentView === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currentView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {currentView === 'week' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Calendar Header: Day Columns Header */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10">
            {/* GMT Timezone cell */}
            <div className="p-3 text-center border-r border-gray-200 flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GMT+7</span>
            </div>

            {/* 7 Days Headers */}
            {dayDates.map((item, idx) => {
              const isToday = item.day === 'Monday'; // sample today highlight
              return (
                <div 
                  key={item.day}
                  className={`py-3 px-2 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {item.day.slice(0, 3)}
                  </div>
                  <div className="mt-0.5 flex justify-center">
                    <span className={`inline-flex items-center justify-center text-sm font-bold w-7 h-7 rounded-full ${
                      isToday 
                        ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/40' 
                        : 'text-gray-900'
                    }`}>
                      {item.date.split(' ')[1]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timetable Body Grid with Horizontal Hour Gridlines */}
          <div className="overflow-y-auto max-h-[680px] relative">
            <div className="grid grid-cols-[64px_repeat(7,1fr)] relative min-w-[750px]">
              {/* Left Column: Hour Time Labels */}
              <div className="border-r border-gray-200 bg-gray-50/40 select-none">
                {timeSlots.map((time) => (
                  <div key={time} className="h-16 border-b border-gray-100 pr-2 text-right">
                    <span className="text-[11px] font-medium text-gray-400 relative -top-2.5">
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* 7 Day Columns with Event Overlays */}
              {daysOfWeek.map((day) => {
                const dayEvents = filteredClasses.filter(c => c.dayOfWeek === day);

                return (
                  <div 
                    key={day} 
                    className="relative border-r border-gray-200 last:border-r-0 border-b border-gray-200 bg-white hover:bg-gray-50/30 transition-colors"
                  >
                    {/* Horizontal background grid lines */}
                    {timeSlots.map((time) => (
                      <div key={time} className="h-16 border-b border-gray-100/80"></div>
                    ))}

                    {/* Events absolute positioned over grid */}
                    {dayEvents.map((cls) => {
                      const pos = calculatePosition(cls.startTime, cls.endTime);
                      const style = getEventStyle(cls);

                      return (
                        <div
                          key={cls.id}
                          onClick={() => handleOpenDetail(cls)}
                          style={{ top: pos.top, height: pos.height }}
                          className={`absolute left-1 right-1 rounded-xl p-2.5 border transition-all cursor-pointer shadow-xs hover:shadow-md hover:z-20 flex flex-col justify-between overflow-hidden ${style.bg}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${style.badge}`}>
                                {cls.type}
                              </span>
                              <span className="text-[10px] font-semibold opacity-75">
                                {cls.startTime} - {cls.endTime}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs leading-tight line-clamp-1">
                              {cls.name}
                            </h4>
                            <p className="text-[11px] opacity-80 line-clamp-1 mt-0.5">
                              {cls.moduleLevel} • {cls.roomName.split('(')[0]}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] opacity-90 pt-1 border-t border-black/5 mt-1">
                            <span className="truncate max-w-[85px]">👤 {cls.teacherName}</span>
                            <span className="font-bold">👥 {cls.enrolledStudentsCount}/{cls.capacity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Day View Mode */}
      {currentView === 'day' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Today's Sessions (Saturday Schedule)</h2>
              <p className="text-xs text-gray-500">Complete chronological agenda for active classes</p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredClasses.filter(c => c.dayOfWeek === 'Saturday').map((cls) => {
              const style = getEventStyle(cls);
              return (
                <div 
                  key={cls.id}
                  onClick={() => handleOpenDetail(cls)}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:shadow-md ${style.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 shrink-0 text-center min-w-[70px]">
                      <span className="block text-xs font-bold text-gray-900">{cls.startTime}</span>
                      <span className="block text-[10px] text-gray-400">{cls.endTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${style.badge}`}>
                          {cls.type}
                        </span>
                        <span className="text-xs font-bold text-gray-700">{cls.moduleLevel}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{cls.name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{cls.centerName} • {cls.roomName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-[10px]">INSTRUCTOR</span>
                      {cls.teacherName}
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">ENROLLMENT</span>
                      {cls.enrolledStudentsCount}/{cls.capacity} Students
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClass(cls);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View Mode */}
      {currentView === 'month' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-600">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = (i % 31) + 1;
              const hasEvents = dayNum === 29 || dayNum === 30 || dayNum === 5 || dayNum === 6;
              return (
                <div key={i} className="bg-white min-h-[90px] p-2 hover:bg-gray-50/50 transition-colors">
                  <span className={`text-xs font-semibold ${dayNum === 31 ? 'text-primary-600 font-bold' : 'text-gray-700'}`}>
                    {dayNum}
                  </span>
                  {hasEvents && (
                    <div className="mt-1 space-y-1">
                      <div className="text-[10px] bg-primary-50 text-primary-700 p-1 rounded font-medium truncate">
                        Python Teens (10:00)
                      </div>
                      <div className="text-[10px] bg-amber-50 text-amber-700 p-1 rounded font-medium truncate">
                        Trial Session (14:00)
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Class Session Details"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <Badge variant={selectedClass.type === 'Trial' ? 'warning' : 'primary'} size="sm">
                  {selectedClass.type} Class
                </Badge>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedClass.name}</h3>
                <p className="text-xs text-gray-500">{selectedClass.code} • {selectedClass.moduleLevel}</p>
              </div>
              {(selectedClass.centerName === 'Online' || selectedClass.centerId === 'ctr-online') && selectedClass.zoomLink ? (
                <a
                  href={selectedClass.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Video className="w-3.5 h-3.5" /> Launch Zoom
                </a>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> On-site Center
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">SCHEDULE & TIME</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary-500" /> {selectedClass.dayOfWeek}, {selectedClass.startTime} - {selectedClass.endTime}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">LOCATION & ROOM</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <DoorClosed className="w-3.5 h-3.5 text-purple-500" /> {selectedClass.roomName}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">ASSIGNED TEACHER</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-500" /> {selectedClass.teacherName}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">BRANCH CAMPUS</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> {selectedClass.centerName}
                </span>
              </div>
            </div>

            <div className="p-3 bg-primary-50/50 border border-primary-100 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-primary-900">Capacity & Student Enrolled</span>
                <span className="font-bold text-primary-700">{selectedClass.enrolledStudentsCount} of {selectedClass.capacity} seats</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-600 rounded-full" 
                  style={{ width: `${(selectedClass.enrolledStudentsCount / selectedClass.capacity) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                Manage Class Batch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

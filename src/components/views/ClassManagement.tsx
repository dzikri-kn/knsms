import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, ConfirmDialog, Avatar } from '../ui';
import { ClassItem, ClassType } from '../../types';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  DoorClosed, 
  Trash2, 
  Edit, 
  Video, 
  Users, 
  ExternalLink,
  Layers,
  Building2,
  Filter,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const { currentUser, classes, addClass, updateClass, deleteClass, modules, classrooms, users, centers } = useApp();

  const isAdminCenter = currentUser.role === 'admin_center';
  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterCenterId, setFilterCenterId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [centerId, setCenterId] = useState(isAdminCenter ? assignedCenterIds[0] : (centers[0]?.id || 'ctr-kemayoran'));
  const [roomId, setRoomId] = useState(classrooms[0]?.id || '');
  const [moduleId, setModuleId] = useState(modules[0]?.id || '');
  const [classType, setClassType] = useState<ClassType>('Regular');
  const [teacherId, setTeacherId] = useState(users.find(u => u.role === 'teacher')?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Saturday');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [zoomLink, setZoomLink] = useState('');

  // Available Students based on selected Center
  const availableStudents = users.filter(u => {
    if (u.role !== 'student') return false;
    if (centerId === 'ctr-online') return true;
    return u.centerId === centerId;
  });
  const activeStudents = availableStudents.length > 0 ? availableStudents : users.filter(u => u.role === 'student');

  // Available Teachers based on selected Center
  const availableTeachers = users.filter(u => {
    if (u.role !== 'teacher') return false;
    if (centerId === 'ctr-online') return true; // All teachers can teach online
    return u.centerId === centerId || (u.centerIds && u.centerIds.includes(centerId));
  });
  const activeTeachers = availableTeachers.length > 0 ? availableTeachers : users.filter(u => u.role === 'teacher');

  // Available Classrooms based on selected Center
  const availableRooms = classrooms.filter(r => r.centerId === centerId || centerId === 'ctr-online');
  const activeRooms = availableRooms.length > 0 ? availableRooms : classrooms;

  // Selected Teacher specialization modules (if any)
  const currentTeacher = users.find(u => u.id === teacherId);
  const teacherSpecializations = currentTeacher?.specialization ? currentTeacher.specialization.split(',').map(s => s.trim()) : [];
  
  // Available Modules tailored to teacher/center
  const availableModules = teacherSpecializations.length > 0
    ? modules.filter(m => teacherSpecializations.some(spec => m.title.includes(spec) || spec.includes(m.title)))
    : modules;
  const activeModules = availableModules.length > 0 ? availableModules : modules;

  const handleToggleStudent = (sId: string) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(sId)) {
        return prev.filter(id => id !== sId);
      }
      if (prev.length >= 6) {
        return prev; // capped strictly at 6 students max
      }
      return [...prev, sId];
    });
  };

  // Child IDs for parent
  const parentChildIds = new Set([
    ...(currentUser.childrenIds || []),
    ...users.filter(u => u.parentId === currentUser.id).map(u => u.id)
  ]);

  const filteredClasses = classes.filter((c) => {
    // 1. Super Admin sees all classes
    if (currentUser.role === 'admin') {
      // no restriction
    }
    // 2. Center Admin sees classes in assigned center(s)
    else if (currentUser.role === 'admin_center') {
      if (!assignedCenterIds.includes(c.centerId)) return false;
    }
    // 3. Student Advisor sees classes in assigned center(s)
    else if (currentUser.role === 'student_advisor') {
      if (!assignedCenterIds.includes(c.centerId)) return false;
    }
    // 4. Teacher only sees classes they teach
    else if (currentUser.role === 'teacher') {
      if (c.teacherId !== currentUser.id && c.teacherName !== currentUser.name) return false;
    }
    // 5. Parent only sees classes where their child is enrolled
    else if (currentUser.role === 'parent') {
      const hasChildEnrolled = (c.studentIds || []).some(sid => parentChildIds.has(sid));
      if (!hasChildEnrolled) return false;
    }
    // 6. Student only sees classes they are enrolled in
    else if (currentUser.role === 'student') {
      if (!(c.studentIds || []).includes(currentUser.id)) return false;
    }

    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesCenter = filterCenterId === 'all' || c.centerId === filterCenterId;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.centerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesCenter && matchesSearch;
  });

  const handleCenterChange = (newCenterId: string) => {
    setCenterId(newCenterId);
    
    // Auto cascade available rooms for this center
    const roomsForCenter = classrooms.filter(r => r.centerId === newCenterId || newCenterId === 'ctr-online');
    if (roomsForCenter.length > 0) {
      setRoomId(roomsForCenter[0].id);
    }

    // Auto cascade available teachers for this center
    const teachersForCenter = users.filter(u => 
      u.role === 'teacher' && 
      (newCenterId === 'ctr-online' || u.centerId === newCenterId || (u.centerIds && u.centerIds.includes(newCenterId)))
    );
    if (teachersForCenter.length > 0) {
      setTeacherId(teachersForCenter[0].id);
    }

    // Clear student selection when center changes to avoid mismatch
    setSelectedStudentIds([]);
  };

  // Helper to parse "HH:MM" into minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  // Check if two time ranges on the same day overlap
  const isTimeOverlapping = (startA: string, endA: string, startB: string, endB: string): boolean => {
    const sA = parseTimeToMinutes(startA);
    const eA = parseTimeToMinutes(endA);
    const sB = parseTimeToMinutes(startB);
    const eB = parseTimeToMinutes(endB);
    return Math.max(sA, sB) < Math.min(eA, eB);
  };

  const handleOpenCreate = () => {
    setFormError(null);
    setEditingClass(null);
    const initialCenter = centers[0]?.id || 'ctr-kemayoran';
    setCenterId(initialCenter);

    const roomsForCenter = classrooms.filter(r => r.centerId === initialCenter || initialCenter === 'ctr-online');
    setRoomId(roomsForCenter[0]?.id || classrooms[0]?.id || 'room-1');

    const firstModule = modules[0];
    setClassName(firstModule?.title || 'JK 12-16 Python First');
    setClassCode(`CLS-KN-${Math.floor(100 + Math.random() * 900)}`);
    setClassType('Regular');
    setModuleId(firstModule?.id || 'mod-jk-12');

    const teachersForCenter = users.filter(u => 
      u.role === 'teacher' && 
      (initialCenter === 'ctr-online' || u.centerId === initialCenter || (u.centerIds && u.centerIds.includes(initialCenter)))
    );
    const initialTeacher = teachersForCenter[0] || users.find(u => u.role === 'teacher');
    setTeacherId(initialTeacher?.id || 'usr-teacher-1');

    setSelectedStudentIds([]);
    setDayOfWeek('Saturday');
    setStartTime('10:00');
    setEndTime('12:00');
    setZoomLink('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setFormError(null);
    setEditingClass(cls);
    setClassName(cls.name);
    setClassCode(cls.code);
    setClassType(cls.type);
    setCenterId(cls.centerId || centers[0]?.id || 'ctr-kemayoran');
    setRoomId(cls.roomId);
    setModuleId(cls.moduleId);
    setTeacherId(cls.teacherId);
    setSelectedStudentIds(cls.studentIds || []);
    setDayOfWeek(cls.dayOfWeek);
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setZoomLink(cls.zoomLink || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate times
    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    if (endMin <= startMin) {
      setFormError('Jam selesai harus lebih besar dari jam mulai kelas.');
      return;
    }

    const selModule = modules.find(m => m.id === moduleId) || modules[0];
    const selTeacher = users.find(t => t.id === teacherId) || activeTeachers[0];
    const selCenter = centers.find(c => c.id === centerId) || centers[0];
    const selRoom = classrooms.find(r => r.id === roomId) || activeRooms[0];

    // Check conflict: Teacher or Room overlap on the same day
    const otherClasses = classes.filter(c => editingClass ? c.id !== editingClass.id : true);

    // 1. Teacher Conflict Check (A teacher cannot be in two classes at the same time, even across different centers)
    const teacherConflict = otherClasses.find(c => 
      (c.teacherId === selTeacher.id || c.teacherName === selTeacher.name) &&
      c.dayOfWeek === dayOfWeek &&
      isTimeOverlapping(c.startTime, c.endTime, startTime, endTime)
    );

    if (teacherConflict) {
      setFormError(
        `Jadwal bentrok untuk Guru "${selTeacher.name}"! Guru sudah mengajar di kelas "${teacherConflict.name}" (${teacherConflict.dayOfWeek}, ${teacherConflict.startTime} - ${teacherConflict.endTime}) di ${teacherConflict.centerName}.`
      );
      return;
    }

    // 2. Room Conflict Check (Physical room cannot be used by two classes at the same time in the same center)
    if (selCenter.id !== 'ctr-online' && selCenter.name !== 'Online') {
      const roomConflict = otherClasses.find(c => 
        (c.centerId === selCenter.id) &&
        (c.roomId === selRoom.id || c.roomName === selRoom.name) &&
        c.dayOfWeek === dayOfWeek &&
        isTimeOverlapping(c.startTime, c.endTime, startTime, endTime)
      );

      if (roomConflict) {
        setFormError(
          `Ruangan bentrok! Ruangan "${selRoom.name}" sudah digunakan oleh kelas "${roomConflict.name}" pada ${roomConflict.dayOfWeek}, ${roomConflict.startTime} - ${roomConflict.endTime}.`
        );
        return;
      }
    }

    if (editingClass) {
      updateClass(editingClass.id, {
        name: className || selModule.title,
        code: classCode,
        type: classType,
        moduleId: selModule.id,
        moduleName: selModule.title,
        moduleLevel: selModule.level,
        teacherId: selTeacher.id,
        teacherName: selTeacher.name,
        teacherAvatar: selTeacher.avatar,
        centerId: selCenter.id,
        centerName: selCenter.name,
        roomId: selRoom.id,
        roomName: selRoom.name,
        dayOfWeek,
        startTime,
        endTime,
        capacity: 6,
        enrolledStudentsCount: selectedStudentIds.length,
        studentIds: selectedStudentIds,
        zoomLink: (selCenter.id === 'ctr-online' || selCenter.name === 'Online') ? zoomLink : undefined,
      });
    } else {
      addClass({
        name: className || selModule.title,
        code: classCode,
        type: classType,
        moduleId: selModule.id,
        moduleName: selModule.title,
        moduleLevel: selModule.level,
        teacherId: selTeacher.id,
        teacherName: selTeacher.name,
        teacherAvatar: selTeacher.avatar,
        centerId: selCenter.id,
        centerName: selCenter.name,
        roomId: selRoom.id,
        roomName: selRoom.name,
        dayOfWeek,
        startTime,
        endTime,
        capacity: 6,
        enrolledStudentsCount: selectedStudentIds.length,
        studentIds: selectedStudentIds,
        status: 'active',
        zoomLink: (selCenter.id === 'ctr-online' || selCenter.name === 'Online') ? zoomLink : undefined,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class & Batch Management</h1>
          <p className="text-sm text-gray-500">Manage Regular, Catchup, Make-up, Consult, and Free Trial class schedules</p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Create New Class
        </Button>
      </div>

      {/* Class Type Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Class Types' },
          { id: 'Regular', label: 'Regular Batch' },
          { id: 'Trial', label: 'Free Trial Coding' },
          { id: 'Catchup', label: 'Catchup Lesson' },
          { id: 'Make-up', label: 'Make-up Session' },
          { id: 'Consult', label: 'Consultation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shrink-0 ${
              filterType === tab.id
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Center Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class name, batch code, instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filter by Center Dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
          <select
            value={filterCenterId}
            onChange={(e) => setFilterCenterId(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Centers ({centers.length} Branches)</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          // Check if this class has any conflict with other classes
          const otherClasses = classes.filter(c => c.id !== cls.id);
          const hasConflict = otherClasses.some(c => 
            c.dayOfWeek === cls.dayOfWeek &&
            isTimeOverlapping(c.startTime, c.endTime, cls.startTime, cls.endTime) &&
            ((c.teacherId === cls.teacherId || c.teacherName === cls.teacherName) ||
             (cls.centerId !== 'ctr-online' && c.centerId === cls.centerId && (c.roomId === cls.roomId || c.roomName === cls.roomName)))
          );

          return (
          <Card key={cls.id} className={`flex flex-col justify-between hover:shadow-md transition-shadow relative ${
            hasConflict ? 'border-2 border-rose-400 bg-rose-50/20' : ''
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant={
                      cls.type === 'Regular' ? 'primary' :
                      cls.type === 'Trial' ? 'warning' :
                      cls.type === 'Make-up' ? 'purple' : 'success'
                    }
                    size="sm"
                  >
                    {cls.type}
                  </Badge>
                  {hasConflict && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-300 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Jadwal Bertabrakan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(cls)} aria-label="Edit Class" className="p-1 text-gray-400 hover:text-primary-600 rounded cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setClassToDelete(cls)} aria-label="Delete Class" className="p-1 text-gray-400 hover:text-danger-600 rounded cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-base font-bold text-gray-900 mt-2.5">{cls.name}</h2>
              <div className="text-xs text-gray-400 font-mono">{cls.code}</div>

              {/* Details */}
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" /> Center:</span>
                  <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md text-[11px] border border-primary-100">
                    {cls.centerName || 'Online'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Schedule:</span>
                  <span className="font-bold text-gray-900">{cls.dayOfWeek}, {cls.startTime} - {cls.endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><DoorClosed className="w-3.5 h-3.5 text-gray-400" /> Room:</span>
                  <span className="font-medium text-gray-800">{cls.roomName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /> Instructor:</span>
                  <span className="font-medium text-gray-800">{cls.teacherName}</span>
                </div>
              </div>
            </div>

            {/* Bottom: Capacity Bar & Zoom (Online Only) */}
            <div className="mt-5 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Occupancy:</span>
                <span className="font-bold text-gray-900">{cls.enrolledStudentsCount} / {cls.capacity} Students</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (cls.enrolledStudentsCount / cls.capacity) * 100)}%` }}
                />
              </div>

              {/* Zoom Button only for Online Center */}
              {(cls.centerName === 'Online' || cls.centerId === 'ctr-online') && cls.zoomLink ? (
                <div className="mt-3">
                  <a
                    href={cls.zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
                  >
                    <Video className="w-3.5 h-3.5" /> Open Class Zoom ↗
                  </a>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="w-full py-1.5 bg-gray-50 text-gray-500 font-medium rounded-lg text-[11px] flex items-center justify-center gap-1.5 border border-gray-100">
                    <Building2 className="w-3.5 h-3.5" /> On-site Offline Session ({cls.roomName})
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Create/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? 'Edit Class' : 'Create New Class'}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{formError}</div>
            </div>
          )}

          {/* Step 1: Select Center */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              1. Select Branch Center
            </label>
            <select
              value={centerId}
              onChange={(e) => handleCenterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border-2 border-primary-300 rounded-xl text-sm font-semibold text-gray-900 bg-primary-50/30 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {centers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id === 'ctr-online' ? '(Virtual / Zoom)' : `(${c.city})`}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Room */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              2. Select Room / Lab ({activeRooms.length} available in {centers.find(c => c.id === centerId)?.name || 'Center'})
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
            >
              {activeRooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} (Max: 6 Students)</option>
              ))}
            </select>
          </div>

          {/* Step 3: Select Module & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">3. Curriculum Module (Class Name)</label>
              <select
                value={moduleId}
                onChange={(e) => {
                  const sel = modules.find(m => m.id === e.target.value);
                  setModuleId(e.target.value);
                  if (sel) {
                    setClassName(sel.title);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
              >
                {activeModules.map(m => (
                  <option key={m.id} value={m.id}>{m.level} - {m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Session Type</label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as ClassType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Regular">Regular</option>
                <option value="Trial">Free Trial</option>
                <option value="Catchup">Catchup</option>
                <option value="Make-up">Make-up</option>
                <option value="Consult">Consult</option>
              </select>
            </div>
          </div>

          {/* Step 4: Select Teacher */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              4. Select Teacher ({activeTeachers.length} Available in this Center)
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {activeTeachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Step 5: Select Students (Max 6) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                5. Enroll Students ({selectedStudentIds.length} / 6 Students)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds(activeStudents.slice(0, 6).map(s => s.id))}
                  className="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer"
                >
                  Quick Fill (6)
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50 space-y-1 divide-y divide-gray-100">
              {activeStudents.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-2">No students registered in this center.</p>
              ) : (
                activeStudents.map(st => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  const isMaxed = selectedStudentIds.length >= 6 && !isChecked;
                  return (
                    <label
                      key={st.id}
                      className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                        isChecked 
                          ? 'bg-primary-50/90 border border-primary-300' 
                          : (isMaxed ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : 'hover:bg-gray-100')
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isMaxed}
                        checked={isChecked}
                        onChange={() => handleToggleStudent(st.id)}
                        className="w-3.5 h-3.5 rounded text-primary-600 focus:ring-primary-500 border-gray-300 shrink-0 cursor-pointer"
                      />
                      <Avatar name={st.name} size="xs" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 truncate block">{st.name}</span>
                      </div>
                      {st.level && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded">
                          {st.level}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {selectedStudentIds.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {selectedStudentIds.map(sId => {
                  const student = activeStudents.find(s => s.id === sId) || users.find(u => u.id === sId);
                  if (!student) return null;
                  return (
                    <span 
                      key={sId} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-800 border border-primary-200 rounded-md text-[10px] font-semibold"
                    >
                      {student.name}
                      <button 
                        type="button" 
                        onClick={() => handleToggleStudent(sId)}
                        className="text-primary-500 hover:text-rose-600 font-bold ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 6: Schedule Timetable */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">6. Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Time</label>
              <input
                type="text"
                placeholder="10:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Time</label>
              <input
                type="text"
                placeholder="11:30"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Step 7: Zoom Meeting Link (Only if Online Center) */}
          {(centerId === 'ctr-online' || centers.find(c => c.id === centerId)?.name === 'Online') && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
              <label className="block text-xs font-bold text-blue-900 uppercase mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                7. Zoom Meeting Link (Online Class Only)
              </label>
              <input
                type="url"
                placeholder="https://zoom.us/j/9988112233"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Class Deletion */}
      <ConfirmDialog
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirm={() => {
          if (classToDelete) {
            deleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
        title="Delete Class Batch"
        message={`Are you sure you want to delete "${classToDelete?.name}" (${classToDelete?.code})? All associated schedule slots will be removed.`}
        confirmText="Yes, Delete Class"
      />
    </div>
  );
};

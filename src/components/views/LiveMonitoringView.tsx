import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Avatar } from '../ui';
import { 
  ClipboardCheck, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Building2,
  Video
} from 'lucide-react';

export const LiveMonitoringView: React.FC = () => {
  const { currentUser, classes, attendance, users } = useApp();

  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  const parentChildIds = new Set([
    ...(currentUser.childrenIds || []),
    ...users.filter(u => u.parentId === currentUser.id).map(u => u.id)
  ]);

  // Accessible classes for current user
  const visibleClasses = classes.filter((c) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'admin_center' || currentUser.role === 'student_advisor') {
      return assignedCenterIds.includes(c.centerId);
    }
    if (currentUser.role === 'teacher') {
      return c.teacherId === currentUser.id || c.teacherName === currentUser.name;
    }
    if (currentUser.role === 'parent') {
      return (c.studentIds || []).some(sid => parentChildIds.has(sid));
    }
    if (currentUser.role === 'student') {
      return (c.studentIds || []).includes(currentUser.id);
    }
    return true;
  });

  const [selectedClassId, setSelectedClassId] = useState<string>(visibleClasses[0]?.id || '');
  const activeClass = visibleClasses.find(c => c.id === selectedClassId) || visibleClasses[0];

  // Students specifically enrolled in this class
  const classStudents = users.filter(
    u => u.role === 'student' && (activeClass?.studentIds || []).includes(u.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            Real-Time Class & Attendance Monitoring
          </h1>
          <p className="text-sm text-gray-500">Live overview of student attendance and active class operations</p>
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {visibleClasses.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
            No assigned classes found.
          </div>
        ) : (
          visibleClasses.map((cls) => {
            const isSelected = cls.id === activeClass?.id;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`p-3.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-white/60 border-gray-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={cls.status === 'ongoing' ? 'success' : 'primary'} size="sm" dot>
                    {cls.status === 'ongoing' ? 'Live Session' : 'Scheduled'}
                  </Badge>
                </div>
                <div className="font-bold text-gray-900 text-sm mt-1">{cls.name}</div>
                <div className="text-xs text-gray-500">{cls.dayOfWeek}, {cls.startTime} - {cls.endTime}</div>
              </button>
            );
          })
        )}
      </div>

      {/* Class Live Status Banner */}
      {activeClass && (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs text-primary-300 font-semibold">{activeClass.code} • {activeClass.moduleLevel}</span>
              <h2 className="text-xl font-bold mt-0.5">{activeClass.name}</h2>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {activeClass.centerName} ({activeClass.roomName})</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Instructor: {activeClass.teacherName}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeClass.dayOfWeek}, {activeClass.startTime} - {activeClass.endTime}</span>
              </div>
            </div>

            {(activeClass.centerName === 'Online' || activeClass.centerId === 'ctr-online') && activeClass.zoomLink ? (
              <a
                href={activeClass.zoomLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg text-xs text-white flex items-center gap-2 shadow"
              >
                <Video className="w-4 h-4" /> Join Live Zoom Session
              </a>
            ) : (
              <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> On-site Center Session
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Attendance Sheet */}
      {activeClass && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Session Attendance Roster</h2>
              <p className="text-xs text-gray-500">Student roster for this batch and live check-in timestamps</p>
            </div>
            <Badge variant="primary" size="sm">
              {classStudents.length} Enrolled
            </Badge>
          </div>

          <div className="divide-y divide-gray-100">
            {classStudents.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 font-medium">
                No students currently enrolled in this batch.
              </div>
            ) : (
              classStudents.map((st) => {
                const record = attendance.find(a => a.studentId === st.id && a.classId === activeClass?.id);

                return (
                  <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={st.name} size="md" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{st.name}</div>
                        <div className="text-xs text-gray-400">Level: {st.level || 'JK 7-9'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          record?.status === 'present' ? 'success' :
                          record?.status === 'late' ? 'warning' :
                          record?.status === 'absent' ? 'danger' : 'neutral'
                        }
                        size="md"
                        dot
                      >
                        {record ? record.status.toUpperCase() : 'UNMARKED'}
                      </Badge>
                      {record?.markedAt && (
                        <span className="text-[11px] text-gray-400">Time: {record.markedAt}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

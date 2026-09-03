import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, Avatar } from '../ui';
import { 
  BookOpen, 
  ClipboardCheck, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Award,
  Video,
  Send,
  MessageSquare,
  Building2
} from 'lucide-react';

export const TeacherDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, classes, users, attendance, markAttendance, projects, updateProject } = useApp();

  // Find classes assigned to this teacher
  const teacherClasses = classes.filter(c => c.teacherId === currentUser.id || c.teacherName === currentUser.name);
  const activeClass = teacherClasses[0] || classes[0];

  const teacherStudentIds = new Set(teacherClasses.flatMap(c => c.studentIds || []));
  const activeClassStudentIds = new Set(activeClass?.studentIds || []);

  const enrolledStudents = users.filter(u => u.role === 'student' && activeClassStudentIds.has(u.id));
  const teacherProjects = projects.filter(p => teacherStudentIds.has(p.studentId));

  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState(95);
  const [feedbackValue, setFeedbackValue] = useState('');

  const handleMark = (studentId: string, studentName: string, studentAvatar: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!activeClass) return;
    markAttendance({
      classId: activeClass.id,
      className: activeClass.name,
      date: new Date().toISOString().split('T')[0],
      studentId,
      studentName,
      studentAvatar,
      status,
      note: status === 'present' ? 'Present & actively participating.' : 'Absent / Excused',
      markedByTeacherId: currentUser.id
    });
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForGrading) return;
    updateProject(selectedStudentForGrading.id, {
      grade: Number(gradeValue),
      feedback: feedbackValue,
      status: 'reviewed'
    });
    setSelectedStudentForGrading(null);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success" className="bg-white/20 text-white border-white/30 text-xs">
              Teacher Dashboard
            </Badge>
            <span className="text-xs text-emerald-100">Active Educator Status</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.name}</h1>
          <p className="text-emerald-100 text-sm mt-1">
            {activeClass ? (
              <>Teaching Class: <strong className="text-white">{activeClass.name}</strong> • Room: {activeClass.roomName}</>
            ) : (
              <span>No active class assigned currently</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {activeClass && (activeClass.centerName === 'Online' || activeClass.centerId === 'ctr-online') && activeClass.zoomLink ? (
            <a
              href={activeClass.zoomLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 font-bold rounded-lg text-sm shadow hover:bg-emerald-50 transition-colors"
            >
              <Video className="w-4 h-4 text-emerald-600" /> Open Class Zoom
            </a>
          ) : activeClass ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 text-white border border-white/20 rounded-lg text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" /> In-Center Lab: {activeClass.roomName}
            </div>
          ) : null}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Enrolled Students</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{enrolledStudents.length} Students</div>
          <p className="text-xs text-gray-500 mt-1">Active class roster</p>
        </Card>

        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Current Module</span>
            <BookOpen className="w-5 h-5 text-primary-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">Python & AI</div>
          <p className="text-xs text-gray-500 mt-1">JK 12-16 (Unit 8 of 20)</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Submitted Projects</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{projects.length} Projects</div>
          <p className="text-xs text-gray-500 mt-1">Awaiting review & grades</p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Attendance Rate</span>
            <ClipboardCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">97.5%</div>
          <p className="text-xs text-success-600 font-semibold mt-1">Excellent Attendance</p>
        </Card>
      </div>

      {/* Live Attendance Marking Tool */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Attendance Marking: {activeClass.name}
            </h2>
            <p className="text-xs text-gray-500">Instant one-click attendance marking for today's session</p>
          </div>
          <Badge variant="primary" size="sm">
            {activeClass.dayOfWeek}, {activeClass.startTime} - {activeClass.endTime}
          </Badge>
        </div>

        <div className="divide-y divide-gray-100">
          {enrolledStudents.map((st) => {
            const todayRecord = attendance.find(a => a.studentId === st.id);
            return (
              <div key={st.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={st.name} size="md" />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{st.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>Level: {st.level || 'JK 12-16'}</span>
                      {todayRecord && (
                        <Badge 
                          variant={todayRecord.status === 'present' ? 'success' : todayRecord.status === 'late' ? 'warning' : 'danger'} 
                          size="sm"
                        >
                          Status: {todayRecord.status.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant={todayRecord?.status === 'present' ? 'success' : 'outline'}
                    onClick={() => handleMark(st.id, st.name, st.avatar, 'present')}
                    className="text-xs py-1 px-2.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Present
                  </Button>
                  <Button
                    size="sm"
                    variant={todayRecord?.status === 'late' ? 'secondary' : 'secondary'}
                    onClick={() => handleMark(st.id, st.name, st.avatar, 'late')}
                    className="text-xs py-1 px-2.5"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" /> Late
                  </Button>
                  <Button
                    size="sm"
                    variant={todayRecord?.status === 'absent' ? 'danger' : 'secondary'}
                    onClick={() => handleMark(st.id, st.name, st.avatar, 'absent')}
                    className="text-xs py-1 px-2.5 text-danger-600 hover:bg-danger-50"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Absent
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Projects to Review */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Student Coding Project Reviews</h2>
            <p className="text-xs text-gray-500">Grading and feedback for student capstones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teacherProjects.length === 0 ? (
            <div className="col-span-3 py-6 text-center text-xs text-gray-500 font-medium">
              No submitted student projects to review at this moment.
            </div>
          ) : (
            teacherProjects.map((proj) => (
            <div key={proj.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
              <div>
                <img src={proj.thumbnail} alt={proj.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="purple" size="sm">{proj.moduleName.split(':')[0]}</Badge>
                  {proj.grade && <span className="text-xs font-bold text-emerald-600">Grade: {proj.grade}/100</span>}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mt-1">{proj.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{proj.description}</p>
                <div className="text-xs text-gray-600 mt-2 font-medium">👤 By: {proj.studentName}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">
                  View Code ↗
                </a>
                <Button size="sm" variant="primary" onClick={() => {
                  setSelectedStudentForGrading(proj);
                  setGradeValue(proj.grade || 95);
                  setFeedbackValue(proj.feedback || '');
                }}>
                  Grade Project
                </Button>
              </div>
            </div>
          )))}
        </div>
      </Card>

      {/* Modal Grading */}
      <Modal isOpen={!!selectedStudentForGrading} onClose={() => setSelectedStudentForGrading(null)} title="Grade & Project Feedback">
        {selectedStudentForGrading && (
          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div>
              <div className="text-sm font-bold text-gray-900">{selectedStudentForGrading.title}</div>
              <div className="text-xs text-gray-500">Student: {selectedStudentForGrading.studentName}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Grade Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={gradeValue}
                onChange={(e) => setGradeValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teacher Feedback & Comments</label>
              <textarea
                rows={3}
                required
                placeholder="Provide constructive feedback and encouragement for the student's project..."
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setSelectedStudentForGrading(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Submit Grade & Feedback
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

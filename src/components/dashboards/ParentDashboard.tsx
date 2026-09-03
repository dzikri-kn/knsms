import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Avatar } from '../ui';
import { 
  Users, 
  Sparkles, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FolderGit2,
  Download,
  ExternalLink
} from 'lucide-react';

export const ParentDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, users, attendance, projects, classes } = useApp();

  // Find children of this parent dynamically
  const children = users.filter(
    u => u.role === 'student' && (u.parentId === currentUser.id || (currentUser.childrenIds && currentUser.childrenIds.includes(u.id)))
  );
  
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');
  const activeChild = children.find(c => c.id === selectedChildId) || children[0];

  const childAttendance = attendance.filter(a => a.studentId === activeChild?.id);
  const childProjects = projects.filter(p => p.studentId === activeChild?.id);
  const childClasses = classes.filter(c => (c.studentIds || []).includes(activeChild?.id));

  return (
    <div className="space-y-6">
      {/* Parent Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning" className="bg-white/20 text-white border-white/30 text-xs">
              Parent Portal
            </Badge>
            <span className="text-xs text-amber-100">Koding Next Learning Tracker</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {currentUser.name}</h1>
          <p className="text-amber-100 text-sm mt-1">
            Monitor your children&apos;s coding progress, attendance track record, and creative project portfolio.
          </p>
        </div>
      </div>

      {/* Children Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {children.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
            No children profiles currently linked to this parent account.
          </div>
        ) : (
          children.map((child) => {
          const isSelected = child.id === activeChild?.id;
          return (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white/60 border-gray-200 hover:bg-white'
              }`}
            >
              <Avatar name={child.name} size="md" />
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">{child.name}</div>
                <div className="text-xs text-amber-600 font-semibold">{child.level}</div>
              </div>
            </button>
          );
        }))}
      </div>

      {/* Child Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Attendance Rate</span>
            <CheckCircle2 className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">100%</div>
          <p className="text-xs text-success-600 font-semibold mt-1">Always punctual</p>
        </Card>

        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Enrolled Track</span>
            <BookOpen className="w-5 h-5 text-primary-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{activeChild?.level}</div>
          <p className="text-xs text-gray-500 mt-1">Jakarta - Kemayoran</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Completed Projects</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{childProjects.length} Projects</div>
          <p className="text-xs text-gray-500 mt-1">Average Score: 95.5 / 100</p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Next Class Session</span>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2 text-lg font-extrabold text-gray-900">Saturday, 10:00 AM</div>
          <p className="text-xs text-gray-500 mt-1">Hopper Lab (Room 103)</p>
        </Card>
      </div>

      {/* Projects Showcase & Portfolio */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Coding Portfolio: {activeChild?.name}
            </h2>
            <p className="text-xs text-gray-500">Capstone coding projects and creations</p>
          </div>
        </div>

        {childProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No projects submitted yet for this module.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {childProjects.map((proj) => (
              <div key={proj.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <img src={proj.thumbnail} alt={proj.title} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{proj.moduleName}</Badge>
                    {proj.grade && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-sm rounded-lg border border-emerald-200">
                        ⭐ {proj.grade} / 100
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-2">{proj.title}</h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{proj.description}</p>
                  
                  {proj.feedback && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1 mb-0.5">
                        💬 Teacher Feedback & Notes:
                      </div>
                      <p className="italic">"{proj.feedback}"</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Submitted: {proj.submissionDate}</span>
                    <a
                      href={proj.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Open Live Demo <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Attendance History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Course Attendance Log</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Class Session</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Mentor Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {childAttendance.map((att) => (
                <tr key={att.id}>
                  <td className="py-3 px-4 text-xs font-bold text-gray-800">{att.date}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-900">{att.className}</td>
                  <td className="py-3 px-4">
                    <Badge variant={att.status === 'present' ? 'success' : 'warning'} size="sm" dot>
                      {att.status === 'present' ? 'Present' : att.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{att.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

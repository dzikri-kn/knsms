import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, Avatar } from '../ui';
import { StudentProject } from '../../types';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  Building2, 
  User as UserIcon, 
  ExternalLink, 
  Award, 
  Star, 
  Upload, 
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const StudentPortfoliosView: React.FC = () => {
  const { currentUser, modules, projects, users, centers, classes, addProject, updateProject } = useApp();

  const isSuperAdmin = currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  // Find students in teacher's classes
  const teacherStudentIds = new Set(
    classes
      .filter(c => c.teacherId === currentUser.id || c.teacherName === currentUser.name)
      .flatMap(c => c.studentIds || [])
  );

  // Child IDs for parent
  const parentChildIds = new Set([
    ...(currentUser.childrenIds || []),
    ...users.filter(u => u.parentId === currentUser.id).map(u => u.id)
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal Upload / Feedback
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<StudentProject | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [projectGrade, setProjectGrade] = useState(95);

  // Form states for project submission
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectModule, setProjectModule] = useState('JK 12-16 Python AI');
  const [projectThumb, setProjectThumb] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60');
  const [studentForUpload, setStudentForUpload] = useState(currentUser.id);

  // Accessible students based on role
  const allStudents = users.filter(u => {
    if (u.role !== 'student') return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'admin_center' || currentUser.role === 'student_advisor') {
      return u.centerId && assignedCenterIds.includes(u.centerId);
    }
    if (currentUser.role === 'teacher') {
      return teacherStudentIds.has(u.id);
    }
    if (currentUser.role === 'parent') {
      return parentChildIds.has(u.id);
    }
    if (currentUser.role === 'student') {
      return u.id === currentUser.id;
    }
    return true;
  });

  // Filter students based on center filter
  const candidateStudents = allStudents.filter(s => {
    if (selectedCenterFilter === 'all') return true;
    return s.centerId === selectedCenterFilter;
  });

  // Filter projects strictly based on assigned scope
  const filteredProjects = projects.filter((proj) => {
    const studentUser = users.find(u => u.id === proj.studentId);
    const studentCenterId = studentUser?.centerId || 'ctr-kemayoran';

    // 1. Role Scope Check
    if (currentUser.role === 'student') {
      if (proj.studentId !== currentUser.id) return false;
    } else if (currentUser.role === 'parent') {
      if (!parentChildIds.has(proj.studentId)) return false;
    } else if (currentUser.role === 'teacher') {
      if (!teacherStudentIds.has(proj.studentId)) return false;
    } else if (currentUser.role === 'admin_center' || currentUser.role === 'student_advisor') {
      if (!assignedCenterIds.includes(studentCenterId)) return false;
    }

    // 2. UI Center filter
    if (selectedCenterFilter !== 'all' && studentCenterId !== selectedCenterFilter) {
      return false;
    }

    // 3. UI Student filter
    if (selectedStudentFilter !== 'all' && proj.studentId !== selectedStudentFilter) {
      return false;
    }

    // 4. UI Status filter
    if (selectedStatusFilter !== 'all' && proj.status !== selectedStatusFilter) {
      return false;
    }

    // 5. Search query
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      proj.title.toLowerCase().includes(query) ||
      proj.studentName.toLowerCase().includes(query) ||
      proj.moduleName.toLowerCase().includes(query) ||
      proj.description.toLowerCase().includes(query);

    return matchesSearch;
  });

  const handleUploadProject = (e: React.FormEvent) => {
    e.preventDefault();
    const studentObj = users.find(u => u.id === (isStudent ? currentUser.id : studentForUpload)) || currentUser;
    
    addProject({
      studentId: studentObj.id,
      studentName: studentObj.name,
      title: projectTitle,
      description: projectDesc,
      moduleName: projectModule,
      projectUrl: projectUrl || 'https://github.com/kodingnext-student',
      status: 'submitted',
      thumbnail: projectThumb
    });

    setProjectTitle('');
    setProjectDesc('');
    setProjectUrl('');
    setIsUploadModalOpen(false);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForFeedback) return;
    
    updateProject(selectedProjectForFeedback.id, {
      feedback: teacherFeedback,
      grade: projectGrade,
      status: 'showcased'
    });

    setSelectedProjectForFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Header Banner */}
      {isSuperAdmin ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm">
                Super Admin Portfolio Directory
              </Badge>
              <span className="text-xs text-gray-500">• All 35+ Centers & Online</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Student Coding Portfolios</h1>
            <p className="text-sm text-gray-500 mt-1">
              Inspect, review, and filter all student capstone projects across all campuses and individual students.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="primary" size="md">
              Total {projects.length} Projects
            </Badge>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Add Student Project
            </Button>
          </div>
        </div>
      ) : (
        /* Student / Teacher Mode Banner */
        <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs">
                Student Portfolios
              </Badge>
              <span className="text-xs text-primary-100">Koding Next Capstone Showcase</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Student Coding Showcase</h1>
            <p className="text-primary-100 text-sm mt-1">
              Explore hands-on student projects, interactive games, AI demos, and web applications.
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Upload className="w-4 h-4 text-primary-600" />}
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-white text-primary-700 hover:bg-primary-50 font-bold border-none"
          >
            Upload Project
          </Button>
        </div>
      )}

      {/* Super Admin Summary Metrics (No Next Session / No XP) */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Student Projects</span>
              <FolderGit2 className="w-5 h-5 text-primary-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{projects.length} Submissions</div>
            <p className="text-xs text-primary-700 font-semibold mt-1">Across LK & JK Curriculum Tracks</p>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Showcased & Reviewed</span>
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {projects.filter(p => p.status === 'showcased').length} Projects
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Evaluated by Certified Instructors</p>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Active Student Creators</span>
              <UserIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {new Set(projects.map(p => p.studentId)).size} Students
            </div>
            <p className="text-xs text-amber-700 font-semibold mt-1">Representing multiple branch centers</p>
          </Card>
        </div>
      )}

      {/* Filter & Search Bar with Center Filter & Student Filter */}
      <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project name, student name, module, or technology..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Center */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 border border-gray-200 rounded-xl">
              <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={selectedCenterFilter}
                onChange={(e) => {
                  setSelectedCenterFilter(e.target.value);
                  setSelectedStudentFilter('all'); // Reset student filter when center changes
                }}
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                <option value="all">All Centers ({centers.length})</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Each Student */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 border border-gray-200 rounded-xl">
              <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                <option value="all">All Students ({candidateStudents.length})</option>
                {candidateStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.centerName || 'Center'})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 border border-gray-200 rounded-xl">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="showcased">Showcased / Reviewed</option>
                <option value="submitted">Submitted (Pending)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Helper */}
        {(selectedCenterFilter !== 'all' || selectedStudentFilter !== 'all' || selectedStatusFilter !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap text-xs text-gray-500">
            <span>Active filters:</span>
            {selectedCenterFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md font-medium border border-primary-200">
                Center: {centers.find(c => c.id === selectedCenterFilter)?.name}
                <button onClick={() => setSelectedCenterFilter('all')} className="hover:text-primary-900 cursor-pointer">×</button>
              </span>
            )}
            {selectedStudentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium border border-indigo-200">
                Student: {users.find(u => u.id === selectedStudentFilter)?.name}
                <button onClick={() => setSelectedStudentFilter('all')} className="hover:text-indigo-900 cursor-pointer">×</button>
              </span>
            )}
            {selectedStatusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                Status: {selectedStatusFilter}
                <button onClick={() => setSelectedStatusFilter('all')} className="hover:text-amber-900 cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCenterFilter('all');
                setSelectedStudentFilter('all');
                setSelectedStatusFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Displaying Projects ({filteredProjects.length})
          </h2>
          <span className="text-xs text-gray-400">Total {projects.length} in database</span>
        </div>

        {filteredProjects.length === 0 ? (
          <Card className="py-12 text-center text-gray-400">
            <FolderGit2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600">No student projects found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting the Center or Student filter options above.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => {
              const studentUser = users.find(u => u.id === proj.studentId);
              const studentCenter = centers.find(c => c.id === studentUser?.centerId) || { name: studentUser?.centerName || 'Jakarta - Kemayoran' };

              return (
                <Card 
                  key={proj.id} 
                  className="flex flex-col justify-between hover:shadow-lg transition-all border border-gray-200/90 overflow-hidden p-0 rounded-2xl group"
                >
                  <div className="relative">
                    <img 
                      src={proj.thumbnail} 
                      alt={proj.title} 
                      className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300" 
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <Badge variant="purple" size="sm" className="shadow-xs backdrop-blur-md bg-white/90 text-purple-900 font-bold border-none">
                        {proj.moduleName}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      {proj.grade ? (
                        <span className="px-2.5 py-1 bg-emerald-600/95 text-white font-extrabold text-xs rounded-full shadow-sm">
                          ⭐ {proj.grade}/100
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-500/95 text-white font-bold text-xs rounded-full shadow-sm">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Student Info & Center Badge */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={proj.studentName} size="xs" />
                          <span className="font-bold text-gray-900">{proj.studentName}</span>
                        </div>
                        <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded text-[11px] border border-primary-100 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {studentCenter.name}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>

                      {/* Instructor Feedback Snippet */}
                      {proj.feedback && (
                        <div className="mt-3 p-2.5 bg-emerald-50/80 text-emerald-950 rounded-xl text-xs border border-emerald-100 leading-normal">
                          <strong className="text-emerald-800 flex items-center gap-1 mb-0.5">
                            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Instructor Evaluation:
                          </strong>
                          "{proj.feedback}"
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">
                        Submitted: {proj.submissionDate}
                      </span>
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setSelectedProjectForFeedback(proj);
                              setTeacherFeedback(proj.feedback || '');
                              setProjectGrade(proj.grade || 95);
                            }}
                            className="text-xs font-bold text-gray-600 hover:text-primary-600 px-2 py-1 bg-gray-100 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Review & Grade
                          </button>
                        )}
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Upload New Student Project */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Submit Student Project">
        <form onSubmit={handleUploadProject} className="space-y-4">
          {!isStudent && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Student Creator</label>
              <select
                value={studentForUpload}
                onChange={(e) => setStudentForUpload(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
              >
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.centerName || 'Branch'}) • Level: {s.level || 'JK 12-16'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 2D Cyberpunk Platformer or AI Object Detector"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Curriculum Module</label>
              <select
                value={projectModule}
                onChange={(e) => setProjectModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium bg-white"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.title}>
                    {m.title} ({m.level})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Demo / Code URL</label>
              <input
                type="url"
                required
                placeholder="https://scratch.mit.edu/... or https://github.com/..."
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description & Key Learnings</label>
            <textarea
              rows={3}
              required
              placeholder="Describe what the application does, algorithms used, and custom assets created..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Super Admin / Teacher Review & Grade */}
      <Modal 
        isOpen={!!selectedProjectForFeedback} 
        onClose={() => setSelectedProjectForFeedback(null)} 
        title={`Review & Grade — ${selectedProjectForFeedback?.title}`}
      >
        <form onSubmit={handleSaveFeedback} className="space-y-4">
          <div>
            <span className="text-xs text-gray-500">Student: <strong>{selectedProjectForFeedback?.studentName}</strong></span>
            <p className="text-xs text-gray-700 mt-1">{selectedProjectForFeedback?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Score / Grade (0 - 100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={projectGrade}
              onChange={(e) => setProjectGrade(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instructor Feedback & Commendation</label>
            <textarea
              rows={3}
              placeholder="Commend student on code logic, creativity, UI/UX, or areas for future improvement..."
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSelectedProjectForFeedback(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

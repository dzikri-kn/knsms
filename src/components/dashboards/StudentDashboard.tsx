import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal } from '../ui';
import { 
  GraduationCap, 
  Code, 
  Sparkles, 
  Upload, 
  Calendar, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Play,
  ExternalLink
} from 'lucide-react';

export const StudentDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser, modules, projects, addProject } = useApp();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectModule, setProjectModule] = useState(modules[0]?.title || 'JK 12-16 Python First');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectThumb, setProjectThumb] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60');

  const myProjects = projects.filter(p => p.studentId === currentUser.id);

  const handleUploadProject = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      studentId: currentUser.id,
      studentName: currentUser.name,
      title: projectTitle,
      description: projectDesc,
      moduleName: projectModule || currentUser.level || 'JK 12-16 Python First',
      projectUrl: projectUrl || 'https://github.com/kodingnext-student',
      status: 'submitted',
      thumbnail: projectThumb
    });
    setProjectTitle('');
    setProjectDesc('');
    setProjectUrl('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="danger" className="bg-white/20 text-white border-white/30 text-xs">
              Student Space
            </Badge>
            <span className="text-xs text-rose-100">Koding Next Learning Track</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {currentUser.name}!</h1>
          <p className="text-rose-100 text-sm mt-1">
            You are enrolled in <strong className="text-white">{currentUser.level || 'JK 12-16'}</strong>. Keep building awesome coding projects!
          </p>
        </div>
        <div>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Upload className="w-4 h-4 text-rose-600" />}
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-white text-rose-700 hover:bg-rose-50 font-bold border-none"
          >
            Submit Coding Project
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Module Progress</span>
            <BookOpen className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">75% Complete</div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Uploaded Projects</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{myProjects.length} Projects</div>
          <p className="text-xs text-success-600 font-semibold mt-1">⭐ Portfolio Showcase</p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Next Session</span>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-lg font-extrabold text-gray-900">Saturday, 10:00 AM</div>
          <p className="text-xs text-gray-500 mt-1">Jakarta - Kemayoran - Hopper Lab</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Coding XP</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">1,450 XP</div>
          <p className="text-xs text-amber-600 font-semibold mt-1">Level 4 Coder</p>
        </Card>
      </div>

      {/* Student Portfolio Showcase */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Coding Projects & Portfolio</h2>
            <p className="text-xs text-gray-500">Your collection of completed module capstone projects</p>
          </div>
          <Button size="sm" variant="primary" onClick={() => setIsUploadModalOpen(true)} icon={<Upload className="w-3.5 h-3.5" />}>
            Upload New Project
          </Button>
        </div>

        {myProjects.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            You haven't uploaded any projects yet. Click above to submit your coding creation!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProjects.map((proj) => (
              <div key={proj.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <img src={proj.thumbnail} alt={proj.title} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{proj.moduleName}</Badge>
                    {proj.grade ? (
                      <Badge variant="success" size="sm">Grade: {proj.grade}/100</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Pending Review</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mt-2">{proj.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{proj.description}</p>
                  
                  {proj.feedback && (
                    <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-900 rounded-lg text-xs border border-emerald-100">
                      <strong>Teacher Feedback:</strong> "{proj.feedback}"
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Status: {proj.status}</span>
                    <a
                      href={proj.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      Open Demo <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Upload Project */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Submit New Coding Project">
        <form onSubmit={handleUploadProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 2D Platformer Dino Jump"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Curriculum Module</label>
            <select
              value={projectModule}
              onChange={(e) => setProjectModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium bg-white"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.title}>
                  {m.title} ({m.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Short Description</label>
            <textarea
              rows={3}
              required
              placeholder="Describe what your code does, gameplay mechanics, or key learnings..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Scratch / GitHub / Replit Link</label>
            <input
              type="url"
              required
              placeholder="https://scratch.mit.edu/projects/... or https://github.com/..."
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-rose-600 hover:bg-rose-700">
              Submit Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

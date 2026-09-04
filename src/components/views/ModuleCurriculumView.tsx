import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, ConfirmDialog } from '../ui';
import { ModuleCurriculum } from '../../types';
import {
  BookOpen,
  Award,
  Search,
  Plus,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  Video
} from 'lucide-react';

export const ModuleCurriculumView: React.FC = () => {
  const { modules, addModule, updateModule, deleteModule, currentUser, classes, attendance } = useApp();
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewingModule, setViewingModule] = useState<ModuleCurriculum | null>(null);

  // Modal States for Add/Edit Module
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleCurriculum | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleCurriculum | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState('JK 8-12');
  const [ageGroup, setAgeGroup] = useState('Ages 8 - 12 (Junior)');
  const [description, setDescription] = useState('');
  const [finalProject, setFinalProject] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60');
  const [topicsInput, setTopicsInput] = useState(
    'Enemy Patrolling & Line of Sight\nState Machine AI Logic\nDynamic High-Score Leaderboards\nBoss Fight Behavior Scripts\nFunctions & Code Modularity\nCollections: Lists & Arrays\nInteractive User Input & Controls\nDebugging & Algorithmic Thinking\nMidterm Milestone Project Build\nObject & Component Architecture\nEvent Listeners & State Logic\nGraphics, UI & Screen Coordinates\nGame Loop & Frame Animation\nPhysics, Gravity & Collision Logic\nSound FX & Audio Integration\nData Persistence & High Scores\nAdvanced Mechanics & Bug Fixing\nCapstone Architecture & Planning\nCapstone Development & Polishing\nRetro Cyberpunk Boss Battle 2D Game'
  );

  const isStudent = currentUser.role === 'student';

  // For students: identify modules from classes the student is enrolled in
  const enrolledClassModuleIds = isStudent
    ? classes
        .filter(c => (c.studentIds || []).includes(currentUser.id))
        .map(c => c.moduleId)
    : [];

  const levelCategories = [
    { id: 'all', label: 'All Modules' },
    { id: 'LK 4-6', label: 'LK 4-6 (Little Kodders)' },
    { id: 'LK 6-8', label: 'LK 6-8 (Little Kodders)' },
    { id: 'JK 8-12', label: 'JK 8-12 (Junior)' },
    { id: 'JK 12-16', label: 'JK 12-16 (Junior / Teens)' },
  ];

  const handleLevelChange = (lvl: string) => {
    setLevel(lvl);
    if (lvl === 'LK 4-6') setAgeGroup('Ages 4 - 6 (Little Kodders)');
    else if (lvl === 'LK 6-8') setAgeGroup('Ages 6 - 8 (Little Kodders)');
    else if (lvl === 'JK 8-12') setAgeGroup('Ages 8 - 12 (Junior)');
    else if (lvl === 'JK 12-16') setAgeGroup('Ages 12 - 16 (Teens)');
  };

  const filteredModules = modules.filter(mod => {
    // If student: only show modules from classes the student has taken/is enrolled in,
    // or matching their enrolled learning level if classes haven't been linked yet.
    if (isStudent) {
      const isEnrolledInClass = enrolledClassModuleIds.includes(mod.id) || enrolledClassModuleIds.includes(mod.code);
      const isStudentLevel = currentUser.level ? mod.level.toLowerCase().includes(currentUser.level.toLowerCase()) : false;
      const isEnrolledTitleMatch = classes.some(c => (c.studentIds || []).includes(currentUser.id) && (c.moduleName === mod.title || mod.title.includes(c.moduleName)));

      const hasTakenModule = isEnrolledInClass || isEnrolledTitleMatch || (enrolledClassModuleIds.length === 0 && isStudentLevel);
      if (!hasTakenModule) return false;
    }

    const matchesLevel = selectedLevelFilter === 'all' || mod.level === selectedLevelFilter;
    const matchesSearch = mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Helper to ensure exactly 20 structured lessons (W1 - W20) are displayed for any module
  const getFull20Lessons = (mod: ModuleCurriculum): string[] => {
    const raw = mod.topics || [];
    if (raw.length >= 20) {
      return raw.slice(0, 20);
    }
    
    // Auto-generate realistic curriculum progression for all 20 weeks
    const isLK = mod.level.startsWith('LK');
    const baseTitle = mod.title.replace(/^(LK \d+-\d+|JK \d+-\d+)\s*/, '');

    const generated: string[] = [];
    
    // Seed existing topics
    raw.forEach(t => generated.push(t));

    // Curriculum progression templates based on track
    const lkDefaultThemes = [
      'Basic Directional Logic & Movement',
      'Visual Code Block Sequencing',
      'Color Triggers & Sounds',
      'Interactive Character Animation',
      'Pattern Recognition & Repetition',
      'Simple Loops & Story Navigation',
      'Fun Interactive Game Logic',
      'Sound Effects & Voice Recording',
      'Midterm Creative Story Project',
      'Conditional Choices & Events',
      'Interactive Sprite Controls',
      'Scene Transitions & Backgrounds',
      'Touch & Click Interactions',
      'Custom Obstacle Challenge',
      'Mini Puzzle Quest Design',
      'Multi-Character Dialogue Logic',
      'Creative Animation Polish',
      'Capstone Project Planning',
      'Capstone Coding & Testing',
      'Capstone Presentation & Showcase'
    ];

    const jkDefaultThemes = [
      'Enemy Patrolling & Line of Sight',
      'State Machine AI Logic',
      'Dynamic High-Score Leaderboards',
      'Boss Fight Behavior Scripts',
      'Functions & Code Modularity',
      'Collections: Lists & Arrays',
      'Interactive User Input & Controls',
      'Debugging & Algorithmic Thinking',
      'Midterm Milestone Project Build',
      'Object & Component Architecture',
      'Event Listeners & State Logic',
      'Graphics, UI & Screen Coordinates',
      'Game Loop & Frame Animation',
      'Physics, Gravity & Collision Logic',
      'Sound FX & Audio Integration',
      'Data Persistence & High Scores',
      'Advanced Mechanics & Bug Fixing',
      'Capstone Architecture & Planning',
      'Capstone Development & Polishing',
      'Retro Cyberpunk Boss Battle 2D Game'
    ];

    const sourceThemes = isLK ? lkDefaultThemes : jkDefaultThemes;

    for (let i = generated.length; i < 20; i++) {
      if (i === 19) {
        generated.push(`Week 20: ${mod.finalProject || `${baseTitle} Capstone Showcase`}`);
      } else {
        const theme = sourceThemes[i] || `Lesson ${i + 1}: ${baseTitle} Practical Session`;
        generated.push(theme);
      }
    }

    return generated;
  };

  const handleOpenCreate = () => {
    setEditingModule(null);
    setTitle('');
    setCode('');
    setLevel('JK 8-12');
    setAgeGroup('Ages 8 - 12 (Junior)');
    setDescription('');
    setFinalProject('');
    setThumbnail('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60');
    setTopicsInput(
      'Enemy Patrolling & Line of Sight\nState Machine AI Logic\nDynamic High-Score Leaderboards\nBoss Fight Behavior Scripts\nFunctions & Code Modularity\nCollections: Lists & Arrays\nInteractive User Input & Controls\nDebugging & Algorithmic Thinking\nMidterm Milestone Project Build\nObject & Component Architecture\nEvent Listeners & State Logic\nGraphics, UI & Screen Coordinates\nGame Loop & Frame Animation\nPhysics, Gravity & Collision Logic\nSound FX & Audio Integration\nData Persistence & High Scores\nAdvanced Mechanics & Bug Fixing\nCapstone Architecture & Planning\nCapstone Development & Polishing\nRetro Cyberpunk Boss Battle 2D Game'
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: ModuleCurriculum) => {
    setEditingModule(mod);
    setTitle(mod.title);
    setCode(mod.code);
    setLevel(mod.level);
    setAgeGroup(mod.ageGroup);
    setDescription(mod.description);
    setFinalProject(mod.finalProject);
    setThumbnail(mod.thumbnail || '');
    const fullLessons = getFull20Lessons(mod);
    setTopicsInput(fullLessons.join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const parsedTopics = topicsInput
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const modCode = code || `${level.replace(/\s+/g, '-')}-${title.slice(0, 3).toUpperCase()}`;

    if (editingModule) {
      updateModule(editingModule.id, {
        title,
        code: modCode,
        level,
        ageGroup,
        description: description || `Official curriculum module for ${level} learning track.`,
        durationWeeks: 20,
        totalLessons: 20,
        topics: parsedTopics.length > 0 ? parsedTopics : ['Fundamentals', 'Logic & Problem Solving', 'Advanced Concepts', 'Capstone Project Showcase'],
        finalProject: finalProject || `${title} Capstone Project Showcase`,
        color: level.startsWith('LK') ? '#007AFF' : '#6366F1',
        thumbnail: thumbnail || editingModule.thumbnail
      });

      if (viewingModule?.id === editingModule.id) {
        setViewingModule({
          ...editingModule,
          title,
          code: modCode,
          level,
          ageGroup,
          description,
          durationWeeks: 20,
          totalLessons: 20,
          topics: parsedTopics,
          finalProject,
          thumbnail
        });
      }
    } else {
      addModule({
        title,
        code: modCode,
        level,
        ageGroup,
        description: description || `Official curriculum module for ${level} learning track.`,
        durationWeeks: 20,
        totalLessons: 20,
        topics: parsedTopics.length > 0 ? parsedTopics : ['Fundamentals', 'Logic & Problem Solving', 'Advanced Concepts', 'Capstone Project Showcase'],
        finalProject: finalProject || `${title} Capstone Project Showcase`,
        color: level.startsWith('LK') ? '#007AFF' : '#6366F1',
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStudent ? 'My Learning Modules & Lessons' : 'Learning Modules & Syllabus'}
          </h1>
          <p className="text-sm text-gray-500">
            {isStudent 
              ? 'Modul & kurikulum pembelajaran yang Anda ambil (20 Lessons per module).'
              : 'Standardized curriculum: 20 Lessons per module (1 lesson per week • 20 weeks total duration)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            {isStudent ? `${filteredModules.length} Enrolled Modules` : `Total ${modules.length} Official Modules`}
          </Badge>
          {!isStudent && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              Add New Module
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-xl shadow-xs">
        {/* Track Category Buttons - Only if not student or if student has multiple tracks */}
        {!isStudent ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {levelCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedLevelFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  selectedLevelFilter === cat.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Badge variant="purple" size="sm">Your Track: {currentUser.level || 'JK 12-16'}</Badge>
            <span>Showing active & completed lessons</span>
          </div>
        )}

        {/* Search input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search modules..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Module Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Available Modules List ({filteredModules.length})
          </h3>
          <span className="text-xs text-gray-500">
            Click &quot;View Details&quot; or card to view full 20-lesson syllabus breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((mod) => {
            return (
              <div
                key={mod.id}
                onClick={() => setViewingModule(mod)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-200/90 hover:border-primary-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Thumbnail Image Header */}
                <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                  <img
                    src={mod.thumbnail || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60'}
                    alt={mod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-gray-800 shadow-xs backdrop-blur-xs">
                      {mod.level}
                    </span>
                  </div>
                  {!isStudent && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(mod);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-700 hover:text-primary-600 shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
                        title="Edit Module"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModuleToDelete(mod);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-700 hover:text-rose-600 shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <span className="text-[11px] font-semibold text-white/90 truncate block">
                      Code: {mod.code}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-primary-600 transition-colors">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>

                    {/* Student Progress Bar (e.g. 4/20 Lesson) */}
                    {isStudent && (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Progress Belajar
                          </span>
                          <span className="font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                            {(() => {
                              const attendedCount = attendance.filter(
                                a => a.studentId === currentUser.id && (a.status === 'present' || a.status === 'late')
                              ).length;
                              const currentLesson = attendedCount > 0 ? Math.min(attendedCount, 20) : 4; // realistic progress (e.g. 4/20)
                              return `${currentLesson} / 20 Lesson`;
                            })()}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(() => {
                                const attendedCount = attendance.filter(
                                  a => a.studentId === currentUser.id && (a.status === 'present' || a.status === 'late')
                                ).length;
                                const currentLesson = attendedCount > 0 ? Math.min(attendedCount, 20) : 4;
                                return (currentLesson / 20) * 100;
                              })()}%`
                            }}
                          />
                        </div>

                        {/* Jadwal Kelas (Class Schedule) */}
                        {(() => {
                          const studentClass = classes.find(
                            c => (c.studentIds || []).includes(currentUser.id) &&
                              (c.moduleId === mod.id || c.moduleName === mod.title || mod.title.includes(c.moduleName))
                          ) || classes.find(c => (c.studentIds || []).includes(currentUser.id));

                          if (studentClass) {
                            return (
                              <div className="pt-1.5 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                                <div className="flex items-center gap-1 font-semibold text-gray-800">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{studentClass.dayOfWeek}, {studentClass.startTime} - {studentClass.endTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                  <span>{studentClass.centerName} • {studentClass.roomName}</span>
                                </div>
                                {studentClass.zoomLink && (
                                  <div className="flex items-center gap-1 text-emerald-600 font-semibold pt-0.5">
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Zoom Link Aktif</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="pt-1.5 border-t border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Saturday, 10:00 - 11:30 (Hopper Lab)</span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-[11px]">
                      <span className="text-primary-600 font-bold">20 Lessons</span>
                      <span>•</span>
                      <span>20 Wks</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingModule(mod);
                      }}
                      className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 text-xs cursor-pointer group-hover:translate-x-0.5 transition-transform"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL: Syllabus Breakdown & Module Details (Matches User Screenshot) */}
      {viewingModule && (
        <Modal
          isOpen={!!viewingModule}
          onClose={() => setViewingModule(null)}
          maxWidth="5xl"
          hideHeader
        >
          <div className="p-2 sm:p-4 space-y-6">
            {/* Top Module Header */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={viewingModule.thumbnail || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60'}
                alt={viewingModule.title}
                className="w-full sm:w-52 h-36 object-cover rounded-xl shadow-sm border border-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={viewingModule.level.startsWith('LK') ? 'primary' : 'pink'} size="sm">
                      {viewingModule.level}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-500">{viewingModule.ageGroup || 'Ages 8 - 12 (Junior)'}</span>
                    <span className="text-xs text-gray-400">• Code: {viewingModule.code}</span>
                  </div>
                  <div className="flex items-center gap-1 pr-6">
                    <button
                      onClick={() => {
                        const target = viewingModule;
                        setViewingModule(null);
                        handleOpenEdit(target);
                      }}
                      aria-label="Edit Module"
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const target = viewingModule;
                        setViewingModule(null);
                        setModuleToDelete(target);
                      }}
                      aria-label="Delete Module"
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">{viewingModule.title}</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{viewingModule.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 flex-wrap">
                  <span className="font-bold text-[#25719D] bg-[#F0F8FC] px-3 py-1 rounded-md border border-[#A6DEEF] inline-flex items-center gap-1.5">
                    ⏱ {viewingModule.durationWeeks || 20} Weeks Duration (1 Lesson / Week)
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5">
                    📚 {viewingModule.totalLessons || 20} Total Lessons
                  </span>
                </div>
              </div>
            </div>

            {/* Syllabus Lessons Breakdown */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#49A5D7]" />
                  Syllabus Lessons Breakdown (20 Lessons • 1 Lesson / Week)
                </h3>
                <span className="text-xs font-semibold text-[#25719D] bg-[#F0F8FC] px-3 py-0.5 rounded-full border border-[#A6DEEF]">
                  All 20 Weeks Shown
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {getFull20Lessons(viewingModule).map((topic, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-gray-50/90 hover:bg-white rounded-xl border border-gray-200/80 hover:border-[#49A5D7] hover:shadow-xs transition-all flex items-start gap-2.5"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-extrabold text-[11px] flex items-center justify-center shrink-0 ${
                        i === 19
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-[#F0F8FC] text-[#25719D] border border-[#A6DEEF]'
                      }`}
                    >
                      W{i + 1}
                    </div>
                    <span className="text-xs font-semibold text-gray-800 line-clamp-2 mt-0.5 leading-snug">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Capstone Project */}
            <div className="pt-3 border-t border-gray-100 bg-gradient-to-r from-[#F0F8FC] to-indigo-50/70 p-4 rounded-xl border border-[#A6DEEF]">
              <div className="flex items-center gap-2 text-[#25719D] font-bold text-xs mb-1">
                <Award className="w-4 h-4 text-[#49A5D7]" />
                Capstone Final Project (Week 20):
              </div>
              <p className="text-sm text-gray-900 font-extrabold">
                {viewingModule.finalProject || `${viewingModule.title} Capstone Project Showcase`}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add/Edit Module */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingModule ? 'Edit Learning Module' : 'Add New Learning Module'}>
        <form onSubmit={handleSaveModule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Module Title (Class Name)</label>
            <input
              type="text"
              required
              placeholder="e.g. JK 8-12 2D Games and AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Track Level</label>
              <select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
              >
                <option value="LK 4-6">LK 4-6 (Little Kodders 4-6 yo)</option>
                <option value="LK 6-8">LK 6-8 (Little Kodders 6-8 yo)</option>
                <option value="JK 8-12">JK 8-12 (Junior 8-12 yo)</option>
                <option value="JK 12-16">JK 12-16 (Junior / Teens 12-16 yo)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Module Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. JK-8-12-2D-AI"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Standard Duration</label>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center justify-between">
                <span>20 Weeks</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]">1 Lesson / Wk</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Lessons</label>
              <div className="px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-xs font-bold text-primary-800 flex items-center justify-between">
                <span>20 Lessons</span>
                <span className="bg-primary-600 text-white px-2 py-0.5 rounded text-[10px]">Full Syllabus</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief overview of what students will master..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Capstone Final Project</label>
            <input
              type="text"
              placeholder="e.g. Retro Cyberpunk Boss Battle 2D Game"
              value={finalProject}
              onChange={(e) => setFinalProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Syllabus Lessons Breakdown (1 Lesson Per Line)
            </label>
            <textarea
              rows={4}
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingModule ? 'Save Changes' : 'Save Module'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Module Deletion */}
      <ConfirmDialog
        isOpen={!!moduleToDelete}
        onClose={() => setModuleToDelete(null)}
        onConfirm={() => {
          if (moduleToDelete) {
            deleteModule(moduleToDelete.id);
            if (viewingModule?.id === moduleToDelete.id) {
              setViewingModule(null);
            }
            setModuleToDelete(null);
          }
        }}
        title="Delete Learning Module"
        message={`Are you sure you want to delete module "${moduleToDelete?.title}" (${moduleToDelete?.code})?`}
        confirmText="Yes, Delete Module"
      />
    </div>
  );
};

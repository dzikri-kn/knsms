import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge } from '../ui';
import { 
  Users, 
  BookOpen, 
  Building2, 
  TrendingUp, 
  GraduationCap, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Sparkles,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  LabelList
} from 'recharts';

const attendanceTrendData = [
  { day: 'Mon', present: 94, excused: 4, absent: 2 },
  { day: 'Tue', present: 96, excused: 3, absent: 1 },
  { day: 'Wed', present: 92, excused: 6, absent: 2 },
  { day: 'Thu', present: 95, excused: 4, absent: 1 },
  { day: 'Fri', present: 98, excused: 2, absent: 0 },
  { day: 'Sat', present: 99, excused: 1, absent: 0 },
  { day: 'Sun', present: 97, excused: 2, absent: 1 },
];

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { users, classes, centers, classrooms } = useApp();
  const [centerPage, setCenterPage] = useState(0);
  const pageSize = 5;
  const totalCenterPages = Math.ceil(centers.length / pageSize);

  // Multi-Select Center IDs (empty array means all centers)
  const [selectedCenterIds, setSelectedCenterIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchCenterQuery, setSearchCenterQuery] = useState('');

  const isAllSelected = selectedCenterIds.length === 0 || selectedCenterIds.length === centers.length;

  const handleToggleCenter = (centerId: string) => {
    if (selectedCenterIds.includes(centerId)) {
      setSelectedCenterIds(selectedCenterIds.filter(id => id !== centerId));
    } else {
      setSelectedCenterIds([...selectedCenterIds, centerId]);
    }
  };

  const handleSelectAllCenters = () => {
    setSelectedCenterIds([]);
  };

  const handleClearCenters = () => {
    setSelectedCenterIds([]);
  };

  // Filtered dataset calculation based on multi-select
  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchCenterQuery.toLowerCase()) || 
    c.city.toLowerCase().includes(searchCenterQuery.toLowerCase())
  );

  const activeStudentsCount = users.filter(u => {
    if (u.role !== 'student') return false;
    if (selectedCenterIds.length === 0) return true;
    return (u.centerId && selectedCenterIds.includes(u.centerId)) || 
           (u.centerIds && u.centerIds.some(id => selectedCenterIds.includes(id)));
  }).length;

  const activeTeachersCount = users.filter(u => {
    if (u.role !== 'teacher') return false;
    if (selectedCenterIds.length === 0) return true;
    return (u.centerId && selectedCenterIds.includes(u.centerId)) || 
           (u.centerIds && u.centerIds.some(id => selectedCenterIds.includes(id)));
  }).length;

  const activeClassesCount = classes.filter(c => {
    if (selectedCenterIds.length === 0) return true;
    return selectedCenterIds.includes(c.centerId);
  }).length;

  const activeCentersCount = selectedCenterIds.length === 0 ? centers.length : selectedCenterIds.length;

  const totalCenters = centers.length;

  const currentCentersData = centers
    .slice(centerPage * pageSize, (centerPage + 1) * pageSize)
    .map(c => ({
      name: c.name,
      fullName: c.name,
      students: c.studentCount,
      classes: c.activeClassesCount
    }));

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs">
              Super Admin View
            </Badge>
            <span className="text-xs text-primary-100">National Management Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Koding Next School Portal</h1>
          <p className="text-primary-100 text-sm mt-1 max-w-xl">
            Monitor real-time performance across 35 Koding Next Indonesia centers, course scheduling, live attendance tracking, and curriculum in one unified system.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onNavigate('classes')}
            className="bg-white text-primary-700 hover:bg-primary-50 font-bold border-none"
          >
            Create New Class
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<Users className="w-4 h-4" />}
            onClick={() => onNavigate('users')}
            className="border-white/40 text-white hover:bg-white/10"
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Multi-Select Center Filter Selector Bar (Above Active Students) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter Cabang Center</div>
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>
                  {selectedCenterIds.length === 0
                    ? `Seluruh Cabang (${centers.length} Centers)`
                    : `${selectedCenterIds.length} Cabang Terpilih`}
                </span>
                <Badge variant={selectedCenterIds.length === 0 ? 'primary' : 'pink'} size="sm">
                  {selectedCenterIds.length === 0 ? 'Nasional' : 'Multi-Filter'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-4 h-4 text-brand-blue shrink-0" />
                  <span className="truncate">
                    {selectedCenterIds.length === 0
                      ? 'Pilih Cabang (Semua)'
                      : `${selectedCenterIds.length} Cabang Dipilih`}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">▼</span>
              </button>

              {/* Multi-Select Dropdown Popover */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Pilih Satu atau Lebih Cabang
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSelectAllCenters}
                          className="text-[11px] font-semibold text-brand-blue hover:underline cursor-pointer"
                        >
                          Semua
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={handleClearCenters}
                          className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Search inside filter */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchCenterQuery}
                        onChange={(e) => setSearchCenterQuery(e.target.value)}
                        placeholder="Cari nama cabang atau kota..."
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>

                    {/* Checkbox list */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 pr-1 space-y-0.5">
                      {filteredCenters.map((c) => {
                        const isChecked = selectedCenterIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                              isChecked ? 'bg-blue-50/80 font-bold text-brand-blue' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCenter(c.id)}
                              className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-gray-300 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{c.name}</div>
                              <div className="text-[10px] text-gray-400 font-normal truncate">{c.city} • {c.studentCount} Siswa</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {selectedCenterIds.length === 0 ? 'Menampilkan seluruh cabang' : `${selectedCenterIds.length} dari ${centers.length} dipilih`}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        Selesai
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedCenterIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCenters}
                className="text-xs text-brand-pink hover:bg-pink-50"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Selected Center Badges / Chips */}
        {selectedCenterIds.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-400 font-semibold mr-1">Filter Aktif:</span>
            {selectedCenterIds.map(cid => {
              const centerObj = centers.find(c => c.id === cid);
              if (!centerObj) return null;
              return (
                <span
                  key={cid}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-brand-blue text-[11px] font-medium"
                >
                  <span>{centerObj.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCenter(cid)}
                    className="text-brand-blue/60 hover:text-brand-blue cursor-pointer font-bold ml-0.5"
                    title="Hapus filter"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Students</span>
            <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{activeStudentsCount}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedCenterIds.length === 0 ? `Across ${totalCenters} Centers in Indonesia` : `${selectedCenterIds.length} Centers terpilih`}
          </p>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teachers</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{activeTeachersCount}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +8.5%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedCenterIds.length === 0 ? 'Globally certified instructors' : 'Pengajar di cabang terpilih'}
          </p>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-pink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Classes</span>
            <div className="p-2.5 bg-pink-50 rounded-xl text-brand-pink">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{activeClassesCount}</span>
            <Badge variant="pink" size="sm" dot>Live Active</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">Regular, Trial & Online Classes</p>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Center Network</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{activeCentersCount}</span>
            <span className="text-xs font-medium text-gray-500">
              {selectedCenterIds.length === 0 ? 'Official Centers' : 'Cabang Aktif'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {selectedCenterIds.length === 0 ? 'Jabodetabek, Java, Bali, Sumatra, etc.' : 'Cabang terpilih dalam filter'}
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Rate Trend Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Weekly Student Attendance Rate (%)</h2>
              <p className="text-xs text-gray-500">Average attendance across all ongoing coding classes</p>
            </div>
            <Badge variant="success" size="sm">96.8% Average</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis domain={[80, 100]} stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Area type="monotone" dataKey="present" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" name="Attendance Rate (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Centers Distribution Bar Chart with 5-Center Pagination */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-gray-900">Students per Center</h2>
                <p className="text-xs text-gray-500">Official branches student breakdown (5 per view)</p>
              </div>
              <button onClick={() => onNavigate('centers')} className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
                All 35 Centers <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pagination Controls per 5 Centers */}
            <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 mb-3 text-xs">
              <span className="font-bold text-gray-600">
                Center {centerPage * pageSize + 1} – {Math.min((centerPage + 1) * pageSize, centers.length)} of {centers.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCenterPage(p => Math.max(0, p - 1))}
                  disabled={centerPage === 0}
                  className="p-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous 5 Centers"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-semibold text-gray-500 px-1">
                  Page {centerPage + 1} / {totalCenterPages}
                </span>
                <button
                  onClick={() => setCenterPage(p => Math.min(totalCenterPages - 1, p + 1))}
                  disabled={centerPage === totalCenterPages - 1}
                  className="p-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next 5 Centers"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentCentersData} layout="vertical" margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} domain={[0, 'dataMax + 40']} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#334155" 
                  fontSize={11} 
                  fontWeight={600}
                  width={140}
                  tickFormatter={(val) => val.length > 17 ? `${val.substring(0, 17)}...` : val}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '10px', color: '#fff', border: 'none', fontSize: '12px' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Active Students (${item.payload.classes} Batches)`,
                    item.payload.fullName
                  ]}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="students" fill="#4F46E5" radius={[0, 6, 6, 0]} name="Total Students">
                  <LabelList 
                    dataKey="students" 
                    position="right" 
                    fill="#1E293B" 
                    fontSize={11} 
                    fontWeight={700}
                    formatter={(val: any) => `${val}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Ongoing Classes & Live Monitoring Quick Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Ongoing Class Sessions
            </h2>
            <p className="text-xs text-gray-500">Real-time attendance status and room occupancy</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('monitoring')}>
            Open Live Monitoring
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Class Name</th>
                <th className="py-3 px-4">Module / Level</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Center & Room</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.slice(0, 4).map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {cls.name}
                    <div className="text-[11px] font-normal text-gray-400">{cls.code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="purple" size="sm">{cls.moduleLevel}</Badge>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">{cls.moduleName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img src={cls.teacherAvatar} alt={cls.teacherName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-medium text-gray-800">{cls.teacherName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-medium text-gray-800">{cls.roomName}</div>
                    <div className="text-gray-400">{cls.centerName}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-700">
                    <span className="font-semibold">{cls.dayOfWeek}</span>, {cls.startTime} - {cls.endTime}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className="font-bold text-gray-900">{cls.enrolledStudentsCount}</span>
                    <span className="text-gray-400">/{cls.capacity} Students</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={cls.status === 'ongoing' ? 'success' : 'primary'} size="sm" dot>
                      {cls.status === 'ongoing' ? 'Live Session' : 'Scheduled'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, Modal, ConfirmDialog, Avatar } from '../ui';
import { UserRole, User } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  UserCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { currentUser, users, classes = [], addUser, updateUser, deleteUser, changePassword, centers, modules } = useApp();

  const isAdminCenter = currentUser.role === 'admin_center';
  const isStudentAdvisor = currentUser.role === 'student_advisor';

  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Ganti Password Modal State
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [adminGivenPassword, setAdminGivenPassword] = useState('');
  const [adminPasswordMsg, setAdminPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingUserPassword, setIsChangingUserPassword] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customPassword, setCustomPassword] = useState('kodingnext123');
  const [role, setRole] = useState<UserRole>('student');
  const [centerId, setCenterId] = useState('ctr-kemayoran');
  const [selectedCenterIds, setSelectedCenterIds] = useState<string[]>(['ctr-kemayoran']);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [level, setLevel] = useState('JK 8-12');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState<string>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  const allStudents = users.filter(u => u.role === 'student');
  const allParents = users.filter(u => u.role === 'parent');

  // Centers assigned to the current user
  const assignedCenterIds = currentUser.centerIds && currentUser.centerIds.length > 0 
    ? currentUser.centerIds 
    : (currentUser.centerId ? [currentUser.centerId] : ['ctr-kemayoran']);

  // Find classes taught by this teacher (for teacher role)
  const teacherClassStudentIds = new Set(
    classes
      .filter(c => c.teacherId === currentUser.id || c.teacherName === currentUser.name)
      .flatMap(c => c.studentIds || [])
  );

  // Find child IDs for parent role
  const parentChildIds = new Set([
    ...(currentUser.childrenIds || []),
    ...users.filter(u => u.parentId === currentUser.id).map(u => u.id)
  ]);

  const filteredUsers = users.filter((u) => {
    // 1. Super Admin can see everyone
    if (currentUser.role === 'admin') {
      const matchesRole = activeRoleFilter === 'all' || u.role === activeRoleFilter;
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    }

    // 2. Center Admin can ONLY see users in their assigned center(s)
    if (currentUser.role === 'admin_center') {
      if (u.id === currentUser.id) return true; // Can see self
      if (u.role === 'admin') return false; // Cannot see Super Admin

      const hasDirectCenter = u.centerId && assignedCenterIds.includes(u.centerId);
      const hasMultiCenter = u.centerIds && u.centerIds.some(cid => assignedCenterIds.includes(cid));
      let hasChildInCenter = false;
      if (u.role === 'parent' && u.childrenIds && u.childrenIds.length > 0) {
        const studentChildren = users.filter(s => u.childrenIds?.includes(s.id));
        hasChildInCenter = studentChildren.some(s => s.centerId && assignedCenterIds.includes(s.centerId));
      }

      if (!hasDirectCenter && !hasMultiCenter && !hasChildInCenter) {
        return false;
      }
    }

    // 3. Student Advisor can ONLY see parent and student accounts
    if (currentUser.role === 'student_advisor') {
      if (u.id === currentUser.id) return true; // Can see self
      if (u.role !== 'parent' && u.role !== 'student') return false; // STRICT: only parent and student

      const isHandledParent = u.role === 'parent' && currentUser.handledParentIds?.includes(u.id);
      const hasDirectCenter = u.centerId && assignedCenterIds.includes(u.centerId);
      const hasMultiCenter = u.centerIds && u.centerIds.some(cid => assignedCenterIds.includes(cid));
      let hasChildInCenter = false;
      if (u.role === 'parent' && u.childrenIds && u.childrenIds.length > 0) {
        const studentChildren = users.filter(s => u.childrenIds?.includes(s.id));
        hasChildInCenter = studentChildren.some(s => s.centerId && assignedCenterIds.includes(s.centerId));
      }

      if (!hasDirectCenter && !hasMultiCenter && !isHandledParent && !hasChildInCenter) {
        return false;
      }
    }

    // 4. Teacher can ONLY see students enrolled in their assigned classes & their own profile
    if (currentUser.role === 'teacher') {
      if (u.id === currentUser.id) return true;
      if (u.role === 'student' && teacherClassStudentIds.has(u.id)) return true;
      return false;
    }

    // 5. Parent can ONLY see their own children & their own profile
    if (currentUser.role === 'parent') {
      if (u.id === currentUser.id) return true;
      if (u.role === 'student' && parentChildIds.has(u.id)) return true;
      return false;
    }

    // 6. Student can ONLY see their own profile
    if (currentUser.role === 'student') {
      return u.id === currentUser.id;
    }

    const matchesRole = activeRoleFilter === 'all' || u.role === activeRoleFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleToggleModule = (modTitle: string) => {
    setSelectedModules(prev => 
      prev.includes(modTitle) 
        ? prev.filter(m => m !== modTitle) 
        : [...prev, modTitle]
    );
  };

  const handleToggleCenter = (cId: string) => {
    setSelectedCenterIds(prev => 
      prev.includes(cId)
        ? (prev.length > 1 ? prev.filter(id => id !== cId) : prev) // keep at least 1
        : [...prev, cId]
    );
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleToggleParent = (parentId: string) => {
    setSelectedParentIds(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setCustomPassword('kodingnext123');
    setRole('student');
    setCenterId(centers[0]?.id || 'ctr-kemayoran');
    setSelectedCenterIds([centers[0]?.id || 'ctr-kemayoran']);
    setSelectedStudentIds([]);
    setSelectedParentIds([]);
    setSelectedModules(['JK 12-16 Python First']);
    setStudentSearchQuery('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setCenterId(user.centerId || centers[0]?.id || 'ctr-kemayoran');
    setSelectedCenterIds(user.centerIds && user.centerIds.length > 0 ? user.centerIds : [user.centerId || centers[0]?.id || 'ctr-kemayoran']);
    setSelectedStudentIds(user.childrenIds && user.childrenIds.length > 0 ? user.childrenIds : []);
    setSelectedParentIds(user.handledParentIds && user.handledParentIds.length > 0 ? user.handledParentIds : []);
    setLevel(user.level || 'JK 8-12');
    setStudentSearchQuery('');
    
    // Parse existing specialization into array
    if (user.specialization) {
      const parsed = user.specialization.split(',').map(s => s.trim());
      setSelectedModules(parsed);
    } else {
      setSelectedModules(['JK 12-16 Python First']);
    }
    setIsCreateModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCenter = centers.find(c => c.id === centerId);
    const assignedCenters = centers.filter(c => selectedCenterIds.includes(c.id));
    const multipleCenterNames = assignedCenters.map(c => c.name).join(', ');

    const specializationStr = selectedModules.length > 0 
      ? selectedModules.join(', ') 
      : 'General Coding Teacher';

    const isMultiCenterRole = role === 'admin_center' || role === 'student_advisor' || role === 'teacher';
    const isSuperAdmin = role === 'admin';

    // For parents, their centers are naturally determined by their linked children
    const linkedStudents = users.filter(u => selectedStudentIds.includes(u.id));
    const parentCenterIds = Array.from(new Set(linkedStudents.map(s => s.centerId).filter(Boolean))) as string[];
    const parentCenters = centers.filter(c => parentCenterIds.includes(c.id));
    const parentCenterNames = parentCenters.map(c => c.name).join(', ') || 'Online / Branch';

    const finalCenterId = isSuperAdmin 
      ? 'all' 
      : role === 'parent' 
        ? (parentCenterIds[0] || 'ctr-kemayoran') 
        : (isMultiCenterRole ? (selectedCenterIds[0] || centerId) : centerId);

    const finalCenterIds = isSuperAdmin 
      ? centers.map(c => c.id) 
      : role === 'parent'
        ? (parentCenterIds.length > 0 ? parentCenterIds : ['ctr-kemayoran'])
        : (isMultiCenterRole ? selectedCenterIds : (centerId ? [centerId] : []));

    const finalCenterName = isSuperAdmin 
      ? 'All Centers (Nationwide)' 
      : role === 'parent'
        ? parentCenterNames
        : (isMultiCenterRole ? multipleCenterNames : selectedCenter?.name);

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        phone,
        role,
        centerId: finalCenterId,
        centerIds: finalCenterIds,
        centerName: finalCenterName,
        childrenIds: role === 'parent' ? selectedStudentIds : undefined,
        handledParentIds: role === 'student_advisor' ? selectedParentIds : undefined,
        level: role === 'student' ? level : undefined,
        specialization: role === 'teacher' ? specializationStr : undefined,
      });
    } else {
      addUser({
        name,
        email,
        phone,
        role,
        status: 'active',
        avatar: '',
        centerId: finalCenterId,
        centerIds: finalCenterIds,
        centerName: finalCenterName,
        childrenIds: role === 'parent' ? selectedStudentIds : undefined,
        handledParentIds: role === 'student_advisor' ? selectedParentIds : undefined,
        level: role === 'student' ? level : undefined,
        specialization: role === 'teacher' ? specializationStr : undefined,
      }, customPassword || 'kodingnext123');
    }
    setIsCreateModalOpen(false);
  };

  const handleOpenChangePassword = (user: User) => {
    setPasswordTargetUser(user);
    setAdminGivenPassword('kodingnext123');
    setAdminPasswordMsg(null);
  };

  const handleAdminSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (adminGivenPassword.length < 4) {
      setAdminPasswordMsg({ type: 'error', text: 'Password minimal terdiri dari 4 karakter.' });
      return;
    }
    setIsChangingUserPassword(true);
    try {
      const res = await changePassword(passwordTargetUser.id, adminGivenPassword);
      if (res.success) {
        setAdminPasswordMsg({ type: 'success', text: `Password untuk ${passwordTargetUser.name} berhasil diubah!` });
        setTimeout(() => {
          setPasswordTargetUser(null);
        }, 1200);
      } else {
        setAdminPasswordMsg({ type: 'error', text: res.message });
      }
    } catch {
      setAdminPasswordMsg({ type: 'error', text: 'Gagal mengubah password.' });
    } finally {
      setIsChangingUserPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management System</h1>
          <p className="text-sm text-gray-500">Manage Student Advisors, Teachers, Parents, Students, and Administrators</p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add New User
        </Button>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {(isStudentAdvisor ? [
          { id: 'all', label: 'All (Parents & Students)' },
          { id: 'parent', label: 'Parents' },
          { id: 'student', label: 'Students' },
        ] : [
          { id: 'all', label: 'All Users' },
          ...(isAdminCenter ? [] : [{ id: 'admin', label: 'Super Admin' }]),
          ...(isAdminCenter ? [] : [{ id: 'admin_center', label: 'Admin Center' }]),
          { id: 'student_advisor', label: 'Student Advisors' },
          { id: 'teacher', label: 'Teachers' },
          { id: 'parent', label: 'Parents' },
          { id: 'student', label: 'Students' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRoleFilter(tab.id)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
              activeRoleFilter === tab.id
                ? 'border-primary-600 text-primary-600 bg-primary-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by full name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-5">Name & Profile</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Center Branch</th>
                <th className="py-3.5 px-4">Contact (Email / Phone)</th>
                <th className="py-3.5 px-4">Level / Specialty</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-500 font-medium">
                    No users found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="md" />
                      <div>
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-[11px] text-gray-400">Joined: {u.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        u.role === 'admin' ? 'primary' :
                        u.role === 'teacher' ? 'success' :
                        u.role === 'student' ? 'purple' :
                        u.role === 'parent' ? 'warning' : 'neutral'
                      }
                      size="sm"
                    >
                      {u.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {u.role === 'admin' ? (
                      <span className="font-semibold text-purple-700">All Centers (Nationwide)</span>
                    ) : (() => {
                      const assignedIds = (u.centerIds && u.centerIds.length > 0)
                        ? u.centerIds
                        : (u.centerId && u.centerId !== 'all' ? [u.centerId] : []);

                      if (assignedIds.length === 0) {
                        return <span className="text-gray-400">-</span>;
                      }

                      const matchedCenters = assignedIds
                        .map(id => centers.find(c => c.id === id))
                        .filter(Boolean);

                      if (matchedCenters.length === 0) {
                        return <span className="text-gray-700">{u.centerName || 'All Centers'}</span>;
                      }

                      return (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {matchedCenters.map((c: any, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-brand-blue text-[11px] font-medium border border-blue-200/70"
                            >
                              {c.name.replace('Koding Next - ', '')}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-medium text-gray-900">{u.email}</div>
                    <div className="text-gray-400">{u.phone || '-'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-medium text-gray-800">{u.level || u.specialization || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={u.status === 'active' ? 'success' : 'warning'} size="sm" dot>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenChangePassword(u)}
                        title="Ganti / Reset Password User"
                        aria-label="Ganti Password"
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        aria-label="Edit User"
                        className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        aria-label="Delete User"
                        className="p-1.5 text-gray-400 hover:text-danger-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Add New User'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className={role === 'admin' ? 'space-y-3' : ((role === 'admin_center' || role === 'student_advisor' || role === 'parent' || role === 'teacher') ? 'space-y-3' : 'grid grid-cols-2 gap-3')}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
              >
                {isStudentAdvisor ? (
                  <>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                  </>
                ) : (
                  <>
                    {!isAdminCenter && <option value="admin">Super Admin</option>}
                    {!isAdminCenter && <option value="admin_center">Admin Center</option>}
                    <option value="student_advisor">Student Advisor</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="student">Student</option>
                  </>
                )}
              </select>
            </div>

            {role === 'admin' ? (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    All Centers Access (Nationwide)
                    <Badge variant="purple" size="sm">Super Admin</Badge>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    Super Admin automatically has full access across all 35 physical centers & online campus. No center selection needed.
                  </p>
                </div>
              </div>
            ) : role === 'student' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch Center</label>
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : role === 'parent' ? null : (
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Assigned Centers ({selectedCenterIds.length} of {centers.length} Centers)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCenterIds(centers.map(c => c.id))}
                      className="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer"
                    >
                      Select All 35
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCenterIds([centers[0]?.id || 'ctr-kemayoran'])}
                      className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                {/* Multiple Choice Checkboxes for Centers */}
                <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {centers.map(c => {
                    const isChecked = selectedCenterIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-primary-50/90 border border-primary-300 text-primary-950 font-semibold' : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCenter(c.id)}
                          className="w-3.5 h-3.5 rounded text-primary-600 focus:ring-primary-500 border-gray-300 shrink-0 cursor-pointer"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Selected Centers Badges */}
                <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                  {selectedCenterIds.map(cId => {
                    const c = centers.find(center => center.id === cId);
                    if (!c) return null;
                    return (
                      <span 
                        key={cId} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-[10px] font-semibold"
                      >
                        {c.name}
                        {selectedCenterIds.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleToggleCenter(cId)}
                            className="text-blue-500 hover:text-rose-600 font-bold ml-0.5"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Module Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="LK 4-6">LK 4-6 (Little Kodders)</option>
                <option value="LK 6-8">LK 6-8 (Little Kodders)</option>
                <option value="JK 8-12">JK 8-12 (Junior)</option>
                <option value="JK 12-16">JK 12-16 (Junior)</option>
              </select>
            </div>
          )}

          {role === 'teacher' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Teaching Modules Specialization ({selectedModules.length} Selected)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModules(modules.map(m => m.title))}
                    className="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedModules([])}
                    className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Module Categories Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Modules' },
                  { id: 'LK 4-6', label: 'LK 4-6' },
                  { id: 'LK 6-8', label: 'LK 6-8' },
                  { id: 'JK 8-12', label: 'JK 8-12' },
                  { id: 'JK 12-16', label: 'JK 12-16' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModuleCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors shrink-0 ${
                      moduleCategoryFilter === tab.id
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Multiple Choice Checkbox Grid */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 space-y-1.5 divide-y divide-gray-100">
                {modules
                  .filter(m => moduleCategoryFilter === 'all' || m.level === moduleCategoryFilter)
                  .map(mod => {
                    const isChecked = selectedModules.includes(mod.title);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-primary-50/80 border border-primary-200' : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleModule(mod.title)}
                          className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 shrink-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{mod.title}</span>
                            <Badge variant={mod.level.startsWith('LK') ? 'primary' : 'purple'} size="sm">
                              {mod.level}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{mod.description}</p>
                        </div>
                      </label>
                    );
                  })}
              </div>

              {/* Selected Badges Preview */}
              {selectedModules.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                  {selectedModules.map(m => (
                    <span 
                      key={m} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-semibold"
                    >
                      {m}
                      <button 
                        type="button" 
                        onClick={() => handleToggleModule(m)}
                        className="text-emerald-500 hover:text-rose-600 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {role === 'parent' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Linked Children / Students ({selectedStudentIds.length} Selected)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds(allStudents.map(s => s.id))}
                    className="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer"
                  >
                    Select All
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

              {/* Search Bar for Filtering Students */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama murid, email, atau center..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                />
                {studentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStudentSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Multiple Choice Checkboxes for Students */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 space-y-1.5 divide-y divide-gray-100">
                {allStudents
                  .filter(student => {
                    if (!studentSearchQuery.trim()) return true;
                    const q = studentSearchQuery.toLowerCase();
                    return (
                      student.name.toLowerCase().includes(q) ||
                      student.email.toLowerCase().includes(q) ||
                      (student.centerName && student.centerName.toLowerCase().includes(q)) ||
                      (student.level && student.level.toLowerCase().includes(q))
                    );
                  })
                  .map(student => {
                    const isChecked = selectedStudentIds.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-primary-50/90 border border-primary-300' : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudent(student.id)}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 shrink-0 cursor-pointer"
                        />
                        <Avatar name={student.name} size="xs" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 truncate">{student.name}</span>
                            {student.level && (
                              <Badge variant="purple" size="sm">
                                {student.level}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                            {student.centerName || 'Online'} • {student.email}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                {allStudents.filter(student => {
                  if (!studentSearchQuery.trim()) return true;
                  const q = studentSearchQuery.toLowerCase();
                  return (
                    student.name.toLowerCase().includes(q) ||
                    student.email.toLowerCase().includes(q) ||
                    (student.centerName && student.centerName.toLowerCase().includes(q)) ||
                    (student.level && student.level.toLowerCase().includes(q))
                  );
                }).length === 0 && (
                  <div className="py-4 text-center text-xs text-gray-500">
                    Tidak ditemukan murid dengan kata kunci "{studentSearchQuery}"
                  </div>
                )}
              </div>

              {/* Selected Children Badges Preview */}
              {selectedStudentIds.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                  {selectedStudentIds.map(sId => {
                    const student = allStudents.find(s => s.id === sId);
                    if (!student) return null;
                    return (
                      <span 
                        key={sId} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md text-[10px] font-semibold"
                      >
                        {student.name}
                        <button 
                          type="button" 
                          onClick={() => handleToggleStudent(sId)}
                          className="text-purple-500 hover:text-rose-600 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {role === 'student_advisor' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Handled Parents / Leads CRM ({selectedParentIds.length} Selected)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedParentIds(allParents.map(p => p.id))}
                    className="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedParentIds([])}
                    className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Multiple Choice Checkboxes for Parents */}
              <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 space-y-1.5 divide-y divide-gray-100">
                {allParents.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-3">No parents registered in the system yet.</p>
                ) : (
                  allParents.map(parent => {
                    const isChecked = selectedParentIds.includes(parent.id);
                    return (
                      <label
                        key={parent.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-amber-50/90 border border-amber-300' : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleParent(parent.id)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300 shrink-0 cursor-pointer"
                        />
                        <Avatar name={parent.name} size="xs" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 truncate">{parent.name}</span>
                            <Badge variant="warning" size="sm">Parent</Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                            {parent.phone || 'No phone'} • {parent.email}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Selected Parents Badges Preview */}
              {selectedParentIds.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                  {selectedParentIds.map(pId => {
                    const parent = allParents.find(p => p.id === pId);
                    if (!parent) return null;
                    return (
                      <span 
                        key={pId} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-semibold"
                      >
                        {parent.name}
                        <button 
                          type="button" 
                          onClick={() => handleToggleParent(pId)}
                          className="text-amber-500 hover:text-rose-600 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Default Password field for new user creation */}
          {!editingUser && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-900 uppercase">
                  Account Password
                </label>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  Default: kodingnext123
                </span>
              </div>
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="kodingnext123"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-amber-700">
                Password awal untuk login pertama user ini. Pengguna dapat mengubahnya kapan saja melalui profil akun.
              </p>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Admin Change Password */}
      <Modal
        isOpen={!!passwordTargetUser}
        onClose={() => setPasswordTargetUser(null)}
        title="Ganti Password Akun Pengguna"
        maxWidth="sm"
      >
        {passwordTargetUser && (
          <form onSubmit={handleAdminSubmitPassword} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <Avatar name={passwordTargetUser.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900 truncate">{passwordTargetUser.name}</div>
                <div className="text-xs text-gray-500 truncate">{passwordTargetUser.email}</div>
              </div>
            </div>

            {adminPasswordMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                adminPasswordMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {adminPasswordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{adminPasswordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Password Baru
              </label>
              <input
                type="text"
                required
                value={adminGivenPassword}
                onChange={(e) => setAdminGivenPassword(e.target.value)}
                placeholder="Masukkan password baru..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Password baru akan langsung tersimpan di database Neon dan aktif saat login selanjutnya.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPasswordTargetUser(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={isChangingUserPassword || !adminGivenPassword}>
                {isChangingUserPassword ? 'Menyimpan...' : 'Simpan Password'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirmation Dialog for User Deletion */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        title="Delete User Account"
        message={`Are you sure you want to delete "${userToDelete?.name}" (${userToDelete?.role})? This action cannot be undone.`}
        confirmText="Yes, Delete User"
      />
    </div>
  );
};
